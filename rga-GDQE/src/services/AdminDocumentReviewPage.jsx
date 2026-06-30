import { useState, useEffect } from 'react';
import { Badge, LoadingSpinner } from '../components/UI';
import {
  fetchCandidatesPendingApproval, approveCandidateDocuments,
  flagCandidateForReview, rejectCandidateApplication,
} from '../services/documentCheckService';
import { REQUIRED_DOC_TYPES } from '../services/firmCandidateService';
import { C, font, SPECIALTY_ICONS } from '../utils/constants';
import toast from 'react-hot-toast';

export function AdminDocumentReviewPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const r = await fetchCandidatesPendingApproval();
    if (r.success) setCandidates(r.data);
    setLoading(false);
  };

  const handleApprove = async (candidateId, name) => {
    const r = await approveCandidateDocuments(candidateId, 'admin');
    if (r.success) {
      toast.success(`تم اعتماد ${name} — جاهز لجدولة الاختبار`);
      load();
    } else {
      toast.error('فشل: ' + r.error);
    }
  };

  const handleFlag = async (candidateId, name) => {
    const r = await flagCandidateForReview(candidateId, 'admin', 'يحتاج مراجعة يدوية');
    if (r.success) {
      toast.success(`تم تعليم ${name} للمراجعة`);
      load();
    } else {
      toast.error('فشل: ' + r.error);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return toast.error('يرجى كتابة سبب الرفض');
    const r = await rejectCandidateApplication(rejectModal.id, 'admin', rejectReason);
    if (r.success) {
      toast.success(`تم رفض طلب ${rejectModal.name}`);
      setRejectModal(null);
      setRejectReason('');
      load();
    } else {
      toast.error('فشل: ' + r.error);
    }
  };

  const getDocByType = (candidate, docType) => candidate.candidate_documents?.find(d => d.doc_type === docType);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.text, fontFamily: font }}>مراجعة طلبات المرشحين</h2>
        <p style={{ margin: '4px 0 0', color: C.textMuted, fontSize: 13, fontFamily: font }}>
          الفحص الآلي يتحقق من اكتمال الرفع — الاعتماد النهائي قرار بشري دائماً
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><LoadingSpinner size={32} /></div>
      ) : candidates.length === 0 ? (
        <div style={{ background: C.surface, borderRadius: 16, padding: 60, textAlign: 'center', border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}> </div>
          <p style={{ color: C.textMuted, fontSize: 15, fontFamily: font }}>لا توجد طلبات بانتظار المراجعة حالياً</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {candidates.map(c => {
            const check = c.document_checks?.[0];
            const isComplete = check?.overall_status === 'complete';
            const isExpanded = expanded === c.id;

            return (
              <div key={c.id} style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, boxShadow: C.shadow, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => setExpanded(isExpanded ? null : c.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: 26 }}>{SPECIALTY_ICONS[c.specialty] || ' '}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: C.text, fontFamily: font }}>{c.full_name}</div>
                      <div style={{ fontSize: 12, color: C.textMuted, fontFamily: font }}>
                        {c.specialty} • {c.consulting_firms?.firm_name || 'بدون مكتب'} • {c.national_id || c.id_number}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Badge color={isComplete ? 'success' : 'danger'}>
                      {isComplete ? 'مستندات مكتملة ✓' : 'مستندات ناقصة'}
                    </Badge>
                    <span style={{ fontSize: 12, color: C.textMuted }}>{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${C.border}` }}>
                    {!isComplete && check?.missing_documents?.length > 0 && (
                      <div style={{ background: C.dangerBg, borderRadius: 10, padding: '10px 14px', margin: '14px 0', fontSize: 13, color: C.danger, fontFamily: font }}>
                        ناقص: {check.missing_documents.join('، ')}
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, margin: '14px 0' }}>
                      {REQUIRED_DOC_TYPES.map(docType => {
                        const doc = getDocByType(c, docType.key);
                        return (
                          <div key={docType.key} style={{
                            padding: '10px 14px', borderRadius: 10, fontSize: 12, fontFamily: font,
                            border: `1.5px solid ${doc ? C.success : C.border}`,
                            background: doc ? C.successBg : '#F8FAFC',
                          }}>
                            <div style={{ fontWeight: 700, color: C.text, marginBottom: 4 }}>{docType.icon} {docType.label}</div>
                            {doc ? (
                              <a href={doc.file_url} target="_blank" rel="noreferrer" style={{ color: C.success, textDecoration: 'none', fontSize: 11 }}>
                                ↗ عرض الملف
                              </a>
                            ) : (
                              <span style={{ color: C.danger, fontSize: 11 }}>لم يُرفع</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
                      <button
                        onClick={() => handleApprove(c.id, c.full_name)}
                        disabled={!isComplete}
                        style={{
                          padding: '9px 18px', borderRadius: 9, border: 'none', cursor: isComplete ? 'pointer' : 'not-allowed',
                          background: isComplete ? C.success : C.border, color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: font
                        }}
                      >
                        ✓ اعتماد المرشح
                      </button>
                      <button onClick={() => handleFlag(c.id, c.full_name)} style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${C.warning}`, background: '#FFF7ED', color: C.warning, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
                        ⚠ تحتاج مراجعة
                      </button>
                      <button onClick={() => setRejectModal({ id: c.id, name: c.full_name })} style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${C.danger}`, background: C.dangerBg, color: C.danger, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
                        ✕ رفض الطلب
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 20 }}>
          <div style={{ background: C.surface, borderRadius: 16, padding: 28, maxWidth: 400, width: '100%', fontFamily: font }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800, color: C.text }}>رفض طلب: {rejectModal.name}</h3>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="سبب الرفض (سيُحفظ في سجل التدقيق)"
              rows={3}
              style={{ width: '100%', padding: 12, borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, fontFamily: font, resize: 'vertical', boxSizing: 'border-box', marginBottom: 16 }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }} style={{ flex: 1, padding: '10px', borderRadius: 9, border: `1px solid ${C.border}`, background: 'transparent', color: C.textSub, cursor: 'pointer', fontFamily: font }}>إلغاء</button>
              <button onClick={handleReject} style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', background: C.danger, color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: font }}>تأكيد الرفض</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
