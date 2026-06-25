// ── 読み方データ（マスターモード用：問題部分のみ）───────────────
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

// ── 読み方データ（やさしいモード用：答えまで含む）────────────────
export const kukuReadingsFull = {
  1: ["いんいちが いち", "いんにが に", "いんさんが さん", "いんしが し", "いんごが ご", "いんろくが ろく", "いんしちが しち", "いんはちが はち", "いんくが く"],
  2: ["にいちが に", "ににんが し", "にさんが ろく", "にしが はち", "にご じゅう", "にろく じゅうに", "にしち じゅうし", "にはち じゅうろく", "にく じゅうはち"],
  3: ["さんいちが さん", "さんにが ろく", "さざんが く", "さんし じゅうに", "さんご じゅうご", "さぶろく じゅうはち", "さんしち にじゅういち", "さんぱ にじゅうし", "さんく にじゅうしち"],
  4: ["しいちが し", "しにが はち", "しさん じゅうに", "しし じゅうろく", "しご にじゅう", "しろく にじゅうし", "ししち にじゅうはち", "しは さんじゅうに", "しく さんじゅうろく"],
  5: ["ごいちが ご", "ごに じゅう", "ごさん じゅうご", "ごし にじゅう", "ごご にじゅうご", "ごろく さんじゅう", "ごしち さんじゅうご", "ごは しじゅう", "ごっく しじゅうご"],
  6: ["ろくいちが ろく", "ろくに じゅうに", "ろくさん じゅうはち", "ろくし にじゅうし", "ろくご さんじゅう", "ろくろく さんじゅうろく", "ろくしち しじゅうに", "ろくは しじゅうはち", "ろっく ごじゅうし"],
  7: ["しちいちが しち", "しちに じゅうし", "しちさん にじゅういち", "しちし にじゅうはち", "しちご さんじゅうご", "しちろく しじゅうに", "しちしち しじゅうく", "しちは ごじゅうろく", "しちく ろくじゅうさん"],
  8: ["はちいちが はち", "はちに じゅうろく", "はちさん にじゅうし", "はちし さんじゅうに", "はちご しじゅう", "はちろく しじゅうはち", "はちしち ごじゅうろく", "はっぱ ろくじゅうし", "はっく しちじゅうに"],
  9: ["くいちが く", "くに じゅうはち", "くさん にじゅうしち", "くし さんじゅうろく", "くご しじゅうご", "くろく ごじゅうし", "くしち ろくじゅうさん", "くは しちじゅうに", "くく はちじゅういち"],
}

// ── サウンド ──────────────────────────────────────────────────
export class SoundService {
  constructor() { this.ctx = null }

  _resume() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (AC) this.ctx = new AC()
    }
    if (this.ctx?.state === 'suspended') this.ctx.resume()
    return this.ctx
  }

  _note(type, freq, startTime, duration, freqEnd = null) {
    const ctx = this.ctx
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, startTime)
    if (freqEnd) osc.frequency.linearRampToValueAtTime(freqEnd, startTime + duration)
    gain.gain.setValueAtTime(0.1, startTime)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
    osc.connect(gain); gain.connect(ctx.destination)
    osc.start(startTime); osc.stop(startTime + duration)
  }

  playCorrect() {
    const ctx = this._resume(); if (!ctx) return
    const t = ctx.currentTime
    this._note('triangle', 660, t, 0.3)
    this._note('triangle', 1320, t + 0.1, 0.4)
  }

  playWrong() {
    const ctx = this._resume(); if (!ctx) return
    const t = ctx.currentTime
    this._note('sawtooth', 150, t, 0.3, 100)
  }

  playTap() {
    const ctx = this._resume(); if (!ctx) return
    const t = ctx.currentTime
    this._note('triangle', 400, t, 0.05)
  }

  playStamp() {
    const ctx = this._resume(); if (!ctx) return
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(400, t)
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.1)
    gain.gain.setValueAtTime(0.2, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
    osc.connect(gain); gain.connect(this.ctx.destination)
    osc.start(t); osc.stop(t + 0.2)
  }
}

export const soundService = new SoundService()

// ── マスターモード 問題生成 ────────────────────────────────────
export const generateMasterQuestions = (dan, mode, count, weaknessMap = {}) => {
  let qs = []

  if (dan === 'WEAKNESS') {
    const keys = Object.keys(weaknessMap).filter(k => weaknessMap[k] > 0)
    keys.sort((a, b) => weaknessMap[b] - weaknessMap[a])
    const targets = keys.slice(0, 10).map(k => {
      const [d, m] = k.split('-').map(Number)
      return { d, m }
    })
    while (targets.length < 10)
      targets.push({ d: Math.floor(Math.random() * 9) + 1, m: Math.floor(Math.random() * 9) + 1 })
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
    else if (mode === 'reverse') qs = [...base].reverse()
    else {
      qs = [...base]
      for (let i = qs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [qs[i], qs[j]] = [qs[j], qs[i]]
      }
    }
  }
  return qs.map(q => ({ ...q, a: q.d * q.m }))
}

// ── やさしいモード 問題生成 ───────────────────────────────────
export const generateEasyQuestions = (dan, level) =>
  [1, 2, 3, 4, 5, 6, 7, 8, 9].map(m => ({
    dan,
    multiplier: m,
    product: dan * m,
    missingPart: level === 1 ? 'dan' : level === 2 ? 'multiplier' : 'product',
    options: level === 1
      ? [dan]
      : level === 2
        ? [1, 2, 3, 4, 5, 6, 7, 8, 9]
        : [1, 2, 3, 4, 5, 6, 7, 8, 9].map(mul => dan * mul),
  }))

// ── 苦手マップ計算（マスター履歴から）───────────────────────────
export const computeWeaknessMap = (history) => {
  const map = {}
  for (const h of history) {
    if (h.wrongList) {
      h.wrongList.forEach(w => {
        const key = `${w.d}-${w.m}`
        map[key] = (map[key] || 0) + 1
      })
    }
  }
  return map
}
