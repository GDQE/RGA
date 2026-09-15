import { supabase } from './supabase';

async function logAudit({ actorType, actorId, actorName, action, entityType, entityId, details }) {
  try {
    await supabase.from('audit_log').insert({
      actor_type: actorType,
      actor_id: actorId || null,
      actor_name: actorName || null,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      details: details || null,
    });
  } catch (e) {
    console.error('Audit log failed (non-blocking):', e);
  }
}

/**
 * تسجيل دخول عضو اللجنة
 * التحقق الآن يتم بالكامل على الخادم (login_committee_member_v2 RPC):
 * - كلمة المرور تُرسل عبر HTTPS ولا تُشفَّر في المتصفح
 * - المقارنة تتم بـ bcrypt داخل قاعدة البيانات
 * - لا يصل password_hash أبداً للمتصفح (RLS يمنع SELECT مباشر على الجدول أصلاً)
 */
export async function loginCommitteeMember({ username, password }) {
  try {
    const { data, error } = await supabase.rpc('login_committee_member_v2', {
      p_username: username,
      p_password: password,
    });

    if (error) {
      return { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
    }
    const row = data?.[0];
    if (!row) {
      return { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
    }

    const session = {
      id: row.id,
      fullName: row.full_name,
      username: row.username,
      memberOrder: row.member_order,
      loginAt: new Date().toISOString(),
    };
    localStorage.setItem('committee_session', JSON.stringify(session));

    await logAudit({
      actorType: 'committee_member', actorId: row.id, actorName: row.full_name,
      action: 'login', entityType: 'member', entityId: row.id,
    });

    return { success: true, member: session };
  } catch (error) {
    console.error('Login committee member error:', error);
    return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' };
  }
}

export function getCommitteeSession() {
  try {
    const raw = localStorage.getItem('committee_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function logoutCommitteeMember() {
  const session = getCommitteeSession();
  if (session) {
    logAudit({
      actorType: 'committee_member', actorId: session.id, actorName: session.fullName,
      action: 'logout', entityType: 'member', entityId: session.id,
    });
  }
  localStorage.removeItem('committee_session');
}

/**
 * جلب كل أعضاء اللجنة (لوحة الإدارة) — يتطلب تسجيل دخول إداري (authenticated)
 */
export async function fetchCommitteeMembers() {
  try {
    const { data, error } = await supabase
      .from('committee_members')
      .select('id, full_name, username, member_order, is_active, created_at')
      .order('member_order', { ascending: true });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}

/**
 * إضافة عضو لجنة جديد — من لوحة الإدارة (تتطلب تسجيل دخول إداري)
 * ملاحظة: إضافة العضو تتم بدون كلمة مرور أولية؛ يجب استخدام
 * admin_reset_committee_password فوراً بعد الإنشاء لتعيين كلمة مرور bcrypt
 */
export async function addCommitteeMember({ fullName, username, password, memberOrder }) {
  try {
    const { data, error } = await supabase
      .from('committee_members')
      .insert({
        full_name: fullName,
        username: username.trim().toLowerCase(),
        member_order: memberOrder,
        is_active: true,
      })
      .select()
      .single();
    if (error) throw error;

    // تعيين كلمة المرور الأولى عبر الدالة الآمنة (bcrypt على الخادم)
    const { error: pwError } = await supabase.rpc('admin_reset_committee_password', {
      p_member_id: data.id,
      p_new_password: password,
    });
    if (pwError) throw pwError;

    await logAudit({
      actorType: 'admin', action: 'create', entityType: 'member', entityId: data.id,
      details: { fullName, username },
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * إعادة تعيين كلمة مرور عضو من لوحة الإدارة — الآن عبر RPC آمن (bcrypt)
 */
export async function resetCommitteeMemberPassword(memberId, newPassword) {
  try {
    const { error } = await supabase.rpc('admin_reset_committee_password', {
      p_member_id: memberId,
      p_new_password: newPassword,
    });
    if (error) throw error;

    await logAudit({
      actorType: 'admin', action: 'reset_password', entityType: 'member', entityId: memberId,
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * تفعيل / تعطيل عضو لجنة
 */
export async function setCommitteeMemberActive(memberId, isActive) {
  try {
    const { error } = await supabase
      .from('committee_members')
      .update({ is_active: isActive })
      .eq('id', memberId);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export { logAudit };
