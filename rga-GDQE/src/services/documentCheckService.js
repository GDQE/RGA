import { supabase } from './supabase';
import { REQUIRED_DOC_TYPES } from './firmCandidateService';

async function autoScheduleExamInternal(candidateId) {
  try {
    const { autoScheduleExam } = await import('./examSchedulingService');
    await autoScheduleExam(candidateId);
  } catch (e) {
    console.error('Auto schedule failed (non-blocking):', e);
  }
}

export async function runDocumentCheck(candidateId) {
  try {
    const { data: docs, error: docsErr } = await supabase
      .from('candidate_documents')
      .select('doc_type')
      .eq('candidate_id', candidateId);
    if (docsErr) throw docsErr;

    const uploadedTypes = new Set(docs.map(d => d.doc_type));
    const missing = REQUIRED_DOC_TYPES.filter(d => !uploadedTypes.has(d.key)).map(d => d.label);
    const isComplete = missing.length === 0;
    const overallStatus = isComplete ? 'complete' : 'incomplete';

    const { data: existing } = await supabase
      .from('document_checks')
      .select('id')
      .eq('candidate_id', candidateId)
      .maybeSingle();

    const checkPayload = {
      candidate_id: candidateId,
      has_cv: uploadedTypes.has('cv'),
      has_academic_cert: uploadedTypes.has('academic_certificate'),
      has_training_course: uploadedTypes.has('training_course'),
      has_experience: uploadedTypes.has('experience_letter'),
      missing_documents: missing,
      overall_status: overallStatus,
      checked_at: new Date().toISOString(),
    };

    if (existing) {
      await supabase.from('document_checks').update(checkPayload).eq('id', existing.id);
    } else {
      await supabase.from('document_checks').insert(checkPayload);
    }

    const { data: candidate } = await supabase
      .from('candidates')
      .select('application_status')
      .eq('id', candidateId)
      .single();

    const lockedStatuses = ['exam_scheduled', 'exam_passed', 'exam_failed', 'interview_scheduled', 'approved', 'rejected', 'documents_approved'];
    if (!lockedStatuses.includes(candidate?.application_status)) {
      await supabase.from('candidates')
        .update({ application_status: isComplete ? 'documents_complete' : 'documents_incomplete' })
        .eq('id', candidateId);
    }

    return { success: true, isComplete, missing, overallStatus };
  } catch (error) {
    console.error('Document check error:', error);
    return { success: false, error: error.message };
  }
}

export async function fetchDocumentCheck(candidateId) {
  try {
    const { data, error } = await supabase
      .from('document_checks')
      .select('*')
      .eq('candidate_id', candidateId)
      .maybeSingle();
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function fetchCandidatesPendingApproval() {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .select(`
        id, full_name, id_number, national_id, specialty, company, application_status, created_at,
        firm_id, consulting_firms (firm_name),
        candidate_documents (id, doc_type, doc_name, file_url, status),
        document_checks (overall_status, missing_documents, checked_at)
      `)
      .in('application_status', ['documents_complete', 'documents_incomplete', 'needs_review'])
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}

/**
 * المشرف يعتمد المرشح ← يُجدَّل اختباره تلقائياً لأقرب أربعاء
 */
export async function approveCandidateDocuments(candidateId, adminName) {
  try {
    const { error } = await supabase
      .from('candidates')
      .update({ application_status: 'documents_approved' })
      .eq('id', candidateId);
    if (error) throw error;

    await supabase.from('audit_log').insert({
      actor_type: 'admin',
      actor_name: adminName || 'admin',
      action: 'approve_documents',
      entity_type: 'candidate',
      entity_id: candidateId,
    });

    // جدولة الاختبار تلقائياً فور الاعتماد
    await autoScheduleExamInternal(candidateId);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function flagCandidateForReview(candidateId, adminName, reason) {
  try {
    const { error } = await supabase
      .from('candidates')
      .update({ application_status: 'needs_review' })
      .eq('id', candidateId);
    if (error) throw error;
    await supabase.from('audit_log').insert({
      actor_type: 'admin', actor_name: adminName || 'admin',
      action: 'flag_for_review', entity_type: 'candidate', entity_id: candidateId,
      details: { reason },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function rejectCandidateApplication(candidateId, adminName, reason) {
  try {
    const { error } = await supabase
      .from('candidates')
      .update({ application_status: 'rejected' })
      .eq('id', candidateId);
    if (error) throw error;
    await supabase.from('audit_log').insert({
      actor_type: 'admin', actor_name: adminName || 'admin',
      action: 'reject_application', entity_type: 'candidate', entity_id: candidateId,
      details: { reason },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
