import { useState } from 'react'
import { soundService } from '../data.js'
import { HomeIcon, ArrowLeftIcon } from './Icons.jsx'

const generateQuestions = (dan, holeMode) => {
  let baseQs = []
  if (dan === 'ALL') {
    const all = []
    for (let d = 1; d <= 9; d++) for (let m = 1; m <= 9; m++) all.push({ d, m })
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[all[i], all[j]] = [all[j], all[i]]
    }
    baseQs = all.slice(0, 10)
  } else {
    const d = parseInt(dan)
    baseQs = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(m => ({ d, m }))
    for (let i = baseQs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[baseQs[i], baseQs[j]] = [baseQs[j], baseQs[i]]
    }
  }
  return baseQs.map(q => {
    const holeSide = holeMode === 'left' ? 0 : holeMode === 'right' ? 1 : (Math.random() < 0.5 ? 0 : 1)
    return { d: q.d, m: q.m, ans: q.d * q.m, holeSide, correctVal: holeSide === 0 ? q.d : q.m }
  })
}

const TenKeyPad = ({ onInput, onClear }) => {
  const btns = [7, 8, 9, 4, 5, 6, 1, 2, 3, 0]
  return (
    <div className="grid grid-cols-3 gap-3 w-full" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
      {btns.map(n => (
        <button key={n}
          className={`h-16 rounded-2xl bg-sky-400 border-b-4 border-sky-600 text-3xl font-bold text-white active:border-b-0 active:translate-y-1 transition-all shadow-sm flex items-center justify-center ${n === 0 ? 'col-start-2' : ''}`}
          onClick={() => onInput(n)}
        >{n}</button>
      ))}
      <button onClick={onClear}
        className="col-start-3 row-start-4 h-16 rounded-2xl bg-amber-100 border-b-4 border-amber-200 text-amber-600 text-2xl font-bold active:border-b-0 active:translate-y-1 flex items-center justify-center">
        C
      </button>
    </div>
  )
}

const holeBoxBase = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  border: '3px solid #10b981', borderRadius: '0.5rem',
  minWidth: '1.2em', minHeight: '1.2em', margin: '0 0.05em',
}

const AnaumeGame = ({ dan, holeMode, settings, onExit, onFinish }) => {
  const [qs] = useState(() => generateQuestions(dan, holeMode))
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState('none')
  const [startTime] = useState(() => Date.now())
  const [wrongList, setWrongList] = useState([])
  const [mistakeCount, setMistakeCount] = useState(0)

  const q = qs[idx]

  const handleInput = (num) => {
    if (feedback !== 'none') return
    if (settings.isSoundEnabled) soundService.playTap()
    setInput(num.toString())
    if (num === q.correctVal) {
      setFeedback('correct')
      if (settings.isSoundEnabled) soundService.playCorrect()
      setTimeout(() => {
        setFeedback('none'); setInput('')
        if (idx < qs.length - 1) setIdx(i => i + 1)
        else onFinish({ timeMs: Date.now() - startTime, mistakeCount, wrongList, total: qs.length })
      }, 300)
    } else {
      setFeedback('wrong')
      if (settings.isSoundEnabled) soundService.playWrong()
      setWrongList(prev => [...prev, { d: q.d, m: q.m, holeSide: q.holeSide }])
      setMistakeCount(c => c + 1)
      setTimeout(() => { setFeedback('none'); setInput('') }, 400)
    }
  }

  if (!q) return null

  const holeBoxStyle = {
    ...holeBoxBase,
    borderColor: feedback === 'wrong' ? '#f43f5e' : '#10b981',
    backgroundColor: input ? '#ecfdf5' : '#fff',
  }

  const leftEl = q.holeSide === 0
    ? <span style={holeBoxStyle}><span className={input ? 'text-slate-800' : 'text-slate-300'}>{input || '?'}</span></span>
    : <span>{q.d}</span>
  const rightEl = q.holeSide === 1
    ? <span style={holeBoxStyle}><span className={input ? 'text-slate-800' : 'text-slate-300'}>{input || '?'}</span></span>
    : <span>{q.m}</span>

  return (
    <div className="flex flex-col h-full w-full bg-green-50 overflow-hidden">
      <div className="h-1.5 bg-emerald-200 shrink-0">
        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${(idx / qs.length) * 100}%` }} />
      </div>
      <header className="px-3 py-2 flex justify-between items-center shrink-0">
        <button onClick={onExit} className="text-slate-400 hover:text-slate-600 p-1">
          <HomeIcon className="w-7 h-7" />
        </button>
        <div className="font-bold text-emerald-600 bg-white px-4 py-1 rounded-full shadow-sm text-sm">
          {idx + 1} / {qs.length}
        </div>
        <div className="w-10" />
      </header>

      <div className="flex-1 flex flex-col px-4 pt-4 pb-2 gap-8 min-h-0 items-center justify-start">
        <div className="flex items-center justify-center w-full">
          <div className={`bg-white rounded-3xl shadow-lg flex flex-col items-center justify-center border-b-4 transition-all px-8 py-7 w-full max-w-sm
            ${feedback === 'correct' ? 'border-emerald-400' : 'border-white'}
            ${feedback === 'wrong' ? 'border-rose-300 shake' : ''}`}>
            <div className="flex items-center gap-3 text-[4rem] font-black text-slate-700 leading-none">
              {leftEl}
              <span className="text-emerald-300 text-3xl">×</span>
              {rightEl}
              <span className="text-emerald-300 text-3xl">＝</span>
              <span>{q.ans}</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 px-4 pb-2 w-full max-w-sm">
          <TenKeyPad onInput={handleInput} onClear={() => setInput('')} />
        </div>
      </div>
    </div>
  )
}

const AnaumeResult = ({ result, onHome, onRetry }) => {
  const sec = (result.timeMs / 1000).toFixed(1)
  const accuracy = Math.max(0, Math.round(((result.total - result.mistakeCount) / result.total) * 100))
  let stamp = '👍', msg = 'よくがんばったね！'
  if (accuracy === 100) { stamp = '💮'; msg = 'かんぺき！すごい！' }
  else if (accuracy >= 80) { stamp = '🎉'; msg = 'そのちょうし！' }
  return (
    <div className="flex flex-col items-center justify-center h-full bg-orange-50 animate-pop p-6">
      <div className="text-[7rem] animate-bounce mb-2 select-none filter drop-shadow-md">{stamp}</div>
      <h2 className="text-2xl font-black text-orange-600 mb-6">{msg}</h2>
      <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-lg mb-8">
        <div className="flex justify-between items-end border-b border-orange-100 pb-2 mb-2">
          <span className="text-slate-400 font-bold text-sm">タイム</span>
          <span className="text-4xl font-black text-slate-700">{sec}<span className="text-base font-normal ml-1">びょう</span></span>
        </div>
        <div className="flex justify-between items-end">
          <span className="text-slate-400 font-bold text-sm">せいかい</span>
          <span className="text-4xl font-black text-emerald-500">{accuracy}<span className="text-base font-normal ml-1">%</span></span>
        </div>
      </div>
      <div className="flex gap-4 w-full max-w-xs">
        <button onClick={onHome} className="flex-1 py-4 bg-slate-400 text-white rounded-2xl font-bold shadow-md active:translate-y-1">もどる</button>
        <button onClick={onRetry} className="flex-1 py-4 bg-orange-400 text-white rounded-2xl font-bold shadow-md active:translate-y-1">もういちど</button>
      </div>
    </div>
  )
}

const AnaumeMenu = ({ settings, onExit, onStart }) => {
  const [dan, setDan] = useState('ALL')
  const [holeMode, setHoleMode] = useState('random')

  return (
    <div className="flex flex-col h-full bg-green-50 animate-fade-in overflow-hidden">
      <header className="px-4 py-3 flex items-center gap-3 border-b border-emerald-100 bg-white shrink-0">
        <button onClick={onExit} className="text-slate-400 hover:text-slate-600">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black text-emerald-600">💡 あなうめ九九</h1>
      </header>

      <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-xs font-bold text-slate-500 mb-3">あなの ばしょ</div>
          <div className="flex gap-2">
            {[['left', '□ × 数'], ['right', '数 × □'], ['random', 'どちらも']].map(([mode, label]) => (
              <button key={mode} onClick={() => setHoleMode(mode)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all
                  ${holeMode === mode ? 'bg-emerald-500 text-white shadow-md' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-xs font-bold text-slate-500 mb-3">だんを えらぶ</div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
              <button key={d} onClick={() => setDan(d)}
                className={`py-4 rounded-xl font-black text-3xl transition-all
                  ${dan === d ? 'bg-emerald-500 text-white shadow-md' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                {d}
              </button>
            ))}
          </div>
          <button onClick={() => setDan('ALL')}
            className={`w-full py-3 rounded-xl font-black text-lg transition-all
              ${dan === 'ALL' ? 'bg-emerald-500 text-white shadow-md' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
            まぜまぜ（10もん）
          </button>
        </div>
      </div>

      <div className="p-4 bg-white border-t border-emerald-100 shrink-0">
        <button onClick={() => onStart(dan, holeMode)}
          className="w-full py-4 rounded-2xl font-black text-xl text-white bg-emerald-500 shadow-lg active:translate-y-1 active:shadow-md transition-all">
          スタート
        </button>
      </div>
    </div>
  )
}

export const AnaumeApp = ({ settings, onExit }) => {
  const [screen, setScreen] = useState('MENU')
  const [config, setConfig] = useState({ dan: 'ALL', holeMode: 'random' })
  const [result, setResult] = useState(null)

  if (screen === 'GAME') return (
    <AnaumeGame
      dan={config.dan} holeMode={config.holeMode}
      settings={settings}
      onExit={() => setScreen('MENU')}
      onFinish={r => { setResult(r); setScreen('RESULT') }}
    />
  )

  if (screen === 'RESULT') return (
    <AnaumeResult
      result={result}
      onHome={() => setScreen('MENU')}
      onRetry={() => setScreen('GAME')}
    />
  )

  return <AnaumeMenu settings={settings} onExit={onExit} onStart={(dan, holeMode) => { setConfig({ dan, holeMode }); setScreen('GAME') }} />
}
