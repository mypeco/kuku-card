import { useState, useEffect } from 'react'
import { generateMasterQuestions, kukuReadings, soundService } from '../data.js'
import { HomeIcon } from './Icons.jsx'

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

const TenKeyPad = ({ onInput, onClear, disabled, handedness, onToggleHand }) => {
  const btns = [7, 8, 9, 4, 5, 6, 1, 2, 3, 0]
  return (
    <div className="flex flex-col h-full p-2 gap-1">
      {/* 利き手切替 */}
      <div className="flex justify-end shrink-0 mb-1">
        <button onClick={onToggleHand}
          className="text-xs font-bold px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-500 shadow-sm active:scale-95">
          {handedness === 'right' ? '🤜 右手' : '🤛 左手'}
        </button>
      </div>
      <div className="flex-1 grid grid-cols-3 gap-2">
        {btns.map(n => (
          <button key={n}
            className={`rounded-xl bg-white border-b-[3px] border-emerald-200 text-2xl font-bold text-emerald-600 active:border-b-0 active:translate-y-[3px] transition-all shadow-sm flex items-center justify-center ${n === 0 ? 'col-start-2' : ''}`}
            onClick={() => !disabled && onInput(n)}
          >{n}</button>
        ))}
        <button onClick={onClear}
          className="col-start-3 row-start-4 rounded-xl bg-amber-100 border-b-[3px] border-amber-200 text-amber-600 font-bold active:border-b-0 active:translate-y-[3px] flex items-center justify-center">
          C
        </button>
      </div>
    </div>
  )
}

export const GameScreen = ({ config, settings, onUpdateSettings, onExit, onFinish }) => {
  const [qs, setQs] = useState([])
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState('none')
  const [startTime, setStartTime] = useState(null)
  const [wrongList, setWrongList] = useState([])
  const [mistakeCount, setMistakeCount] = useState(0)
  const [showFlashAns, setShowFlashAns] = useState(false)

  const isLandscape = useIsLandscape()
  const handLeft = settings.handedness === 'left'

  useEffect(() => {
    setQs(generateMasterQuestions(config.dan, config.subMode, config.count, config.weaknessMap))
    setStartTime(Date.now())
  }, [])

  const q = qs[idx]

  const nextQ = (ci, cw, cm, cqs) => {
    setFeedback('none'); setInput(''); setShowFlashAns(false)
    if (ci < cqs.length - 1) setIdx(ci + 1)
    else onFinish({ timeMs: Date.now() - startTime, mistakeCount: cm, wrongList: cw, total: cqs.length })
  }

  const handleTenKey = (num) => {
    if (feedback !== 'none') return
    if (settings.isSoundEnabled) soundService.playTap()
    const next = input + num.toString()
    const strAns = q.a.toString()
    let check = strAns.length === 1 || next.length >= 2
    if (strAns.length > next.length && next[0] !== strAns[0]) check = true
    setInput(next)
    if (check) {
      if (parseInt(next) === q.a) {
        setFeedback('correct')
        if (settings.isSoundEnabled) soundService.playCorrect()
        setTimeout(() => nextQ(idx, wrongList, mistakeCount, qs), 300)
      } else {
        setFeedback('wrong')
        if (settings.isSoundEnabled) soundService.playWrong()
        const nwl = [...wrongList, { d: q.d, m: q.m }]
        const nmc = mistakeCount + 1
        setWrongList(nwl); setMistakeCount(nmc)
        setInput('')
        setTimeout(() => setFeedback('none'), 500)
      }
    }
  }

  const handleFlashTap = () => {
    if (showFlashAns) return
    if (settings.isSoundEnabled) soundService.playTap()
    setShowFlashAns(true)
    setTimeout(() => nextQ(idx, wrongList, mistakeCount, qs), 400)
  }

  const toggleHand = () =>
    onUpdateSettings({ ...settings, handedness: handLeft ? 'right' : 'left' })

  const toggleReading = () =>
    onUpdateSettings({ ...settings, isReadingVisible: !settings.isReadingVisible })

  if (!q) return null

  const showReading = settings.isReadingVisible && config.dan !== 'ALL' && config.dan !== 'WEAKNESS'
  const isTenkey = config.modeType === 'tenkey'

  // ── 問題カード ─────────────────────────────────────────────
  const QuestionCard = () => (
    <div className={`w-full bg-white rounded-[2rem] shadow-lg flex flex-col items-center justify-center relative border-b-4 overflow-hidden transition-all
      ${feedback === 'correct' ? 'border-emerald-400 bg-emerald-50' : 'border-slate-100'}
      ${feedback === 'wrong'   ? 'border-rose-400 shake bg-rose-50' : ''}
      ${isLandscape ? 'flex-1' : (isTenkey ? 'h-48' : 'flex-1 max-h-[22rem]')}
    `}>
      <div className="flex items-center gap-2 text-[3.5rem] sm:text-[5rem] font-black text-slate-700 leading-none">
        <span>{q.d}</span>
        <span className="text-emerald-300 text-2xl sm:text-4xl">×</span>
        <span>{q.m}</span>
        <span className="text-emerald-300 text-2xl sm:text-4xl">＝</span>
        {isTenkey ? (
          <span className={`min-w-[1.2em] text-center ${input ? 'text-slate-800' : 'text-slate-200'}`}>
            {input || '?'}
          </span>
        ) : (
          <span className={showFlashAns ? 'text-slate-800 animate-pop' : 'text-transparent'}>{q.a}</span>
        )}
      </div>
      {showReading && (
        <div className="absolute bottom-3 text-emerald-500 font-bold bg-white/80 px-4 py-1 rounded-full animate-pop text-base tracking-widest border border-emerald-100">
          {kukuReadings[q.d][q.m - 1]}
        </div>
      )}
      {!isTenkey && <div onClick={handleFlashTap} className="absolute inset-0 z-10 cursor-pointer" />}
    </div>
  )

  // ── テンキーパネル ─────────────────────────────────────────
  const TenkeyPanel = () => (
    <div className={`bg-slate-100 rounded-t-[2rem] ${isLandscape ? 'h-full rounded-none rounded-l-[2rem]' : 'h-[42vh]'} shrink-0`}
      style={isLandscape ? { width: '300px' } : {}}>
      <TenKeyPad
        onInput={handleTenKey}
        onClear={() => setInput('')}
        disabled={feedback !== 'none'}
        handedness={settings.handedness}
        onToggleHand={toggleHand}
      />
    </div>
  )

  return (
    <div className="flex flex-col h-full w-full bg-emerald-50 overflow-hidden">
      {/* プログレスバー */}
      <div className="h-1.5 bg-emerald-200 shrink-0">
        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${(idx / qs.length) * 100}%` }} />
      </div>

      {/* ヘッダー */}
      <header className="px-3 py-2 flex justify-between items-center shrink-0">
        <button onClick={onExit} className="text-slate-400 hover:text-slate-600 p-1">
          <HomeIcon className="w-7 h-7" />
        </button>
        <div className="font-bold text-emerald-600 bg-white px-4 py-1 rounded-full shadow-sm text-sm">
          {idx + 1} / {qs.length}
        </div>
        <div className="flex gap-2">
          {config.dan !== 'ALL' && config.dan !== 'WEAKNESS' && (
            <button onClick={toggleReading}
              className={`w-12 h-10 rounded-xl flex flex-col items-center justify-center transition-all shadow-sm text-[9px] font-bold
                ${settings.isReadingVisible ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-200' : 'bg-slate-50 text-slate-400 border-2 border-slate-100'}`}>
              <span className="leading-none mb-0.5">よみかた</span>
              <span className="leading-none">{settings.isReadingVisible ? 'あり' : 'なし'}</span>
            </button>
          )}
        </div>
      </header>

      {/* メインエリア：横置き時は左右分割 */}
      {isLandscape && isTenkey ? (
        <div className={`flex flex-1 min-h-0 p-3 gap-3 ${handLeft ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            <QuestionCard />
          </div>
          <TenkeyPanel />
        </div>
      ) : (
        <div className="flex-1 flex flex-col p-4 gap-3 min-h-0">
          <QuestionCard />
          {!isTenkey && (
            <div className="text-center text-slate-400 font-bold animate-pulse text-base">
              タップして こたえあわせ
            </div>
          )}
          {isTenkey && <TenkeyPanel />}
        </div>
      )}
    </div>
  )
}
