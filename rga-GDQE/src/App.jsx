import { AccessCodePage} from './pages/AccessCodePage';
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

import { RegistrationPage } from './pages/RegistrationPage';
import { ExamPage } from './pages/ExamPage';
import { ThankYouPage } from './pages/ThankYouPage';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ResultDetailPage } from './pages/ResultDetailPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingPage } from './components/UI';

import { QUESTION_BANK, pickRandom } from './utils/questionBank';
import { saveExamResult } from './services/examService';

// Google Fonts loader
function FontLoader() {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Tajawal:wght@400;700;800;900&display=swap';
    document.head.appendChild(link);
  }, []);
  return null;
}

// Exam flow (registration → exam → done)
function ExamFlow() {
  const [stage, setStage] = useState('access');
  const [candidate, setCandidate] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [result, setResult] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'saved' | 'error'

  const handleRegister = (form) => {
    setCandidate(form);
    setQuestions(pickRandom(QUESTION_BANK[form.specialty], 10));
    setStage('exam');
  };

  const handleFinish = async (res) => {
    setResult(res);
    setStage('done');
    setSaveStatus('saving');

    const saveRes = await saveExamResult({ candidate, result: res });
    if (saveRes.success) {
      setSaveStatus('saved');
      toast.success('تم حفظ بيانات الاختبار بنجاح');
    } else {
      setSaveStatus('error');
      toast.error('تعذّر حفظ البيانات — يرجى إبلاغ المشرف');
    }
  };
   
  if (stage === 'access') return <AccessCodePage onSuccess={() => setStage('register')} />;
  if (stage === 'register') return <RegistrationPage onSubmit={handleRegister} />;
  if (stage === 'exam') return <ExamPage candidate={candidate} questions={questions} onFinish={handleFinish} />;
  if (stage === 'done') return <ThankYouPage candidate={candidate} result={result} saveStatus={saveStatus} />;
  return null;
}

export default function App() {
  return (
    <>
      <FontLoader />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: "'IBM Plex Sans Arabic','Tajawal',sans-serif",
            direction: 'rtl',
            fontSize: 14,
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          {/* Exam flow */}
          <Route path="/" element={<ExamFlow />} />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLoginWrapper />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/result/:id" element={
            <ProtectedRoute>
              <ResultDetailPage />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

function AdminLoginWrapper() {
  const [done, setDone] = useState(false);
  if (done) return <Navigate to="/admin" replace />;
  return <LoginPage onLogin={() => setDone(true)} />;
}
