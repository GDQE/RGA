import { useState, useEffect } from 'react';
import { LoadingSpinner, Badge } from '../components/UI';
import { fetchAllCertificates } from '../services/certificateService';
import { C, font, SPECIALTY_ICONS } from '../utils/constants';

export function AdminCertificatesPage() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const r = await fetchAllCertificates();
    if (r.success) setCerts(r.data);
    setLoading(false);
  };

  const isExpired = (expiry) => new Date(expiry) < new Date();

  const formatDate = (d) => new Date(d).toLocaleDateString('ar-SA', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.text, fontFamily: font }}>الشهادات الرقمية</h2>
        <p style={{ margin: '4px 0 0', color: C.textMuted, fontSize: 13, fontFamily: font }}>
          تُصدر تلقائياً بعد اعتماد اللجنة وكانت النتيجة النهائية ≥75%
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <LoadingSpinner size={32} />
        </div>
      ) : certs.length === 0 ? (
        <div style={{ background: C.surface, borderRadius: 16, padding: 60, textAlign: 'center', border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏅</div>
          <p style={{ color: C.textMuted, fontSize: 15, fontFamily: font }}>لم تُصدر أي شهادات بعد</p>
        </div>
      ) : (
        <div style={{ background: C.surface, borderRadius: 16, boxShadow: C.shadow, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #0F2D1F, #1B5E35)' }}>
                {['اسم المهندس', 'التخصص', 'رقم الشهادة', 'تاريخ الإصدار', 'تاريخ الانتهاء', 'الحالة', 'إجراء'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: font }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {certs.map(c => {
                const expired = isExpired(c.expiry_date);
                return (
                  <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: C.text, fontFamily: font }}>
                      {c.candidates?.full_name || c.engineer_name}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: C.textSub, fontFamily: font }}>
                      {SPECIALTY_ICONS[c.specialty]} {c.specialty}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: C.textSub, fontFamily: 'monospace' }}>
                      {c.certificate_number}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: C.textMuted, fontFamily: font }}>
                      {formatDate(c.issue_date)}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: expired ? C.danger : C.textMuted, fontFamily: font }}>
                      {formatDate(c.expiry_date)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge color={expired ? 'danger' : 'success'}>
                        {expired ? 'منتهية' : 'سارية'}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <a
                        href={`/verify?cert=${c.certificate_number}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #1B5E35', background: '#EAF3ED', color: '#1B5E35', fontSize: 12, textDecoration: 'none', fontFamily: font }}
                      >
                        عرض ↗
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
