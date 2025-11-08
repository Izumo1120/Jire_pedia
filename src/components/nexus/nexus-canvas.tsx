"use client"

import { useEffect, useRef } from 'react'

export function NexusCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // キャンバスサイズをウィンドウに合わせる
    const resizeCanvas = () => {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // 現在のキャンバスサイズを保持
    let currentWidth = canvas.width
    let currentHeight = canvas.height

    // パーティクル（言葉の断片）クラス
    class Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
      char: string
      type: 'kanji' | 'math' | 'greek' | 'logic' | 'kana'

      constructor() {
        this.x = Math.random() * currentWidth
        this.y = Math.random() * currentHeight
        this.vx = (Math.random() - 0.5) * 0.4
        this.vy = (Math.random() - 0.5) * 0.4
        this.size = Math.random() * 1.5 + 0.8
        this.opacity = Math.random() * 0.4 + 0.15

        // 知的な文字セット（漢字・数式・記号・ひらがな）
        const charSets = [
          { type: 'kanji' as const, chars: '知識学習思考理解分析概念定義原理法則論証仮説実験観察推論帰納演繹' },
          { type: 'math' as const, chars: '∑∫∂∇π∞≈≠≤≥±×÷√∈∉⊂⊃∪∩' },
          { type: 'greek' as const, chars: 'αβγδεζηθικλμνξοπρστυφχψω' },
          { type: 'logic' as const, chars: '∀∃∧∨¬→⇒⇔≡⊢⊨⊥⊤' },
          { type: 'kana' as const, chars: 'がくもんかがくすうがくぶんせきていぎろんしょうかせつじっけんかんさつすいろんきのうえんえき' }
        ]

        // 重み付けランダム選択（漢字と数式を多めに）
        const weights = [3, 2, 1.5, 1, 0.5] // kanji > math > greek > logic > kana
        const totalWeight = weights.reduce((a, b) => a + b, 0)
        let random = Math.random() * totalWeight

        let selectedIndex = 0
        for (let i = 0; i < weights.length; i++) {
          if (random < weights[i]) {
            selectedIndex = i
            break
          }
          random -= weights[i]
        }

        const selected = charSets[selectedIndex]
        this.type = selected.type
        this.char = selected.chars[Math.floor(Math.random() * selected.chars.length)]
      }

      update() {
        this.x += this.vx
        this.y += this.vy

        // 画面端で折り返し
        if (this.x < 0 || this.x > currentWidth) this.vx *= -1
        if (this.y < 0 || this.y > currentHeight) this.vy *= -1

        // 境界内に収める
        this.x = Math.max(0, Math.min(currentWidth, this.x))
        this.y = Math.max(0, Math.min(currentHeight, this.y))
      }

      draw() {
        if (!ctx) return

        // 文字タイプによって色を微調整
        const colorMap = {
          kanji: '#FFD700',
          math: '#FFA500',
          greek: '#FFD700',
          logic: '#FFAA00',
          kana: '#FFE066'
        }

        ctx.save()
        ctx.globalAlpha = this.opacity
        ctx.fillStyle = colorMap[this.type]
        ctx.font = `${this.size * 10}px "Noto Sans JP", "Noto Sans Math", sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(this.char, this.x, this.y)
        ctx.restore()

        // 微細な光の粒
        ctx.save()
        ctx.globalAlpha = this.opacity * 0.4
        ctx.fillStyle = colorMap[this.type]
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }

    // パーティクルを生成（レスポンシブに対応）
    const particles: Particle[] = []
    const getParticleCount = () => {
      const area = currentWidth * currentHeight
      const baseCount = Math.floor(area / 25000) // 画面サイズに応じて調整
      return Math.min(Math.max(baseCount, 30), 80) // 30〜80個の範囲
    }

    for (let i = 0; i < getParticleCount(); i++) {
      particles.push(new Particle())
    }

    // アニメーションループ
    let animationId: number
    const animate = () => {
      if (!canvas || !ctx) return

      // サイズ更新
      currentWidth = canvas.width
      currentHeight = canvas.height

      // 背景のグラデーション（より深い階層感）
      const gradient = ctx.createLinearGradient(0, 0, currentWidth, currentHeight)
      gradient.addColorStop(0, '#0A2540')
      gradient.addColorStop(0.5, '#0d2d4d')
      gradient.addColorStop(1, '#1a3a5a')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, currentWidth, currentHeight)

      // パーティクルを更新・描画
      particles.forEach(particle => {
        particle.update()
        particle.draw()
      })

      // パーティクル間の接続線（近い粒子同士を繋ぐ）
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            ctx.save()
            ctx.globalAlpha = (1 - distance / 150) * 0.15
            ctx.strokeStyle = '#FFD700'
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
            ctx.restore()
          }
        })
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="nexus-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
