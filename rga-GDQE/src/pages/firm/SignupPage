

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TopBar } from '../../components/TopBar';
import { TextInput, ErrorBox, LoadingSpinner } from '../../components/UI';
import { registerFirm } from '../../services/firmAuthService';
import { C, font } from '../../utils/constants';

export function FirmSignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firmName: '', username: '', password: '', confirmPassword: '', email: '', phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.firmName.trim()) return setError('اسم المكتب مطلوب');
    if (!form.username.trim() || form.username.length < 4) return setError('اسم المستخدم يجب أن يكون 4 أحرف على الأقل');
    if (!form.password || form.password.length < 6) return setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    if (form.password !== form.confirmPassword) return setError('كلمتا المرور غير متطابقتين');

    setError('');
    setLoading(true);
    const result = await registerFirm({
      firmName: form.firmName,
      username: form.username,
      password: form.password,
      email: form.email,
      phone: form.phone,
    });
    setLoading(false);

    if (!result.success) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', direction: 'rtl' }}>
        <TopBar showBranding />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: C.surface, borderRadius: 20, padding: '44px 40px', maxWidth: 460, textAlign: 'center', boxShadow: C.shadowLg, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>⏳</div>
            <h2 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 900, color: C.text, fontFamily: font }}>تم إنشاء حسابك بنجاح</h2>
            <p style={{ color: C.textSub, fontSize: 14, lineHeight: 1.8, fontFamily: font, marginBottom: 24 }}>
              حسابك الآن قيد المراجعة من قبل الإدارة العامة للجودة والبيئة. سيتم تفعيله بعد الموافقة، وسنتواصل معك عند التفعيل.
            </p>
            <Link to="/firm/login" style={{ display: 'inline-block', padding: '11px 28px', borderRadius: 10, background: C.accentMid, color: '#fff', textDecoration: 'none', fontFamily: font, fontWeight: 700, fontSize: 14 }}>
              الذهاب لصفحة الدخول
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', direction: 'rtl' }}>
      <TopBar showBranding />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 900, color: C.text, fontFamily: font }}>تسجيل مكتب استشاري جديد</h1>
            <p style={{ margin: 0, color: C.textSub, fontSize: 14, fontFamily: font }}>أنشئ حساباً لمكتبك لإدارة طلبات تأهيل المهندسين</p>
          </div>

          <div style={{ background: C.surface, borderRadius: 20, padding: '32px 36px', boxShadow: C.shadowLg, border: `1px solid ${C.border}` }}>
            <TextInput label="اسم المكتب / الشركة" value={form.firmName} onChange={v => set('firmName', v)} placeholder="مثال: مكتب الرواد للاستشارات الهندسية" required />
            <TextInput label="اسم المستخدم" value={form.username} onChange={v => set('username', v.replace(/\s/g, ''))} placeholder="username" required hint="بدون مسافات، يُستخدم لتسجيل الدخول" />
            <TextInput label="البريد الإلكتروني" value={form.email} onChange={v => set('email', v)} placeholder="info@firm.com" type="email" />
            <TextInput label="رقم الجوال" value={form.phone} onChange={v => set('phone', v)} placeholder="05XXXXXXXX" />
            <TextInput label="كلمة المرور" value={form.password} onChange={v => set('password', v)} placeholder="••••••••" type="password" required />
            <TextInput label="تأكيد كلمة المرور" value={form.confirmPassword} onChange={v => set('confirmPassword', v)} placeholder="••••••••" type="password" required />

            <ErrorBox message={error} />

            <button onClick={handleSubmit} disabled={loading} style={{
              width: '100%', padding: '13px', borderRadius: 12, fontSize: 15, fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: font,
              background: loading ? C.border : `linear-gradient(135deg, ${C.accent}, ${C.accentMid})`,
              color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
            }}>
              {loading ? <><LoadingSpinner size={18} color="#fff" /> جارٍ الإنشاء...</> : 'إنشاء الحساب ←'}
            </button>

            <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: C.textMuted, fontFamily: font }}>
              لديك حساب؟ <Link to="/firm/login" style={{ color: C.accentMid, fontWeight: 700, textDecoration: 'none' }}>تسجيل الدخول</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


