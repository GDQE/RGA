import { RGALogo } from './RGALogo';
import { font } from '../utils/constants';

export function TopBar({ title, showBranding }) {
  return (
    <div style={{ background: "#FFFFFF", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
      {showBranding ? (
        <div style={{ background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 40px", gap: 0 }}>
          <RGALogo size={64} />
          <div style={{ width: 2, height: 68, background: "#CBD5E0", margin: "0 20px" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ color: "#4A5568", fontSize: 24, fontWeight: 900, fontFamily: font, lineHeight: 1.2 }}>
              الهيئة العامة للطرق
            </div>
            <div style={{ color: "#718096", fontSize: 13, fontWeight: 500, fontFamily: font, letterSpacing: 0.3 }}>
              Roads General Authority
            </div>
            <div style={{ width: "100%", height: 1, background: "#E2E8F0", margin: "4px 0" }}/>
            <div style={{ color: "#2E7D52", fontSize: 14, fontWeight: 700, fontFamily: font }}>
              الإدارة العامة للجودة والبيئة
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: "#FFFFFF", height: 56, display: "flex", alignItems: "center", padding: "0 24px", gap: 10, borderBottom: "1px solid #E2E6E9" }}>
          <RGALogo size={36} />
          <div style={{ width: 1, height: 40, background: "#CBD5E0", margin: "0 6px" }}/>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: "#4A5568", fontFamily: font, lineHeight: 1.2 }}>الهيئة العامة للطرق</div>
            <div style={{ fontSize: 11, color: "#2E7D52", fontFamily: font, fontWeight: 600 }}>الإدارة العامة للجودة والبيئة</div>
          </div>
          <div style={{ marginRight: "auto", color: "#4A5568", fontSize: 13, fontWeight: 700, fontFamily: font }}>
            {title || "نظام اختبار تأهيل المهندسين"}
          </div>
        </div>
      )}
    </div>
  );
}
