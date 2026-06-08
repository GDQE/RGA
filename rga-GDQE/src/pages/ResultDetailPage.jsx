import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchResultDetail } from '../services/examService';
import { LoadingPage, Badge } from '../components/UI';
import { QUESTION_BANK } from '../utils/questionBank';
import { C, font, SPECIALTY_ICONS } from '../utils/constants';

export function ResultDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResultDetail(id).then(r => {
      if (r.success) setData(r.data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <LoadingPage text="جارٍ تحميل التفاصيل..." />;
  if (!data) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font, direction: 'rtl' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}></div>
        <p style={{ color: C.textMuted }}>لم يتم العثور على النتيجة</p>
        <button onClick={() => navigate('/admin')} style={{ marginTop: 16, padding: '10px 20px', borderRadius: 8, background: C.accentMid, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: font }}>العودة للوحة الإدارة</button>
      </div>
    </div>
  );

  const c = data.candidates;
  const specialty = c?.specialty;
  const questions = QUESTION_BANK[specialty] || [];

  const getQuestionText = (questionId) => {
    for (const qs of Object.values(QUESTION_BANK)) {
      const q = qs.find(q => q.id === questionId);
      if (q) return q;
    }
    return null;
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, direction: 'rtl', fontFamily: font, padding: '28px 24px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* Back */}
        <button onClick={() => navigate('/admin')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.textSub, fontSize: 13, cursor: 'pointer', marginBottom: 24, fontFamily: font }}>
          → العودة للقائمة الرئيسية
        </button>

        {/* Header card */}
        <div style={{ background: C.surface, borderRadius: 16, padding: '24px 28px', boxShadow: C.shadowMd, border: `1px solid ${C.border}`, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h1 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 900, color: C.text }}>{c?.full_name}</h1>
              <p style={{ margin: 0, color: C.textMuted, fontSize: 13 }}>{c?.company}</p>
            </div>
            <div style={{ textAlign: 'center', background: data.passed ? C.successBg : C.dangerBg, border: `1px solid ${data.passed ? C.success : C.danger}33`, borderRadius: 12, padding: '12px 20px' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: data.passed ? C.success : C.danger }}>{data.score}%</div>
              <Badge color={data.passed ? 'success' : 'danger'}>{data.passed ? ' مؤهل' : 'غير مؤهل'}</Badge>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            {[
              { label: 'رقم الهوية', value: c?.id_number },
              { label: 'رقم الجوال', value: c?.phone },
              { label: 'التخصص', value: `${SPECIALTY_ICONS[specialty] || ''} ${specialty}` },
              { label: 'الشهادات', value: c?.certificates || '—' },
              { label: 'الإجابات الصحيحة', value: `${data.correct_answers} / 10` },
              { label: 'الإجابات الخاطئة', value: data.wrong_answers },
              { label: 'الدرجة المكتسبة', value: `${data.earned_points} / ${data.total_points}` },
              { label: 'تاريخ الاختبار', value: data.submitted_at ? new Date(data.submitted_at).toLocaleDateString('ar-SA') : '—' },
            ].map(item => (
              <div key={item.label} style={{ background: C.bg, borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Answers detail */}
        <div style={{ background: C.surface, borderRadius: 16, padding: '24px 28px', boxShadow: C.shadowMd, border: `1px solid ${C.border}` }}>
          <h2 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 800, color: C.text }}>تفاصيل الإجابات</h2>
          {data.exam_answers?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {data.exam_answers.map((a, i) => {
                const q = getQuestionText(a.question_id);
                return (
                  <div key={a.id} style={{
                    borderRadius: 12, padding: '16px 18px',
                    background: a.is_correct ? C.successBg : C.dangerBg,
                    border: `1px solid ${a.is_correct ? C.success : C.danger}33`
                  }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        background: a.is_correct ? C.success : C.danger,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 13, fontWeight: 900
                      }}>
                        {a.is_correct ? '✓' : '✗'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8, lineHeight: 1.7 }}>
                          {i + 1}. {q?.text || `سؤال ${a.question_id}`}
                        </div>
                        {q && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {q.options.map((opt, idx) => {
                              const isSelected = a.selected_answer === idx;
                              const isCorrect = a.correct_answer === idx;
                              return (
                                <div key={idx} style={{
                                  padding: '6px 12px', borderRadius: 6, fontSize: 12,
                                  background: isCorrect ? `${C.success}22` : isSelected && !isCorrect ? `${C.danger}22` : 'transparent',
                                  border: `1px solid ${isCorrect ? C.success : isSelected ? C.danger : 'transparent'}`,
                                  color: C.text, display: 'flex', alignItems: 'center', gap: 8
                                }}>
                                  <span style={{ width: 16, height: 16, borderRadius: 4, background: isCorrect ? C.success : isSelected ? C.danger : C.border, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff' }}>
                                    {['أ','ب','ج','د'][idx]}
                                  </span>
                                  {opt}
                                  {isCorrect && <span style={{ marginRight: 'auto', color: C.success, fontSize: 11, fontWeight: 700 }}>✓ الإجابة الصحيحة</span>}
                                  {isSelected && !isCorrect && <span style={{ marginRight: 'auto', color: C.danger, fontSize: 11, fontWeight: 700 }}> إجابة المرشح</span>}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: C.textMuted, textAlign: 'center', padding: 24 }}>لا توجد تفاصيل إجابات</p>
          )}
        </div>
      </div>
    </div>
  );
}
