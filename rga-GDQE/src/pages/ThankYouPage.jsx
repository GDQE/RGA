import { RGALogo } from '../components/RGALogo';
import { C, font } from '../utils/constants';

export function ThankYouPage({ candidate, result, saveStatus }) {
  const { results } = result;
  const now = new Date();
  const dateStr = now.toLocaleDateString('ar-SA');
  const timeStr = now.toLocaleTimeString('ar-SA');

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', direction: 'rtl' }}>
      <div style={{ background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 40px', gap: 0 }}>
          <RGALogo size={64} />
          <div style={{ width: 2, height: 68, background: '#CBD5E0', margin: '0 20px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ color: '#4A5568', fontSize: 24, fontWeight: 900, fontFamily: font, lineHeight: 1.2 }}>الهيئة العامة للطرق</div>
            <div style={{ color: '#718096', fontSize: 13, fontWeight: 500, fontFamily: font }}>Roads General Authority</div>
            <div style={{ width: '100%', height: 1, background: '#E2E8F0', margin: '4px 0' }}/>
            <div style={{ color: '#2E7D52', fontSize: 14, fontWeight: 700, fontFamily: font }}>الإدارة العامة للجودة والبيئة</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ width: '100%', maxWidth: 520 }}>
          <div style={{ background: C.surface, borderRadius: 24, boxShadow: C.shadowLg, border: '1px solid ' + C.border, overflow: 'hidden' }}>
            <div style={{ height: 6, background: 'linear-gradient(90deg,' + C.accent + ',' + C.accentLight + ')' }}/>
            <div style={{ padding: '44px 48px', textAlign: 'center' }}>
              <div style={{ margin: '0 auto 24px', display: 'flex', justifyContent: 'center' }}>
                <RGALogo size={80} />
              </div>
              <h2 style={{ margin: '0 0 18px', fontSize: 22, fontWeight: 900, color: C.text, lineHeight: 1.5, fontFamily: font }}>
                شكرا لإتمامك الاختبار المبدئي
              </h2>

              {saveStatus === 'saving' && (
                <div style={{ background: C.accentGhost, borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: C.accentMid, fontFamily: font }}>
                  جاري حفظ بياناتك...
                </div>
              )}
              {saveStatus === 'saved' && (
                <div style={{ background: C.successBg, borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: C.success, fontFamily: font }}>
                  تم حفظ بياناتك بنجاح
                </div>
              )}
              {saveStatus === 'error' && (
                <div style={{ background: C.dangerBg, borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: C.danger, fontFamily: font }}>
                  تعذر حفظ البيانات - يرجى إبلاغ المشرف
                </div>
              )}

              <div style={{ background: C.accentGhost, borderRadius: 14, padding: '18px 24px', marginBottom: 28 }}>
                <p style={{ margin: 0, fontSize: 15, color: C.textSub, lineHeight: 1.9, fontFamily: font }}>
                  سيتم التواصل معك في حال اجتيازك للانتقال إلى المقابلة النهائية.
                </p>
              </div>

              <div style={{ background: C.bg, borderRadius: 12, padding: '16px 20px', border: '1px solid ' + C.border, textAlign: 'right' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px' }}>
                  {[
                    { label: 'الاسم', value: candidate.name },
                    { label: 'الشركة', value: candidate.company },
                    { label: 'الهوية / الإقامة', value: candidate.idNumber },
                    { label: 'رقم الجوال', value: candidate.phone },
                    { label: 'التخصص', value: candidate.specialty },
                    { label: 'الشهادات الإضافية', value: candidate.certificates || '-' },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 2, fontFamily: font }}>{item.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: font, wordBreak: 'break-word' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, background: C.bg, borderRadius: 12, padding: '12px 20px', border: '1px solid ' + C.border }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: C.textMuted, fontFamily: font }}>التاريخ</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: font }}>{dateStr}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: C.textMuted, fontFamily: font }}>الوقت</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: font }}>{timeStr}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: C.textMuted, fontFamily: font }}>الاسئلة</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: font }}>{results.length}أسئلة</div>
                </div>
              </div>

              <p style={{ fontSize: 12, color: C.textMuted, margin: '20px 0 0', fontFamily: font }}>يمكنك إغلاق هذه النافذة الآن</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


