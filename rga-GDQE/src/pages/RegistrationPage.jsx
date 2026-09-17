import { useState } from 'react';
import { TopBar } from '../components/TopBar';
import { ErrorBox, LoadingSpinner } from '../components/UI';
import { C, font, SPECIALTIES, SPECIALTY_ICONS } from '../utils/constants';
import { supabase } from '../services/supabase';

export function RegistrationPage({ onSubmit, loadError }) {
  const [idNumber, setIdNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [candidate, setCandidate] = useState(null); // بيانات المرشح من قاعدة البيانات
  const [step, setStep] = useState('lookup'); // lookup -> confirm -> otp
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleLookup = async () => {
    if (!idNumber.trim() || idNumber.length < 9) {
      return setError('يرجى إدخال رقم الهوية كاملاً');
    }
    setError('');
    setLoading(true);

    // البحث عن المرشح بالهوية في النظام
    const { data, error: err } = await supabase
      .from('candidates')
      .select('id, full_name, specialty, company, national_id, id_number, application_status, email')
      .or(`national_id.eq.${idNumber.trim()},id_number.eq.${idNumber.trim()}`)
      .eq('application_status', 'exam_scheduled')
      .maybeSingle();

    setLoading(false);

    if (err) {
      setError('خطأ في الاتصال — يرجى المحاولة مجدداً');
      return;
    }

    if (!data) {
      setError('رقم الهوية غير مسجّل  — تواصل مع مكتبك الاستشاري');
      return;
    }

    setCandidate(data);
    setStep('confirm');
  };

  // إرسال رمز تحقق للبريد المسجّل — خطوة تحقق ثانية قبل بدء الاختبار
  // (تمنع دخول أي شخص يعرف رقم هوية مرشح آخر بدون امتلاك بريده الفعلي)
  const handleSendOtp = async () => {
    if (!candidate?.email) {
      setOtpError('لا يوجد بريد إلكتروني مسجّل لهذا الحساب — تواصل مع مكتبك الاستشاري لتحديث بياناتك');
      return;
    }
    setOtpError('');
    setOtpLoading(true);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: candidate.email,
      options: { shouldCreateUser: true },
    });
    setOtpLoading(false);
    if (err) {
      setOtpError('تعذّر إرسال رمز التحقق — حاول مرة أخرى: ' + err.message);
      return;
    }
    setStep('otp');
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown(s => {
        if (s <= 1) { clearInterval(timer); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setOtpError('أدخل رمز التحقق المكوّن من 6 أرقام');
      return;
    }
    setOtpError('');
    setOtpLoading(true);
    const { error: err } = await supabase.auth.verifyOtp({
      email: candidate.email,
      token: otpCode.trim(),
      type: 'email',
    });
    setOtpLoading(false);
    if (err) {
      setOtpError('رمز التحقق غير صحيح أو منتهي الصلاحية');
      return;
    }
    // التحقق نجح — نبدأ الاختبار فعلياً
    onSubmit({
      candidateId: candidate.id,
      name: candidate.full_name,
      specialty: candidate.specialty,
      company: candidate.company,
      idNumber: idNumber.trim(),
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', direction: 'rtl' }}>
      <TopBar showBranding />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}></div>
            <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 900, color: C.text, fontFamily: font }}>
              {step === 'otp' ? 'تحقق من بريدك الإلكتروني' : 'الدخول للاختبار'}
            </h1>
            <p style={{ margin: 0, color: C.textSub, fontSize: 14, fontFamily: font }}>
              {step === 'otp' ? `أرسلنا رمزاً مكوّناً من 6 أرقام إلى ${candidate?.email}` : 'أدخل رقم هويتك للتحقق من تسجيلك'}
            </p>
          </div>

          <div style={{ background: C.surface, borderRadius: 20, padding: '32px 36px', boxShadow: C.shadowLg, border: `1px solid ${C.border}` }}>

            {step === 'lookup' && (
              <>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8, fontFamily: font }}>
                  رقم الهوية / الإقامة
                </label>
                <input
                  value={idNumber}
                  onChange={e => setIdNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  onKeyDown={e => e.key === 'Enter' && handleLookup()}
                  placeholder="أدخل رقم الهوية"
                  maxLength={10}
                  style={{
                    width: '100%', padding: '13px 14px', borderRadius: 12, fontSize: 18,
                    fontFamily: 'monospace', letterSpacing: 3, textAlign: 'center',
                    border: `1.5px solid ${error ? C.danger : C.border}`,
                    outline: 'none', boxSizing: 'border-box', color: C.text,
                    background: '#F8FAFC', marginBottom: 16,
                  }}
                  autoFocus
                />
                <ErrorBox message={error} />
                <button onClick={handleLookup} disabled={loading} style={{
                  width: '100%', padding: '13px', borderRadius: 12, fontSize: 15, fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer', fontFamily: font,
                  background: loading ? C.border : `linear-gradient(135deg, ${C.accent}, ${C.accentMid})`,
                  color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                }}>
                  {loading ? <><LoadingSpinner size={18} color="#fff" /> جارٍ التحقق...</> : 'تحقق من التسجيل ←'}
                </button>
              </>
            )}

            {step === 'confirm' && (
              <>
                <div style={{ background: C.successBg, border: `1px solid ${C.success}`, borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
                  <div style={{ fontSize: 13, color: C.success, fontWeight: 700, marginBottom: 10, fontFamily: font }}>✓ تم التحقق — بياناتك:</div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <InfoRow label="الاسم" value={candidate.full_name} />
                    <InfoRow label="التخصص" value={`${SPECIALTY_ICONS[candidate.specialty] || ''} ${candidate.specialty}`} />
                    <InfoRow label="الشركة" value={candidate.company} />
                  </div>
                </div>

                <p style={{ fontSize: 13, color: C.textSub, textAlign: 'center', marginBottom: 20, fontFamily: font }}>
                  هل هذه بياناتك الصحيحة؟
                </p>
                {loadError && <p style={{ fontSize: 13, color: C.danger, textAlign: 'center', marginBottom: 16, fontFamily: font }}>{loadError}</p>}
                <ErrorBox message={otpError} />

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => { setCandidate(null); setIdNumber(''); setStep('lookup'); }} style={{
                    flex: 1, padding: '11px', borderRadius: 10, border: `1px solid ${C.border}`,
                    background: 'transparent', color: C.textSub, cursor: 'pointer', fontFamily: font, fontSize: 14
                  }}>
                    لا، تراجع
                  </button>
                  <button onClick={handleSendOtp} disabled={otpLoading} style={{
                    flex: 2, padding: '11px', borderRadius: 10, border: 'none',
                    background: `linear-gradient(135deg, ${C.accent}, ${C.accentMid})`,
                    color: '#fff', fontWeight: 800, cursor: otpLoading ? 'not-allowed' : 'pointer', fontFamily: font, fontSize: 14
                  }}>
                    {otpLoading ? 'جارٍ الإرسال...' : 'نعم، إرسال رمز التحقق ←'}
                  </button>
                </div>
              </>
            )}

            {step === 'otp' && (
              <>
                <input
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                  placeholder="000000"
                  maxLength={6}
                  style={{
                    width: '100%', padding: '13px 14px', borderRadius: 12, fontSize: 24,
                    fontFamily: 'monospace', letterSpacing: 10, textAlign: 'center',
                    border: `1.5px solid ${otpError ? C.danger : C.border}`,
                    outline: 'none', boxSizing: 'border-box', color: C.text,
                    background: '#F8FAFC', marginBottom: 16,
                  }}
                  autoFocus
                />
                <ErrorBox message={otpError} />
                <button onClick={handleVerifyOtp} disabled={otpLoading} style={{
                  width: '100%', padding: '13px', borderRadius: 12, fontSize: 15, fontWeight: 800,
                  cursor: otpLoading ? 'not-allowed' : 'pointer', fontFamily: font,
                  background: otpLoading ? C.border : `linear-gradient(135deg, ${C.accent}, ${C.accentMid})`,
                  color: '#fff', border: 'none', marginBottom: 12
                }}>
                  {otpLoading ? 'جارٍ التحقق...' : 'تأكيد ودخول الاختبار ←'}
                </button>
                <button
                  onClick={handleSendOtp}
                  disabled={resendCooldown > 0 || otpLoading}
                  style={{
                    width: '100%', background: 'none', border: 'none', textAlign: 'center',
                    color: resendCooldown > 0 ? C.textSub : C.accent, cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                    fontSize: 13, fontFamily: font, textDecoration: resendCooldown > 0 ? 'none' : 'underline'
                  }}>
                  {resendCooldown > 0 ? `إعادة الإرسال بعد ${resendCooldown} ثانية` : 'إعادة إرسال الرمز'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontFamily: "'IBM Plex Sans Arabic','Tajawal',sans-serif" }}>
      <span style={{ color: '#6B7280' }}>{label}</span>
      <span style={{ fontWeight: 700, color: '#1F2937' }}>{value}</span>
    </div>
  );
}
