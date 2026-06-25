import { useState, useEffect } from 'react'
import { SparklesIcon, EditIcon, XIcon } from './Icons.jsx'

const ICON_OPTIONS = [
  '🌟','⭐','🐶','🐱','🐻','🐼','🦊','🐰','🐯','🦁',
  '🐸','🐺','🦋','🌈','🌸','🌷','🍭','🎉','👑','🚀',
  '🎵','🎨','⚽','🍎','🍀','🌙','☀️','🌊','🦄','🐝',
]

const COLOR_OPTIONS = [
  { label: 'green',  class: 'bg-emerald-50', border: 'border-emerald-200' },
  { label: 'orange', class: 'bg-orange-50',  border: 'border-orange-200' },
  { label: 'blue',   class: 'bg-sky-50',     border: 'border-sky-200' },
  { label: 'violet', class: 'bg-violet-50',  border: 'border-violet-200' },
  { label: 'rose',   class: 'bg-rose-50',    border: 'border-rose-200' },
  { label: 'amber',  class: 'bg-amber-50',   border: 'border-amber-200' },
]

export const ProfileSelect = ({ db, onSelect }) => {
  const [users, setUsers] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState(ICON_OPTIONS[0])
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[0])

  useEffect(() => {
    db.users.toArray().then(async (list) => {
      for (const u of list) {
        if (!u.profileId) await db.users.put({ ...u, profileId: crypto.randomUUID() })
      }
      setUsers(await db.users.toArray())
    })
  }, [])

  const startCreate = () => {
    setNewName(''); setNewIcon(ICON_OPTIONS[0]); setNewColor(COLOR_OPTIONS[0])
    setEditingUser(null); setIsCreating(true)
  }

  const startEdit = (user, e) => {
    e.stopPropagation()
    setNewName(user.name); setNewIcon(user.icon); setNewColor(user.color)
    setEditingUser(user); setIsCreating(true)
  }

  const handleSave = async () => {
    if (!newName.trim()) return
    if (editingUser) {
      const updated = { ...editingUser, name: newName.trim(), icon: newIcon, color: newColor }
      await db.users.put(updated)
      setUsers(prev => prev.map(u => u.id === editingUser.id ? updated : u))
      setIsCreating(false); setEditingUser(null)
    } else {
      const profileId = crypto.randomUUID()
      const newUser = { name: newName.trim(), icon: newIcon, color: newColor, profileId }
      const id = await db.users.add(newUser)
      onSelect({ ...newUser, id })
    }
  }

  const handleDelete = async (userId, userName, e) => {
    e.stopPropagation()
    if (!window.confirm(`${userName} のデータをぜんぶ けしますか？`)) return
    await db.users.delete(userId)
    await db.settings?.where({ userId }).delete()
    await db.practices?.where({ userId }).delete()
    await db.bestShots?.where({ userId }).delete()
    await db.readWords?.where({ userId }).delete()
    setUsers(prev => prev.filter(u => u.id !== userId))
  }

  if (isCreating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-6 animate-fade-in bg-white">
        <h1 className="text-2xl font-bold mb-6 text-stone-700">
          {editingUser ? 'プロフィールを なおす' : 'あたらしく つくる'}
        </h1>
        <input type="text" placeholder="なまえ" value={newName} onChange={e => setNewName(e.target.value)}
          className="w-full max-w-sm text-center text-2xl p-4 rounded-xl border-4 border-amber-200 focus:border-amber-400 outline-none mb-6 shadow-sm" />
        <div className="w-full max-w-sm mb-6">
          <p className="font-bold text-stone-500 mb-2 text-center">アイコンをえらぶ</p>
          <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-3 bg-white rounded-xl border-2 border-stone-100 shadow-inner">
            {ICON_OPTIONS.map(icon => (
              <button key={icon} onClick={() => setNewIcon(icon)}
                className={`text-3xl p-1 rounded-lg transition-transform ${newIcon === icon ? 'bg-amber-100 ring-4 ring-amber-400 scale-110' : 'hover:bg-stone-50'}`}>
                {icon}
              </button>
            ))}
          </div>
        </div>
        <div className="w-full max-w-sm mb-8">
          <p className="font-bold text-stone-500 mb-3 text-center">テーマカラーをえらぶ</p>
          <div className="flex gap-4 flex-wrap justify-center">
            {COLOR_OPTIONS.map(c => (
              <button key={c.label} onClick={() => setNewColor(c)}
                className={`w-12 h-12 rounded-full ${c.class} ${c.border} border-2 shadow-sm transition-all ${newColor.label === c.label ? 'ring-4 ring-stone-400 scale-110' : 'opacity-50 hover:opacity-100'}`} />
            ))}
          </div>
        </div>
        <div className="flex gap-4 w-full max-w-sm">
          <button onClick={() => { setIsCreating(false); setEditingUser(null) }}
            className="flex-1 py-4 rounded-full font-bold text-stone-500 bg-stone-100 active:scale-95 transition-transform">
            もどる
          </button>
          <button onClick={handleSave} disabled={!newName.trim()}
            className="flex-1 py-4 rounded-full font-bold text-white bg-amber-500 disabled:opacity-40 active:scale-95 shadow-md transition-transform">
            ほぞんする
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 animate-fade-in bg-white">
      <h1 className="text-3xl font-bold mb-8 text-emerald-600">だれがあそぶ？</h1>
      <div className="w-full max-w-sm space-y-4 mb-8">
        {users.length === 0 && (
          <p className="text-center text-stone-400 font-bold py-8">まだだれもいません</p>
        )}
        {users.map(user => (
          <div key={user.id}
            className={`w-full flex items-center p-4 rounded-2xl shadow-sm border-2 transition-transform hover:-translate-y-0.5 ${user.color?.class ?? 'bg-emerald-50'} ${user.color?.border ?? 'border-emerald-200'}`}>
            <div onClick={() => onSelect(user)} className="flex items-center gap-4 flex-1 cursor-pointer active:scale-95 transition-transform">
              <div className="text-4xl bg-white/70 w-16 h-16 flex items-center justify-center rounded-full shadow-sm shrink-0">
                {user.icon}
              </div>
              <span className="text-2xl font-bold tracking-wide">{user.name}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <button onClick={e => startEdit(user, e)}
                className="w-10 h-10 rounded-full bg-white/50 text-stone-500 hover:bg-amber-500 hover:text-white flex items-center justify-center transition-colors shadow-sm">
                <EditIcon className="w-5 h-5" />
              </button>
              <button onClick={e => handleDelete(user.id, user.name, e)}
                className="w-10 h-10 rounded-full bg-white/50 text-stone-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors shadow-sm">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={startCreate}
        className="flex items-center justify-center gap-2 w-full max-w-sm py-4 rounded-full font-bold text-stone-500 bg-white border-2 border-dashed border-stone-300 hover:bg-stone-50 active:scale-95 transition-transform">
        <SparklesIcon className="w-5 h-5" /> あたらしくつくる
      </button>
    </div>
  )
}
