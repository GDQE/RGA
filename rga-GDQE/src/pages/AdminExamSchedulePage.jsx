import { useState, useEffect } from 'react';
import { LoadingSpinner, Badge } from '../components/UI';
import { fetchAllScheduledExams } from '../services/examSchedulingService';
import { notifyExamResult } from '../services/examSchedulingService';
import { C, font, SPECIALTY_ICONS } from '../utils/constants';
import toast from 'react-hot-toast';

export function AdminExamSchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grouped, setGrouped] = useState({});

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const r = await fetchAllScheduledExams();
    if (r.success) {
      setSchedules(r.data);
      // تجميع حسب التاريخ
      const groups = {};
      r.data.forEach(s => {
        const date = s.exam_date;
        if (!groups[date]) groups[date] = [];
        groups[date].push(s);
      });
      setGrouped(groups);
    }
    setLoading(false);
  };

  const handleMarkResult = async (candidateId, name, passed) => {
    const r = await notifyExamResult(candidateId, passed);
    if (r.success) {
      toast.success(`تم تسجيل نتيجة ${name}: ${passed ? 'ناجح ✓' : 'راسب ✗'}`);
      load();
    } else {
      toast.error('فشل: ' + r.error);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const statusColor = {
    scheduled: 'warning',
    completed: 'success',
    cancelled: 'danger',
    no_show: 'danger',
  };

  const statusLabel = {
    scheduled: 'مجدول',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    no_show: 'لم يحضر',
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.text, fontFamily: font }}>جدول الاختبارات</h2>
        <p style={{ margin: '4px 0 0', color: C.textMuted, fontSize: 13, fontFamily: font }}>
          كل مرشح معتمد يُجدَّل تلقائياً لأقرب أربعاء الساعة 10:00 صباحاً
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><LoadingSpinner size={32} /></div>
      ) : Object.keys(grouped).length === 0 ? (
        <div style={{ background: C.surface, borderRadius: 16, padding: 60, textAlign: 'center', border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
          <p style={{ color: C.textMuted, fontSize: 15, fontFamily: font }}>لا توجد اختبارات مجدولة حالياً</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          {Object.entries(grouped).sort().map(([date, items]) => (
            <div key={date} style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: C.shadow, overflow: 'hidden' }}>
              {/* رأس التاريخ */}
              <div style={{ background: 'linear-gradient(135deg, #0F2D1F, #1B5E35)', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#fff', fontSize: 15, fontWeight: 800, fontFamily: font }}>{formatDate(date)}</div>
                  <div style={{ color: '#C49A28', fontSize: 12, fontFamily: font }}>الساعة 10:00 صباحاً</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '4px 12px', color: '#fff', fontSize: 13, fontFamily: font }}>
                  {items.length} مرشح
                </div>
              </div>

              {/* رابط الاختبار */}
              <div style={{ padding: '10px 20px', background: '#F0FDF4', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: C.textMuted, fontFamily: font }}>رابط الاختبار لهذا اليوم:</span>
                <a href={items[0]?.exam_link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: C.success, fontFamily: font, fontWeight: 700 }}>
                  {items[0]?.exam_link}
                </a>
              </div>

              {/* قائمة المرشحين */}
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: `1px solid ${C.border}` }}>
                    {['الاسم', 'التخصص', 'الشركة', 'الحالة', 'تسجيل النتيجة'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: C.textSub, fontFamily: font }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map(s => {
                    const c = s.candidates;
                    const isScheduled = c?.application_status === 'exam_scheduled';
                    const isPassed = c?.application_status === 'exam_passed';
                    const isFailed = c?.application_status === 'exam_failed';
                    return (
                      <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: C.text, fontFamily: font }}>{c?.full_name}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: C.textSub, fontFamily: font }}>
                          {SPECIALTY_ICONS[c?.specialty]} {c?.specialty}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: C.textSub, fontFamily: font }}>{c?.company}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <Badge color={isPassed ? 'success' : isFailed ? 'danger' : 'warning'}>
                            {isPassed ? 'ناجح' : isFailed ? 'راسب' : 'بانتظار الاختبار'}
                          </Badge>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {isScheduled ? (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => handleMarkResult(c.id, c.full_name, true)}
                                style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: C.success, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
                                ✓ ناجح
                              </button>
                              <button onClick={() => handleMarkResult(c.id, c.full_name, false)}
                                style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: C.danger, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
                                ✗ راسب
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: C.textMuted, fontFamily: font }}>
                              {isPassed ? '✓ تم التسجيل' : isFailed ? '✗ تم التسجيل' : '—'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
