import { useState } from 'react';
import { TopBar } from '../components/TopBar';
import { ErrorBox } from '../components/UI';
import { C, font } from '../utils/constants';
import { supabase } from '../services/supabase';

export function AccessCodePage({ onSuccess }) {
const [code, setCode] = useState('');
const [error, setError] = useState('');
const [checking, setChecking] = useState(false);

const handleSubmit = async () => {
if (!code.trim()) return setError('يرجى إدخال رمز الدخول');
setError('');
setChecking(true);
// التحقق يتم على الخادم عبر verify_access_code RPC — الرمز الصحيح مخزّن في
// قاعدة البيانات فقط (جدول app_settings) ولا يصل أبداً لكود الموقع المنشور
const { data, error: err } = await supabase.rpc('verify_access_code', { p_code: code.trim() });
setChecking(false);
if (err || data !== true) {
setError('رمز الدخول غير صحيح — يرجى التواصل مع المشرف');
return;
}
onSuccess();
};

return (
<div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', direction: 'rtl' }}>
<TopBar showBranding />
<div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
<div style={{ width: '100%', maxWidth: 420 }}>
<div style={{ background: C.surface, borderRadius: 20, padding: '40px 36px', boxShadow: '0 12px 40px rgba(0,0,0,0.12)', border: `1px solid ${C.border}`, textAlign: 'center' }}>
<div style={{ fontSize: 52, marginBottom: 16 }}></div>
<h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 900, color: C.text, fontFamily: font }}>رمز الدخول</h2>
<p style={{ margin: '0 0 28px', color: C.textMuted, fontSize: 14, fontFamily: font }}>أدخل رمز الدخول الذي حصلت عليه من المشرف</p>

<input
value={code}
onChange={e => setCode(e.target.value)}
onKeyDown={e => e.key === 'Enter' && handleSubmit()}
placeholder="أدخل الرمز هنا"
maxLength={20}
style={{
width: '100%', padding: '14px', borderRadius: 12, fontSize: 20,
fontFamily: 'monospace', letterSpacing: 4, textAlign: 'center',
border: `2px solid ${error ? C.danger : C.border}`,
outline: 'none', boxSizing: 'border-box', color: C.text,
background: '#F8FAFC', marginBottom: 16,
textTransform: 'uppercase'
}}
autoFocus
/>

<ErrorBox message={error} />

<button onClick={handleSubmit} disabled={checking} style={{
width: '100%', padding: '13px', borderRadius: 12, fontSize: 15,
fontWeight: 800, cursor: checking ? 'not-allowed' : 'pointer', fontFamily: font,
background: `linear-gradient(135deg, ${C.accentLight}, ${C.accent})`,
color: '#fff', border: 'none', marginTop: 4
}}>
{checking ? 'جارٍ التحقق...' : 'دخول ←'}
</button>

<p style={{ marginTop: 16, fontSize: 12, color: C.textMuted, fontFamily: font }}>
للحصول على رمز الدخول تواصل مع الإدارة العامة للجودة والبيئة
</p>
</div>
</div>
</div>
</div>
);
}
