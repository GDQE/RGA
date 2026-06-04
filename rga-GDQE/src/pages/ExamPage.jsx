import { useState, useEffect, useRef } from 'react';
import { C, font } from '../utils/constants';

export function ExamPage({ candidate, questions, onFinish }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const timerRef = useRef(null);
  const doSubmitRef = useRef(null);

  const tryFinish = () => {
    if (answered < questions.length) {
      setSubmitError(`يرجى الإجابة على جميع الأسئلة. تبقى ${questions.length - answered} سؤال بدون إجابة.`);
      return;
    }
    setSubmitError('');
    setConfirmOpen(true);
  };

  const doSubmit = () => {
    clearInterval(timerRef.current);
    const results = questions.map(q => ({
      ...q,
      userAnswer: answers[q.id] ?? null,
      isCorrect: answers[q.id] === q.correct,
    }));
    const earned = results.filter(r => r.isCorrect).reduce((s, r) => s + r.points, 0);
    const total = results.reduce((s, r) => s + r.points, 0);
    onFinish({ results, earned, total, score: Math.round((earned / total) * 100) });
  };

  doSubmitRef.current = doSubmit;

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); doSubmitRef.current(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const q = questions[currentQ];
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const isLow = timeLeft < 180;
  const answered = Object.keys(answers).length;
  const toggleFlag = (id) => { const f = new Set(flagged); f.has(id) ? f.delete(id) : f.add(id); setFlagged(f); };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, direction: 'rtl', fontFamily: font }}>
      <div style={{ position: 'fixed', top: 0, right: 0, left: 0, zIndex: 100, background: C.surface, borderBottom: `1px solid ${C.border}`, boxShadow: C.shadow }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{candidate.name}</span>
            <span style={{ fontSize: 12, color: C.textMuted, marginRight: 10 }}>{candidate.specialty}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 13, color: C.textSub }}><strong style={{ color: C.accentMid }}>{answered}</strong>/{questions.length} إجابة</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: isLow ? C.dangerBg : C.accentGhost, border: `1px solid ${isLow ? C.danger + '55' : C.accentLight + '55'}`, borderRadius: 10, padding: '6px 14px' }}>
              <span style={{ fontSize: 13 }}>{isLow ? '⚠️' : '⏱'}</span>
              <span style={{ fontSize: 19, fontWeight: 900, fontFamily: 'monospace', color: isLow ? C.danger : C.accent }}>{String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}</span>
            </div>
            <button onClick={tryFinish} style={{ padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: font, background: answered < questions.length ? C.border : C.success, color: answered < questions.length ? C.textMuted : '#fff', border: 'none' }}>إنهاء الاختبار</button>
          </div>
        </div>
        <div style={{ height: 3, background: C.border }}>
          <div style={{ height: '100%', background: `linear-gradient(90deg,${C.accentMid},${C.accentLight})`, width: `${((currentQ+1)/questions.length)*100}%`, transition: 'width 0.3s' }} />
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '76px 20px 40px' }}>
        {submitError && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#DC2626', fontSize: 14, fontWeight: 600 }}>
            {submitError}
          </div>
        )}
        <div style={{ background: C.surface, borderRadius: 18, padding: '32px 36px', boxShadow: C.shadowMd, border: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg,${C.accent},${C.accentMid})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900, color: '#fff' }}​​​​​​​​​​​​​​​​

      
