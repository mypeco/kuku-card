import { useState, useEffect } from 'react'
import { GameScreen } from './components/GameScreen.jsx'
import { ResultScreen } from './components/ResultScreen.jsx'
import { Dashboard } from './components/Dashboard.jsx'
import { UserIcon, GridIcon, ZapIcon, AlertIcon } from './components/Icons.jsx'

const ReadingToggleBtn = ({ show, onToggle }) => (
  <button onClick={onToggle} className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all shadow-sm ${show ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-200' : 'bg-slate-50 text-slate-400 border-2 border-slate-100'}`}>
    <span className="text-[10px] font-black leading-none mb-0.5">よみかた</span>
    <span className="text-[10px] font-bold leading-none">{show ? 'あり' : 'なし'}</span>
  </button>
)

export default function App() {
  const [view, setView] = useState('MENU')
  const [tab, setTab] = useState('DAN')
  const [selDan, setSelDan] = useState(1)
  const [subMode, setSubMode] = useState('normal')
  const [qCount, setQCount] = useState(10)
  const [modeType, setModeType] = useState('tenkey')
  const [showReading, setShowReading] = useState(true)
  const [lastResult, setLastResult] = useState(null)
  const [showParent, setShowParent] = useState(false)

  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('kuku_v4_history') || '[]'))
  const [weaknessMap, setWeaknessMap] = useState(() => JSON.parse(localStorage.getItem('kuku_v4_weakness') || '{}'))

  useEffect(() => { localStorage.setItem('kuku_v4_history', JSON.stringify(history)) }, [history])
  useEffect(() => { localStorage.setItem('kuku_v4_weakness', JSON.stringify(weaknessMap)) }, [weaknessMap])

  const hasWeakness = Object.values(weaknessMap).some(v => v > 0)

  const startGame = (isWeakness = false) => {
    if (isWeakness) {
      setTab('CHALLENGE')
      setSelDan('WEAKNESS')
    }
    setView('GAME')
  }

  const handleFinish = (res) => {
    const accuracy = Math.max(0, Math.round(((res.total - res.mistakeCount) / res.total) * 100))
    let stamp = '👍'
    if (accuracy === 100) stamp = '💮'
    else if (accuracy >= 80) stamp = '🎉'

    const newWeaknessMap = { ...weaknessMap }
    res.wrongList.forEach(w => {
      const key = `${w.d}-${w.m}`
      newWeaknessMap[key] = (newWeaknessMap[key] || 0) + 1
    })
    setWeaknessMap(newWeaknessMap)

    const label = selDan === 'WEAKNESS' ? '苦手特訓' : (tab === 'DAN' ? `${selDan}のだん` : `ランダム${qCount}`)
    const isReadingOn = (tab === 'DAN' && selDan !== 'WEAKNESS') ? showReading : null
    const currentSubMode = (tab === 'DAN' && selDan !== 'WEAKNESS') ? subMode : null

    const rec = {
      id: Date.now(), date: Date.now(), modeType,
      label,
      timeStr: `${(res.timeMs / 1000).toFixed(1)}`,
      accuracy, stamp, wrongList: res.wrongList,
      isReadingOn,
      subMode: currentSubMode,
    }
    setHistory(prev => [...prev, rec])
    setLastResult({ ...res, ...rec })
    setView('RESULT')
  }

  const handleDeleteHistory = (id) => { if (confirm('削除しますか？')) setHistory(prev => prev.filter(h => h.id !== id)) }
  const handleDeleteAll = () => { if (confirm('全ての履歴を削除しますか？')) setHistory([]) }

  return (
    <div className="h-full w-full max-w-md mx-auto bg-white md:shadow-2xl md:border-x border-slate-100 flex flex-col relative">
      {view === 'MENU' && (
        <div className="flex flex-col h-full animate-pop">
          <header className="flex justify-between items-center p-4 shrink-0 relative">
            <button onClick={() => setShowParent(true)} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-500 rounded-full text-xs font-bold hover:bg-emerald-50 hover:text-emerald-600 transition-all">
              <UserIcon className="w-4 h-4" />記録
            </button>
            <h1 className="text-2xl font-black text-emerald-500 tracking-tight absolute left-1/2 -translate-x-1/2 pointer-events-none">⭐ 九九マスター ⭐</h1>
            <div className="w-12 flex justify-end">
              {tab === 'DAN' && <ReadingToggleBtn show={showReading} onToggle={() => setShowReading(!showReading)} />}
            </div>
          </header>

          <div className="px-6 shrink-0 mb-2">
            <div className="flex p-1 bg-slate-100 rounded-2xl">
              <button onClick={() => { setTab('DAN'); setSelDan(1) }} className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${tab === 'DAN' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>れんしゅう (だん)</button>
              <button onClick={() => { setTab('CHALLENGE'); setSelDan('ALL') }} className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${tab === 'CHALLENGE' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-400'}`}>🔥チャレンジ🔥</button>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center px-6 gap-2 min-h-0 pb-20">
            {tab === 'DAN' ? (
              <>
                <div className="grid grid-cols-3 gap-3">
                  {[1,2,3,4,5,6,7,8,9].map(d => (
                    <button key={d} onClick={() => setSelDan(d)} className={`h-16 rounded-2xl text-3xl font-black border-b-4 active:translate-y-[2px] active:border-b-0 transition-all ${selDan === d ? 'bg-emerald-500 text-white border-emerald-700 shadow-lg' : 'bg-white border-emerald-100 text-emerald-300'}`}>
                      {d}
                    </button>
                  ))}
                </div>
                <div className="bg-emerald-50 p-2 rounded-xl mt-2">
                  <div className="flex gap-2">
                    {[['normal','じゅんばん'], ['reverse','ぎゃく'], ['shuffle','バラバラ']].map(([key, label]) => (
                      <button key={key} onClick={() => setSubMode(key)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${subMode === key ? 'bg-emerald-500 text-white shadow' : 'bg-white text-emerald-300'}`}>{label}</button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                {[10, 20, 50, 100].map(c => (
                  <button key={c} onClick={() => { setSelDan('ALL'); setQCount(c) }} className={`w-full py-3 rounded-2xl font-black text-xl border-b-4 active:scale-95 transition-all ${selDan === 'ALL' && qCount === c ? 'bg-orange-500 text-white border-orange-700 shadow-lg' : 'bg-white border-orange-100 text-orange-300'}`}>
                    ランダム {c}もん
                  </button>
                ))}
                <div className="border-t border-slate-100 my-2"></div>
                <button
                  onClick={() => { if (hasWeakness) setSelDan('WEAKNESS') }}
                  disabled={!hasWeakness}
                  className={`w-full py-3 rounded-2xl font-black text-xl border-b-4 active:scale-95 transition-all flex items-center justify-center gap-2 ${selDan === 'WEAKNESS' ? 'bg-rose-500 text-white border-rose-700 shadow-lg' : (hasWeakness ? 'bg-white border-rose-100 text-rose-400' : 'bg-slate-100 border-slate-200 text-slate-300')}`}
                >
                  <AlertIcon className="w-6 h-6" />
                  {hasWeakness ? '苦手特訓 (10もん)' : 'まだ苦手はありません'}
                </button>
              </div>
            )}
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur border-t border-slate-100 max-w-md mx-auto z-20 pb-safe">
            <div className="flex gap-3 mb-3">
              <button onClick={() => setModeType('tenkey')} className={`flex-1 py-2 flex flex-col items-center justify-center rounded-xl border-2 transition-all ${modeType === 'tenkey' ? 'border-sky-500 bg-sky-50 text-sky-600' : 'border-slate-100 text-slate-300 grayscale opacity-60'}`}>
                <GridIcon className="w-4 h-4 mb-0.5" />
                <span className="text-[10px] font-bold">テンキー</span>
              </button>
              <button onClick={() => setModeType('flash')} className={`flex-1 py-2 flex flex-col items-center justify-center rounded-xl border-2 transition-all ${modeType === 'flash' ? 'border-yellow-500 bg-yellow-50 text-yellow-600' : 'border-slate-100 text-slate-300 grayscale opacity-60'}`}>
                <ZapIcon className="w-4 h-4 mb-0.5" />
                <span className="text-[10px] font-bold">フラッシュ</span>
              </button>
            </div>
            <button onClick={() => startGame()} className={`w-full py-3 rounded-xl font-black text-xl text-white shadow-xl active:scale-95 transition-all ${tab === 'DAN' ? 'bg-emerald-500' : 'bg-orange-500'}`}>
              スタート
            </button>
          </div>
        </div>
      )}

      {view === 'GAME' && (
        <GameScreen
          config={{ dan: selDan, subMode, count: qCount, modeType, weaknessMap }}
          showReading={showReading}
          onToggleReading={() => setShowReading(!showReading)}
          onExit={() => setView('MENU')}
          onFinish={handleFinish}
        />
      )}

      {view === 'RESULT' && lastResult && (
        <ResultScreen result={lastResult} modeType={modeType} onRetry={() => startGame()} onHome={() => setView('MENU')} onOpenParent={() => setShowParent(true)} />
      )}

      {showParent && (
        <Dashboard history={history} onClose={() => setShowParent(false)} onDelete={handleDeleteHistory} onDeleteAll={handleDeleteAll} />
      )}
    </div>
  )
}
