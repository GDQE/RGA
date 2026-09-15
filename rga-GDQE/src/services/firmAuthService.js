import { supabase } from './supabase';

/**
 * تسجيل مكتب استشاري جديد — عبر register_firm_v2 RPC
 * كلمة المرور تُشفَّر بـ bcrypt على الخادم مباشرة، ولا تُخزَّن أو تُقارن في المتصفح إطلاقاً
 */
export async function registerFirm({ firmName, username, password, email, phone }) {
  try {
    const { data, error } = await supabase.rpc('register_firm_v2', {
      p_firm_name: firmName,
      p_username: username,
      p_password: password,
      p_email: email || null,
      p_phone: phone || null,
    });

    if (error) {
      return { success: false, error: error.message?.includes('اسم المستخدم')
        ? error.message
        : 'تعذّر إنشاء الحساب، حاول مرة أخرى' };
    }

    return { success: true, data: { id: data } };
  } catch (error) {
    console.error('Register firm error:', error);
    return { success: false, error: 'تعذّر إنشاء الحساب، حاول مرة أخرى' };
  }
}

/**
 * تسجيل دخول المكتب الاستشاري — عبر login_firm_v2 RPC (bcrypt على الخادم)
 */
export async function loginFirm({ username, password }) {
  try {
    const { data, error } = await supabase.rpc('login_firm_v2', {
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
    if (!row.is_active) {
      return { success: false, error: 'حسابك قيد المراجعة من الإدارة، يرجى الانتظار حتى التفعيل' };
    }

    const session = {
      id: row.id,
      firmName: row.firm_name,
      username: row.username,
      loginAt: new Date().toISOString(),
    };
    localStorage.setItem('firm_session', JSON.stringify(session));

    return { success: true, firm: session };
  } catch (error) {
    console.error('Login firm error:', error);
    return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' };
  }
}

export function getFirmSession() {
  try {
    const raw = localStorage.getItem('firm_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function logoutFirm() {
  localStorage.removeItem('firm_session');
}

/**
 * جلب قائمة المكاتب لمراجعة الإدارة (يتطلب تسجيل دخول إداري authenticated)
 */
export async function fetchPendingFirms() {
  try {
    const { data, error } = await supabase
      .from('consulting_firms')
      .select('id, firm_name, username, contact_email, contact_phone, is_active, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}

/**
 * إعادة تعيين كلمة مرور مكتب استشاري من لوحة الإدارة (bcrypt على الخادم)
 * ملاحظة: لا يوجد لها زر في واجهة AdminFirmsPage حالياً — الدالة جاهزة للاستخدام
 * سواء من واجهة مستقبلية أو مباشرة عبر Supabase SQL Editor عند الحاجة
 */
export async function resetFirmPassword(firmId, newPassword) {
  try {
    const { error } = await supabase.rpc('admin_reset_firm_password', {
      p_firm_id: firmId,
      p_new_password: newPassword,
    });
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * تفعيل / تعطيل مكتب من لوحة الإدارة
 */
export async function setFirmActiveStatus(firmId, isActive) {
  try {
    const { error } = await supabase
      .from('consulting_firms')
      .update({ is_active: isActive })
      .eq('id', firmId);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
