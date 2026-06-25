import { useState, useEffect } from 'react'
import { GameScreen } from './GameScreen.jsx'
import { ResultScreen } from './ResultScreen.jsx'
import { Dashboard } from './Dashboard.jsx'
import { UserIcon, GridIcon, ZapIcon, AlertIcon, Volume2Icon, VolumeXIcon, ArrowLeftIcon } from './Icons.jsx'
import {
  getMasterHistory, addMasterHistoryRecord, deleteMasterHistoryRecord,
  clearMasterHistoryByUser,
} from '../db.js'
import { computeWeaknessMap } from '../data.js'

export const MasterApp = ({ user, settings, onUpdateSettings, onExit }) => {
  const [view, setView] = useState('MENU')
  const [tab, setTab] = useState('DAN')
  const [selDan, setSelDan] = useState(1)
  const [subMode, setSubMode] = useState('normal')
  const [qCount, setQCount] = useState(10)
  const [modeType, setModeType] = useState('tenkey')
  const [lastResult, setLastResult] = useState(null)
  const [showDash, setShowDash] = useState(false)
  const [history, setHistory] = useState(null)

  useEffect(() => {
    getMasterHistory(user.id).then(setHistory)
  }, [user.id])

  if (history === null) return <div className="flex items-center justify-center h-full text-slate-400 text-lg">読み込み中…</div>

  const weaknessMap = computeWeaknessMap(history)
  const hasWeakness = Object.values(weaknessMap).some(v => v > 0)

  const startGame = (useWeakness = false) => {
    if (useWeakness) { setTab('CHALLENGE'); setSelDan('WEAKNESS') }
    setView('GAME')
  }

  const handleFinish = async (res) => {
    const accuracy = Math.max(0, Math.round(((res.total - res.mistakeCount) / res.total) * 100))
    let stamp = '👍'
    if (accuracy === 100) stamp = '💮'
    else if (accuracy >= 80) stamp = '🎉'

    const label = selDan === 'WEAKNESS' ? '苦手特訓'
      : tab === 'DAN' ? `${selDan}のだん`
      : `ランダム${qCount}`

    const rec = {
      id: Date.now(), date: Date.now(), modeType,
      label,
      timeStr: (res.timeMs / 1000).toFixed(1),
      accuracy, stamp, wrongList: res.wrongList,
      subMode: tab === 'DAN' ? subMode : null,
    }
    await addMasterHistoryRecord(user.id, rec)
    setHistory(prev => [...prev, rec])
    setLastResult({ ...res, ...rec })
    setView('RESULT')
  }

  const handleDelete = async (id) => {
    if (!confirm('削除しますか？')) return
    await deleteMasterHistoryRecord(id)
    setHistory(prev => prev.filter(h => h.id !== id))
  }

  const handleDeleteAll = async () => {
    if (!confirm('全ての履歴を削除しますか？')) return
    await clearMasterHistoryByUser(user.id)
    setHistory([])
  }

  if (view === 'GAME') return (
    <GameScreen
      config={{ dan: selDan, subMode, count: qCount, modeType, weaknessMap }}
      settings={settings}
      onUpdateSettings={onUpdateSettings}
      onExit={() => setView('MENU')}
      onFinish={handleFinish}
    />
  )

  if (view === 'RESULT' && lastResult) return (
    <>
      <ResultScreen
        result={lastResult}
        modeType={modeType}
        onRetry={() => startGame()}
        onHome={() => setView('MENU')}
        onOpenDashboard={() => setShowDash(true)}
      />
      {showDash && (
        <Dashboard
          history={history} userName={user.name}
          onClose={() => setShowDash(false)}
          onDelete={handleDelete}
          onDeleteAll={handleDeleteAll}
        />
      )}
    </>
  )

  // ── メニュー画面 ──────────────────────────────────────────
  return (
    <div className="flex flex-col h-full animate-pop bg-white">
      <header className="flex justify-between items-center px-4 py-3 shrink-0 border-b border-slate-100">
        <button onClick={onExit} className="flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm font-bold">
          <ArrowLeftIcon className="w-4 h-4" />もどる
        </button>
        <h1 className="text-xl font-black text-emerald-500">⭐ 九九マスター ⭐</h1>
        <div className="flex gap-2 items-center">
          <button onClick={() => onUpdateSettings({ ...settings, isSoundEnabled: !settings.isSoundEnabled })}
            className={`p-2 rounded-xl border-2 transition-all ${settings.isSoundEnabled ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
            {settings.isSoundEnabled ? <Volume2Icon className="w-5 h-5" /> : <VolumeXIcon className="w-5 h-5" />}
          </button>
          <button onClick={() => setShowDash(true)} className="p-2 rounded-xl border-2 border-slate-100 text-slate-400 bg-slate-50">
            <UserIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="px-4 pt-3 shrink-0">
        <div className="flex p-1 bg-slate-100 rounded-2xl">
          <button onClick={() => { setTab('DAN'); setSelDan(1) }}
            className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${tab === 'DAN' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>
            れんしゅう（だん）
          </button>
          <button onClick={() => { setTab('CHALLENGE'); setSelDan('ALL') }}
            className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${tab === 'CHALLENGE' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-400'}`}>
            🔥 チャレンジ 🔥
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-2 min-h-0 pb-24">
        <div className="w-full max-w-xs">
          {tab === 'DAN' ? (
            <>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {[1,2,3,4,5,6,7,8,9].map(d => (
                  <button key={d} onClick={() => setSelDan(d)}
                    className={`h-12 rounded-2xl text-2xl font-black border-b-4 active:translate-y-[2px] active:border-b-0 transition-all
                      ${selDan === d ? 'bg-emerald-500 text-white border-emerald-700 shadow-lg' : 'bg-white border-emerald-100 text-emerald-300'}`}>
                    {d}
                  </button>
                ))}
              </div>
              <div className="bg-emerald-50 p-2 rounded-xl">
                <div className="flex gap-2">
                  {[['normal','じゅんばん'],['reverse','ぎゃく'],['shuffle','バラバラ']].map(([k, l]) => (
                    <button key={k} onClick={() => setSubMode(k)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${subMode === k ? 'bg-emerald-500 text-white shadow' : 'bg-white text-emerald-300'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              {[10, 20, 50, 100].map(c => (
                <button key={c} onClick={() => { setSelDan('ALL'); setQCount(c) }}
                  className={`w-full py-2.5 rounded-2xl font-black text-lg border-b-4 active:scale-95 transition-all
                    ${selDan === 'ALL' && qCount === c ? 'bg-orange-500 text-white border-orange-700 shadow-lg' : 'bg-white border-orange-100 text-orange-300'}`}>
                  ランダム {c}もん
                </button>
              ))}
              <div className="border-t border-slate-100 pt-2">
                <button
                  onClick={() => hasWeakness && setSelDan('WEAKNESS')}
                  disabled={!hasWeakness}
                  className={`w-full py-2.5 rounded-2xl font-black text-lg border-b-4 active:scale-95 transition-all flex items-center justify-center gap-2
                    ${selDan === 'WEAKNESS' ? 'bg-rose-500 text-white border-rose-700 shadow-lg'
                    : hasWeakness ? 'bg-white border-rose-100 text-rose-400'
                    : 'bg-slate-100 border-slate-200 text-slate-300'}`}>
                  <AlertIcon className="w-5 h-5" />
                  {hasWeakness ? '苦手特訓（10もん）' : 'まだ苦手はありません'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* スタートバー（固定フッター） */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white/90 backdrop-blur border-t border-slate-100 z-20">
        <div className="flex gap-3 mb-3">
          {[['tenkey', <GridIcon className="w-4 h-4 mb-0.5" />, 'テンキー', 'sky'],
            ['flash',  <ZapIcon  className="w-4 h-4 mb-0.5" />, 'フラッシュ', 'yellow']].map(([mt, icon, label, c]) => (
            <button key={mt} onClick={() => setModeType(mt)}
              className={`flex-1 py-2 flex flex-col items-center justify-center rounded-xl border-2 transition-all
                ${modeType === mt ? `border-${c}-500 bg-${c}-50 text-${c}-600` : 'border-slate-100 text-slate-300 opacity-60'}`}>
              {icon}
              <span className="text-[10px] font-bold">{label}</span>
            </button>
          ))}
        </div>
        <button onClick={() => startGame()}
          className={`w-full py-3 rounded-xl font-black text-xl text-white shadow-xl active:scale-95 transition-all ${tab === 'DAN' ? 'bg-emerald-500' : 'bg-orange-500'}`}>
          スタート
        </button>
      </div>

      {showDash && (
        <Dashboard
          history={history} userName={user.name}
          onClose={() => setShowDash(false)}
          onDelete={handleDelete}
          onDeleteAll={handleDeleteAll}
        />
      )}
    </div>
  )
}
