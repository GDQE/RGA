import { supabase } from './supabase';

export const REQUIRED_DOC_TYPES = [
  { key: 'cv', label: 'السيرة الذاتية', icon: ' ' },
  { key: 'academic_certificate', label: 'الشهادة الأكاديمية', icon: ' ' },
  { key: 'training_course', label: 'الدورات التدريبية', icon: ' ' },
  { key: 'experience_letter', label: 'خطاب الخبرة', icon: ' ' },
];

/**
* رفع ملف واحد إلى Supabase Storage
*/
async function uploadFile(file, candidateId, docType) {
  const ext = file.name.split('.').pop();
  const fileName = `${candidateId}/${docType}_${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from('candidate-documents')
    .upload(fileName, file, { cacheControl: '3600', upsert: false });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('candidate-documents')
    .getPublicUrl(fileName);

  return { path: fileName, url: urlData.publicUrl, size: file.size };
}

/**
* إنشاء مرشح جديد من قبل المكتب الاستشاري مع رفع المرفقات
*/
export async function createCandidateWithDocuments({ candidateInfo, firmId, files }) {
  try {
    // 1. إنشاء سجل المرشح
    const { data: candidate, error: candError } = await supabase
      .from('candidates')
      .insert({
        full_name: candidateInfo.name,
        company: candidateInfo.company,
        id_number: candidateInfo.idNumber,
        phone: candidateInfo.phone,
        specialty: candidateInfo.specialty,
        certificates: candidateInfo.certificatesNote || null,
        email: candidateInfo.email || null,
        national_id: candidateInfo.idNumber,
        firm_id: firmId,
        application_status: 'pending',
      })
      .select()
      .single();

    if (candError) throw candError;

    // 2. رفع كل ملف وربطه بالمرشح
    const uploadedDocs = [];
    for (const docType of Object.keys(files)) {
      const file = files[docType];
      if (!file) continue;

      const uploaded = await uploadFile(file, candidate.id, docType);

      const { error: docError } = await supabase
        .from('candidate_documents')
        .insert({
          candidate_id: candidate.id,
          doc_type: docType,
          doc_name: file.name,
          file_url: uploaded.url,
          file_size: uploaded.size,
          is_required: true,
          status: 'pending',
        });

      if (docError) throw docError;
      uploadedDocs.push(docType);
    }

    // فحص آلي فوري لاكتمال المستندات بعد الرفع (لا ينتظر تحديث صفحة)
    try {
      const { runDocumentCheck } = await import('./documentCheckService');
      await runDocumentCheck(candidate.id);
    } catch (checkErr) {
      console.error('Auto document check failed (non-blocking):', checkErr);
    }

    return { success: true, candidateId: candidate.id, uploadedDocs };
  } catch (error) {
    console.error('Create candidate error:', error);
    return { success: false, error: error.message };
  }
}

/**
* جلب كل مرشحي مكتب معيّن
*/
export async function fetchFirmCandidates(firmId) {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .select(`
        id, full_name, company, id_number, phone, specialty,
        application_status, created_at,
        candidate_documents (id, doc_type, doc_name, status)
      `)
      .eq('firm_id', firmId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}

/**
* جلب تفاصيل مرشح واحد مع مرفقاته
*/
export async function fetchCandidateDocuments(candidateId) {
  try {
    const { data, error } = await supabase
      .from('candidate_documents')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}

export const STATUS_LABELS = {
  pending: { label: 'قيد المراجعة', color: 'warning' },
  documents_incomplete: { label: 'مستندات ناقصة', color: 'danger' },
  documents_complete: { label: 'مستندات مكتملة — بانتظار اعتماد المشرف', color: 'success' },
  documents_approved: { label: 'معتمد — بانتظار جدولة الاختبار', color: 'success' },
  needs_review: { label: 'يحتاج مراجعة', color: 'warning' },
  exam_scheduled: { label: 'مجدول للاختبار', color: 'default' },
  exam_passed: { label: 'نجح في الاختبار', color: 'success' },
  exam_failed: { label: 'لم ينجح في الاختبار', color: 'danger' },
  interview_scheduled: { label: 'مجدول للمقابلة', color: 'default' },
  approved: { label: 'معتمد', color: 'success' },
  rejected: { label: 'مرفوض', color: 'danger' },
};
