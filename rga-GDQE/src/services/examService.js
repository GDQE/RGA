import { supabase } from './supabase';

export async function saveExamResult({ candidate, result }) {
  try {
    let candidateId = candidate.candidateId || null;

    // لو المرشح جاء من النظام الجديد (عنده candidateId) لا نُنشئ سجلاً جديداً
    if (!candidateId) {
      const { data: newCandidate, error: e0 } = await supabase
        .from('candidates')
        .insert({
          full_name: candidate.name,
          company: candidate.company,
          id_number: candidate.idNumber,
          phone: candidate.phone || null,
          specialty: candidate.specialty,
          certificates: candidate.certificates || null,
        })
        .select()
        .single();
      if (e0) throw e0;
      candidateId = newCandidate.id;
    }

    const correct = result.results.filter(r => r.isCorrect).length;
    const wrong = result.results.filter(r => !r.isCorrect).length;

    const { data: resultData, error: e1 } = await supabase
      .from('results')
      .insert({
        candidate_id: candidateId,
        score: result.score,
        earned_points: result.earned,
        total_points: result.total,
        correct_answers: correct,
        wrong_answers: wrong,
        passed: result.score >= 70,
      })
      .select()
      .single();

    if (e1) throw e1;

    const answers = result.results.map(r => ({
      result_id: resultData.id,
      question_id: r.id,
      selected_answer: r.userAnswer,
      correct_answer: r.correct,
      is_correct: r.isCorrect,
    }));

    const { error: e2 } = await supabase.from('exam_answers').insert(answers);
    if (e2) throw e2;

    // ربط النتيجة بمرشح النظام الجديد وتحديث حالته
    if (candidate.candidateId) {
      const newStatus = result.score >= 70 ? 'exam_passed' : 'exam_failed';
      await supabase
        .from('candidates')
        .update({ application_status: newStatus })
        .eq('id', candidate.candidateId);

      // إشعار داخلي بالنتيجة
      await supabase.from('notifications').insert({
        candidate_id: candidate.candidateId,
        type: 'exam_result',
        title: result.score >= 70 ? 'نتيجة الاختبار: ناجح ✓' : 'نتيجة الاختبار',
        message: result.score >= 70
          ? 'تم اجتياز الاختبار بنجاح وتم ترشيحك للمقابلة النهائية مع اللجنة.'
          : 'نأسف، لم يتم اجتياز الاختبار.',
        channel: 'app',
        sent_status: 'sent',
      }).catch(() => {}); // non-blocking
    }

    return { success: true, candidateId, resultId: resultData.id };
  } catch (error) {
    console.error('Save failed:', error);
    return { success: false, error: error.message };
  }
}

export async function fetchAllResults({ search = '', specialty = '', page = 1, limit = 20 } = {}) {
  try {
    let query = supabase
      .from('results')
      .select(`id, score, earned_points, total_points, correct_answers, wrong_answers, passed, submitted_at,
        candidates (id, full_name, company, id_number, specialty, certificates)`, { count: 'exact' })
      .order('submitted_at', { ascending: false });

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    let filtered = data || [];
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(r =>
        r.candidates?.full_name?.toLowerCase().includes(s) ||
        r.candidates?.company?.toLowerCase().includes(s) ||
        r.candidates?.id_number?.includes(s)
      );
    }
    if (specialty) {
      filtered = filtered.filter(r => r.candidates?.specialty === specialty);
    }

    return { success: true, data: filtered, total: count || 0 };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}

export async function fetchResultDetail(resultId) {
  try {
    const { data, error } = await supabase
      .from('results')
      .select(`*, candidates (*), exam_answers (*)`)
      .eq('id', resultId)
      .single();
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function fetchDashboardStats() {
  try {
    const { data, error } = await supabase
      .from('results')
      .select(`id, score, passed, submitted_at, candidates (specialty, full_name, company)`);
    if (error) throw error;

    const total = data.length;
    const passed = data.filter(r => r.passed).length;
    const avgScore = total > 0 ? Math.round(data.reduce((s, r) => s + r.score, 0) / total) : 0;
    const maxScore = total > 0 ? Math.max(...data.map(r => r.score)) : 0;

    const bySpecialty = {};
    data.forEach(r => {
      const sp = r.candidates?.specialty || 'غير محدد';
      if (!bySpecialty[sp]) bySpecialty[sp] = { total: 0, passed: 0, scores: [] };
      bySpecialty[sp].total++;
      if (r.passed) bySpecialty[sp].passed++;
      bySpecialty[sp].scores.push(r.score);
    });

    const specialtyStats = Object.entries(bySpecialty).map(([name, v]) => ({
      name, total: v.total, passed: v.passed, failed: v.total - v.passed,
      passRate: v.total > 0 ? Math.round((v.passed / v.total) * 100) : 0,
      avgScore: v.scores.length > 0 ? Math.round(v.scores.reduce((a, b) => a + b, 0) / v.scores.length) : 0,
    }));

    const now = new Date();
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayData = data.filter(r => r.submitted_at?.startsWith(dateStr));
      trend.push({
        date: d.toLocaleDateString('ar-SA', { weekday: 'short', month: 'short', day: 'numeric' }),
        total: dayData.length,
        passed: dayData.filter(r => r.passed).length,
      });
    }

    return { success: true, stats: { total, passed, failed: total - passed, avgScore, maxScore }, specialtyStats, trend };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteResult(resultId) {
  try {
    await supabase.from('exam_answers').delete().eq('result_id', resultId);
    const { error } = await supabase.from('results').delete().eq('id', resultId);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
