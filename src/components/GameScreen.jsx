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

const TenKeyPad = ({ onInput, onClear, disabled, handedness, onToggleHand, isLandscape }) => {
  const btns = [7, 8, 9, 4, 5, 6, 1, 2, 3, 0]
  // 横置き時：ボタンをw-16 h-16の固定サイズにしてグリッド全体をcentering
  return (
    <div className="flex flex-col h-full items-center justify-center p-4 gap-3">
      <div className="flex justify-end w-full">
        <button onClick={onToggleHand}
          className="text-xs font-bold px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-500 shadow-sm active:scale-95">
          {handedness === 'right' ? '🤜 右手' : '🤛 左手'}
        </button>
      </div>
      <div className={`grid grid-cols-3 ${isLandscape ? 'gap-3' : 'gap-2 w-full flex-1'}`}
        style={isLandscape ? { gridTemplateColumns: 'repeat(3, 4rem)' } : {}}>
        {btns.map(n => (
          <button key={n}
            className={`${isLandscape ? 'w-16 h-16' : ''} rounded-xl bg-sky-400 border-b-[3px] border-sky-600 text-2xl font-bold text-white active:border-b-0 active:translate-y-[3px] transition-all shadow-sm flex items-center justify-center ${n === 0 ? 'col-start-2' : ''}`}
            onClick={() => !disabled && onInput(n)}
          >{n}</button>
        ))}
        <button onClick={onClear}
          className={`col-start-3 row-start-4 ${isLandscape ? 'w-16 h-16' : ''} rounded-xl bg-amber-100 border-b-[3px] border-amber-200 text-amber-600 font-bold active:border-b-0 active:translate-y-[3px] flex items-center justify-center`}>
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
    <div className="flex items-center justify-center w-full">
      <div className={`bg-white rounded-3xl shadow-lg flex flex-col items-center justify-center border-b-4 transition-all relative px-10 py-8 w-full max-w-xl
        ${feedback === 'correct' ? 'border-emerald-400 bg-emerald-50' : 'border-white'}
        ${feedback === 'wrong'   ? 'border-rose-300 shake bg-rose-50' : ''}`}>
        <div className="flex items-center gap-3 text-[4rem] sm:text-[5rem] font-black text-slate-700 leading-none">
          <span>{q.d}</span>
          <span className="text-emerald-300 text-3xl sm:text-4xl">×</span>
          <span>{q.m}</span>
          <span className="text-emerald-300 text-3xl sm:text-4xl">＝</span>
          {isTenkey ? (
            <span className={`min-w-[1.2em] text-center ${input ? 'text-slate-800' : 'text-slate-200'}`}>
              {input || '?'}
            </span>
          ) : (
            <span className={showFlashAns ? 'text-slate-800 animate-pop' : 'text-transparent'}>{q.a}</span>
          )}
        </div>
        {showReading && (
          <div className="mt-4 text-emerald-500 font-bold px-4 py-1 rounded-full text-sm tracking-widest border border-emerald-100 bg-emerald-50">
            {kukuReadings[q.d][q.m - 1]}
          </div>
        )}
        {!isTenkey && <div onClick={handleFlashTap} className="absolute inset-0 z-10 cursor-pointer" />}
      </div>
    </div>
  )

  // ── テンキー（フレームなし・背景と同化） ────────────────────
  const tenKeyPanel = (
    <div className="shrink-0 px-4 pb-2">
      <TenKeyPad
        onInput={handleTenKey}
        onClear={() => setInput('')}
        disabled={feedback !== 'none'}
        handedness={settings.handedness}
        onToggleHand={toggleHand}
        isLandscape={false}
      />
    </div>
  )

  return (
    <div className="flex flex-col h-full w-full bg-green-50 overflow-hidden">
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

      {/* メインエリア：常にカード上・テンキー下 */}
      <div className="flex-1 flex flex-col p-4 gap-4 min-h-0 items-center justify-center">
        <QuestionCard />
        {!isTenkey && (
          <div className="text-center text-slate-400 font-bold animate-pulse text-base">
            タップして こたえあわせ
          </div>
        )}
        {isTenkey && tenKeyPanel}
      </div>
    </div>
  )
}
