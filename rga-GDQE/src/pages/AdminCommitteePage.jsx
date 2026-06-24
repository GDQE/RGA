import { useState, useEffect } from 'react';
import { Badge, LoadingSpinner, TextInput, ErrorBox } from '../components/UI';
import { fetchCommitteeMembers, addCommitteeMember, resetCommitteeMemberPassword, setCommitteeMemberActive } from '../services/committeeAuthService';
import { C, font } from '../utils/constants';
import toast from 'react-hot-toast';

export function AdminCommitteePage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetModal, setResetModal] = useState(null); // { id, name }
  const [newPassword, setNewPassword] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [newMember, setNewMember] = useState({ fullName: '', username: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const r = await fetchCommitteeMembers();
    if (r.success) setMembers(r.data);
    setLoading(false);
  };

  const handleToggle = async (id, status) => {
    const r = await setCommitteeMemberActive(id, status);
    if (r.success) { toast.success(status ? 'تم تفعيل العضو' : 'تم تعطيل العضو'); load(); }
    else toast.error('فشل: ' + r.error);
  };

  const handleResetSubmit = async () => {
    if (!newPassword || newPassword.length < 6) return setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    const r = await resetCommitteeMemberPassword(resetModal.id, newPassword);
    if (r.success) {
      toast.success(`تم تعيين كلمة مرور جديدة لـ ${resetModal.name}`);
      setResetModal(null);
      setNewPassword('');
      setError('');
    } else {
      setError(r.error);
    }
  };

  const handleAddSubmit = async () => {
    if (!newMember.fullName.trim()) return setError('الاسم مطلوب');
    if (!newMember.username.trim()) return setError('اسم المستخدم مطلوب');
    if (!newMember.password || newMember.password.length < 6) return setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');

    const nextOrder = members.length > 0 ? Math.max(...members.map(m => m.member_order)) + 1 : 1;
    const r = await addCommitteeMember({ ...newMember, memberOrder: nextOrder });
    if (r.success) {
      toast.success('تم إضافة العضو بنجاح');
      setAddModal(false);
      setNewMember({ fullName: '', username: '', password: '' });
      setError('');
      load();
    } else {
      setError(r.error);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.text, fontFamily: font }}>أعضاء لجنة التقييم</h2>
          <p style={{ margin: '4px 0 0', color: C.textMuted, fontSize: 13, fontFamily: font }}>إدارة حسابات اللجنة وإعادة تعيين كلمات المرور</p>
        </div>
        {members.length < 4 && (
          <button onClick={() => setAddModal(true)} style={{ padding: '9px 18px', borderRadius: 9, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg, ${C.accent}, ${C.accentMid})`, color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: font }}>
            + إضافة عضو رابع
          </button>
        )}
      </div>

      <div style={{ background: C.surface, borderRadius: 14, boxShadow: C.shadow, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><LoadingSpinner size={32} /></div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: `2px solid ${C.border}` }}>
                {['الترتيب', 'الاسم', 'اسم المستخدم', 'الحالة', 'إجراء'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: C.textSub, fontFamily: font }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: C.textSub, fontFamily: font }}>عضو {m.member_order}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: C.text, fontFamily: font }}>{m.full_name}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: C.textSub, fontFamily: font }}>{m.username}</td>
                  <td style={{ padding: '12px 16px' }}><Badge color={m.is_active ? 'success' : 'danger'}>{m.is_active ? 'مُفعّل' : 'معطّل'}</Badge></td>
                  <td style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
                    <button onClick={() => setResetModal({ id: m.id, name: m.full_name })} style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.textSub, fontSize: 12, cursor: 'pointer', fontFamily: font }}>إعادة تعيين الرمز</button>
                    {m.is_active ? (
                      <button onClick={() => handleToggle(m.id, false)} style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.danger}`, background: C.dangerBg, color: C.danger, fontSize: 12, cursor: 'pointer', fontFamily: font }}>تعطيل</button>
                    ) : (
                      <button onClick={() => handleToggle(m.id, true)} style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.success}`, background: C.successBg, color: C.success, fontSize: 12, cursor: 'pointer', fontFamily: font }}>تفعيل</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Reset password modal */}
      {resetModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <div style={{ background: C.surface, borderRadius: 16, padding: 28, width: 380, fontFamily: font }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: C.text }}>إعادة تعيين رمز: {resetModal.name}</h3>
            <TextInput label="كلمة المرور الجديدة" value={newPassword} onChange={setNewPassword} placeholder="6 أحرف على الأقل" type="password" />
            <ErrorBox message={error} />
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={() => { setResetModal(null); setError(''); setNewPassword(''); }} style={{ flex: 1, padding: '10px', borderRadius: 9, border: `1px solid ${C.border}`, background: 'transparent', color: C.textSub, cursor: 'pointer', fontFamily: font }}>إلغاء</button>
              <button onClick={handleResetSubmit} style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', background: C.accentMid, color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: font }}>حفظ</button>
            </div>
          </div>
        </div>
      )}

      {/* Add member modal */}
      {addModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <div style={{ background: C.surface, borderRadius: 16, padding: 28, width: 380, fontFamily: font }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: C.text }}>إضافة عضو لجنة جديد</h3>
            <TextInput label="الاسم الكامل" value={newMember.fullName} onChange={v => setNewMember(m => ({ ...m, fullName: v }))} placeholder="اسم العضو" />
            <TextInput label="اسم المستخدم" value={newMember.username} onChange={v => setNewMember(m => ({ ...m, username: v.replace(/\s/g, '') }))} placeholder="member4" />
            <TextInput label="كلمة المرور" value={newMember.password} onChange={v => setNewMember(m => ({ ...m, password: v }))} placeholder="6 أحرف على الأقل" type="password" />
            <ErrorBox message={error} />
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={() => { setAddModal(false); setError(''); setNewMember({ fullName: '', username: '', password: '' }); }} style={{ flex: 1, padding: '10px', borderRadius: 9, border: `1px solid ${C.border}`, background: 'transparent', color: C.textSub, cursor: 'pointer', fontFamily: font }}>إلغاء</button>
              <button onClick={handleAddSubmit} style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', background: C.accentMid, color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: font }}>إضافة</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
