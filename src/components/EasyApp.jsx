import { useState, useEffect } from 'react'
import { generateEasyQuestions, kukuReadingsFull, soundService } from '../data.js'
import { HomeIcon, RefreshIcon, Volume2Icon, VolumeXIcon, LangIcon, ArrowLeftIcon } from './Icons.jsx'
import { getEasyData, saveEasyData } from '../db.js'

function useIsLandscape() {
  const check = () => window.innerWidth > window.innerHeight && window.innerWidth >= 600
  const [ls, setLs] = useState(check)
  useEffect(() => {
    const h = () => setLs(check())
    window.addEventListener('resize', h)
    window.addEventListener('orientationchange', h)
    return () => { window.removeEventListener('resize', h); window.removeEventListener('orientationchange', h) }
  }, [])
  return ls
}

// ── ゲーム画面 ────────────────────────────────────────────────
const EasyGame = ({ dan, level, settings, onUpdateSettings, onExit, onComplete }) => {
  const [qs] = useState(() => generateEasyQuestions(dan, level))
  const [idx, setIdx] = useState(0)
  const [feedback, setFeedback] = useState('idle')
  const [done, setDone] = useState(false)
  const isLandscape = useIsLandscape()

  const q = qs[idx]
  const reading = kukuReadingsFull[q.dan][q.multiplier - 1]

  const handleAns = (val) => {
    if (feedback !== 'idle') return
    const correct =
      (q.missingPart === 'dan'        && val === q.dan)        ||
      (q.missingPart === 'multiplier' && val === q.multiplier) ||
      (q.missingPart === 'product'    && val === q.product)

    if (correct) {
      setFeedback('correct')
      if (settings.isSoundEnabled) soundService.playCorrect()
      setTimeout(() => {
        setFeedback('idle')
        if (idx < qs.length - 1) setIdx(i => i + 1)
        else { setDone(true); onComplete() }
      }, 1200)
    } else {
      setFeedback('wrong')
      if (settings.isSoundEnabled) soundService.playWrong()
      setTimeout(() => setFeedback('idle'), 700)
    }
  }

  if (done) return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-pop bg-orange-50">
      <div className="text-[7rem] animate-bounce select-none mb-4">🎉</div>
      <h2 className="text-4xl font-black text-orange-500 mb-4">おめでとう！</h2>
      <p className="text-lg font-bold text-stone-500 mb-8">さいごまで できたね！</p>
      <div className="flex flex-col w-full gap-4 max-w-xs">
        <button onClick={onExit} className="w-full py-4 bg-orange-400 text-white rounded-2xl font-bold text-xl shadow-lg active:scale-95 flex items-center justify-center gap-2">
          <HomeIcon className="w-5 h-5" /> メニューへもどる
        </button>
        <button onClick={() => { setDone(false); setIdx(0); setFeedback('idle') }}
          className="w-full py-4 bg-white text-stone-500 border-2 border-stone-100 rounded-2xl font-bold text-xl active:scale-95 flex items-center justify-center gap-2">
          <RefreshIcon className="w-5 h-5" /> もういちど
        </button>
      </div>
    </div>
  )

  const isSingle = q.options.length === 1

  // ── 問題カード ──
  const Part = ({ val, type }) => {
    const isMiss = q.missingPart === type
    return (
      <div className="w-20 h-20 flex items-center justify-center">
        {isMiss ? (
          <div className={`w-full h-full rounded-3xl border-4 flex items-center justify-center text-4xl font-black transition-all
            ${feedback === 'correct' ? 'border-emerald-400 text-emerald-500 bg-emerald-50'
            : feedback === 'wrong'   ? 'border-rose-300 bg-rose-50 shake'
            : 'border-orange-300 text-transparent bg-white border-dashed'}`}>
            {feedback === 'correct' ? val : '?'}
          </div>
        ) : (
          <span className="text-5xl font-black text-stone-700">{val}</span>
        )}
      </div>
    )
  }

  const QuestionPanel = () => (
    <div className="flex flex-col items-center justify-center p-4 w-full max-w-sm">
      <div className="w-full bg-orange-100 h-3 rounded-full mb-4 overflow-hidden">
        <div className="bg-orange-400 h-full transition-all duration-500" style={{ width: `${(idx / qs.length) * 100}%` }} />
      </div>
      <div className="bg-white rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center border-b-8 border-orange-50 relative w-full py-8">
        <div className="flex items-center justify-center gap-1 mb-4">
          <Part val={q.dan} type="dan" />
          <span className="text-3xl text-orange-200 font-black">×</span>
          <Part val={q.multiplier} type="multiplier" />
          <span className="text-3xl text-orange-200 font-black">＝</span>
          <Part val={q.product} type="product" />
        </div>
        {settings.isReadingVisible && (
          <div className="text-xl font-black text-orange-500 bg-orange-50 px-6 py-2 rounded-full tracking-widest border border-orange-100">
            {reading}
          </div>
        )}
      </div>
    </div>
  )

  const answerPanel = (
    <div className="px-4 pb-2 w-full max-w-sm mx-auto shrink-0">
      <div className={`${isSingle ? 'flex justify-center' : 'grid grid-cols-3'} gap-3`}>
        {q.options.map(opt => (
          <button key={opt} onClick={() => handleAns(opt)} disabled={feedback !== 'idle'}
            className={`h-16 text-3xl font-black bg-sky-400 text-white rounded-2xl border-b-4 border-sky-600 active:border-b-0 active:translate-y-1 disabled:opacity-50 shadow-md
              ${isSingle ? 'w-full max-w-[180px]' : ''}`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-green-50 overflow-hidden">
      <header className="px-4 py-2 flex justify-between items-center shrink-0">
        <button onClick={onExit} className="text-stone-300 hover:text-stone-500">
          <HomeIcon className="w-8 h-8" />
        </button>
        <div className="px-4 py-1 bg-white border border-orange-100 rounded-full text-orange-400 font-bold text-sm">
          {idx + 1} / {qs.length}
        </div>
        <button onClick={() => onUpdateSettings({ ...settings, isReadingVisible: !settings.isReadingVisible })}
          className={`px-3 py-2 rounded-xl border-2 transition-all flex items-center gap-1
            ${settings.isReadingVisible ? 'bg-white border-orange-200 text-orange-500 shadow-sm' : 'bg-transparent border-stone-200 text-stone-300'}`}>
          <LangIcon className="w-5 h-5" />
          <span className="text-xs font-bold">よみかた</span>
        </button>
      </header>

      <div className="flex flex-col flex-1 min-h-0 items-center justify-start pt-2">
        <QuestionPanel />
        {answerPanel}
      </div>
    </div>
  )
}

// ── メニュー画面 ──────────────────────────────────────────────
const DAN_ICONS = { 1:'🐶',2:'🌈',3:'🐼',4:'🍭',5:'🐰',6:'🐻',7:'🌷',8:'🦊',9:'👑' }
const LEVEL_ICONS = { 1:'👍', 2:'🎉', 3:'💮' }
const LEVELS = [
  { lv: 1, label: 'レベル 1', desc: 'かけられるかずは？' },
  { lv: 2, label: 'レベル 2', desc: 'かけるかずは？' },
  { lv: 3, label: 'レベル 3', desc: 'こたえは？' },
]

export const EasyApp = ({ user, settings, onUpdateSettings, onExit }) => {
  const [page, setPage] = useState('DAN')
  const [selDan, setSelDan] = useState(null)
  const [selLevel, setSelLevel] = useState(null)
  const [stamps, setStamps] = useState(null)
  const [counts, setCounts]   = useState(null)

  useEffect(() => {
    getEasyData(user.id).then(d => {
      setStamps(d.stamps); setCounts(d.counts)
    })
  }, [user.id])

  if (stamps === null) return <div className="flex items-center justify-center h-full text-slate-400 text-lg">読み込み中…</div>

  const isDanComplete = (d) => LEVELS.every(l => stamps[`${d}-${l.lv}`])

  const persist = async (s, c) => {
    setStamps(s); setCounts(c)
    await saveEasyData(user.id, s, c)
  }

  const toggleStamp = async (d, lv) => {
    const key = `${d}-${lv}`
    if (!(counts[key] > 0)) return
    const newStamps = { ...stamps, [key]: !stamps[key] }
    if (!stamps[key] && settings.isSoundEnabled) soundService.playStamp()
    await persist(newStamps, counts)
  }

  const handleComplete = async () => {
    const key = `${selDan}-${selLevel}`
    const newCounts = { ...counts, [key]: (counts[key] || 0) + 1 }
    await persist(stamps, newCounts)
  }

  if (page === 'GAME') return (
    <EasyGame
      dan={selDan} level={selLevel}
      settings={settings} onUpdateSettings={onUpdateSettings}
      onExit={() => setPage('LEVEL')}
      onComplete={handleComplete}
    />
  )

  if (page === 'LEVEL') return (
    <div className="flex flex-col h-full bg-orange-50 animate-pop overflow-hidden">
      <header className="px-4 py-3 flex items-center gap-3 border-b border-orange-100 bg-white shrink-0">
        <button onClick={() => setPage('DAN')} className="text-stone-400 hover:text-orange-400">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-black text-orange-500">{selDan} のだん</h2>
        <div className="ml-auto flex gap-2">
          <button onClick={() => onUpdateSettings({ ...settings, isSoundEnabled: !settings.isSoundEnabled })}
            className={`p-2 rounded-xl border-2 ${settings.isSoundEnabled ? 'bg-orange-50 border-orange-200 text-orange-500' : 'bg-stone-50 border-stone-100 text-stone-300'}`}>
            {settings.isSoundEnabled ? <Volume2Icon className="w-5 h-5" /> : <VolumeXIcon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="flex-1 scroll-y p-4 flex flex-col items-center">
        <div className="w-full max-w-md space-y-3">
        {LEVELS.map(l => {
          const key = `${selDan}-${l.lv}`
          const isStamped = !!stamps[key]
          const count = counts[key] || 0
          return (
            <div key={l.lv}
              className={`relative p-1 rounded-[2rem] border-4 transition-all ${isStamped ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-orange-100 shadow-lg'}`}>
              <div className="flex">
                <button onClick={() => { setSelLevel(l.lv); setPage('GAME') }} className="flex-1 p-5 text-left active:opacity-70">
                  <h3 className={`text-2xl font-black ${isStamped ? 'text-emerald-600' : 'text-stone-600'}`}>{l.label}</h3>
                  <p className="text-stone-400 text-sm font-bold mb-2">{l.desc}</p>
                  <div className="inline-block px-3 py-1 bg-stone-100 rounded-full text-xs font-bold text-stone-500">
                    {count}かい できた！
                  </div>
                </button>
                <div className="w-24 border-l-2 border-dashed border-stone-100 flex items-center justify-center p-2">
                  <button
                    onClick={() => toggleStamp(selDan, l.lv)}
                    disabled={count === 0}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all
                      ${count === 0 ? 'opacity-30 grayscale cursor-not-allowed bg-stone-100' : 'active:scale-110 bg-white shadow-sm border-2 border-orange-50'}`}>
                    {isStamped
                      ? <span className="text-4xl select-none animate-pop">{LEVEL_ICONS[l.lv]}</span>
                      : <div className="text-[9px] font-bold text-stone-400 text-center leading-tight">じしんが<br/>ついたら<br/>おしてね</div>}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
        </div>
      </div>
    </div>
  )

  // ── 段選択 ──
  return (
    <div className="flex flex-col h-full bg-orange-50 animate-pop overflow-hidden">
      <header className="px-4 py-3 flex items-center gap-3 border-b border-orange-100 bg-white shrink-0">
        <button onClick={onExit} className="text-stone-400 hover:text-orange-400">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black text-orange-500">🌷 やさしい九九カード 🌷</h1>
        <div className="ml-auto flex gap-2">
          <button onClick={() => onUpdateSettings({ ...settings, isSoundEnabled: !settings.isSoundEnabled })}
            className={`p-2 rounded-xl border-2 ${settings.isSoundEnabled ? 'bg-orange-50 border-orange-200 text-orange-500' : 'bg-stone-50 border-stone-100 text-stone-300'}`}>
            {settings.isSoundEnabled ? <Volume2Icon className="w-5 h-5" /> : <VolumeXIcon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <p className="text-stone-400 font-bold mb-6">どのだんを れんしゅうする？</p>
        <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
          {[1,2,3,4,5,6,7,8,9].map(d => (
            <button key={d} onClick={() => { setSelDan(d); setPage('LEVEL') }}
              className={`aspect-square rounded-3xl border-4 text-4xl font-black transition-all flex flex-col items-center justify-center relative
                ${isDanComplete(d) ? 'bg-emerald-50 border-emerald-200 text-emerald-500' : 'bg-white border-orange-100 text-orange-400 shadow-lg active:scale-90 hover:border-orange-300'}`}>
              {d}
              {isDanComplete(d) && (
                <span className="absolute text-5xl opacity-100 pointer-events-none select-none">{DAN_ICONS[d]}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
