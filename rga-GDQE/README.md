# نظام اختبار تأهيل المهندسين
## الهيئة العامة للطرق — الإدارة العامة للجودة والبيئة

نظام متكامل لاختبار وتأهيل المهندسين والمراقبين، مبني على React + Vite + Supabase.

---

##  هيكل المشروع

```
src/
├── components/          # مكوّنات مشتركة قابلة للإعادة
│   ├── RGALogo.jsx      # شعار الهيئة
│   ├── TopBar.jsx       # شريط العنوان
│   ├── UI.jsx           # مكوّنات واجهة المستخدم
│   └── ProtectedRoute.jsx
├── pages/               # صفحات التطبيق
│   ├── RegistrationPage.jsx   # تسجيل المرشح
│   ├── ExamPage.jsx           # صفحة الاختبار
│   ├── ThankYouPage.jsx       # صفحة الشكر بعد الاختبار
│   ├── LoginPage.jsx          # دخول المسؤول
│   ├── AdminDashboard.jsx     # لوحة الإدارة
│   └── ResultDetailPage.jsx   # تفاصيل نتيجة مختبر
├── services/            # خدمات الاتصال بـ Supabase
│   ├── supabase.js      # إعداد العميل
│   ├── examService.js   # حفظ وجلب النتائج
│   └── authService.js   # المصادقة
├── hooks/
│   └── useAuth.js       # hook للمصادقة
├── utils/
│   ├── constants.js     # ألوان وثوابت التصميم
│   ├── questionBank.js  # بنك الأسئلة
│   └── exportUtils.js   # تصدير Excel/CSV
└── App.jsx              # الجذر والتوجيه
```

---

##  متطلبات التشغيل

- Node.js 18+
- حساب Supabase (مجاني)
- حساب Vercel (للنشر)

---

## خطوات التشغيل المحلي

### 1. تثبيت الحزم
```bash
npm install
```

### 2. إعداد Supabase
1. سجّل الدخول على [supabase.com](https://supabase.com) وأنشئ مشروعاً جديداً
2. من لوحة Supabase، افتح **SQL Editor**
3. انسخ محتوى ملف `supabase/schema.sql` والصقه في المحرر ثم اضغط **Run**
4. من **Settings → API** انسخ:
   - `Project URL`
   - `anon public key`

### 3. ملف البيئة
أنشئ ملف `.env` في جذر المشروع:
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 4. إنشاء حساب الإدارة
من Supabase → **Authentication → Users → Add user**:
- أدخل البريد الإلكتروني وكلمة المرور للمسؤول

### 5. تشغيل المشروع
```bash
npm run dev
```
افتح المتصفح على: `http://localhost:5173`

---

##  الصفحات

| الصفحة | الرابط | الوصف |
|--------|--------|-------|
| صفحة التسجيل | `/` | بيانات المرشح واختيار التخصص |
| الاختبار | (تلقائي) | 10 أسئلة عشوائية، مؤقت 20 دقيقة |
| صفحة الشكر | (تلقائي) | رسالة الإتمام وتأكيد الحفظ |
| دخول الإدارة | `/admin/login` | تسجيل دخول المسؤول |
| لوحة الإدارة | `/admin` | إحصائيات، نتائج، تقارير |
| تفاصيل مختبر | `/admin/result/:id` | إجابات المختبر كاملة |

---

## النشر على Vercel

### 1. رفع الكود إلى GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/rga-system.git
git push -u origin main
```

### 2. ربط Vercel
1. سجّل الدخول على [vercel.com](https://vercel.com)
2. اضغط **New Project** واختر المستودع
3. في **Environment Variables** أضف:
   - `VITE_SUPABASE_URL` ← قيمة رابط مشروعك
   - `VITE_SUPABASE_ANON_KEY` ← المفتاح العام
4. اضغط **Deploy**

### 3. إعداد Vercel لـ SPA
أنشئ ملف `vercel.json` في جذر المشروع:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

---

## الأمان

- **RLS** مفعّل على جميع الجداول في Supabase
- المرشحون يستطيعون إدراج البيانات فقط (INSERT)
- المسؤولون المصادق عليهم يستطيعون القراءة والحذف
- متغيرات البيئة لا تُدمج في الكود المصدري
- `VITE_SUPABASE_ANON_KEY` هو المفتاح العام (آمن للمتصفح)

---

## التخصصات المدعومة

| التخصص | الأسئلة |
|--------|---------|
| 🏗️ مهندس مدني | 12 سؤال |
| مهندس مواد | 12 سؤال |
| ✅ مهندس ضبط جودة | 12 سؤال |
| 📦 مراقب مواد | 12 سؤال |
| 🔍 مراقب ضبط جودة | 12 سؤال |
| 📋 مراقب موقع | 12 سؤال |

من كل تخصص يتم اختيار **10 أسئلة ** بقيمة 10 درجات للسؤال.
حد النجاح: **70%** (70 درجة من 100).

---

## 🛠️ المتطلبات التقنية

```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.22.0",
  "@supabase/supabase-js": "^2.39.0",
  "recharts": "^2.12.0",
  "xlsx": "^0.18.5",
  "react-hot-toast": "^2.4.1"
}
```

---

## 📞 الدعم

للاستفسارات التقنية، يرجى التواصل مع فريق تقنية المعلومات بالهيئة العامة للطرق.
