import { useState, useEffect } from 'react'
import { generateQuestions, playSound, kukuReadings } from '../data.js'
import { HomeIcon } from './Icons.jsx'

const ReadingToggleBtn = ({ show, onToggle }) => (
  <button onClick={onToggle} className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all shadow-sm ${show ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-200' : 'bg-slate-50 text-slate-400 border-2 border-slate-100'}`}>
    <span className="text-[10px] font-black leading-none mb-0.5">よみかた</span>
    <span className="text-[10px] font-bold leading-none">{show ? 'あり' : 'なし'}</span>
  </button>
)

const TenKeyPad = ({ onInput, onClear, disabled }) => {
  const btns = [7, 8, 9, 4, 5, 6, 1, 2, 3, 0]
  return (
    <div className="w-full h-full max-h-[40vh] grid grid-cols-3 gap-2 p-2">
      {btns.map(n => (
        <button key={n}
          className={`rounded-xl bg-white border-b-[3px] border-emerald-200 text-2xl font-bold text-emerald-600 active:border-b-0 active:translate-y-[3px] transition-all shadow-sm flex items-center justify-center ${n === 0 ? 'col-start-2' : ''}`}
          onClick={() => !disabled && onInput(n)}
        >{n}</button>
      ))}
      <button onClick={onClear} className="col-start-3 row-start-4 rounded-xl bg-amber-100 border-b-[3px] border-amber-200 text-amber-600 font-bold active:border-b-0 active:translate-y-[3px] flex items-center justify-center">C</button>
    </div>
  )
}

export const GameScreen = ({ config, showReading, onToggleReading, onExit, onFinish }) => {
  const [qs, setQs] = useState([])
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState('none')
  const [startTime, setStartTime] = useState(null)
  const [wrongList, setWrongList] = useState([])
  const [mistakeCount, setMistakeCount] = useState(0)
  const [showFlashAns, setShowFlashAns] = useState(false)

  useEffect(() => {
    setQs(generateQuestions(config.dan, config.subMode, config.count, config.weaknessMap))
    setStartTime(Date.now())
  }, [])

  const q = qs[idx]

  const nextQ = (currentIdx, currentWrongList, currentMistakeCount, currentQs) => {
    setFeedback('none')
    setInput('')
    setShowFlashAns(false)
    if (currentIdx < currentQs.length - 1) {
      setIdx(currentIdx + 1)
    } else {
      const timeMs = Date.now() - startTime
      onFinish({ timeMs, mistakeCount: currentMistakeCount, wrongList: currentWrongList, total: currentQs.length })
    }
  }

  const handleTenKeyInput = (num) => {
    if (feedback !== 'none') return
    playSound('tap')
    const nextInput = input + num.toString()
    const strAns = q.a.toString()
    let isCheckNow = false
    if (strAns.length === 1) isCheckNow = true
    else if (nextInput.length >= 2) isCheckNow = true
    if (strAns.length > nextInput.length) { if (nextInput[0] !== strAns[0]) isCheckNow = true }
    setInput(nextInput)

    if (isCheckNow) {
      if (parseInt(nextInput) === q.a) {
        setFeedback('correct')
        playSound('correct')
        setTimeout(() => nextQ(idx, wrongList, mistakeCount, qs), 300)
      } else {
        setFeedback('wrong')
        playSound('wrong')
        const newMistakeCount = mistakeCount + 1
        const newWrongList = [...wrongList, { d: q.d, m: q.m }]
        setMistakeCount(newMistakeCount)
        setWrongList(newWrongList)
        setInput('')
        setTimeout(() => setFeedback('none'), 500)
      }
    }
  }

  const handleFlashTap = () => {
    if (showFlashAns) return
    playSound('tap')
    setShowFlashAns(true)
    setTimeout(() => nextQ(idx, wrongList, mistakeCount, qs), 400)
  }

  if (!q) return null

  return (
    <div className="flex flex-col h-full w-full bg-emerald-50 relative overflow-hidden">
      <div className="h-1.5 bg-emerald-200 shrink-0">
        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${(idx / qs.length) * 100}%` }}></div>
      </div>
      <header className="p-2 flex justify-between items-center shrink-0 z-10 relative">
        <div className="w-12">
          <button onClick={onExit} className="text-slate-400 hover:text-slate-600 p-1"><HomeIcon className="w-7 h-7" /></button>
        </div>
        <div className="font-bold text-emerald-600 bg-white px-4 py-1 rounded-full shadow-sm text-sm">
          {idx + 1} / {qs.length}
        </div>
        <div className="w-12 flex justify-end">
          {config.dan !== 'ALL' && config.dan !== 'WEAKNESS' && (
            <ReadingToggleBtn show={showReading} onToggle={onToggleReading} />
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0">
        <div className={`w-full max-w-sm bg-white rounded-[2rem] shadow-lg flex flex-col items-center justify-center relative border-b-4 overflow-hidden transition-all
          ${feedback === 'correct' ? 'border-emerald-400 bg-emerald-50' : 'border-slate-100'}
          ${feedback === 'wrong' ? 'border-rose-400 shake bg-rose-50' : ''}
          ${config.modeType === 'tenkey' ? 'h-3/4 max-h-[16rem]' : 'h-full max-h-[25rem]'}
        `}>
          <div className="flex items-center gap-1 sm:gap-2 text-[4rem] sm:text-[5rem] font-black text-slate-700 leading-none">
            <span>{q.d}</span>
            <span className="text-emerald-300 text-3xl sm:text-4xl">×</span>
            <span>{q.m}</span>
            <span className="text-emerald-300 text-3xl sm:text-4xl">＝</span>
            {config.modeType === 'tenkey' ? (
              <span className={`min-w-[1.2em] text-center ${input ? 'text-slate-800' : 'text-slate-200'}`}>{input || '?'}</span>
            ) : (
              <span className={`${showFlashAns ? 'text-slate-800 animate-pop' : 'text-transparent'}`}>{q.a}</span>
            )}
          </div>
          {config.dan !== 'ALL' && config.dan !== 'WEAKNESS' && showReading && (
            <div className="absolute bottom-4 sm:bottom-6 text-emerald-500 font-bold bg-white/80 px-4 py-1 rounded-full animate-pop text-lg sm:text-xl tracking-widest border border-emerald-100">
              {kukuReadings[q.d][q.m - 1]}
            </div>
          )}
          {config.modeType === 'flash' && (
            <div onClick={handleFlashTap} className="absolute inset-0 z-10 cursor-pointer"></div>
          )}
        </div>
        {config.modeType === 'flash' && (
          <div className="mt-6 text-slate-400 font-bold animate-pulse text-lg">タップして こたえあわせ</div>
        )}
      </div>

      {config.modeType === 'tenkey' && (
        <div className="bg-slate-100 p-2 pb-safe rounded-t-[2rem] h-[45vh] shrink-0 w-full max-w-md mx-auto">
          <TenKeyPad onInput={handleTenKeyInput} onClear={() => setInput('')} disabled={feedback !== 'none'} />
        </div>
      )}
    </div>
  )
}
