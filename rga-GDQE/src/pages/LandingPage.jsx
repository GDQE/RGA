import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RGALogo } from '../components/RGALogo';
import { font } from '../utils/constants';

const GREEN = '#1B5E35';
const GREEN_MID = '#2E7D52';
const GREEN_LIGHT = '#EAF3ED';
const GOLD = '#C8A951';
const TEXT = '#1A1A1A';
const SUB = '#4A4A4A';
const MUTED = '#888';
const BORDER = '#E5E7EB';
const WHITE = '#FFFFFF';
const BG = '#F7F8F6';

const ROLES = [
  {
    id: 'candidate',
    icon: '\u{1F4DD}',
    title: '\u0628\u062F\u0621 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631',
    subtitle: '\u0644\u0644\u0645\u0631\u0634\u062D\u064A\u0646 \u0627\u0644\u0645\u0633\u062C\u0651\u0644\u064A\u0646',
    desc: '\u0623\u062F\u062E\u0644 \u0631\u0645\u0632 \u0627\u0644\u062F\u062E\u0648\u0644 \u0648\u0631\u0642\u0645 \u0647\u0648\u064A\u062A\u0643 \u0644\u0628\u062F\u0621 \u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u062A\u0623\u0647\u064A\u0644',
    color: GREEN,
    bg: GREEN_LIGHT,
    border: GREEN,
    path: '/exam',
  },
  {
    id: 'firm',
    icon: '\u{1F3E2}',
    title: '\u0627\u0644\u0645\u0643\u0627\u062A\u0628 \u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u064A\u0629',
    subtitle: '\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0631\u0634\u062D\u064A\u0646 \u0648\u0627\u0644\u0637\u0644\u0628\u0627\u062A',
    desc: '\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0645\u0631\u0634\u062D\u064A\u0646 \u0648\u0631\u0641\u0639 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0645\u062A\u0627\u0628\u0639\u0629 \u062D\u0627\u0644\u0629 \u0627\u0644\u0637\u0644\u0628\u0627\u062A',
    color: '#1D4ED8',
    bg: '#EFF6FF',
    border: '#3B82F6',
    path: '/firm/login',
  },
  {
    id: 'admin',
    icon: '\u2699\uFE0F',
    title: '\u0644\u0648\u062D\u0629 \u0627\u0644\u0625\u062F\u0627\u0631\u0629',
    subtitle: '\u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0627\u0645\u0629 \u0644\u0644\u062C\u0648\u062F\u0629 \u0648\u0627\u0644\u0628\u064A\u0626\u0629',
    desc: '\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0646\u0635\u0629 \u0648\u0627\u0644\u0645\u0643\u0627\u062A\u0628 \u0648\u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u0648\u0627\u0644\u0634\u0647\u0627\u062F\u0627\u062A',
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#8B5CF6',
    path: '/admin/login',
  },
  {
    id: 'committee',
    icon: '\u2696\uFE0F',
    title: '\u0644\u062C\u0646\u0629 \u0627\u0644\u062A\u0642\u064A\u064A\u0645',
    subtitle: '\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0645\u0631\u0634\u062D\u064A\u0646 \u0627\u0644\u0645\u0624\u0647\u0651\u0644\u064A\u0646',
    desc: '\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0645\u0631\u0634\u062D\u064A\u0646 \u0627\u0644\u0646\u0627\u062C\u062D\u064A\u0646 \u0641\u064A \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631 \u0648\u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u0646\u062A\u0627\u0626\u062C \u0627\u0644\u0646\u0647\u0627\u0626\u064A\u0629',
    color: '#B45309',
    bg: '#FFFBEB',
    border: '#F59E0B',
    path: '/committee/login',
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const year = new Date().getFullYear();

  return (
    <div style={{ minHeight: '100vh', background: BG, direction: 'rtl', fontFamily: font, display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{ background: WHITE, borderBottom: '3px solid ' + GOLD, padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <RGALogo size={40} />
          <div style={{ borderRight: '1px solid ' + BORDER, paddingRight: 16, marginRight: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: GREEN, fontFamily: font }}>
              {'\u0627\u0644\u0647\u064A\u0626\u0629 \u0627\u0644\u0639\u0627\u0645\u0629 \u0644\u0644\u0637\u0631\u0642'}
            </div>
            <div style={{ fontSize: 11, color: MUTED, fontFamily: font }}>
              {'\u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0627\u0645\u0629 \u0644\u0644\u062C\u0648\u062F\u0629 \u0648\u0627\u0644\u0628\u064A\u0626\u0629'}
            </div>
          </div>
        </div>
        <div style={{ background: GREEN, color: WHITE, fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: 20, fontFamily: font }}>
          {'\u0646\u0638\u0627\u0645 \u062A\u0623\u0647\u064A\u0644 \u0627\u0644\u0645\u0647\u0646\u062F\u0633\u064A\u0646'}
        </div>
      </header>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, ' + GREEN + ' 0%, ' + GREEN_MID + ' 60%, #1a5c3a 100%)', padding: '56px 40px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 60px)', pointerEvents: 'none' }} />
        <div style={{ display: 'inline-block', background: 'rgba(200,169,81,0.15)', border: '1px solid rgba(200,169,81,0.4)', borderRadius: 24, padding: '4px 18px', marginBottom: 20 }}>
          <span style={{ fontSize: 12, color: GOLD, fontWeight: 700, fontFamily: font }}>
            {'\u0627\u0644\u0645\u0646\u0635\u0629 \u0627\u0644\u0631\u0642\u0645\u064A\u0629 \u2014 \u0627\u0644\u0625\u0635\u062F\u0627\u0631 2.0'}
          </span>
        </div>
        <h1 style={{ margin: '0 0 12px', fontSize: 32, fontWeight: 900, color: WHITE, fontFamily: font, lineHeight: 1.4 }}>
          {'\u0646\u0638\u0627\u0645 \u062A\u0623\u0647\u064A\u0644 \u0627\u0644\u0643\u0648\u0627\u062F\u0631 \u0627\u0644\u0647\u0646\u062F\u0633\u064A\u0629'}
        </h1>
        <p style={{ margin: '0 auto', fontSize: 15, color: 'rgba(255,255,255,0.75)', fontFamily: font, maxWidth: 480, lineHeight: 1.8 }}>
          {'\u0645\u0646\u0635\u0629 \u0645\u062A\u0643\u0627\u0645\u0644\u0629 \u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u0623\u0647\u064A\u0644 \u0648\u0627\u0644\u062A\u0642\u064A\u064A\u0645 \u0648\u0625\u0635\u062F\u0627\u0631 \u0627\u0644\u0634\u0647\u0627\u062F\u0627\u062A \u0627\u0644\u0631\u0642\u0645\u064A\u0629'}
        </p>
      </div>

      {/* Cards */}
      <div style={{ flex: 1, padding: '44px 40px', maxWidth: 960, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800, color: TEXT, fontFamily: font }}>
            {'\u0627\u062E\u062A\u0631 \u0646\u0648\u0639 \u0627\u0644\u062F\u062E\u0648\u0644'}
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: MUTED, fontFamily: font }}>
            {'\u0633\u064A\u062A\u0645 \u062A\u0648\u062C\u064A\u0647\u0643 \u0625\u0644\u0649 \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0643'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {ROLES.map(role => (
            <button
              key={role.id}
              onClick={() => navigate(role.path)}
              onMouseEnter={() => setHovered(role.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: hovered === role.id ? role.bg : WHITE,
                border: '2px solid ' + (hovered === role.id ? role.border : BORDER),
                borderRadius: 16, padding: '28px 24px', cursor: 'pointer',
                textAlign: 'right', transition: 'all 0.2s ease',
                transform: hovered === role.id ? 'translateY(-2px)' : 'none',
                boxShadow: hovered === role.id ? '0 8px 24px rgba(0,0,0,0.10)' : '0 2px 8px rgba(0,0,0,0.04)',
                display: 'flex', flexDirection: 'column', gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ fontSize: 28, width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', background: hovered === role.id ? role.color : '#F8FAFC', borderRadius: 12, transition: 'all 0.2s', flexShrink: 0 }}>
                  {role.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: hovered === role.id ? role.color : TEXT, fontFamily: font, marginBottom: 4 }}>
                    {role.title}
                  </div>
                  <div style={{ fontSize: 12, color: role.color, fontWeight: 600, fontFamily: font, opacity: 0.8 }}>
                    {role.subtitle}
                  </div>
                </div>
                <div style={{ fontSize: 18, color: hovered === role.id ? role.color : BORDER, transition: 'all 0.2s' }}>
                  {'\u2190'}
                </div>
              </div>
              <div style={{ fontSize: 13, color: SUB, fontFamily: font, lineHeight: 1.7, borderTop: '1px solid ' + (hovered === role.id ? role.border : BORDER), paddingTop: 12 }}>
                {role.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: WHITE, borderTop: '1px solid ' + BORDER, padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 12, color: MUTED, fontFamily: font }}>
          {'\u00A9 ' + year + ' \u0627\u0644\u0647\u064A\u0626\u0629 \u0627\u0644\u0639\u0627\u0645\u0629 \u0644\u0644\u0637\u0631\u0642 \u2014 \u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0642\u0648\u0642 \u0645\u062D\u0641\u0648\u0638\u0629'}
        </div>
        <div style={{ fontSize: 12, color: MUTED, fontFamily: font }}>
          {'\u0644\u0644\u062F\u0639\u0645 \u0627\u0644\u0641\u0646\u064A: \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0627\u0645\u0629 \u0644\u0644\u062C\u0648\u062F\u0629 \u0648\u0627\u0644\u0628\u064A\u0626\u0629'}
        </div>
      </footer>
    </div>
  );
}


