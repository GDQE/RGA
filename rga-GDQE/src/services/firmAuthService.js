import { supabase } from './supabase';

// تشفير كلمة المرور (بسيط - يُفضّل استخدام bcrypt عبر Edge Function في الإنتاج الكامل)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
* تسجيل مكتب استشاري جديد (يبقى غير مُفعّل حتى موافقة الإدارة)
*/
export async function registerFirm({ firmName, username, password, email, phone }) {
  try {
    // تحقق من عدم وجود اسم المستخدم مسبقاً
    const { data: existing } = await supabase
      .from('consulting_firms')
      .select('id')
      .eq('username', username.trim().toLowerCase())
      .maybeSingle();

    if (existing) {
      return { success: false, error: 'اسم المستخدم مستخدم بالفعل، اختر اسماً آخر' };
    }

    const passwordHash = await hashPassword(password);

    const { data, error } = await supabase
      .from('consulting_firms')
      .insert({
        firm_name: firmName.trim(),
        username: username.trim().toLowerCase(),
        password_hash: passwordHash,
        contact_email: email || null,
        contact_phone: phone || null,
        is_active: false, // يحتاج موافقة الإدارة
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Register firm error:', error);
    return { success: false, error: error.message };
  }
}

/**
* تسجيل دخول المكتب الاستشاري
*/
export async function loginFirm({ username, password }) {
  try {
    const passwordHash = await hashPassword(password);

    const { data, error } = await supabase
      .from('consulting_firms')
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
      return { success: false, error: 'حسابك قيد المراجعة من الإدارة، يرجى الانتظار حتى التفعيل' };
    }

    // حفظ جلسة المكتب في localStorage (جلسة بسيطة)
    const session = {
      id: data.id,
      firmName: data.firm_name,
      username: data.username,
      loginAt: new Date().toISOString(),
    };
    localStorage.setItem('firm_session', JSON.stringify(session));

    return { success: true, firm: session };
  } catch (error) {
    console.error('Login firm error:', error);
    return { success: false, error: error.message };
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
* جلب قائمة المكاتب لمراجعة الإدارة
*/
export async function fetchPendingFirms() {
  try {
    const { data, error } = await supabase
      .from('consulting_firms')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, data: [], error: error.message };
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
