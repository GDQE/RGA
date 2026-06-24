
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RGALogo } from '../../components/RGALogo';
import { LoadingSpinner, ErrorBox } from '../../components/UI';
import { getCommitteeSession } from '../../services/committeeAuthService';
import {
  fetchActiveTemplate, getOrCreateEvaluationSession, fetchCandidateForEvaluation,
  getOrCreateMemberEvaluation, saveSubItemScore, saveMemberNotesAndRecommendation, submitMemberEvaluation,
} from '../../services/evaluationService';
import { C, font } from '../../utils/constants';
import toast from 'react-hot-toast';

const RECOMMENDATIONS = ['مؤهل', 'مؤهل مع الحاجة للتحسين', 'غير مؤهل'];

export function EvaluationFormPage() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const session = getCommitteeSession();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [candidate, setCandidate] = useState(null);
  const [criteria, setCriteria] = useState([]);
  const [evalSession, setEvalSession] = useState(null);
  const [memberEval, setMemberEval] = useState(null);
  const [scores, setScores] = useState({}); // subItemId -> score
  const [notes, setNotes] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  useEffect(() => { init(); }, [candidateId]);

  const init = async () => {
    setLoading(true);
    setError('');

    const candRes = await fetchCandidateForEvaluation(candidateId);
    if (!candRes.success) { setError(candRes.error); setLoading(false); return; }
    setCandidate(candRes.data);

    const examScore = candRes.data.results?.[0]?.score ?? null;

    const tmplRes = await fetchActiveTemplate();
    if (!tmplRes.success) { setError(tmplRes.error); setLoading(false); return; }
    setCriteria(tmplRes.criteria);

    const sessRes = await getOrCreateEvaluationSession(candidateId, tmplRes.template.id, examScore);
    if (!sessRes.success) { setError(sessRes.error); setLoading(false); return; }
    setEvalSession(sessRes.session);

    const memberEvalRes = await getOrCreateMemberEvaluation(sessRes.session.id, session.id);
    if (!memberEvalRes.success) { setError(memberEvalRes.error); setLoading(false); return; }
    setMemberEval(memberEvalRes.evaluation);
    setNotes(memberEvalRes.evaluation.notes || '');
    setRecommendation(memberEvalRes.evaluation.recommendation || '');

    const initialScores = {};
    (memberEvalRes.evaluation.member_evaluation_scores || []).forEach(s => {
      initialScores[s.sub_item_id] = s.score;
    });
    setScores(initialScores);

    setLoading(false);
  };

  const isLocked = memberEval?.is_submitted;

  const handleScoreChange = async (subItemId, maxScore, rawValue) => {
    if (isLocked) return;
    let value = rawValue === '' ? '' : Number(rawValue);
    if (value !== '' && (isNaN(value) || value < 0)) return;
    if (value !== '' && value > maxScore) {
      toast.error(`الدرجة القصوى لهذا البند هي ${maxScore}`);
      value = maxScore;
    }
    setScores(s => ({ ...s, [subItemId]: value }));
  };

  const handleScoreBlur = async (subItemId, maxScore) => {
    if (isLocked) return;
    const value = scores[subItemId];
    if (value === '' || value == null) return;
    const result = await saveSubItemScore(memberEval.id, subItemId, value, maxScore);
    if (!result.success) toast.error(result.error);
  };

  const criterionTotal = (criterion) => {
    return criterion.items.reduce((sum, item) => sum + (Number(scores[item.id]) || 0), 0);
  };

  const grandTotal = useMemo(() => {
    return criteria.reduce((sum, c) => sum + criterionTotal(c), 0);
  }, [scores, criteria]);

  const maxPossible = useMemo(() => criteria.reduce((sum, c) => sum + Number(c.max_score), 0), [criteria]);

  const handleSaveDraft = async () => {
    setSaving(true);
    const r = await saveMemberNotesAndRecommendation(memberEval.id, { notes, recommendation });
    setSaving(false);
    if (r.success) toast.success('تم حفظ المسودة');
    else toast.error('فشل الحفظ: ' + r.error);
  };

  const handleSubmit = async () => {
    if (!recommendation) {
      toast.error('يرجى اختيار التوصية النهائية قبل الاعتماد');
      return;
    }
    setSaving(true);
    await saveMemberNotesAndRecommendation(memberEval.id, { notes, recommendation });
    const r = await submitMemberEvaluation(memberEval.id, session.fullName, candidateId);
    setSaving(false);
    if (r.success) {
      toast.success('تم اعتماد التقييم بنجاح');
      navigate('/committee/dashboard');
    } else {
      toast.error('فشل الاعتماد: ' + r.error);
    }
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LoadingSpinner size={40} /></div>;
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, direction: 'rtl' }}>
        <ErrorBox message={error} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F5', direction: 'rtl', fontFamily: font }}>
      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <RGALogo size={32} />
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textSub }}>نموذج تقييم اللجنة</div>
        </div>
        <button onClick={() => navigate('/committee/dashboard')} style={{ padding: '8px 18px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.textSub, fontSize: 13, cursor: 'pointer', fontFamily: font }}>
          → العودة للقائمة
        </button>
      </div>

      <div style={{ padding: '24px 20px', maxWidth: 880, margin: '0 auto' }}>
        {/* Candidate info card */}
        <div style={{ background: C.surface, borderRadius: 16, padding: '20px 24px', marginBottom: 20, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
            <InfoField label="اسم المرشح" value={candidate.full_name} />
            <InfoField label="رقم الهوية" value={candidate.national_id || candidate.id_number} />
            <InfoField label="التخصص / الوظيفة" value={candidate.specialty} />
            <InfoField label="درجة الاختبار" value={candidate.results?.[0]?.score != null ? `${candidate.results[0].score}%` : '—'} highlight />
          </div>
        </div>

        {isLocked && (
          <div style={{ background: C.successBg, border: `1px solid ${C.success}`, borderRadius: 12, padding: '12px 18px', marginBottom: 20, fontSize: 13, color: C.success, fontWeight: 700 }}>
            ✓ لقد اعتمدت هذا التقييم بتاريخ {new Date(memberEval.submitted_at).toLocaleDateString('ar-SA')} — لا يمكن التعديل بعد الاعتماد
          </div>
        )}

        {/* Criteria sections */}
        {criteria.map(criterion => (
          <div key={criterion.id} style={{ background: C.surface, borderRadius: 16, padding: '20px 24px', marginBottom: 16, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: `2px solid ${C.border}` }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: C.text }}>{criterion.criterion_name}</h3>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.accentMid }}>
                {criterionTotal(criterion).toFixed(2)} / {criterion.max_score}
              </div>
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              {criterion.items.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>{item.item_name}</div>
                    {item.description && <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>{item.description}</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <input
                      type="number"
                      min={0}
                      max={item.max_score}
                      step={0.5}
                      disabled={isLocked}
                      value={scores[item.id] ?? ''}
                      onChange={e => handleScoreChange(item.id, item.max_score, e.target.value)}
                      onBlur={() => handleScoreBlur(item.id, item.max_score)}
                      placeholder="0"
                      style={{
                        width: 64, padding: '8px 10px', borderRadius: 8, textAlign: 'center',
                        border: `1.5px solid ${C.border}`, fontSize: 14, fontWeight: 700,
                        background: isLocked ? '#F3F4F6' : '#fff', color: C.text,
                      }}
                    />
                    <span style={{ fontSize: 12, color: C.textMuted, whiteSpace: 'nowrap' }}>/ {item.max_score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Grand total */}
        <div style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accentMid})`, borderRadius: 16, padding: '20px 24px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#fff', fontSize: 15, fontWeight: 800 }}>المجموع الكلي للتقييم</span>
          <span style={{ color: '#fff', fontSize: 22, fontWeight: 900 }}>{grandTotal.toFixed(2)} / {maxPossible}</span>
        </div>

        {/* Recommendation */}
        <div style={{ background: C.surface, borderRadius: 16, padding: '20px 24px', marginBottom: 20, border: `1px solid ${C.border}` }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 12 }}>التوصية النهائية</label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {RECOMMENDATIONS.map(r => (
              <button
                key={r}
                disabled={isLocked}
                onClick={() => setRecommendation(r)}
                style={{
                  padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: isLocked ? 'not-allowed' : 'pointer',
                  border: `1.5px solid ${recommendation === r ? C.accentMid : C.border}`,
                  background: recommendation === r ? C.accentMid : 'transparent',
                  color: recommendation === r ? '#fff' : C.textSub, fontFamily: font
                }}
              >
                {r}
              </button>
            ))}
          </div>

          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.text, marginTop: 18, marginBottom: 8 }}>ملاحظات (اختياري)</label>
          <textarea
            value={notes}
            disabled={isLocked}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: 12, borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, fontFamily: font, resize: 'vertical', boxSizing: 'border-box', background: isLocked ? '#F3F4F6' : '#fff' }}
          />
        </div>

        {/* Actions */}
        {!isLocked && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
            <button onClick={handleSaveDraft} disabled={saving} style={{
              flex: 1, padding: '13px', borderRadius: 12, border: `1.5px solid ${C.border}`,
              background: 'transparent', color: C.textSub, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: font
            }}>
              حفظ كمسودة
            </button>
            <button onClick={() => setConfirmSubmit(true)} disabled={saving} style={{
              flex: 2, padding: '13px', borderRadius: 12, border: 'none',
              background: `linear-gradient(135deg, ${C.success}, #15803d)`, color: '#fff',
              fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: font
            }}>
              اعتماد التقييم النهائي ✓
            </button>
          </div>
        )}
      </div>

      {/* Confirm submit modal */}
      {confirmSubmit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 20 }}>
          <div style={{ background: C.surface, borderRadius: 16, padding: 28, maxWidth: 420, fontFamily: font, direction: 'rtl' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800, color: C.text }}>تأكيد الاعتماد النهائي</h3>
            <p style={{ color: C.textSub, fontSize: 13, lineHeight: 1.8, marginBottom: 20 }}>
              بعد الاعتماد، لن تستطيع تعديل أي درجة أو توصية لهذا المرشح. تأكد من مراجعة جميع البنود قبل المتابعة.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmSubmit(false)} style={{ flex: 1, padding: '11px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'transparent', color: C.textSub, cursor: 'pointer', fontFamily: font }}>تراجع</button>
              <button onClick={() => { setConfirmSubmit(false); handleSubmit(); }} style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', background: C.success, color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: font }}>تأكيد الاعتماد</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoField({ label, value, highlight }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: highlight ? C.accentMid : C.text }}>{value || '—'}</div>
    </div>
  );
}

