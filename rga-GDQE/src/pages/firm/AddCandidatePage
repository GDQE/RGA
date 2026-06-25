import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput, PhoneInput, ErrorBox, LoadingSpinner } from '../../components/UI';
import { getFirmSession } from '../../services/firmAuthService';
import { createCandidateWithDocuments, REQUIRED_DOC_TYPES } from '../../services/firmCandidateService';
import { C, font, SPECIALTIES, SPECIALTY_ICONS } from '../../utils/constants';
import toast from 'react-hot-toast';

export function AddCandidatePage() {
  const navigate = useNavigate();
  const session = getFirmSession();

  const [form, setForm] = useState({
    name: '', company: '', idNumber: '', phone: '', email: '', specialty: '', certificatesNote: '',
  });
  const [files, setFiles] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFileChange = (docType, file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم الملف يجب ألا يتجاوز 10 ميجابايت');
      return;
    }
    setFiles(f => ({ ...f, [docType]: file }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return setError('الاسم الكامل مطلوب');
    if (!form.company.trim()) return setError('اسم الشركة مطلوب');
    if (!/^\d{10}$/.test(form.idNumber.trim())) return setError('رقم الهوية يجب أن يكون 10 أرقام');
    if (!form.phone || form.phone.length < 13) return setError('رقم الجوال مطلوب');
    if (!form.specialty) return setError('يرجى اختيار التخصص');

    const missingDocs = REQUIRED_DOC_TYPES.filter(d => !files[d.key]);
    if (missingDocs.length > 0) {
      return setError(`يرجى رفع جميع المرفقات المطلوبة (ناقص: ${missingDocs.map(d => d.label).join('، ')})`);
    }

    setError('');
    setLoading(true);
    const result = await createCandidateWithDocuments({
      candidateInfo: form,
      firmId: session.id,
      files,
    });
    setLoading(false);

    if (result.success) {
      toast.success('تم تسجيل المرشح ورفع المرفقات بنجاح');
      navigate('/firm/dashboard');
    } else {
      setError('تعذّر الحفظ: ' + result.error);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F5', direction: 'rtl', fontFamily: font, padding: '28px 32px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <button onClick={() => navigate('/firm/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.textSub, fontSize: 13, cursor: 'pointer', marginBottom: 20 }}>
          → العودة للوحة المكتب
        </button>

        <div style={{ background: C.surface, borderRadius: 20, padding: '32px 36px', boxShadow: C.shadowMd, border: `1px solid ${C.border}` }}>
          <h1 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 900, color: C.text }}>إضافة مرشح جديد</h1>
          <p style={{ margin: '0 0 24px', color: C.textMuted, fontSize: 13 }}>أدخل بيانات المرشح وارفع المستندات المطلوبة</p>

          <TextInput label="الاسم الكامل" value={form.name} onChange={v => set('name', v)} placeholder="الاسم الرباعي" required />
          <TextInput label="رقم الهوية / الإقامة" value={form.idNumber} onChange={v => set('idNumber', v.replace(/\D/g, '').slice(0, 10))} placeholder="10 أرقام" required />
          <PhoneInput value={form.phone} onChange={v => set('phone', v)} />
          <TextInput label="البريد الإلكتروني" value={form.email} onChange={v => set('email', v)} placeholder="example@email.com" type="email" />
          <TextInput label="اسم الشركة" value={form.company} onChange={v => set('company', v)} placeholder="جهة عمل المرشح" required />
          <TextInput label="ملاحظات إضافية" value={form.certificatesNote} onChange={v => set('certificatesNote', v)} placeholder="اختياري" />

          {/* Specialty dropdown */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>التخصص <span style={{ color: C.danger }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <div onClick={() => setDropOpen(o => !o)} style={{
                padding: '11px 14px', borderRadius: 10, cursor: 'pointer',
                border: `1.5px solid ${form.specialty ? C.accentMid : C.border}`,
                background: C.surface, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                {form.specialty ? <span>{SPECIALTY_ICONS[form.specialty]} {form.specialty}</span> : <span style={{ color: C.textMuted }}>اختر التخصص</span>}
                <span style={{ fontSize: 11, color: C.textMuted }}>▼</span>
              </div>
              {dropOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, left: 0, zIndex: 100, background: C.surface, borderRadius: 12, border: `1.5px solid ${C.border}`, boxShadow: C.shadowLg, overflow: 'hidden' }}>
                  {SPECIALTIES.map(sp => (
                    <div key={sp} onClick={() => { set('specialty', sp); setDropOpen(false); }} style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span>{SPECIALTY_ICONS[sp]}</span><span style={{ fontSize: 14 }}>{sp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Document uploads */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 12 }}>المرفقات المطلوبة <span style={{ color: C.danger }}>*</span></label>
            <div style={{ display: 'grid', gap: 10 }}>
              {REQUIRED_DOC_TYPES.map(doc => (
                <div key={doc.key} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12,
                  border: `1.5px solid ${files[doc.key] ? C.success : C.border}`,
                  background: files[doc.key] ? C.successBg : '#F8FAFC'
                }}>
                  <span style={{ fontSize: 24 }}>{doc.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{doc.label}</div>
                    {files[doc.key] && <div style={{ fontSize: 11, color: C.success }}>✓ {files[doc.key].name}</div>}
                  </div>
                  <label style={{ padding: '7px 16px', borderRadius: 8, background: files[doc.key] ? C.success : C.accentMid, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    {files[doc.key] ? 'تغيير' : 'رفع الملف'}
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" style={{ display: 'none' }} onChange={e => handleFileChange(doc.key, e.target.files[0])} />
                  </label>
                </div>
              ))}
            </div>
          </div>

          <ErrorBox message={error} />

          <button onClick={handleSubmit} disabled={loading} style={{
            width: '100%', padding: '13px', borderRadius: 12, fontSize: 15, fontWeight: 800,
            cursor: loading ? 'not-allowed' : 'pointer',
            background: loading ? C.border : `linear-gradient(135deg, ${C.accent}, ${C.accentMid})`,
            color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
          }}>
            {loading ? <><LoadingSpinner size={18} color="#fff" /> جارٍ الحفظ والرفع...</> : 'حفظ وإرسال الطلب ←'}
          </button>
        </div>
      </div>
    </div>
  );
}


