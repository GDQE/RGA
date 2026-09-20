import ExportReportButton from '../components/ExportReportButton';
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { RGALogo } from '../components/RGALogo';
import { LoadingSpinner, Badge, StatCard } from '../components/UI';
import { fetchAllResults, fetchDashboardStats, deleteResult } from '../services/examService';
import { signOut } from '../services/authService';
import { C, font, SPECIALTIES, SPECIALTY_ICONS } from '../utils/constants';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AdminFirmsPage } from './AdminFirmsPage';
import { AdminCommitteePage } from './AdminCommitteePage';
import { AdminDocumentReviewPage } from './AdminDocumentReviewPage';
import { AdminExamSchedulePage } from './AdminExamSchedulePage';
import { AdminCertificatesPage } from './AdminCertificatesPage';

// ============================================================
// نظام تصميم موحّد للوحة الإدارة — كل قيمة تُستخدم من هنا فقط
// بدلاً من كتابة ألوان/مسافات/زوايا مباشرة بكل مكان
// ============================================================
const RADIUS = { card: 16, control: 10, chip: 8 };
const SPACE = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, section: 28 };
const TYPE = {
  pageTitle: { fontSize: 24, fontWeight: 900 },
  sectionTitle: { fontSize: 15, fontWeight: 800 },
  body: { fontSize: 13, fontWeight: 600 },
  small: { fontSize: 12, fontWeight: 500 },
  tiny: { fontSize: 11, fontWeight: 500 },
};
const cardStyle = {
  background: C.surface, borderRadius: RADIUS.card, padding: SPACE.xxl,
  boxShadow: C.shadow, border: `1px solid ${C.border}`,
};

const PIE_COLORS = [C.accent, C.danger];

export function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();
  const LIMIT = 15;

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { loadResults(); }, [search, specialty, page]);

  const loadStats = async () => {
    const r = await fetchDashboardStats();
    if (r.success) setStats(r);
  };

  const loadResults = async () => {
    setLoading(true);
    const r = await fetchAllResults({ search, specialty, page, limit: LIMIT });
    if (r.success) { setResults(r.data); setTotal(r.total); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    const r = await deleteResult(id);
    if (r.success) {
      toast.success('تم حذف النتيجة بنجاح');
      setDeleteConfirm(null);
      loadResults();
      loadStats();
    } else {
      toast.error('فشل الحذف: ' + r.error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const totalPages = Math.ceil(total / LIMIT);

  const TAB_LABELS = {
    overview: 'لوحة مؤشرات الأداء',
    results: 'النتائج',
    charts: 'التقارير',
    review: 'مراجعة الطلبات',
    schedule: 'جدول الاختبارات',
    firms: 'المكاتب الاستشارية',
    committee: 'لجنة التقييم',
    certificates: 'الشهادات الرقمية',
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, direction: 'rtl', fontFamily: font }}>

      {/* Sidebar */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 240,
        background: `linear-gradient(180deg, #0F2D1F 0%, ${C.accent} 100%)`,
        display: 'flex', flexDirection: 'column', zIndex: 50,
        boxShadow: '2px 0 20px rgba(0,0,0,0.25)'
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACE.md }}>
            <RGALogo size={36} />
            <div>
              <div style={{ color: '#fff', fontSize: 12, fontWeight: 800, fontFamily: font }}>الهيئة العامة للطرق</div>
              <div style={{ color: C.gold, fontSize: 10, fontFamily: font }}>لوحة مؤشرات الأداء</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: SPACE.xs, overflowY: 'auto' }}>
          {Object.entries(TAB_LABELS).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              display: 'flex', alignItems: 'center', gap: SPACE.md, padding: '11px 14px',
              borderRadius: RADIUS.control, cursor: 'pointer', border: 'none', width: '100%', textAlign: 'right',
              background: tab === id ? 'rgba(196,154,40,0.15)' : 'transparent',
              color: tab === id ? C.gold : 'rgba(255,255,255,0.6)',
              fontSize: 13, fontWeight: tab === id ? 700 : 400, fontFamily: font,
              transition: 'all 0.15s',
              borderRight: tab === id ? `3px solid ${C.gold}` : '3px solid transparent'
            }}>
              {label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleSignOut} style={{
            display: 'flex', alignItems: 'center', gap: SPACE.sm, padding: '10px 14px',
            borderRadius: RADIUS.control, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)',
            background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontFamily: font, width: '100%'
          }}>
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ marginRight: 240, padding: '28px 32px', minHeight: '100vh' }}>

        <div style={{ marginBottom: SPACE.section, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ margin: 0, ...TYPE.pageTitle, color: C.text, fontFamily: font }}>
              {TAB_LABELS[tab]}
            </h1>
            <p style={{ margin: '4px 0 0', color: C.textMuted, ...TYPE.small, fontFamily: font }}>
              نظام اختبار التأهيل — الإدارة العامة للجودة والبيئة
            </p>
          </div>
          <div style={{
            background: `linear-gradient(135deg, ${C.accent}, ${C.accentLight})`,
            borderRadius: RADIUS.control, padding: '6px 14px',
            color: '#fff', fontSize: 12, fontFamily: font, fontWeight: 700
          }}>
            {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && stats && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: SPACE.lg, marginBottom: SPACE.section }}>
              <StatCard label="إجمالي المختبرين" value={stats.stats.total} color={C.accent} />
              <StatCard label="المؤهلين" value={stats.stats.passed}
                sub={`${stats.stats.total > 0 ? Math.round((stats.stats.passed / stats.stats.total) * 100) : 0}% نسبة النجاح`}
                color={C.accent} />
              <StatCard label="غير مؤهلين" value={stats.stats.failed} color={C.danger} />
              <StatCard label="متوسط الدرجات" value={`${stats.stats.avgScore}%`} color={C.gold} />
              <StatCard label="أعلى درجة" value={`${stats.stats.maxScore}%`} color={C.gold} />
            </div>

            <div style={{ ...cardStyle, marginBottom: SPACE.xxl }}>
              <h3 style={{ margin: `0 0 ${SPACE.xl}px`, ...TYPE.sectionTitle, color: C.text, fontFamily: font }}>نتائج حسب التخصص</h3>
              <div style={{ display: 'grid', gap: SPACE.md }}>
                {stats.specialtyStats.map(sp => (
                  <div key={sp.name} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: C.bg, borderRadius: RADIUS.control, border: `1px solid ${C.border}` }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: SPACE.sm }}>
                        <span style={{ ...TYPE.body, fontWeight: 700, color: C.text, fontFamily: font }}>{sp.name}</span>
                        <span style={{ ...TYPE.small, color: C.textMuted, fontFamily: font }}>{sp.total} مختبر • متوسط {sp.avgScore}%</span>
                      </div>
                      <div style={{ background: C.border, borderRadius: 6, height: 10, display: 'flex', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: `linear-gradient(90deg, ${C.accent}, ${C.accentLight})`, width: `${sp.passRate}%`, transition: 'width 0.6s ease', borderRadius: 6 }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: SPACE.xs }}>
                        <span style={{ ...TYPE.tiny, color: C.accent, fontFamily: font, fontWeight: 700 }}>مؤهل: {sp.passed}</span>
                        <span style={{ ...TYPE.tiny, color: C.danger, fontFamily: font, fontWeight: 700 }}>غير مؤهل: {sp.failed}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: `0 0 ${SPACE.xl}px`, ...TYPE.sectionTitle, color: C.text, fontFamily: font }}>اتجاه الاختبارات (آخر 7 أيام)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={stats.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: font }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontFamily: font, direction: 'rtl', borderRadius: RADIUS.chip }} />
                  <Legend wrapperStyle={{ fontFamily: font }} />
                  <Line type="monotone" dataKey="total" stroke={C.gold} strokeWidth={2.5} name="إجمالي" dot={{ r: 4, fill: C.gold }} />
                  <Line type="monotone" dataKey="passed" stroke={C.accent} strokeWidth={2.5} name="مؤهل" dot={{ r: 4, fill: C.accent }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* RESULTS TAB */}
        {tab === 'results' && (
          <div>
            <div style={{ ...cardStyle, padding: '16px 20px', marginBottom: SPACE.xl, display: 'flex', gap: SPACE.md, alignItems: 'center', flexWrap: 'wrap' }}>
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="بحث بالاسم أو الشركة أو رقم الهوية..."
                style={{ flex: 1, minWidth: 220, padding: '9px 14px', borderRadius: RADIUS.control, border: `1.5px solid ${C.border}`, fontSize: 13, fontFamily: font, outline: 'none', color: C.text }} />
              <select value={specialty} onChange={e => { setSpecialty(e.target.value); setPage(1); }}
                style={{ padding: '9px 14px', borderRadius: RADIUS.control, border: `1.5px solid ${C.border}`, fontSize: 13, fontFamily: font, color: C.text, background: C.surface, cursor: 'pointer' }}>
                <option value="">جميع التخصصات</option>
                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ExportReportButton />
            </div>
            <div style={{ background: C.surface, borderRadius: RADIUS.card, boxShadow: C.shadow, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><LoadingSpinner size={36} /></div>
              ) : results.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 48, color: C.textMuted, fontFamily: font }}>لا توجد نتائج</div>
              ) : (
                <>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: `linear-gradient(135deg, #0F2D1F, ${C.accent})` }}>
                        {['#', 'الاسم', 'الشركة', 'التخصص', 'الدرجة', 'النتيجة', 'التاريخ', 'إجراءات'].map(h => (
                          <th key={h} style={{ padding: '13px 16px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: font, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, i) => (
                        <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}`, transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = C.bg}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: C.textMuted, fontFamily: font }}>{(page - 1) * LIMIT + i + 1}</td>
                          <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: C.text, fontFamily: font }}>{r.candidates?.full_name}</td>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: C.textSub, fontFamily: font }}>{r.candidates?.company}</td>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: C.textSub, fontFamily: font }}>{r.candidates?.specialty}</td>
                          <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 900, color: r.score >= 60 ? C.accent : C.danger, fontFamily: font }}>{r.score}%</td>
                          <td style={{ padding: '12px 16px' }}>
                            <Badge color={r.passed ? 'success' : 'danger'}>{r.passed ? 'مؤهل' : 'غير مؤهل'}</Badge>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: C.textMuted, fontFamily: font }}>
                            {r.submitted_at ? new Date(r.submitted_at).toLocaleDateString('ar-SA') : '—'}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={() => navigate(`/admin/result/${r.id}`)} style={{ padding: '5px 12px', borderRadius: RADIUS.chip, border: `1px solid ${C.accent}`, background: C.successBg, color: C.accent, fontSize: 12, cursor: 'pointer', fontFamily: font }}>تفاصيل</button>
                              <button onClick={() => setDeleteConfirm(r.id)} style={{ padding: '5px 12px', borderRadius: RADIUS.chip, border: `1px solid ${C.danger}`, background: C.dangerBg, color: C.danger, fontSize: 12, cursor: 'pointer', fontFamily: font }}>حذف</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: SPACE.sm, padding: SPACE.lg, borderTop: `1px solid ${C.border}` }}>
                      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 14px', borderRadius: RADIUS.chip, border: `1px solid ${C.border}`, background: 'transparent', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? C.textMuted : C.accent, fontSize: 13, fontFamily: font }}>← السابق</button>
                      <span style={{ fontSize: 13, color: C.textSub, fontFamily: font }}>صفحة {page} من {totalPages}</span>
                      <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '6px 14px', borderRadius: RADIUS.chip, border: `1px solid ${C.border}`, background: 'transparent', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: page === totalPages ? C.textMuted : C.accent, fontSize: 13, fontFamily: font }}>التالي →</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* CHARTS TAB */}
        {tab === 'charts' && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SPACE.xl }}>
            <div style={cardStyle}>
              <h3 style={{ margin: `0 0 ${SPACE.xl}px`, ...TYPE.sectionTitle, color: C.text, fontFamily: font }}>توزيع التأهيل</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={[{ name: 'مؤهل', value: stats.stats.passed }, { name: 'غير مؤهل', value: stats.stats.failed }]}
                    cx="50%" cy="50%" outerRadius={90} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {PIE_COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontFamily: font }} />
                  <Tooltip contentStyle={{ fontFamily: font, borderRadius: RADIUS.chip }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={cardStyle}>
              <h3 style={{ margin: `0 0 ${SPACE.xl}px`, ...TYPE.sectionTitle, color: C.text, fontFamily: font }}>متوسط الدرجات حسب التخصص</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={stats.specialtyStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fontFamily: font }} width={110} />
                  <Tooltip contentStyle={{ fontFamily: font, direction: 'rtl', borderRadius: RADIUS.chip }} />
                  <Bar dataKey="avgScore" fill={C.accent} name="متوسط الدرجة" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ ...cardStyle, gridColumn: '1 / -1' }}>
              <h3 style={{ margin: `0 0 ${SPACE.xl}px`, ...TYPE.sectionTitle, color: C.text, fontFamily: font }}>التأهيل حسب التخصص</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.specialtyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: font }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontFamily: font, direction: 'rtl', borderRadius: RADIUS.chip }} />
                  <Legend wrapperStyle={{ fontFamily: font }} />
                  <Bar dataKey="passed" fill={C.accent} name="مؤهل" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="failed" fill={C.danger} name="غير مؤهل" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {tab === 'review' && <AdminDocumentReviewPage />}
        {tab === 'schedule' && <AdminExamSchedulePage />}
        {tab === 'firms' && <AdminFirmsPage />}
        {tab === 'committee' && <AdminCommitteePage />}
        {tab === 'certificates' && <AdminCertificatesPage />}
      </div>

      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: C.surface, borderRadius: RADIUS.card, padding: '32px 36px', maxWidth: 360, width: '100%', boxShadow: C.shadowLg, direction: 'rtl', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 17, fontWeight: 800, color: C.text, fontFamily: font }}>تأكيد الحذف</h3>
            <p style={{ margin: '0 0 24px', color: C.textSub, fontSize: 14, fontFamily: font }}>هل أنت متأكد من حذف هذه النتيجة؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div style={{ display: 'flex', gap: SPACE.md }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: '10px', borderRadius: RADIUS.control, cursor: 'pointer', border: `1px solid ${C.border}`, background: 'transparent', color: C.textSub, fontFamily: font }}>إلغاء</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: '10px', borderRadius: RADIUS.control, cursor: 'pointer', background: C.danger, color: '#fff', border: 'none', fontWeight: 700, fontFamily: font }}>حذف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
