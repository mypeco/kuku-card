import { UserIcon } from './Icons.jsx'

export const ResultScreen = ({ result, modeType, onRetry, onHome, onOpenDashboard }) => {
  const sec = (result.timeMs / 1000).toFixed(1)
  const accuracy = Math.max(0, Math.round(((result.total - result.mistakeCount) / result.total) * 100))

  let stamp = '👍', msg = 'よくがんばったね！'
  if (accuracy === 100) { stamp = '💮'; msg = 'かんぺき！すごい！' }
  else if (accuracy >= 80) { stamp = '🎉'; msg = 'そのちょうし！' }
  if (modeType === 'flash') { stamp = '⚡'; msg = 'スピードアップ！' }

  return (
    <div className="flex flex-col items-center justify-center h-full bg-orange-50 animate-pop p-6 relative">
      <button onClick={onOpenDashboard}
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-2 bg-white rounded-full text-slate-500 shadow-sm border border-slate-200 text-xs font-bold">
        <UserIcon className="w-4 h-4" />記録を見る
      </button>

      <div className="text-[7rem] animate-bounce mb-2 select-none filter drop-shadow-md">{stamp}</div>
      <h2 className="text-2xl font-black text-orange-600 mb-6">{msg}</h2>

      <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-lg mb-8">
        <div className="flex justify-between items-end border-b border-orange-100 pb-2 mb-2">
          <span className="text-slate-400 font-bold text-sm">タイム</span>
          <span className="text-4xl font-black text-slate-700">{sec}<span className="text-base font-normal ml-1">びょう</span></span>
        </div>
        {modeType === 'tenkey' && (
          <div className="flex justify-between items-end">
            <span className="text-slate-400 font-bold text-sm">せいかい</span>
            <span className="text-4xl font-black text-emerald-500">{accuracy}<span className="text-base font-normal ml-1">%</span></span>
          </div>
        )}
      </div>

      <div className="flex gap-4 w-full max-w-xs">
        <button onClick={onHome} className="flex-1 py-4 bg-slate-400 text-white rounded-2xl font-bold shadow-md active:translate-y-1">もどる</button>
        <button onClick={onRetry} className="flex-1 py-4 bg-orange-400 text-white rounded-2xl font-bold shadow-md active:translate-y-1">もういちど</button>
      </div>
    </div>
  )
}
