import { useState, useEffect, useRef } from 'react';
import { C, font } from '../utils/constants';

export function ExamPage({ candidate, questions, onFinish }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const timerRef = useRef(null);
  const doSubmitRef = useRef(null);

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
      {/* Fixed navbar */}
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
            <button onClick={() => setConfirmOpen(true)} style={{ padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: font, background: C.success, color: '#fff', border: 'none' }}>إنهاء الاختبار</button>
          </div>
        </div>
        <div style={{ height: 3, background: C.border }}>
          <div style={{ height: '100%', background: `linear-gradient(90deg,${C.accentMid},${C.accentLight})`, width: `${((currentQ+1)/questions.length)*100}%`, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '76px 20px 40px', display: 'grid', gridTemplateColumns: '1fr 256px', gap: 20, alignItems: 'start' }}>
        {/* Question card */}
        <div style={{ background: C.surface, borderRadius: 18, padding: '32px 36px', boxShadow: C.shadowMd, border: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg,${C.accent},${C.accentMid})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900, color: '#fff' }}>{currentQ+1}</div>
              <div>
                <div style={{ fontSize: 11, color: C.textMuted }}>السؤال {currentQ+1} من {questions.length}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 3 }}>
                  <span style={{ padding: '2px 8px', borderRadius: 6, background: C.accentGhost, color: C.accentMid, fontSize: 11, fontWeight: 700 }}>اختيار متعدد</span>
                  <span style={{ padding: '2px 8px', borderRadius: 6, background: C.goldBg, color: C.gold, fontSize: 11, fontWeight: 700 }}>10 درجات</span>
                </div>
              </div>
            </div>
            <button onClick={() => toggleFlag(q.id)} style={{ padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, background: flagged.has(q.id) ? C.warningBg : 'transparent', border: `1px solid ${flagged.has(q.id) ? C.warning : C.border}`, color: flagged.has(q.id) ? C.warning : C.textMuted, fontFamily: font }}>
              {flagged.has(q.id) ? '🚩 مُعلَّم' : '🏴 علِّم للمراجعة'}
            </button>
          </div>

          <p style={{ fontSize: 17, color: C.text, lineHeight: 1.9, marginBottom: 28, fontWeight: 600 }}>{q.text}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {q.options.map((opt, i) => {
              const sel = answers[q.id] === i;
              return (
                <div key={i} onClick={() => setAnswers(a => ({ ...a, [q.id]: i }))}
                  style={{ padding: '14px 18px', borderRadius: 12, cursor: 'pointer', border: `2px solid ${sel ? C.accentMid : C.border}`, background: sel ? C.accentGhost : C.bg, display: 'flex', alignItems: 'center', gap: 13, transition: 'all 0.15s' }}
                  onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = C.accentLight; }}
                  onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = C.border; }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, border: `2px solid ${sel ? C.accentMid : C.border}`, background: sel ? C.accentMid : C.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: sel ? '#fff' : C.textMuted, transition: 'all 0.15s' }}>
                    {sel ? '✓' : ['أ','ب','ج','د'][i]}
                  </div>
                  <span style={{ fontSize: 14, color: sel ? C.accent : C.text, fontWeight: sel ? 700 : 400 }}>{opt}</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
            <button onClick={() => setCurrentQ(c => Math.max(0,c-1))} disabled={currentQ===0} style={{ padding: '10px 22px', borderRadius: 10, fontSize: 13, cursor: currentQ===0 ? 'not-allowed' : 'pointer', background: 'transparent', border: `1px solid ${C.border}`, color: currentQ===0 ? C.textMuted : C.textSub, fontFamily: font }}>← السابق</button>
            {currentQ < questions.length-1
              ? <button onClick={() => setCurrentQ(c => c+1)} style={{ padding: '10px 26px', borderRadius: 10, fontSize: 13, cursor: 'pointer', background: `linear-gradient(135deg,${C.accent},${C.accentMid})`, color: '#fff', border: 'none', fontWeight: 700, fontFamily: font }}>التالي →</button>
              : <button onClick={() => setConfirmOpen(true)} style={{ padding: '10px 26px', borderRadius: 10, fontSize: 13, cursor: 'pointer', background: C.success, color: '#fff', border: 'none', fontWeight: 800, fontFamily: font }}> إنهاء الاختبار</button>
            }
          </div>
        </div>

      {/* Confirm Modal */}
      {confirmOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background:C.surface, borderRadius:20, padding:'36px 40px', maxWidth:400, width:'100%', boxShadow:C.shadowLg, direction:'rtl', textAlign:'center' }}>
            <div style={{ fontSize:44, marginBottom:16 }}></div>
            <h3 style={{ margin:'0 0 10px', fontSize:19, fontWeight:800, color:C.text, fontFamily:font }}>تأكيد إنهاء الاختبار</h3>
            <p style={{ margin:'0 0 24px', color:C.textSub, fontSize:14, lineHeight:1.7, fontFamily:font }}>
              أجبت على <strong style={{color:C.accentMid}}>{answered}</strong> من أصل {questions.length} أسئلة.
              {answered<questions.length && ` يوجد ${questions.length-answered} سؤال بدون إجابة.`}
            </p>
            <div style={{ display:'flex', gap:12 }}>
              <button onClick={() => setConfirmOpen(false)} style={{ flex:1, padding:'11px', borderRadius:10, cursor:'pointer', background:'transparent', border:`1px solid ${C.border}`, color:C.textSub, fontSize:14, fontFamily:font }}>رجوع</button>
              <button onClick={doSubmit} style={{ flex:1, padding:'11px', borderRadius:10, cursor:'pointer', background:C.success, color:'#fff', border:'none', fontSize:14, fontWeight:800, fontFamily:font }}>تسليم الاختبار </button>
            </div>
          </div>
        </div>
      )}
       );
       }
