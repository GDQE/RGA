import { supabase } from './supabase';

/**
 * توليد رقم شهادة فريد بصيغة RGA-YYYY-NNNNNN
 */
function generateCertNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  return `RGA-${year}-${random}`;
}

/**
 * إصدار شهادة رقمية تلقائياً بعد اعتماد اللجنة
 * يُستدعى من evaluationService بعد اكتمال تقييم كل الأعضاء
 */
export async function issueCertificate({ candidateId, finalResultId, engineerName, specialty, finalScore }) {
  try {
    // تحقق هل صدرت شهادة مسبقاً لهذا المرشح
    const { data: existing } = await supabase
      .from('certificates')
      .select('id, certificate_number')
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (existing) {
      return { success: true, certificate: existing, alreadyIssued: true };
    }

    const certNumber = generateCertNumber();
    const issueDate = new Date().toISOString().split('T')[0];
    const expiryDate = new Date(new Date().setFullYear(new Date().getFullYear() + 2))
      .toISOString().split('T')[0];

    // بيانات QR Code (رابط التحقق من الشهادة)
    const qrData = `${window.location.origin}/verify?cert=${certNumber}`;

    const { data, error } = await supabase
      .from('certificates')
      .insert({
        candidate_id: candidateId,
        final_result_id: finalResultId || null,
        certificate_number: certNumber,
        engineer_name: engineerName,
        specialty,
        issue_date: issueDate,
        expiry_date: expiryDate,
        qr_code_data: qrData,
        is_valid: true,
      })
      .select()
      .single();

    if (error) throw error;

    // تحديث حالة المرشح لـ approved
    await supabase
      .from('candidates')
      .update({ application_status: 'approved' })
      .eq('id', candidateId);

    // إشعار داخلي
    await supabase.from('notifications').insert({
      candidate_id: candidateId,
      type: 'certificate_issued',
      title: 'تم إصدار شهادة التأهيل',
      message: `تهانينا! تم إصدار شهادة تأهلك رقم ${certNumber}. تاريخ الانتهاء: ${expiryDate}`,
      channel: 'app',
      sent_status: 'sent',
    }).catch(() => {});

    return { success: true, certificate: data };
  } catch (error) {
    console.error('Issue certificate error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * جلب شهادة مرشح معيّن
 */
export async function fetchCertificate(candidateId) {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('candidate_id', candidateId)
      .maybeSingle();
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * التحقق من شهادة برقمها (صفحة عامة للتحقق)
 */
export async function verifyCertificate(certNumber) {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*, candidates (full_name, specialty, company)')
      .eq('certificate_number', certNumber)
      .maybeSingle();
    if (error) throw error;
    if (!data) return { success: false, error: 'رقم الشهادة غير موجود' };

    const isExpired = new Date(data.expiry_date) < new Date();
    return { success: true, data, isExpired };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * جلب كل الشهادات الصادرة (للوحة الإدارة)
 */
export async function fetchAllCertificates() {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*, candidates (full_name, specialty, company)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}
