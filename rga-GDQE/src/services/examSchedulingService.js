import { supabase } from './supabase';

function getNextWednesday() {
  const now = new Date();
  const day = now.getDay();
  let daysUntil = (3 - day + 7) % 7;
  if (daysUntil === 0) daysUntil = 7;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntil);
  next.setHours(0, 0, 0, 0);
  return next;
}

function formatDateISO(date) {
  return date.toISOString().split('T')[0];
}

async function createNotification({ candidateId, firmId, type, title, message, channel }) {
  try {
    await supabase.from('notifications').insert({
      candidate_id: candidateId,
      firm_id: firmId || null,
      type, title, message, channel,
      sent_status: 'sent',
    });
  } catch (e) {
    console.error('Notification failed (non-blocking):', e);
  }
}

/**
 * جدولة اختبار تلقائية لأقرب أربعاء فور اعتماد المرشح
 */
export async function autoScheduleExam(candidateId) {
  try {
    const examDate = getNextWednesday();
    const examDateStr = formatDateISO(examDate);
    const examLink = `${window.location.origin}/`;

    const { data, error } = await supabase
      .from('exam_schedules')
      .insert({
        candidate_id: candidateId,
        exam_date: examDateStr,
        exam_time: '10:00:00',
        exam_link: examLink,
        status: 'scheduled',
      })
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('candidates')
      .update({ application_status: 'exam_scheduled' })
      .eq('id', candidateId);

    await createNotification({
      candidateId,
      type: 'exam_scheduled',
      title: 'تم جدولة موعد اختبارك',
      message: `تم تحديد موعد اختبارك يوم ${examDateStr} الساعة 10:00 صباحاً. رابط الاختبار: ${examLink}`,
      channel: 'app',
    });

    return { success: true, schedule: data, examDate: examDateStr };
  } catch (error) {
    console.error('Auto schedule exam error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * جلب جدول اختبار مرشح معيّن
 */
export async function fetchExamSchedule(candidateId) {
  try {
    const { data, error } = await supabase
      .from('exam_schedules')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * جلب كل الاختبارات المجدولة (للوحة الإدارة)
 */
export async function fetchAllScheduledExams() {
  try {
    const { data, error } = await supabase
      .from('exam_schedules')
      .select(`
        id, exam_date, exam_time, exam_link, status,
        candidates (id, full_name, specialty, national_id, id_number, company, application_status)
      `)
      .order('exam_date', { ascending: true });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}

/**
 * المشرف يسجّل نتيجة الاختبار يدوياً — يُحوّل المرشح لـ exam_passed أو exam_failed
 */
export async function notifyExamResult(candidateId, passed) {
  try {
    const newStatus = passed ? 'exam_passed' : 'exam_failed';
    await supabase
      .from('candidates')
      .update({ application_status: newStatus })
      .eq('id', candidateId);

    const message = passed
      ? 'تم اجتياز الاختبار بنجاح وتم ترشيحك للمقابلة النهائية مع اللجنة.'
      : 'نأسف، لم يتم اجتياز الاختبار. سيتم التواصل معك بخصوص الخطوات التالية.';

    await createNotification({
      candidateId,
      type: 'exam_result',
      title: passed ? 'نتيجة الاختبار: ناجح ✓' : 'نتيجة الاختبار',
      message,
      channel: 'app',
    });

    return { success: true, newStatus };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
