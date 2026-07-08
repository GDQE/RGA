import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { verifyCertificate } from '../services/certificateService';
import { C, font } from '../utils/constants';
import { LoadingSpinner } from '../components/UI';
import { RGALogo } from '../components/RGALogo';

export function CertificatePage() {
  const [params] = useSearchParams();
  const certNumber = params.get('cert');
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    if (certNumber) load();
    else { setError('رقم الشهادة مفقود'); setLoading(false); }
  }, [certNumber]);

  const load = async () => {
    setLoading(true);
    const r = await verifyCertificate(certNumber);
    setLoading(false);
    if (!r.success) { setError(r.error); return; }
    setCert(r.data);
    setIsExpired(r.isExpired);
  };

  const handlePrint = () => window.print();

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingSpinner size={40} />
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', direction: 'rtl', fontFamily: font }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>❌</div>
        <h2 style={{ color: C.danger }}>{error}</h2>
        <p style={{ color: C.textMuted }}>رقم الشهادة: {certNumber}</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F5', direction: 'rtl', fontFamily: font }}>
      {/* أزرار التحكم (لا تُطبع) */}
      <div className="no-print" style={{ padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 14, color: C.textSub, fontFamily: font }}>معاينة الشهادة</span>
        <button onClick={handlePrint} style={{
          padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: `linear-gradient(135deg, #1B5E35, #2E7D52)`,
          color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: font
        }}>
          🖨️ طباعة / PDF
        </button>
      </div>

      {/* الشهادة */}
      <div ref={printRef} style={{
        maxWidth: 800, margin: '0 auto 40px', padding: '0 20px'
      }}>
        <div style={{
          background: '#fff',
          border: '8px solid #1B5E35',
          borderRadius: 4,
          padding: '48px 56px',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}>
          {/* إطار داخلي ذهبي */}
          <div style={{
            position: 'absolute', inset: 12,
            border: '2px solid #C8A951',
            borderRadius: 2, pointerEvents: 'none',
          }} />

          {/* حالة انتهاء الصلاحية */}
          {isExpired && (
            <div style={{
              position: 'absolute', top: 24, left: 24, background: '#fee2e2',
              border: '1px solid #ef4444', borderRadius: 8, padding: '6px 14px',
              fontSize: 12, fontWeight: 700, color: '#dc2626', fontFamily: font
            }}>
              ⚠️ منتهية الصلاحية
            </div>
          )}

          {/* الشعار */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <RGALogo size={48} />
          </div>

          {/* العنوان */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 13, color: '#C8A951', fontWeight: 700, letterSpacing: 3, marginBottom: 8, fontFamily: font }}>
              الهيئة العامة للطرق
            </div>
            <h1 style={{
              margin: '0 0 6px', fontSize: 28, fontWeight: 900, color: '#1B5E35',
              fontFamily: font, borderBottom: '2px solid #C8A951', paddingBottom: 12, display: 'inline-block'
            }}>
              شهادة تأهيل مهندس
            </h1>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 8, fontFamily: font }}>
              Engineer Qualification Certificate
            </div>
          </div>

          {/* النص الرئيسي */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <p style={{ fontSize: 15, color: '#374151', lineHeight: 2, margin: 0, fontFamily: font }}>
              تشهد الهيئة العامة للطرق بأن
            </p>
            <div style={{
              fontSize: 26, fontWeight: 900, color: '#1B5E35',
              margin: '12px 0', fontFamily: font,
              borderBottom: '1px dashed #C8A951', paddingBottom: 8,
              display: 'inline-block', minWidth: 300
            }}>
              {cert.engineer_name}
            </div>
            <p style={{ fontSize: 15, color: '#374151', lineHeight: 2, margin: '8px 0 0', fontFamily: font }}>
              قد استوفى متطلبات التأهيل في تخصص
            </p>
            <div style={{
              fontSize: 20, fontWeight: 800, color: '#C8A951',
              margin: '8px 0', fontFamily: font
            }}>
              {cert.specialty}
            </div>
          </div>

          {/* تفاصيل الشهادة */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            gap: 20, margin: '28px 0', padding: '20px 24px',
            background: '#F9FAFB', borderRadius: 8,
            border: '1px solid #E5E7EB'
          }}>
            <CertField label="رقم الشهادة" value={cert.certificate_number} />
            <CertField label="تاريخ الإصدار" value={formatDate(cert.issue_date)} />
            <CertField label="تاريخ الانتهاء" value={formatDate(cert.expiry_date)} expired={isExpired} />
          </div>

          {/* QR Code + التوقيع */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 32 }}>
            {/* QR Code */}
            <div style={{ textAlign: 'center' }}>
              <QRCodeSVG value={cert.qr_code_data} size={90} />
              <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 6, fontFamily: font }}>
                امسح للتحقق
              </div>
            </div>

            {/* ختم */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{
                width: 90, height: 90, borderRadius: '50%',
                border: '3px solid #1B5E35', margin: '0 auto',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(27,94,53,0.05)'
              }}>
                <div style={{ fontSize: 11, color: '#1B5E35', fontWeight: 800, textAlign: 'center', fontFamily: font, lineHeight: 1.4 }}>
                  ختم<br />الهيئة
                </div>
              </div>
            </div>

            {/* توقيع */}
            <div style={{ textAlign: 'center', minWidth: 120 }}>
              <div style={{ borderBottom: '1px solid #374151', paddingBottom: 6, marginBottom: 6, minWidth: 120 }} />
              <div style={{ fontSize: 11, color: '#6B7280', fontFamily: font }}>مدير عام الجودة والبيئة</div>
            </div>
          </div>

          {/* تذييل */}
          <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 16, borderTop: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: 11, color: '#9CA3AF', fontFamily: font }}>
              للتحقق من صحة هذه الشهادة: {cert.qr_code_data}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
        }
      `}</style>
    </div>
  );
}

function CertField({ label, value, expired }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4, fontFamily: "'IBM Plex Sans Arabic','Tajawal',sans-serif" }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: expired ? '#dc2626' : '#1F2937', fontFamily: "'IBM Plex Sans Arabic','Tajawal',sans-serif" }}>{value}</div>
    </div>
  );
}

// QR Code SVG مبسط (بدون مكتبة خارجية)
function QRCodeSVG({ value, size = 90 }) {
  // نستخدم Google Charts API لتوليد QR
  const url = `https://chart.googleapis.com/chart?chs=${size}x${size}&cht=qr&chl=${encodeURIComponent(value)}&choe=UTF-8`;
  return (
    <img src={url} alt="QR Code" width={size} height={size}
      style={{ border: '2px solid #E5E7EB', borderRadius: 4 }}
    />
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('ar-SA', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}
