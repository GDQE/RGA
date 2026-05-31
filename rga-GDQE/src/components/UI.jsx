import { useState } from 'react';
import { C, font } from '../utils/constants';

export function TextInput({ label, value, onChange, placeholder, required, hint, type = 'text', disabled }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6, fontFamily: font }}>
        {label} {required && <span style={{ color: C.danger }}>*</span>}
      </label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 14,
          fontFamily: font, color: C.text, background: disabled ? '#f8f9fa' : C.surface,
          boxSizing: "border-box",
          border: `1.5px solid ${focused ? C.accentMid : C.border}`,
          boxShadow: focused ? `0 0 0 3px ${C.accentLight}22` : "none",
          outline: "none", transition: "all 0.2s", cursor: disabled ? 'not-allowed' : 'text'
        }}
      />
      {hint && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4, fontFamily: font }}>{hint}</div>}
    </div>
  );
}

export function PhoneInput({ value, onChange }) {
  const [focused, setFocused] = useState(false);
  const digits = value.replace(/^\+966/, "");
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6, fontFamily: font }}>
        رقم الجوال <span style={{ color: C.danger }}>*</span>
      </label>
      <div style={{
        display: "flex", borderRadius: 10, overflow: "hidden",
        border: `1.5px solid ${focused ? C.accentMid : C.border}`,
        boxShadow: focused ? `0 0 0 3px ${C.accentLight}22` : "none",
        transition: "all 0.2s", background: C.surface
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6, padding: "0 12px",
          background: "#F1F5F9", borderLeft: `1px solid ${C.border}`,
          fontSize: 13, fontWeight: 700, color: "#374151", whiteSpace: "nowrap", flexShrink: 0
        }}>
          <span style={{ fontSize: 18 }}>🇸🇦</span>
          <span style={{ fontFamily: "monospace", letterSpacing: 0.5 }}>+966</span>
        </div>
        <input
          value={digits}
          onChange={e => { const raw = e.target.value.replace(/\D/g, "").slice(0, 9); onChange("+966" + raw); }}
          placeholder="5XXXXXXXX" type="tel" maxLength={9}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ flex: 1, padding: "11px 14px", fontSize: 15, fontFamily: "monospace", letterSpacing: 2, color: C.text, background: "transparent", border: "none", outline: "none" }}
        />
      </div>
      <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4, fontFamily: font }}>مثال: 512345678</div>
    </div>
  );
}

export function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <div style={{
      background: C.dangerBg, border: `1px solid ${C.danger}33`,
      borderRadius: 8, padding: "10px 14px", marginBottom: 18,
      color: C.danger, fontSize: 13, fontFamily: font
    }}>
      ⚠️ {message}
    </div>
  );
}

export function LoadingSpinner({ size = 24, color = C.accentMid }) {
  return (
    <div style={{
      width: size, height: size, border: `3px solid ${color}22`,
      borderTop: `3px solid ${color}`, borderRadius: '50%',
      animation: 'spin 0.7s linear infinite', display: 'inline-block'
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function LoadingPage({ text = 'جارٍ التحميل...' }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: C.bg,
      gap: 16, direction: 'rtl'
    }}>
      <LoadingSpinner size={40} />
      <p style={{ color: C.textMuted, fontFamily: font, fontSize: 15 }}>{text}</p>
    </div>
  );
}

export function Badge({ children, color = 'default' }) {
  const colors = {
    default: { bg: C.accentGhost, text: C.accentMid },
    success: { bg: C.successBg, text: C.success },
    danger: { bg: C.dangerBg, text: C.danger },
    warning: { bg: C.warningBg, text: C.warning },
    gold: { bg: C.goldBg, text: C.gold },
  };
  const { bg, text } = colors[color] || colors.default;
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 20,
      background: bg, color: text, fontSize: 12, fontWeight: 700, fontFamily: font
    }}>
      {children}
    </span>
  );
}

export function StatCard({ icon, label, value, sub, color = C.accentMid }) {
  return (
    <div style={{
      background: C.surface, borderRadius: 16, padding: '20px 24px',
      boxShadow: C.shadow, border: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center', gap: 16
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14, flexShrink: 0,
        background: `${color}18`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 24
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 900, color, fontFamily: font, lineHeight: 1.2 }}>{value}</div>
        <div style={{ fontSize: 13, color: C.text, fontWeight: 600, fontFamily: font }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: C.textMuted, fontFamily: font, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}
