import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RGALogo } from '../components/RGALogo';
import { font } from '../utils/constants';

const C = {
  green: '#1B5E35', greenMid: '#2E7D52', greenLight: '#EAF3ED',
  gold: '#C8A951', goldLight: '#FDF8EC',
  text: '#1A1A1A', sub: '#4A4A4A', muted: '#888',
  border: '#E5E7EB', white: '#FFFFFF', bg: '#F7F8F6',
};

const ROLES = [
  { id: 'candidate', icon: '📝', title: 'بدء الاختبار', subtitle: 'للمرشحين المسجّلين', desc: 'أدخل رمز الدخول ورقم هويتك لبدء اختبار التأهيل', color: '#1B5E35', bg: '#EAF3ED', border: '#1B5E35', path: '/exam' },
  { id: 'firm', icon: '🏢', title: 'المكاتب الاستشارية', subtitle: 'إدارة المرشحين والطلبات', desc: 'تسجيل المرشحين ورفع المستندات ومتابعة حالة الطلبات', color: '#1D4ED8', bg: '#EFF6FF', border: '#3B82F6', path: '/firm/login' },
  { id: 'admin', icon: '⚙️', title: 'لوحة الإدارة', subtitle: 'الإدارة العامة للجودة والبيئة', desc: 'إدارة المنصة والمكاتب والاختبارات والتقارير والشهادات', color: '#7C3AED', bg: '#F5F3FF', border: '#8B5CF6', path: '/admin/login' },
  { id: 'committee', icon: '⚖️', title: 'لجنة التقييم', subtitle: 'تقييم المرشحين المؤهّلين', desc: 'تقييم المرشحين الناجحين في الاختبار واعتماد النتائج النهائية', color: '#B45309', bg: '#FFFBEB', border: '#F59E0B', path: '/committee/login' },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, direction: 'rtl', fontFamily: font, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ background: C.white, borderBottom: `3px solid ${C.gold}`, padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <RGALogo size={40} />
          <div style={{ borderRight: `1px solid ${C.border}`, paddingRight: 16, marginRight: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.green, fontFamily: font }}>الهيئة العامة للطرق</div>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: font }}>الإدارة العامة للجودة والبيئة</div>
          </div>
        </div>
        <div style={{ background: C.green, color: C.white, fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: 20, fontFamily: font }}>
          نظام تأهيل المهندسين
        </div>
      </header>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenMid} 60%, #1a5c3a 100%)`, padding: '56px 40px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 60px)`, pointerEvents: 'none' }} />
        <div style={{ display: 'inline-block', background: 'rgba(200,169,81,0.15)', border: `1px solid rgba(200,169,81,0.4)`, borderRadius: 24, padding: '4px 18px', marginBottom: 20 }}>
          <span style={{ fontSize: 12, color: C.gold, fontWeight: 700, fontFamily: font }}>المنصة الرقمية — الإصدار 2.0</span>
        </div>
        <h1 style={{ margin: '0 0 12px', fontSize: 32, fontWeight: 900, color: C.white, fontFamily: font, lineHeight: 1.4 }}>
          نظام تأهيل الكوادر الهندسية
        </h1>
        <p style={{ margin: '0 auto', fontSize: 15, color: 'rgba(255,255,255,0.75)', fontFamily: font, maxWidth: 480, lineHeight: 1.8 }}>
          منصة متكاملة لإدارة اختبارات التأهيل والتقييم وإصدار الشهادات الرقمية
        </p>
      </div>

      {/* Role Selection */}
      <div style={{ flex: 1, padding: '44px 40px', maxWidth: 960, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800, color: C.text, fontFamily: font }}>اختر نوع الدخول</h2>
          <p style={{ margin: 0, fontSize: 14, color: C.muted, fontFamily: font }}>سيتم توجيهك إلى لوحة التحكم الخاصة بك</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {ROLES.map(role => (
            <button key={role.id} onClick={() => navigate(role.path)}
              onMouseEnter={() => setHovered(role.id)} onMouseLeave={() => setHovered(null)}
              style={{
                background: hovered === role.id ? role.bg : C.white,
                border: `2px solid ${hovered === role.id ? role.border : C.border}`,
                borderRadius: 16, padding: '28px 24px', cursor: 'pointer',
                textAlign: 'right', transition: 'all 0.2s ease',
                transform: hovered === role.id ? 'translateY(-2px)' : 'none',
                boxShadow: hovered === role.id ? '0 8px 24px rgba(0,0,0,0.10)' : '0 2px 8px rgba(0,0,0,0.04)',
                display: 'flex', flexDirection: 'column', gap: 12,
              }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ fontSize: 28, width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', background: hovered === role.id ? role.color : '#F8FAFC', borderRadius: 12, transition: 'all 0.2s', flexShrink: 0 }}>
                  {role.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: hovered === role.id ? role.color : C.text, fontFamily: font, marginBottom: 4, transition: 'color 0.2s' }}>{role.title}</div>
                  <div style={{ fontSize: 12, color: role.color, fontWeight: 600, fontFamily: font, opacity: 0.8 }}>{role.subtitle}</div>
                </div>
                <div style={{ fontSize: 18, color: hovered === role.id ? role.color : C.border, transition: 'all 0.2s', transform: hovered === role.id ? 'translateX(-4px)' : 'none' }}>←</div>
              </div>
              <div style={{ fontSize: 13, color: C.sub, fontFamily: font, lineHeight: 1.7, borderTop: `1px solid ${hovered === role.id ? role.border : C.border}`, paddingTop: 12, transition: 'border-color 0.2s' }}>
                {role.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: C.white, borderTop: `1px solid ${C.border}`, padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 12, color: C.muted, fontFamily: font }}>© {new Date().getFullYear()} الهيئة العامة للطرق — جميع الحقوق محفوظة</div>
        <div style={{ fontSize: 12, color: C.muted, fontFamily: font }}>للدعم الفني: الإدارة العامة للجودة والبيئة</div>
      </footer>
    </div>
  );
}
