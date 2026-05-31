import { useState } from 'react';
import { RGALogo } from '../components/RGALogo';
import { TextInput, ErrorBox, LoadingSpinner } from '../components/UI';
import { signIn } from '../services/authService';
import { C, font } from '../utils/constants';

export function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) return setError('البريد الإلكتروني مطلوب');
    if (!password) return setError('كلمة المرور مطلوبة');
    setError('');
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (!result.success) {
      setError('بيانات الدخول غير صحيحة. يرجى المحاولة مجدداً.');
    } else {
      onLogin(result.user);
    }
  };

  const handleKey = (e) => { if (e.key === 'Enter') handleLogin(); };

  return (
    <div style={{
      minHeight: '100vh', background: `linear-gradient(135deg, #1a2332 0%, #2D3748 50%, #3D4A5C 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', direction: 'rtl', padding: 20
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <RGALogo size={56} />
            <div style={{ borderRight: '2px solid rgba(255,255,255,0.2)', paddingRight: 16 }}>
              <div style={{ color: '#fff', fontSize: 20, fontWeight: 900, fontFamily: font }}>الهيئة العامة للطرق</div>
              <div style={{ color: '#2E7D52', fontSize: 12, fontWeight: 600, fontFamily: font, marginTop: 2 }}>الإدارة العامة للجودة والبيئة</div>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '6px 16px', display: 'inline-block' }}>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: font }}>🔐 لوحة تحكم الإدارة</span>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.96)', borderRadius: 20, padding: '36px 40px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)'
        }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 900, color: C.text, fontFamily: font }}>تسجيل الدخول</h2>
          <p style={{ margin: '0 0 28px', color: C.textMuted, fontSize: 13, fontFamily: font }}>أدخل بيانات حساب الإدارة للمتابعة</p>

          <TextInput
            label="البريد الإلكتروني"
            value={email}
            onChange={setEmail}
            placeholder="admin@rga.gov.sa"
            type="email"
          />
          <TextInput
            label="كلمة المرور"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            type="password"
          />

          <ErrorBox message={error} />

          <button
            onClick={handleLogin}
            disabled={loading}
            onKeyDown={handleKey}
            style={{
              width: '100%', padding: '13px', borderRadius: 12, fontSize: 15, fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: font,
              background: loading ? C.border : `linear-gradient(135deg, #2D3748, #1a2332)`,
              color: loading ? C.textMuted : '#fff', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'all 0.2s'
            }}>
            {loading ? <><LoadingSpinner size={18} color="#fff" /> جارٍ التحقق...</> : 'دخول →'}
          </button>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 20, fontFamily: font }}>
          نظام اختبار التأهيل — الهيئة العامة للطرق © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
