export const kukuReadings = {
  1: ["いんいちが", "いんにが", "いんさんが", "いんしが", "いんごが", "いんろくが", "いんしちが", "いんはちが", "いんくが"],
  2: ["にいちが", "ににんが", "にさんが", "にしが", "にご", "にろく", "にしち", "にはち", "にく"],
  3: ["さんいちが", "さんにが", "さざんが", "さんし", "さんご", "さぶろく", "さんしち", "さんぱ", "さんく"],
  4: ["しいちが", "しにが", "しさん", "しし", "しご", "しろく", "ししち", "しは", "しく"],
  5: ["ごいちが", "ごに", "ごさん", "ごし", "ごご", "ごろく", "ごしち", "ごは", "ごっく"],
  6: ["ろくいちが", "ろくに", "ろくさん", "ろくし", "ろくご", "ろくろく", "ろくしち", "ろくは", "ろっく"],
  7: ["しちいちが", "しちに", "しちさん", "しちし", "しちご", "しちろく", "しちしち", "しちは", "しちく"],
  8: ["はちいちが", "はちに", "はちさん", "はちし", "はちご", "はちろく", "はちしち", "はっぱ", "はっく"],
  9: ["くいちが", "くに", "くさん", "くし", "くご", "くろく", "くしち", "くは", "くく"],
}

export const generateQuestions = (dan, mode, count, weaknessMap = {}) => {
  let qs = []

  if (dan === 'WEAKNESS') {
    const keys = Object.keys(weaknessMap).filter(k => weaknessMap[k] > 0)
    keys.sort((a, b) => weaknessMap[b] - weaknessMap[a])
    const targets = keys.slice(0, 10).map(k => {
      const [d, m] = k.split('-').map(Number)
      return { d, m }
    })
    while (targets.length < 10) {
      targets.push({ d: Math.floor(Math.random() * 9) + 1, m: Math.floor(Math.random() * 9) + 1 })
    }
    qs = targets
    for (let i = qs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [qs[i], qs[j]] = [qs[j], qs[i]]
    }
  } else if (dan === 'ALL') {
    const all = []
    for (let d = 1; d <= 9; d++) for (let m = 1; m <= 9; m++) all.push({ d, m })
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]]
    }
    qs = []
    while (qs.length < count) {
      if (all.length > 0) {
        qs.push(all.pop())
      } else {
        const refill = []
        for (let d = 1; d <= 9; d++) for (let m = 1; m <= 9; m++) refill.push({ d, m })
        for (let i = refill.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [refill[i], refill[j]] = [refill[j], refill[i]]
        }
        all.push(...refill)
      }
    }
  } else {
    const d = parseInt(dan)
    const base = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(m => ({ d, m }))
    if (mode === 'normal') qs = base
    else if (mode === 'reverse') qs = base.reverse()
    else if (mode === 'shuffle') {
      qs = base
      for (let i = qs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [qs[i], qs[j]] = [qs[j], qs[i]]
      }
    }
  }
  return qs.map(q => ({ ...q, a: q.d * q.m }))
}

export const playSound = (type) => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain); gain.connect(ctx.destination)
  const t = ctx.currentTime

  if (type === 'correct') {
    osc.type = 'sine'; osc.frequency.setValueAtTime(880, t); osc.frequency.exponentialRampToValueAtTime(1760, t + 0.1)
    gain.gain.setValueAtTime(0.3, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1)
    osc.start(t); osc.stop(t + 0.1)
  } else if (type === 'wrong') {
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, t); osc.frequency.linearRampToValueAtTime(100, t + 0.2)
    gain.gain.setValueAtTime(0.2, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2)
    osc.start(t); osc.stop(t + 0.2)
  } else if (type === 'tap') {
    osc.type = 'triangle'; osc.frequency.setValueAtTime(400, t)
    gain.gain.setValueAtTime(0.1, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05)
    osc.start(t); osc.stop(t + 0.05)
  }
}
