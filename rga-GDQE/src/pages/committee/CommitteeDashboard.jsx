
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RGALogo } from '../../components/RGALogo';
import { LoadingSpinner, Badge } from '../../components/UI';
import { getCommitteeSession, logoutCommitteeMember } from '../../services/committeeAuthService';
import { fetchCandidatesForCommittee } from '../../services/evaluationService';
import { supabase } from '../../services/supabase';
import { C, font, SPECIALTY_ICONS } from '../../utils/constants';

export function CommitteeDashboard() {
  const navigate = useNavigate();
  const session = getCommitteeSession();
  const [candidates, setCandidates] = useState([]);
  const [myStatus, setMyStatus] = useState({}); // candidateId -> { is_submitted }
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const r = await fetchCandidatesForCommittee();
    if (r.success) {
      setCandidates(r.data);
      await loadMyStatuses(r.data);
    }
    setLoading(false);
  };

  // يجلب فقط حالة العضو الحالي نفسه (مكتمل/غير مكتمل) — لا يكشف عن تقييم الآخرين
  const loadMyStatuses = async (candidateList) => {
    const statuses = {};
    for (const c of candidateList) {
      const { data: sessionRow } = await supabase
        .from('candidate_evaluation_sessions')
        .select('id')
        .eq('candidate_id', c.id)
        .maybeSingle();

      if (sessionRow) {
        const { data: myEval } = await supabase
          .from('member_evaluations')
          .select('is_submitted')
          .eq('session_id', sessionRow.id)
          .eq('member_id', session.id)
          .maybeSingle();
        statuses[c.id] = myEval?.is_submitted ? 'submitted' : (myEval ? 'in_progress' : 'not_started');
      } else {
        statuses[c.id] = 'not_started';
      }
    }
    setMyStatus(statuses);
  };

  const handleLogout = () => {
    logoutCommitteeMember();
    navigate('/committee/login');
  };

  const statusLabel = {
    not_started: { label: 'لم يبدأ', color: 'default' },
    in_progress: { label: 'قيد التقييم', color: 'warning' },
    submitted: { label: 'تم الاعتماد ✓', color: 'success' },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F5', direction: 'rtl', fontFamily: font }}>
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <RGALogo size={36} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{session?.fullName}</div>
            <div style={{ fontSize: 12, color: C.textMuted }}>بوابة لجنة التقييم</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ padding: '8px 18px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.textSub, fontSize: 13, cursor: 'pointer', fontFamily: font }}>
          🚪 تسجيل الخروج
        </button>
      </div>

      <div style={{ padding: '28px 32px', maxWidth: 1000, margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 900, color: C.text }}>المرشحون المُحوّلون للتقييم</h1>
        <p style={{ margin: '0 0 24px', color: C.textMuted, fontSize: 13 }}>تقييمك مستقل تماماً — لا تظهر لك درجات الأعضاء الآخرين</p>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><LoadingSpinner size={36} /></div>
        ) : candidates.length === 0 ? (
          <div style={{ background: C.surface, borderRadius: 16, padding: 60, textAlign: 'center', border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <p style={{ color: C.textMuted, fontSize: 15 }}>لا يوجد مرشحون بانتظار تقييمك حالياً</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {candidates.map(c => {
              const status = statusLabel[myStatus[c.id] || 'not_started'];
              const examScore = c.results?.[0]?.score;
              return (
                <div key={c.id} style={{
                  background: C.surface, borderRadius: 14, padding: '18px 22px', border: `1px solid ${C.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: C.shadow
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ fontSize: 28 }}>{SPECIALTY_ICONS[c.specialty] || '👤'}</div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{c.full_name}</div>
                      <div style={{ fontSize: 12, color: C.textMuted }}>{c.specialty} • {c.company}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {examScore != null && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: C.textMuted }}>درجة الاختبار</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: C.accentMid }}>{examScore}%</div>
                      </div>
                    )}
                    <Badge color={status.color}>{status.label}</Badge>
                    <button
                      onClick={() => navigate(`/committee/evaluate/${c.id}`)}
                      disabled={myStatus[c.id] === 'submitted'}
                      style={{
                        padding: '9px 20px', borderRadius: 10, border: 'none', cursor: myStatus[c.id] === 'submitted' ? 'not-allowed' : 'pointer',
                        background: myStatus[c.id] === 'submitted' ? C.border : `linear-gradient(135deg, ${C.accent}, ${C.accentMid})`,
                        color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: font
                      }}
                    >
                      {myStatus[c.id] === 'submitted' ? 'مُعتمد' : myStatus[c.id] === 'in_progress' ? 'استكمال التقييم' : 'بدء التقييم'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


