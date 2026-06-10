import { useState } from "react";
import * as XLSX from "xlsx";

// ─── إعداد Supabase ────────────────────────────────────────
// يمكن تمرير القيم كـ props أو من متغيرات البيئة
const DEFAULT_URL = import.meta.env.VITE_SUPABASE_URL || "";
const DEFAULT_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
// ─── ثوابت ─────────────────────────────────────────────────
const PASS_THRESHOLD = 60; // نسبة النجاح

// ─── جلب البيانات من Supabase بدون مكتبة (fetch مباشر) ───
async function fetchAllResults(supabaseUrl, supabaseKey) {
  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    "Content-Type": "application/json",
  };

  // جلب النتائج الكاملة من الـ view
  const res = await fetch(
    `${supabaseUrl}/rest/v1/v_results_full?select=*`

    { headers }
  );
  if (!res.ok) throw new Error(`Supabase error: ${res.status} ${res.statusText}`);
  return await res.json();
}

// ─── مساعدات التنسيق ────────────────────────────────────────
function hexToARGB(hex) {
  return "FF" + hex.replace("#", "");
}

function cellStyle(wb, opts = {}) {
  const {
    bold = false,
    fontSize = 11,
    fontColor = "FF000000",
    bgColor = null,
    hAlign = "center",
    vAlign = "center",
    border = false,
    wrapText = false,
    numFmt = null,
  } = opts;

  return {
    font: { name: "Arial", bold, sz: fontSize, color: { rgb: fontColor } },
    fill: bgColor ? { fgColor: { rgb: bgColor }, patternType: "solid" } : undefined,
    alignment: { horizontal: hAlign, vertical: vAlign, readingOrder: 2, wrapText },
    border: border
      ? {
          top:    { style: "thin", color: { rgb: "FF2E75B6" } },
          bottom: { style: "thin", color: { rgb: "FF2E75B6" } },
          left:   { style: "thin", color: { rgb: "FF2E75B6" } },
          right:  { style: "thin", color: { rgb: "FF2E75B6" } },
        }
      : undefined,
    numFmt: numFmt || undefined,
  };
}

// ─── بناء ورقة النتائج ──────────────────────────────────────
function buildResultsSheet(data) {
  const ws = {};
  const now = new Date();
  const dateStr = now.toLocaleDateString("ar-SA");

  let maxCol = 9;

  function setCell(ws, r, c, v, style) {
    const addr = XLSX.utils.encode_cell({ r, c });
    ws[addr] = { v, t: typeof v === "number" ? "n" : "s", s: style };
  }
  function setNumCell(ws, r, c, v, style) {
    const addr = XLSX.utils.encode_cell({ r, c });
    ws[addr] = { v, t: "n", s: style };
  }

  // ── صف العنوان (row 0)
  const titleStyle = cellStyle(null, {
    bold: true, fontSize: 16,
    fontColor: "FFFFFFFF", bgColor: "FF1F4E79",
    border: true, wrapText: false,
  });
  setCell(ws, 0, 0, `تقرير نتائج التأهيل  |  ${dateStr}`, titleStyle);

  // ── صف الملخص (row 1)
  const total   = data.length;
  const passed  = data.filter(r => (r.score / 100) * 100 >= PASS_THRESHOLD).length;
  const failed  = total - passed;
  const avgScore = total ? (data.reduce((s, r) => s + (r.score || 0), 0) / total).toFixed(1) : 0;

  const subStyle = cellStyle(null, {
    bold: true, fontSize: 11,
    fontColor: "FF1F4E79", bgColor: "FFBDD7EE",
    border: true,
  });
  setCell(ws, 1, 0,
    `إجمالي المرشحين: ${total}   |  المؤهلين: ${passed}   |   غير المؤهلين: ${failed}   |   معدل التأهيل: ${total ? ((passed/total)*100).toFixed(1) : 0}%   |   متوسط الدرجات: ${avgScore}`,
    subStyle
  );

  // ── رؤوس الأعمدة (row 2)
  const headers = [
    "اسم المرشح", "رقم الهوية", "الجنسية", "الشركة",
    "التخصص", "الدرجة", "النسبة المئوية", "الحالة", "تاريخ الاختبار"
  ];
  const hStyle = cellStyle(null, {
    bold: true, fontSize: 12,
    fontColor: "FFFFFFFF", bgColor: "FF1F4E79",
    border: true,
  });
  headers.forEach((h, c) => setCell(ws, 2, c, h, hStyle));

  // ── بيانات (row 3+)
  data.forEach((rec, i) => {
    const r = i + 3;
    const isAlt = i % 2 === 0;
    const rowBg = isAlt ? "FFD6E4F0" : "FFFFFFFF";
    const pct   = rec.score != null ? rec.score / 100 : 0;
    const isPassed = (pct * 100) >= PASS_THRESHOLD;
    const pctBg = isPassed ? "FFC6EFCE" : "FFFFC7CE";

    const dStyle  = cellStyle(null, { bgColor: rowBg, border: true });
    const boldD   = cellStyle(null, { bgColor: rowBg, border: true, bold: true });
    const pctStyle = cellStyle(null, { bgColor: pctBg, border: true, bold: true, numFmt: "0.0%" });
    const stStyle  = cellStyle(null, {
      bgColor: pctBg, border: true, bold: true,
      fontColor: isPassed ? "FF375623" : "FF9C0006",
    });

    setCell   (ws, r, 0, rec.candidate_name || rec.full_name || "", dStyle);
    // رقم الهوية كنص صريح
    const idAddr = XLSX.utils.encode_cell({ r, c: 1 });
    ws[idAddr] = { v: String(rec.id_number || ""), t: "s", s: cellStyle(null, { bgColor: rowBg, border: true }) };
    setCell   (ws, r, 2, rec.nationality || "",       dStyle);
    setCell   (ws, r, 3, rec.company     || "",       dStyle);
    setCell   (ws, r, 4, rec.specialty   || "",       dStyle);
    setNumCell(ws, r, 5, rec.score       || 0,        boldD);
    setNumCell(ws, r, 6, pct,                         pctStyle);
    setCell   (ws, r, 7, isPassed ? "مؤهل":"غير مؤهل", stStyle);
    setCell   (ws, r, 8, rec.exam_date   || (rec.created_at ? rec.created_at.slice(0,10) : ""), dStyle);
  });

  // ── صف المتوسط
  const sr = data.length + 3;
  const sumStyle = cellStyle(null, {
    bold: true, fontSize: 12,
    fontColor: "FFFFFFFF", bgColor: "FF1F4E79",
    border: true,
  });
  for (let c = 0; c < 9; c++) {
    setCell(ws, sr, c, "", sumStyle);
  }
  setCell(ws, sr, 0, "المتوسط العام", sumStyle);
  setNumCell(ws, sr, 5, parseFloat(avgScore), sumStyle);
  setNumCell(ws, sr, 6, total ? passed / total : 0,
    { ...sumStyle, numFmt: "0.0%" });

  // ── Merges
  const merges = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
    { s: { r: sr, c: 0 }, e: { r: sr, c: 4 } },
  ];

  // ── عرض الأعمدة
  const colWidths = [
    { wch: 30 }, { wch: 18 }, { wch: 14 }, { wch: 22 },
    { wch: 22 }, { wch: 10 }, { wch: 16 }, { wch: 14 }, { wch: 18 }
  ];

  // ── نطاق الورقة
  ws["!ref"] = XLSX.utils.encode_range({ r: 0, c: 0 }, { r: sr, c: 8 });
  ws["!merges"] = merges;
  ws["!cols"] = colWidths;
  ws["!rows"] = [{ hpt: 40 }, { hpt: 22 }, { hpt: 28 }];

  // ── AutoFilter
  ws["!autofilter"] = { ref: XLSX.utils.encode_range({ r: 2, c: 0 }, { r: data.length + 2, c: 8 }) };

  // ── Freeze
  ws["!freeze"] = { xSplit: 0, ySplit: 3, topLeftCell: "A4", activePane: "bottomLeft" };

  return ws;
}

// ─── بناء ورقة Dashboard ────────────────────────────────────
function buildDashboardSheet(data) {
  const ws = {};
  const now = new Date();
  const oneWeekAgo  = new Date(now - 7  * 864e5);
  const oneMonthAgo = new Date(now - 30 * 864e5);

  function setCell(r, c, v, style) {
    const addr = XLSX.utils.encode_cell({ r, c });
    ws[addr] = { v, t: typeof v === "number" ? "n" : "s", s: style };
  }
  function setNum(r, c, v, style) {
    const addr = XLSX.utils.encode_cell({ r, c });
    ws[addr] = { v, t: "n", s: style };
  }

  // ─── حساب الإحصاءات ───────────────────────────────────────
  const total      = data.length;
  const scores     = data.map(r => r.score || 0);
  const maxScore   = Math.max(...scores);
  const avgScore   = total ? +(scores.reduce((a,b) => a+b,0) / total).toFixed(1) : 0;
  const topCand    = data.find(r => r.score === maxScore);
  const passedList = data.filter(r => r.score >= PASS_THRESHOLD);
  const failedList = data.filter(r => r.score <  PASS_THRESHOLD);
  const passRate   = total ? +((passedList.length / total) * 100).toFixed(1) : 0;

  const countBy = (key) =>
    data.reduce((acc, r) => { const k = r[key] || "غير محدد"; acc[k] = (acc[k]||0)+1; return acc; }, {});

  const specCount  = countBy("specialty");
  const natCount   = countBy("nationality");
  const compCount  = countBy("company");

  const recentWeek  = data.filter(r => new Date(r.exam_date || r.created_at) >= oneWeekAgo).length;
  const recentMonth = data.filter(r => new Date(r.exam_date || r.created_at) >= oneMonthAgo).length;

  // أسبوعي: عدد المختبرين لكل أسبوع (آخر 8 أسابيع)
  const weeklyMap = {};
  data.forEach(r => {
    const d = new Date(r.exam_date || r.created_at);
    if (isNaN(d)) return;
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().slice(0, 10);
    weeklyMap[key] = (weeklyMap[key] || 0) + 1;
  });
  const weeklyEntries = Object.entries(weeklyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8);

  // أعلى 10 درجات
  const top10 = [...data]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  // ─── الأنماط ──────────────────────────────────────────────
  const S = {
    title: cellStyle(null, { bold: true, fontSize: 18, fontColor: "FFFFFFFF", bgColor: "FF1F4E79", border: true }),
    secHdr: (bg = "FF2E75B6") => cellStyle(null, { bold: true, fontSize: 13, fontColor: "FFFFFFFF", bgColor: bg, border: true }),
    kpiLabel: (bg) => cellStyle(null, { bold: true, fontSize: 10, fontColor: "FFFFFFFF", bgColor: bg, border: true, wrapText: true }),
    kpiVal: (bg) => cellStyle(null, { bold: true, fontSize: 20, fontColor: "FFFFFFFF", bgColor: bg, border: true }),
    colHdr: cellStyle(null, { bold: true, fontSize: 11, fontColor: "FFFFFFFF", bgColor: "FF2E75B6", border: true }),
    dataEven: cellStyle(null, { bgColor: "FFD6E4F0", border: true }),
    dataOdd:  cellStyle(null, { bgColor: "FFFFFFFF", border: true }),
    dataB:    cellStyle(null, { bold: true, bgColor: "FFD6E4F0", border: true }),
    pass:     cellStyle(null, { bold: true, fontColor: "FF375623", bgColor: "FFC6EFCE", border: true }),
    fail:     cellStyle(null, { bold: true, fontColor: "FF9C0006", bgColor: "FFFFC7CE", border: true }),
    sum:      cellStyle(null, { bold: true, fontSize: 12, fontColor: "FFFFFFFF", bgColor: "FF1F4E79", border: true }),
    trophy:   cellStyle(null, { bold: true, fontSize: 12, fontColor: "FF833C00", bgColor: "FFFCE4D6", border: true }),
  };

  const merges = [];
  let maxR = 0;
  let maxC = 13;

  function merge(r1, c1, r2, c2) {
    merges.push({ s: { r: r1, c: c1 }, e: { r: r2, c: c2 } });
  }
  function fillRange(r1, c1, r2, c2, v, style) {
    for (let r = r1; r <= r2; r++)
      for (let c = c1; c <= c2; c++)
        setCell(r, c, v, style);
  }

  // ─── TITLE ────────────────────────────────────────────────
  merge(0, 0, 0, 13);
  setCell(0, 0, `لوحة المؤشرات التنفيذية  |  تقرير نتائج الاختبارات  |  ${now.toLocaleDateString("ar-SA")}`, S.title);
  maxR = 1;

  // ─── KPI CARDS (row 2-5) ──────────────────────────────────
  merge(1, 0, 1, 13);
  setCell(1, 0, "المؤشرات الرئيسية", S.secHdr());

  const kpis = [
    { label: "إجمالي المختبرين",     val: total,               bg: "FF0070C0" },
    { label: "الناجحون",             val: passedList.length,   bg: "FF375623" },
    { label: "الراسبون",             val: failedList.length,   bg: "FF9C0006" },
    { label: "معدل النجاح %",        val: passRate,            bg: "FF7030A0" },
    { label: "متوسط الدرجات",        val: avgScore,            bg: "FF1F4E79" },
    { label: "أعلى درجة",            val: maxScore,            bg: "FF833C00" },
    { label: "آخر أسبوع",            val: recentWeek,          bg: "FF004B50" },
    { label: "آخر شهر",              val: recentMonth,         bg: "FF243F60" },
  ];
  // 8 KPIs across 14 cols → each takes ~1.75 cols; use 7 cols for first 7, last occupies remaining
  // Layout: 2 cols per KPI → 8×2 = 16 > 14, so use pairs of col widths of ~1.75
  // Simplify: spread across cols 0-13 in pairs, last 2 share
  const kpiColSpan = [
    [0,1],[2,3],[4,5],[6,7],[8,9],[10,11],[12,12],[13,13]
  ];
  kpis.forEach((k, i) => {
    const [c1, c2] = kpiColSpan[i];
    merge(2, c1, 2, c2);
    merge(3, c1, 3, c2);
    merge(4, c1, 4, c2);
    merge(5, c1, 5, c2);
    setCell(2, c1, k.label, S.kpiLabel(k.bg));
    setNum (3, c1, k.val,   S.kpiVal(k.bg));
    // spacer rows
    fillRange(4, c1, 4, c2, "", S.kpiVal(k.bg));
    fillRange(5, c1, 5, c2, "", cellStyle(null, { bgColor: k.bg }));
  });

  // Trophy row
  merge(6, 0, 6, 13);
  setCell(6, 0,
    `  أعلى درجة في النظام: ${topCand?.candidate_name || topCand?.full_name || "—"}  —  ${maxScore}/100  —  تخصص: ${topCand?.specialty || "—"}`,
    S.trophy);

  // ─── SECTION: التخصص (cols 0-3, row 8+) ─────────────────
  merge(7, 0, 7, 3);
  setCell(7, 0, "المختبرون حسب التخصص", S.secHdr("FF1F4E79"));
  ["التخصص","العدد","المؤهلين","النسبة %"].forEach((h,c) => setCell(8,c,h,S.colHdr));

  const specEntries = Object.entries(specCount).sort(([,a],[,b]) => b-a);
  specEntries.forEach(([spec, cnt], i) => {
    const r = 9 + i;
    const sp = data.filter(d => d.specialty === spec);
    const spPassed = sp.filter(d => d.score >= PASS_THRESHOLD).length;
    const bg = i%2===0 ? S.dataEven : S.dataOdd;
    setCell(r, 0, spec, bg);
    setNum (r, 1, cnt,  S.dataB);
    setNum (r, 2, spPassed, spPassed===cnt ? S.pass : S.dataOdd);
    setNum (r, 3, +(cnt/total*100).toFixed(1), bg);
    maxR = Math.max(maxR, r);
  });
  const specEnd = 9 + specEntries.length - 1;

  // ─── SECTION: الجنسية (cols 5-8, row 8+) ─────────────────
  merge(7, 5, 7, 8);
  setCell(7, 5, "المختبرون حسب الجنسية", S.secHdr("FF243F60"));
  ["الجنسية","العدد","المؤهلين","النسبة %"].forEach((h,c) => setCell(8,5+c,h,S.colHdr));

  const natEntries = Object.entries(natCount).sort(([,a],[,b]) => b-a);
  natEntries.forEach(([nat, cnt], i) => {
    const r = 9 + i;
    const np = data.filter(d => d.nationality === nat && d.score >= PASS_THRESHOLD).length;
    const bg = i%2===0 ? S.dataEven : S.dataOdd;
    setCell(r, 5, nat,  bg);
    setNum (r, 6, cnt,  S.dataB);
    setNum (r, 7, np,   np===cnt ? S.pass : S.dataOdd);
    setNum (r, 8, +(cnt/total*100).toFixed(1), bg);
    maxR = Math.max(maxR, r);
  });
  const natEnd = 9 + natEntries.length - 1;

  // ─── SECTION: الشركة (cols 10-13, row 8+) ────────────────
  merge(7, 10, 7, 13);
  setCell(7, 10, "المختبرون حسب الشركة", S.secHdr("FF004B50"));
  ["الشركة","العدد","المؤهلين","النسبة %"].forEach((h,c) => setCell(8,10+c,h,S.colHdr));

  const compEntries = Object.entries(compCount).sort(([,a],[,b]) => b-a);
  compEntries.forEach(([comp, cnt], i) => {
    const r = 9 + i;
    const cp = data.filter(d => d.company === comp && d.score >= PASS_THRESHOLD).length;
    const bg = i%2===0 ? S.dataEven : S.dataOdd;
    setCell(r, 10, comp, bg);
    setNum (r, 11, cnt,  S.dataB);
    setNum (r, 12, cp,   cp===cnt ? S.pass : S.dataOdd);
    setNum (r, 13, +(cnt/total*100).toFixed(1), bg);
    maxR = Math.max(maxR, r);
  });
  const compEnd = 9 + compEntries.length - 1;

  // ─── SECTION: أعلى 10 درجات (row after tables+2) ─────────
  const top10Start = Math.max(specEnd, natEnd, compEnd) + 3;
  merge(top10Start, 0, top10Start, 5);
  setCell(top10Start, 0, " أعلى 10 درجات", S.secHdr("FF833C00"));
  ["المرتبة","اسم المرشح","التخصص","الشركة","الجنسية","الدرجة"].forEach((h,c) =>
    setCell(top10Start+1, c, h, S.colHdr));
  top10.forEach((rec, i) => {
    const r = top10Start + 2 + i;
    const bg = i%2===0 ? S.dataEven : S.dataOdd;
    const medals = ["1","2","3"];
    setCell(r, 0, (medals[i] || `${i+1}`) , bg);
    setCell(r, 1, rec.candidate_name || rec.full_name || "", bg);
    setCell(r, 2, rec.specialty || "", bg);
    setCell(r, 3, rec.company   || "", bg);
    setCell(r, 4, rec.nationality || "", bg);
    setNum (r, 5, rec.score,
      i === 0 ? cellStyle(null, { bold:true, fontSize:13, fontColor:"FF833C00", bgColor:"FFFCE4D6", border:true })
              : S.dataB);
    maxR = Math.max(maxR, r);
  });
  const top10End = top10Start + 2 + top10.length - 1;

  // ─── SECTION: الأسبوعي (cols 8-13, same row as top10) ────
  merge(top10Start, 8, top10Start, 13);
  setCell(top10Start, 8, " المختبرون أسبوعيًا (آخر 8 أسابيع)", S.secHdr("FF7030A0"));
  ["الأسبوع","عدد المختبرين"].forEach((h,c) => setCell(top10Start+1, 8+c*2, h, S.colHdr));
  merge(top10Start+1, 8,  top10Start+1, 9);
  merge(top10Start+1, 10, top10Start+1, 13);

  weeklyEntries.forEach(([wk, cnt], i) => {
    const r = top10Start + 2 + i;
    const bg = i%2===0 ? S.dataEven : S.dataOdd;
    merge(r, 8,  r, 9);
    merge(r, 10, r, 13);
    setCell(r, 8,  wk,  bg);
    setNum (r, 10, cnt, S.dataB);
    maxR = Math.max(maxR, r);
  });

 
  const colWidths = [
    {wch:24},{wch:10},{wch:14},{wch:10},
    {wch:3},
    {wch:18},{wch:10},{wch:14},{wch:10},
    {wch:3},
    {wch:20},{wch:10},{wch:14},{wch:10},
  ];

  ws["!ref"]    = XLSX.utils.encode_range({ r: 0, c: 0 }, { r: maxR + 2, c: 13 });
  ws["!merges"] = merges;
  ws["!cols"]   = colWidths;
  ws["!rows"]   = [{ hpt: 42 }];

  return ws;
}


async function generateExcel(data) {
  const wb = XLSX.utils.book_new();

  // ورقة النتائج
  const wsResults = buildResultsSheet(data);
  XLSX.utils.book_append_sheet(wb, wsResults, "النتائج");

  // ورقة Dashboard
  const wsDash = buildDashboardSheet(data);
  XLSX.utils.book_append_sheet(wb, wsDash, "Dashboard");

  // تصدير الملف
  const dateTag = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `تقرير_نتائج_الاختبارات_${dateTag}.xlsx`, {
    bookType: "xlsx",
    type: "binary",
    cellStyles: true,
  });
}

// ─── COMPONENT ───────────────────────────────────────────────
export default function ExportReportButton({
  supabaseUrl = DEFAULT_URL,
  supabaseKey = DEFAULT_KEY,
}) {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");
  const [count, setCount] = useState(null);

  async function handleExport() {
    if (!supabaseUrl || !supabaseKey) {
      setStatus("error");
      setMessage(" يرجى تعيين VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY");
      return;
    }
    try {
      setStatus("loading");
      setMessage("جارٍ تصدير البيانات من قاعدة البيانات...");

      const data = await fetchAllResults(supabaseUrl, supabaseKey);

      if (!data || data.length === 0) {
        setStatus("error");
        setMessage("لا توجد بيانات في قاعدة البيانات.");
        return;
      }

      setCount(data.length);
      setMessage(`تم التصدير ${data.length} سجل. جارٍ إنشاء ملف Excel...`);

      await generateExcel(data);

      setStatus("success");
      setMessage(` تم تصدير التقرير بنجاح! (${data.length} مرشح)`);
      setTimeout(() => { setStatus("idle"); setMessage(""); setCount(null); }, 5000);

    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage(` خطأ: ${err.message}`);
    }
  }

  // ─── Styles ──────────────────────────────────────────────
  const styles = {
    wrapper: {
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "10px",
      fontFamily: "Arial, sans-serif",
      direction: "rtl",
    },
    btn: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "14px 28px",
      borderRadius: "10px",
      border: "none",
      cursor: status === "loading" ? "not-allowed" : "pointer",
      fontSize: "16px",
      fontWeight: "bold",
      fontFamily: "Arial, sans-serif",
      transition: "all 0.2s ease",
      background:
        status === "loading" ? "#94a3b8" :
        status === "success" ? "#166534" :
        status === "error"   ? "#991b1b" :
        "linear-gradient(135deg, #1F4E79 0%, #2E75B6 100%)",
      color: "#fff",
      boxShadow:
        status === "idle"
          ? "0 4px 15px rgba(31,78,121,0.4)"
          : "none",
    },
    icon: { fontSize: "22px" },
    msg: {
      fontSize: "13px",
      color:
        status === "success" ? "#166534" :
        status === "error"   ? "#991b1b" :
        "#1F4E79",
      fontWeight: "600",
      maxWidth: "320px",
      textAlign: "center",
    },
    spinner: {
      display: "inline-block",
      width: "18px", height: "18px",
      border: "3px solid rgba(255,255,255,0.3)",
      borderTop: "3px solid #fff",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    },
  };

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={styles.wrapper}>
        <button
          style={styles.btn}
          onClick={handleExport}
          disabled={status === "loading"}
        >
          {status === "loading" ? (
            <span style={styles.spinner} />
          ) : (
            <span style={styles.icon}></span>
          )}
          {status === "loading" ? "جارٍ التصدير..." :
           status === "success" ?  "تم التصدير" :
           status === "error"   ? "أعد المحاولة" :
           "تصدير التقرير"}
        </button>

        {message && <p style={styles.msg}>{message}</p>}
      </div>
    </>
  );
}


export function PreviewWrapper() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #f0f4f8 0%, #d6e4f0 100%)",
      gap: "32px",
      fontFamily: "Arial, sans-serif",
      direction: "rtl",
      padding: "40px",
    }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "28px", color: "#1F4E79", marginBottom: "8px", fontWeight: "900" }}>
          نظام تصدير تقارير الاختبارات
        </h1>
        <p style={{ color: "#475569", fontSize: "15px", maxWidth: "480px", lineHeight: 1.7 }}>
          اضغط على الزر لجلب جميع البيانات التاريخية من Supabase وتوليد تقرير Excel
          احترافي يشمل ورقة النتائج ولوحة المؤشرات التنفيذية.
        </p>
      </div>

      <div style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "40px 60px",
        boxShadow: "0 8px 40px rgba(31,78,121,0.12)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
      }}>
        <ExportReportButton />


        <div style={{
          marginTop: "8px",
          padding: "16px 24px",
          background: "#f8fafc",
          borderRadius: "10px",
          border: "1px solid #e2e8f0",
          fontSize: "13px",
          color: "#64748b",
          lineHeight: 1.9,
          maxWidth: "400px",
        }}>
          <strong style={{ color: "#1F4E79", display: "block", marginBottom: "6px" }}>
             محتويات التقرير:
          </strong>
          <span> <strong>ورقة النتائج</strong> — جميع بيانات المرشحين مع فلترة<br/></span>
          <span> <strong>Dashboard</strong> — مؤشرات KPI + رسوم بيانية<br/></span>
          <span>أعلى 10 درجات مع التصنيف<br/></span>
          <span> المختبرون أسبوعيًا (آخر 8 أسابيع)<br/></span>
          <span> البيانات محدّثة لحظة التصدير</span>
        </div>
      </div>

      <p style={{ fontSize: "12px", color: "#94a3b8", textAlign: "center" }}>
        لربط Supabase: عيّن <code>VITE_SUPABASE_URL</code> و <code>VITE_SUPABASE_ANON_KEY</code>
        <br/>أو مرّرهما كـ props للمكوّن
      </p>
    </div>
  );
}
