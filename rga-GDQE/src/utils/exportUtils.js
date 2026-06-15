import * as XLSX from 'xlsx';

export function exportToExcel(data, filename = 'نتائج_التأهيل') {
  const rows = data.map((r, i) => ({
    '#': i + 1,
    'الاسم الكامل': r.candidates?.full_name || '',
    'الشركة / المنشأة': r.candidates?.company || '',
    'رقم الهوية / الإقامة': r.candidates?.id_number || '',
    'رقم الجوال': r.candidates?.phone || '',
    'التخصص': r.candidates?.specialty || '',
    'الشهادات الإضافية': r.candidates?.certificates || '—',
    'الدرجة المكتسبة': `${r.earned_points}/${r.total_points}`,
    'النسبة المئوية': `${r.score}%`,
    'الإجابات الصحيحة': r.correct_answers,
    'الإجابات الخاطئة': r.wrong_answers,
    'النتيجة': r.passed ? 'مؤهل' :'غير مؤهل',
    'تاريخ الاختبار': r.submitted_at
      ? new Date(r.submitted_at).toLocaleDateString('ar-SA')
      : '',
    'وقت الاختبار': r.submitted_at
      ? new Date(r.submitted_at).toLocaleTimeString('ar-SA')
      : '',
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);

  // Column widths
  ws['!cols'] = [
    { wch: 5 }, { wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 15 },
    { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
    { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 15 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'النتائج');
  const date = new Date().toLocaleDateString('ar-SA').replace(/\//g, '-');
  XLSX.writeFile(wb, `${filename}_${date}.xlsx`);
}

export function exportToCSV(data, filename = 'نتائج_التأهيل') {
  const headers = ['#', 'الاسم الكامل', 'الشركة', 'رقم الهوية', 'الجوال', 'التخصص', 'الدرجة', 'النسبة', 'صحيح', 'خاطئ', 'النتيجة', 'التاريخ'];
  const rows = data.map((r, i) => [
    i + 1,
    r.candidates?.full_name || '',
    r.candidates?.company || '',
    r.candidates?.id_number || '',
    r.candidates?.phone || '',
    r.candidates?.specialty || '',
    `${r.earned_points}/${r.total_points}`,
    `${r.score}%`,
    r.correct_answers,
    r.wrong_answers,
    r.passed ? 'ناجح' : 'راسب',
    r.submitted_at ? new Date(r.submitted_at).toLocaleDateString('ar-SA') : '',
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const date = new Date().toLocaleDateString('ar-SA').replace(/\//g, '-');
  a.download = `${filename}_${date}.csv`;
  a.click();
}
