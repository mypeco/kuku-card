import { useState } from 'react'
import { db, getUserSettings, saveUserSettings } from './db.js'
import { ProfileSelect } from './components/ProfileSelect.jsx'
import { MasterApp } from './components/MasterApp.jsx'
import { EasyApp } from './components/EasyApp.jsx'
import { ArrowLeftIcon } from './components/Icons.jsx'

// ── モード選択画面 ────────────────────────────────────────────
const ModeSelect = ({ user, onSelectMaster, onSelectEasy, onBack }) => (
  <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-emerald-50 to-orange-50 p-6 animate-fade-in">
    <button onClick={onBack}
      className="absolute top-4 left-4 flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm font-bold">
      <ArrowLeftIcon className="w-4 h-4" />もどる
    </button>

    <div className="flex items-center gap-3 mb-10">
      <div className="text-4xl">{user.icon}</div>
      <h1 className="text-2xl font-black text-slate-700">{user.name}、なにをする？</h1>
    </div>

    <div className="flex flex-wrap gap-6 justify-center w-full max-w-2xl">
      {/* 九九マスター */}
      <button onClick={onSelectMaster}
        className="flex flex-col items-center gap-4 p-8 bg-white rounded-3xl shadow-xl border-b-4 border-emerald-200 active:border-b-0 active:translate-y-[4px] transition-all hover:shadow-2xl"
        style={{ minWidth: '240px', flex: '1 1 240px', maxWidth: '340px' }}>
        <div className="text-6xl">⭐</div>
        <div>
          <h2 className="text-2xl font-black text-emerald-600 mb-1">九九マスター</h2>
          <p className="text-stone-400 text-sm font-bold text-center leading-relaxed">
            テンキーで入力 or フラッシュ<br />苦手特訓・ランダム出題
          </p>
        </div>
      </button>

      {/* やさしい九九カード */}
      <button onClick={onSelectEasy}
        className="flex flex-col items-center gap-4 p-8 bg-white rounded-3xl shadow-xl border-b-4 border-orange-200 active:border-b-0 active:translate-y-[4px] transition-all hover:shadow-2xl"
        style={{ minWidth: '240px', flex: '1 1 240px', maxWidth: '340px' }}>
        <div className="text-6xl">🌷</div>
        <div>
          <h2 className="text-2xl font-black text-orange-500 mb-1">やさしい九九カード</h2>
          <p className="text-stone-400 text-sm font-bold text-center leading-relaxed">
            えらんで答える3段階<br />スタンプで達成記録
          </p>
        </div>
      </button>
    </div>
  </div>
)

// ── トップレベルルーター ──────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('PROFILE')
  const [user, setUser] = useState(null)
  const [settings, setSettings] = useState({ isSoundEnabled: true, isReadingVisible: true, handedness: 'right' })

  const handleSelectUser = async (selectedUser) => {
    const s = await getUserSettings(selectedUser.id)
    setUser(selectedUser)
    setSettings(s)
    setScreen('MODE_SELECT')
  }

  const handleUpdateSettings = async (newSettings) => {
    setSettings(newSettings)
    if (user) await saveUserSettings(user.id, newSettings)
  }

  // ラッパーは常にビューポート全体を占める。各画面が内部でmax-widthを持つ。
  const wrapper = (children) => (
    <div style={{ width: '100vw', height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'white', position: 'relative' }}>
      {children}
    </div>
  )

  if (screen === 'PROFILE') return wrapper(
    <ProfileSelect db={db} onSelect={handleSelectUser} />
  )

  if (screen === 'MODE_SELECT') return wrapper(
    <ModeSelect
      user={user}
      onSelectMaster={() => setScreen('MASTER')}
      onSelectEasy={() => setScreen('EASY')}
      onBack={() => setScreen('PROFILE')}
    />
  )

  if (screen === 'MASTER') return wrapper(
    <MasterApp
      user={user}
      settings={settings}
      onUpdateSettings={handleUpdateSettings}
      onExit={() => setScreen('MODE_SELECT')}
    />
  )

  if (screen === 'EASY') return wrapper(
    <EasyApp
      user={user}
      settings={settings}
      onUpdateSettings={handleUpdateSettings}
      onExit={() => setScreen('MODE_SELECT')}
    />
  )

  return null
}
