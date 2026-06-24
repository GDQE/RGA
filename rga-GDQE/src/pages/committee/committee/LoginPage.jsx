import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../components/TopBar';
import { TextInput, ErrorBox, LoadingSpinner } from '../../components/UI';
import { loginCommitteeMember } from '../../services/committeeAuthService';
import { C, font } from '../../utils/constants';

export function CommitteeLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim()) return setError('اسم المستخدم مطلوب');
    if (!password) return setError('كلمة المرور مطلوبة');
    setError('');
    setLoading(true);
    const result = await loginCommitteeMember({ username, password });
    setLoading(false);
    if (!result.success) {
      setError(result.error);
    } else {
      navigate('/committee/dashboard');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', direction: 'rtl' }}>
      <TopBar showBranding />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>⚖️</div>
            <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 900, color: C.text, fontFamily: font }}>بوابة لجنة التقييم</h1>
            <p style={{ margin: 0, color: C.textSub, fontSize: 14, fontFamily: font }}>سجّل دخولك لتقييم المرشحين المُحوّلين للجنة</p>
          </div>

          <div style={{ background: C.surface, borderRadius: 20, padding: '32px 36px', boxShadow: C.shadowLg, border: `1px solid ${C.border}` }}>
            <TextInput label="اسم المستخدم" value={username} onChange={setUsername} placeholder="username" />
            <TextInput label="كلمة المرور" value={password} onChange={setPassword} placeholder="••••••••" type="password" />

            <ErrorBox message={error} />

            <button onClick={handleLogin} disabled={loading} style={{
              width: '100%', padding: '13px', borderRadius: 12, fontSize: 15, fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: font,
              background: loading ? C.border : `linear-gradient(135deg, ${C.accent}, ${C.accentMid})`,
              color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
            }}>
              {loading ? <><LoadingSpinner size={18} color="#fff" /> جارٍ التحقق...</> : 'دخول ←'}
            </button>

            <p style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: C.textMuted, fontFamily: font }}>
              نسيت كلمة المرور؟ تواصل مع الإدارة لإعادة التعيين
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

