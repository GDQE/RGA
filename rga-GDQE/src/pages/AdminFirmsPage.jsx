import { useState, useEffect } from 'react';
import { Badge, LoadingSpinner } from '../components/UI';
import { fetchPendingFirms, setFirmActiveStatus } from '../services/firmAuthService';
import { C, font } from '../utils/constants';
import toast from 'react-hot-toast';

export function AdminFirmsPage() {
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const r = await fetchPendingFirms();
    if (r.success) setFirms(r.data);
    setLoading(false);
  };

  const handleToggle = async (firmId, newStatus) => {
    const r = await setFirmActiveStatus(firmId, newStatus);
    if (r.success) {
      toast.success(newStatus ? 'تم تفعيل المكتب' : 'تم تعطيل المكتب');
      load();
    } else {
      toast.error('فشل التحديث: ' + r.error);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.text, fontFamily: font }}>المكاتب الاستشارية</h2>
        <p style={{ margin: '4px 0 0', color: C.textMuted, fontSize: 13, fontFamily: font }}>راجع طلبات التسجيل ووافق على الحسابات</p>
      </div>

      <div style={{ background: C.surface, borderRadius: 14, boxShadow: C.shadow, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><LoadingSpinner size={32} /></div>
        ) : firms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: C.textMuted, fontFamily: font }}>لا توجد مكاتب مسجلة</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: `2px solid ${C.border}` }}>
                {['اسم المكتب', 'اسم المستخدم', 'البريد', 'الجوال', 'الحالة', 'إجراء'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: C.textSub, fontFamily: font }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {firms.map(f => (
                <tr key={f.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: C.text, fontFamily: font }}>{f.firm_name}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: C.textSub, fontFamily: font }}>{f.username}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: C.textSub, fontFamily: font }}>{f.contact_email || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: C.textSub, fontFamily: font }}>{f.contact_phone || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge color={f.is_active ? 'success' : 'warning'}>{f.is_active ? 'مُفعّل' : 'قيد المراجعة'}</Badge>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {f.is_active ? (
                      <button onClick={() => handleToggle(f.id, false)} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${C.danger}`, background: C.dangerBg, color: C.danger, fontSize: 12, cursor: 'pointer', fontFamily: font }}>تعطيل</button>
                    ) : (
                      <button onClick={() => handleToggle(f.id, true)} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${C.success}`, background: C.successBg, color: C.success, fontSize: 12, cursor: 'pointer', fontFamily: font }}>تفعيل ✓</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
