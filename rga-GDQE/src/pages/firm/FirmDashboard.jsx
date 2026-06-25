
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RGALogo } from '../../components/RGALogo';
import { LoadingSpinner, Badge } from '../../components/UI';
import { getFirmSession, logoutFirm } from '../../services/firmAuthService';
import { fetchFirmCandidates, STATUS_LABELS, REQUIRED_DOC_TYPES } from '../../services/firmCandidateService';
import { C, font, SPECIALTY_ICONS } from '../../utils/constants';

export function FirmDashboard() {
  const navigate = useNavigate();
  const session = getFirmSession();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCandidates(); }, []);

  const loadCandidates = async () => {
    setLoading(true);
    const r = await fetchFirmCandidates(session.id);
    if (r.success) setCandidates(r.data);
    setLoading(false);
  };

  const handleLogout = () => {
    logoutFirm();
    navigate('/firm/login');
  };

  const getDocsProgress = (candidate) => {
    const uploaded = candidate.candidate_documents?.length || 0;
    return `${uploaded}/${REQUIRED_DOC_TYPES.length}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F5', direction: 'rtl', fontFamily: font }}>
      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <RGALogo size={36} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{session?.firmName}</div>
            <div style={{ fontSize: 12, color: C.textMuted }}>بوابة المكاتب الاستشارية</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ padding: '8px 18px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.textSub, fontSize: 13, cursor: 'pointer', fontFamily: font }}>
           تسجيل الخروج
        </button>
      </div>

      <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.text }}>المرشحون</h1>
            <p style={{ margin: '4px 0 0', color: C.textMuted, fontSize: 13 }}>إجمالي الطلبات: {candidates.length}</p>
          </div>
          <button onClick={() => navigate('/firm/add-candidate')} style={{
            padding: '11px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg, ${C.accent}, ${C.accentMid})`, color: '#fff',
            fontSize: 14, fontWeight: 700, fontFamily: font
          }}>
            + إضافة مرشح جديد
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><LoadingSpinner size={36} /></div>
        ) : candidates.length === 0 ? (
          <div style={{ background: C.surface, borderRadius: 16, padding: 60, textAlign: 'center', border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <p style={{ color: C.textMuted, fontSize: 15 }}>لا يوجد مرشحون مسجلون بعد</p>
          </div>
        ) : (
          <div style={{ background: C.surface, borderRadius: 16, boxShadow: C.shadow, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: `2px solid ${C.border}` }}>
                  {['الاسم', 'التخصص', 'المرفقات', 'الحالة', 'تاريخ التسجيل'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: C.textSub }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {candidates.map(c => {
                  const status = STATUS_LABELS[c.application_status] || STATUS_LABELS.pending;
                  return (
                    <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: C.text }}>{c.full_name}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: C.textSub }}>{SPECIALTY_ICONS[c.specialty]} {c.specialty}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: C.textSub }}>{getDocsProgress(c)}</td>
                      <td style={{ padding: '12px 16px' }}><Badge color={status.color}>{status.label}</Badge></td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: C.textMuted }}>{new Date(c.created_at).toLocaleDateString('ar-SA')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}



