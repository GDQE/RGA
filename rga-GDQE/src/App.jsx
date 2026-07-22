import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

import { LandingPage } from './pages/LandingPage';
import { AccessCodePage } from './pages/AccessCodePage';
import { RegistrationPage } from './pages/RegistrationPage';
import { ExamPage } from './pages/ExamPage';
import { ThankYouPage } from './pages/ThankYouPage';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ResultDetailPage } from './pages/ResultDetailPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CertificatePage } from './pages/CertificatePage';

import { FirmSignupPage } from './pages/firm/FirmSignupPage';
import { FirmLoginPage } from './pages/firm/FirmLoginPage';
import { FirmProtectedRoute } from './pages/firm/FirmProtectedRoute';
import { FirmDashboard } from './pages/firm/FirmDashboard';
import { AddCandidatePage } from './pages/firm/AddCandidatePage';

import { CommitteeLoginPage } from './pages/committee/CommitteeLoginPage';
import { CommitteeProtectedRoute } from './pages/committee/CommitteeProtectedRoute';
import { CommitteeDashboard } from './pages/committee/CommitteeDashboard';
import { EvaluationFormPage } from './pages/committee/EvaluationFormPage';

import { QUESTION_BANK, pickRandom } from './utils/questionBank';
import { saveExamResult } from './services/examService';

function FontLoader() {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Tajawal:wght@400;700;800;900&display=swap';
    document.head.appendChild(link);
  }, []);
  return null;
}

function ExamFlow() {
  const [stage, setStage] = useState('access');
  const [candidate, setCandidate] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [result, setResult] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

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
      <Toaster position="top-center" toastOptions={{ duration: 4000, style: { fontFamily: "'IBM Plex Sans Arabic','Tajawal',sans-serif", direction: 'rtl', fontSize: 14 } }} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/exam" element={<ExamFlow />} />
          <Route path="/admin/login" element={<AdminLoginWrapper />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/result/:id" element={<ProtectedRoute><ResultDetailPage /></ProtectedRoute>} />
          <Route path="/firm/signup" element={<FirmSignupPage />} />
          <Route path="/firm/login" element={<FirmLoginPage />} />
          <Route path="/firm/dashboard" element={<FirmProtectedRoute><FirmDashboard /></FirmProtectedRoute>} />
          <Route path="/firm/add-candidate" element={<FirmProtectedRoute><AddCandidatePage /></FirmProtectedRoute>} />
          <Route path="/committee/login" element={<CommitteeLoginPage />} />
          <Route path="/committee/dashboard" element={<CommitteeProtectedRoute><CommitteeDashboard /></CommitteeProtectedRoute>} />
          <Route path="/committee/evaluate/:candidateId" element={<CommitteeProtectedRoute><EvaluationFormPage /></CommitteeProtectedRoute>} />
          <Route path="/verify" element={<CertificatePage />} />
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


