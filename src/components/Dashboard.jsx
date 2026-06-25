import { UserIcon, TrashIcon } from './Icons.jsx'

const getModeDisplay = (h) => {
  if (h.label.includes('特訓')) return { text: '苦手特訓', color: 'bg-rose-400' }
  if (h.label.includes('ランダム')) return { text: h.label.replace('ランダム', 'ランダム '), color: 'bg-orange-400' }
  const danNum = h.label.replace('のだん', '').replace('の段', '')
  let subText = ''
  if (h.subMode === 'reverse') subText = 'ぎゃくじゅん'
  else if (h.subMode === 'shuffle') subText = 'バラバラ'
  else if (h.subMode === 'normal') subText = 'じゅんばん'
  const finalText = subText ? `${danNum}の段 ${subText}` : `${danNum}の段`
  return { text: finalText, color: 'bg-emerald-500' }
}

export const Dashboard = ({ history, onClose, onDelete, onDeleteAll }) => (
  <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col animate-pop">
    <header className="bg-white p-4 flex justify-between items-center shadow-sm shrink-0 z-10">
      <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg">
        <UserIcon className="w-6 h-6" /> 保護者用記録
      </div>
      <button onClick={onClose} className="px-4 py-1.5 bg-slate-400 text-white rounded-full text-sm font-bold">閉じる</button>
    </header>

    <div className="bg-slate-50 px-6 py-2 grid grid-cols-[1fr_2fr_1.5fr_1.5fr_1fr] gap-2 text-xs font-bold text-slate-400 text-center border-b border-slate-200">
      <div className="text-left">スタンプ</div>
      <div>日時</div>
      <div>正答率</div>
      <div>タイム</div>
      <div>入力</div>
    </div>

    <div className="flex-1 scroll-y p-4">
      <div className="flex justify-end mb-4">
        {history.length > 0 && (
          <button onClick={onDeleteAll} className="text-rose-500 text-xs flex items-center gap-1 bg-white hover:bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100 shadow-sm">
            <TrashIcon className="w-3 h-3" />全削除
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-center text-slate-400 mt-10">記録はまだありません</p>
      ) : (
        <div className="flex flex-col gap-4">
          {history.slice().reverse().map(h => {
            const hasErr = h.wrongList && h.wrongList.length > 0
            const dateObj = new Date(h.date)
            const modeInfo = getModeDisplay(h)
            return (
              <div key={h.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 relative group">
                <button onClick={() => onDelete(h.id)} className="absolute top-2 right-2 text-slate-200 hover:text-rose-400 p-2">
                  <TrashIcon className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-[1fr_2fr_1.5fr_1.5fr_1fr] gap-2 items-center text-center">
                  <div className="text-3xl text-left">{h.stamp}</div>
                  <div className="flex flex-col items-center text-xs text-slate-500 leading-tight">
                    <span className="font-bold text-slate-700 text-sm">{dateObj.getMonth() + 1}/{dateObj.getDate()}</span>
                    <span>{dateObj.getHours().toString().padStart(2, '0')}:{dateObj.getMinutes().toString().padStart(2, '0')}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded text-white mt-1 w-max max-w-full whitespace-pre-wrap text-center leading-tight ${modeInfo.color}`}>{modeInfo.text}</span>
                  </div>
                  <div className={`text-xl font-black ${h.accuracy === 100 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {h.modeType === 'tenkey' ? <>{h.accuracy}<span className="text-xs font-bold">%</span></> : <span className="text-slate-300 text-sm">-</span>}
                  </div>
                  <div className="text-sm font-bold text-slate-600">
                    {Math.round(parseFloat(h.timeStr))}<span className="text-xs">秒</span>
                  </div>
                  <div className="flex justify-center">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${h.modeType === 'flash' ? 'bg-amber-100 text-amber-700' : 'bg-cyan-100 text-cyan-700'}`}>
                      {h.modeType === 'flash' ? 'フラッシュ' : 'テンキー'}
                    </span>
                  </div>
                </div>
                {hasErr && (
                  <div className="mt-3 pt-2 border-t border-slate-50">
                    <div className="text-[10px] font-bold text-slate-400 mb-1.5">まちがえた問題:</div>
                    <div className="flex flex-wrap gap-2">
                      {h.wrongList.map((w, i) => (
                        <span key={i} className="bg-rose-50 text-rose-500 px-2 py-1 rounded-lg text-sm font-bold font-mono shadow-sm border border-rose-100">
                          {w.d}×{w.m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  </div>
)
