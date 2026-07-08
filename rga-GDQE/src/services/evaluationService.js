import { supabase } from './supabase';
import { logAudit } from './committeeAuthService';

export async function fetchActiveTemplate() {
  try {
    const { data: template, error: tErr } = await supabase
      .from('evaluation_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (tErr) throw tErr;
    if (!template) return { success: false, error: 'لا يوجد قالب تقييم نشط' };

    const { data: mainCriteria, error: mcErr } = await supabase
      .from('evaluation_main_criteria')
      .select('*')
      .eq('template_id', template.id)
      .order('display_order', { ascending: true });

    if (mcErr) throw mcErr;

    const criteriaWithItems = await Promise.all(
      mainCriteria.map(async (mc) => {
        const { data: items } = await supabase
          .from('evaluation_sub_items')
          .select('*')
          .eq('main_criterion_id', mc.id)
          .order('display_order', { ascending: true });
        return { ...mc, items: items || [] };
      })
    );

    return { success: true, template, criteria: criteriaWithItems };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getOrCreateEvaluationSession(candidateId, templateId, examScore) {
  try {
    const { data: existing } = await supabase
      .from('candidate_evaluation_sessions')
      .select('*')
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (existing) return { success: true, session: existing };

    const { data: created, error } = await supabase
      .from('candidate_evaluation_sessions')
      .insert({ candidate_id: candidateId, template_id: templateId, exam_score: examScore })
      .select()
      .single();

    if (error) throw error;
    return { success: true, session: created };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function fetchCandidateForEvaluation(candidateId) {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .select(`
        id, full_name, id_number, national_id, specialty, company,
        results (id, score, earned_points, total_points, passed, submitted_at)
      `)
      .eq('id', candidateId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getOrCreateMemberEvaluation(sessionId, memberId) {
  try {
    const { data: existing } = await supabase
      .from('member_evaluations')
      .select('*, member_evaluation_scores (*)')
      .eq('session_id', sessionId)
      .eq('member_id', memberId)
      .maybeSingle();

    if (existing) return { success: true, evaluation: existing };

    const { data: created, error } = await supabase
      .from('member_evaluations')
      .insert({ session_id: sessionId, member_id: memberId })
      .select('*, member_evaluation_scores (*)')
      .single();

    if (error) throw error;
    return { success: true, evaluation: created };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function saveSubItemScore(memberEvaluationId, subItemId, score, maxScore) {
  try {
    if (score < 0 || score > maxScore) {
      return { success: false, error: `الدرجة يجب أن تكون بين 0 و ${maxScore}` };
    }

    const { error } = await supabase
      .from('member_evaluation_scores')
      .upsert({
        member_evaluation_id: memberEvaluationId,
        sub_item_id: subItemId,
        score,
      }, { onConflict: 'member_evaluation_id,sub_item_id' });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function saveMemberNotesAndRecommendation(memberEvaluationId, { notes, recommendation }) {
  try {
    const { error } = await supabase
      .from('member_evaluations')
      .update({ notes, recommendation, updated_at: new Date().toISOString() })
      .eq('id', memberEvaluationId);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * اعتماد تقييم العضو — وبعد اكتمال الجميع يُحسب الفاينل سكور ويُصدر الشهادة تلقائياً
 */
export async function submitMemberEvaluation(memberEvaluationId, memberName, candidateId) {
  try {
    const { error } = await supabase
      .from('member_evaluations')
      .update({ is_submitted: true, submitted_at: new Date().toISOString() })
      .eq('id', memberEvaluationId);

    if (error) throw error;

    await logAudit({
      actorType: 'committee_member', actorName: memberName,
      action: 'submit', entityType: 'member_evaluation', entityId: memberEvaluationId,
      details: { candidateId },
    });

    // تحقق هل اكتمل كل الأعضاء — إذا نعم، أصدر الشهادة إن كانت النتيجة ≥75
    await checkAndFinalizeSesssion(candidateId);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * يتحقق هل اكتمل كل أعضاء اللجنة — وإذا نعم يحسب النتيجة النهائية ويصدر الشهادة
 */
async function checkAndFinalizeSesssion(candidateId) {
  try {
    const { data: session } = await supabase
      .from('candidate_evaluation_sessions')
      .select('*, candidates (full_name, specialty)')
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (!session) return;

    // انتظر ثانية واحدة ليكمل الـ Trigger في Supabase حساب الفاينل سكور
    await new Promise(r => setTimeout(r, 1500));

    // أعد جلب الجلسة بعد الانتظار
    const { data: updatedSession } = await supabase
      .from('candidate_evaluation_sessions')
      .select('*')
      .eq('id', session.id)
      .single();

    if (!updatedSession) return;
    if (updatedSession.status !== 'completed') return;

    // إذا النتيجة النهائية ≥75 → أصدر الشهادة تلقائياً
    if (updatedSession.final_score >= 75) {
      const { issueCertificate } = await import('./certificateService');
      await issueCertificate({
        candidateId,
        finalResultId: null,
        engineerName: session.candidates?.full_name,
        specialty: session.candidates?.specialty,
        finalScore: updatedSession.final_score,
      });
    } else {
      // النتيجة أقل من 75 → مرفوض
      await supabase
        .from('candidates')
        .update({ application_status: 'rejected' })
        .eq('id', candidateId);
    }
  } catch (e) {
    console.error('Finalize session error (non-blocking):', e);
  }
}

export async function fetchSessionProgress(sessionId) {
  try {
    const { data: session } = await supabase
      .from('candidate_evaluation_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    const { data: evaluations } = await supabase
      .from('member_evaluations')
      .select('id, member_id, total_score, recommendation, is_submitted, submitted_at, committee_members (full_name, member_order)')
      .eq('session_id', sessionId)
      .order('committee_members(member_order)', { ascending: true });

    return { success: true, session, evaluations };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function fetchCandidatesForCommittee() {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .select(`
        id, full_name, specialty, company, application_status,
        results (score, passed)
      `)
      .in('application_status', ['exam_passed', 'interview_scheduled'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}
