import { supabase } from './supabase';
import { logAudit } from './committeeAuthService';

/**
* جلب القالب الافتراضي (المعايير والبنود الفرعية) - أول قالب نشط
*/
export async function fetchActiveTemplate(specialty = 'عام') {
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
        const { data: items, error: itemsErr } = await supabase
          .from('evaluation_sub_items')
          .select('*')
          .eq('main_criterion_id', mc.id)
          .order('display_order', { ascending: true });
        if (itemsErr) throw itemsErr;
        return { ...mc, items };
      })
    );

    return { success: true, template, criteria: criteriaWithItems };
  } catch (error) {
    console.error('Fetch template error:', error);
    return { success: false, error: error.message };
  }
}

/**
* جلب أو إنشاء جلسة تقييم لمرشح معيّن (مرة واحدة لكل مرشح)
*/
export async function getOrCreateEvaluationSession(candidateId, templateId, examScore) {
  try {
    const { data: existing, error: findErr } = await supabase
      .from('candidate_evaluation_sessions')
      .select('*')
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (findErr) throw findErr;
    if (existing) return { success: true, session: existing };

    const { data: created, error: createErr } = await supabase
      .from('candidate_evaluation_sessions')
      .insert({
        candidate_id: candidateId,
        template_id: templateId,
        exam_score: examScore,
      })
      .select()
      .single();

    if (createErr) throw createErr;
    return { success: true, session: created };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
* جلب بيانات المرشح كاملة (اسم، هوية، وظيفة، درجة الاختبار)
*/
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

/**
* جلب أو إنشاء تقييم العضو الحالي لجلسة معيّنة (مستقل تماماً عن الأعضاء الآخرين)
*/
export async function getOrCreateMemberEvaluation(sessionId, memberId) {
  try {
    const { data: existing, error: findErr } = await supabase
      .from('member_evaluations')
      .select('*, member_evaluation_scores (*)')
      .eq('session_id', sessionId)
      .eq('member_id', memberId)
      .maybeSingle();

    if (findErr) throw findErr;
    if (existing) return { success: true, evaluation: existing };

    const { data: created, error: createErr } = await supabase
      .from('member_evaluations')
      .insert({ session_id: sessionId, member_id: memberId })
      .select('*, member_evaluation_scores (*)')
      .single();

    if (createErr) throw createErr;
    return { success: true, evaluation: created };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
* حفظ درجة بند فرعي واحد (حفظ تلقائي فوري عند كل تغيير)
*/
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

/**
* حفظ ملاحظات وتوصية العضو (مسودة، قبل الاعتماد النهائي)
*/
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
* اعتماد تقييم العضو نهائياً (لا يمكن التعديل بعدها، ويُحسب متوسط اللجنة تلقائياً عند اكتمال الجميع)
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

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
* جلب حالة اكتمال تقييم اللجنة لمرشح (هل اعتمد الجميع؟ كم باقي؟)
* يُستخدم في لوحة الإدارة وشاشة النتائج، وليس للعضو نفسه (لمنعه من رؤية تقدم الآخرين)
*/
export async function fetchSessionProgress(sessionId) {
  try {
    const { data: session, error: sErr } = await supabase
      .from('candidate_evaluation_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
    if (sErr) throw sErr;

    const { data: evaluations, error: eErr } = await supabase
      .from('member_evaluations')
      .select('id, member_id, total_score, recommendation, is_submitted, submitted_at, committee_members (full_name, member_order)')
      .eq('session_id', sessionId)
      .order('committee_members(member_order)', { ascending: true });
    if (eErr) throw eErr;

    return { success: true, session, evaluations };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
* جلب قائمة المرشحين المحوّلين للجنة (حالة interview_scheduled أو exam_passed)
*/
export async function fetchCandidatesForCommittee() {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .select(`
        id, full_name, specialty, company, application_status,
        results (score, passed)
      `)
      .in('application_status', ['interview_scheduled', 'exam_passed'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}
