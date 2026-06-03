import { useState } from 'react';
import { TopBar } from '../components/TopBar';
import { TextInput, PhoneInput, ErrorBox } from '../components/UI';
import { C, font, SPECIALTIES, SPECIALTY_ICONS } from '../utils/constants';

export function RegistrationPage({ onSubmit }) {
  const [form, setForm] = useState({ name: '', company: '', idNumber: '', phone: '', certificates: '', specialty: '' });
  const [error, setError] = useState('');
  const [dropOpen, setDropOpen] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.name.trim()) return setError('الاسم الكامل مطلوب');
    if (!form.company.trim()) return setError('اسم الشركة / المنشأة مطلوب');
    if (!form.idNumber.trim()) return setError('رقم الهوية / الإقامة مطلوب');
    if (!/^\d{10}$/.test(form.idNumber.trim())) return setError('رقم الهوية يجب أن يكون 10 أرقام');
    if (!form.phone || form.phone.length < 13) return setError('رقم الجوال مطلوب (9 أرقام بعد +966)');
    if (!form.specialty) return setError('يرجى اختيار التخصص');
    setError('');
    onSubmit(form);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', direction: 'rtl' }}>
      <TopBar showBranding />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ width: '100%', maxWidth: 520 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.accentGhost, border: `1px solid ${C.accentLight}44`, borderRadius: 20, padding: '5px 16px', marginBottom: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.accentMid, fontFamily: font }}>اختبار مبدئي للتأهيل للمقابلة النهائية</span>
            </div>
            <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 900, color: C.text, fontFamily: font }}>تسجيل بيانات المرشح</h1>
            <p style={{ margin: 0, color: C.textSub, fontSize: 14, fontFamily: font }}>يرجى تعبئة جميع البيانات بدقة قبل البدء في الاختبار</p>
          </div>

          <div style={{ background: C.surface, borderRadius: 20, padding: '32px 36px', boxShadow: C.shadowLg, border: `1px solid ${C.border}` }}>
            <TextInput label="الاسم الكامل" value={form.name} onChange={v => set('name', v)} placeholder="أدخل اسمك الرباعي كاملاً" required />
            <TextInput label="الشركة / المنشأة" value={form.company} onChange={v => set('company', v)} placeholder="اسم جهة العمل" required />
            <TextInput label="رقم الهوية / الإقامة" value={form.idNumber} onChange={v => set('idNumber', v.replace(/\D/g, '').slice(0, 10))} placeholder="أدخل 10 أرقام" required />
            <PhoneInput value={form.phone} onChange={v => set('phone', v)} />
            <TextInput label="الشهادات الإضافية" value={form.certificates} onChange={v => set('certificates', v)} placeholder="مثال: NEBOSH، PMP، ISO 9001 Lead Auditor" hint="اختياري — اذكر شهاداتك المهنية إن وجدت" />

            {/* Specialty Dropdown */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6, fontFamily: font }}>
                التخصص <span style={{ color: C.danger }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <div onClick={() => setDropOpen(o => !o)} style={{
                  padding: '11px 14px', borderRadius: 10, cursor: 'pointer', userSelect: 'none',
                  border: `1.5px solid ${dropOpen || form.specialty ? C.accentMid : C.border}`,
                  background: C.surface, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  boxShadow: dropOpen ? `0 0 0 3px ${C.accentLight}22` : 'none', transition: 'all 0.2s'
                }}>
                  {form.specialty
                    ? <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 18 }}>{SPECIALTY_ICONS[form.specialty]}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: font }}>{form.specialty}</span>
                      </div>
                    : <span style={{ fontSize: 14, color: C.textMuted, fontFamily: font }}>اختر تخصصك المهني</span>
                  }
                  <span style={{ color: C.textMuted, fontSize: 11, transform: dropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
                </div>
                {dropOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, left: 0, zIndex: 200, background: C.surface, borderRadius: 12, border: `1.5px solid ${C.border}`, boxShadow: C.shadowLg, overflow: 'hidden' }}>
                    {SPECIALTIES.map((sp, i) => (
                      <div key={sp} onClick={() => { set('specialty', sp); setDropOpen(false); }}
                        style={{
                          padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                          background: form.specialty === sp ? C.accentGhost : 'transparent',
                          borderBottom: i < SPECIALTIES.length - 1 ? `1px solid ${C.border}` : 'none'
                        }}
                        onMouseEnter={e => { if (form.specialty !== sp) e.currentTarget.style.background = '#F8FAFC'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = form.specialty === sp ? C.accentGhost : 'transparent'; }}>
                        <span style={{ fontSize: 20 }}>{SPECIALTY_ICONS[sp]}</span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: font }}>{sp}</div
                        </div>
                        {form.specialty === sp && <span style={{ marginRight: 'auto', color: C.accentMid, fontWeight: 900, fontSize: 16 }}>✓</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <ErrorBox message={error} />

            <button onClick={handleSubmit} style={{
              width: '100%', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: 'pointer',
              fontFamily: font, background: `linear-gradient(135deg, ${C.accent}, ${C.accentMid})`,
              color: '#fff', border: 'none', boxShadow: `0 4px 16px ${C.accent}44`, transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; }}>
              الانتقال للاختبار ←
            </button>
          </div>
          <p style={{ textAlign: 'center', color: C.textMuted, fontSize: 12, marginTop: 14, fontFamily: font }}>🔒 بياناتك محمية ولن تُستخدم إلا لأغراض التأهيل المهني</p>
        </div>
      </div>
    </div>
  );
}
