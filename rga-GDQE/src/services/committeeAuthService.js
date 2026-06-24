import { supabase } from './supabase';

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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
*/
export async function loginCommitteeMember({ username, password }) {
  try {
    const passwordHash = await hashPassword(password);

    const { data, error } = await supabase
      .from('committee_members')
      .select('*')
      .eq('username', username.trim().toLowerCase())
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
    }
    if (data.password_hash !== passwordHash) {
      return { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
    }
    if (!data.is_active) {
      return { success: false, error: 'حسابك معطّل، يرجى التواصل مع الإدارة' };
    }

    const session = {
      id: data.id,
      fullName: data.full_name,
      username: data.username,
      memberOrder: data.member_order,
      loginAt: new Date().toISOString(),
    };
    localStorage.setItem('committee_session', JSON.stringify(session));

    await logAudit({
      actorType: 'committee_member', actorId: data.id, actorName: data.full_name,
      action: 'login', entityType: 'member', entityId: data.id,
    });

    return { success: true, member: session };
  } catch (error) {
    console.error('Login committee member error:', error);
    return { success: false, error: error.message };
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
* جلب كل أعضاء اللجنة (لوحة الإدارة)
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
* إضافة عضو لجنة جديد (مثلاً عضو رابع)
*/
export async function addCommitteeMember({ fullName, username, password, memberOrder }) {
  try {
    const passwordHash = await hashPassword(password);
    const { data, error } = await supabase
      .from('committee_members')
      .insert({
        full_name: fullName,
        username: username.trim().toLowerCase(),
        password_hash: passwordHash,
        member_order: memberOrder,
      })
      .select()
      .single();
    if (error) throw error;

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
* إعادة تعيين كلمة مرور عضو من لوحة الإدارة (بدون إيميل)
*/
export async function resetCommitteeMemberPassword(memberId, newPassword) {
  try {
    const passwordHash = await hashPassword(newPassword);
    const { error } = await supabase
      .from('committee_members')
      .update({ password_hash: passwordHash })
      .eq('id', memberId);
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
