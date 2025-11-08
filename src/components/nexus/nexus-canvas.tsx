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

    // パーティクル（言葉の断片）クラス - 深度感を追加
    class Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
      char: string
      type: 'kanji' | 'math' | 'greek' | 'logic' | 'kana'
      depth: number // 新規: 深度（0-1, 大きいほど手前）
      phase: number // 新規: アニメーションフェーズ
      pulseSpeed: number // 新規: パルス速度

      constructor() {
        this.x = Math.random() * currentWidth
        this.y = Math.random() * currentHeight
        this.depth = Math.random() // 深度をランダムに
        this.vx = (Math.random() - 0.5) * (0.2 + this.depth * 0.4) // 深度で速度調整
        this.vy = (Math.random() - 0.5) * (0.2 + this.depth * 0.4)
        this.size = Math.random() * 1.5 + 0.8 + (this.depth * 0.7) // 深度でサイズ調整
        this.opacity = (Math.random() * 0.3 + 0.2) * (0.6 + this.depth * 0.4) // 深度で透明度調整
        this.phase = Math.random() * Math.PI * 2 // ランダムなスタート位置
        this.pulseSpeed = 0.01 + Math.random() * 0.02 // パルス速度

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
        this.phase += this.pulseSpeed // フェーズを進める

        // 画面端で折り返し
        if (this.x < 0 || this.x > currentWidth) this.vx *= -1
        if (this.y < 0 || this.y > currentHeight) this.vy *= -1

        // 境界内に収める
        this.x = Math.max(0, Math.min(currentWidth, this.x))
        this.y = Math.max(0, Math.min(currentHeight, this.y))
      }

      draw() {
        if (!ctx) return

        // 文字タイプによって色を微調整（深度で明度も調整）
        const baseColors = {
          kanji: { r: 255, g: 215, b: 0 },
          math: { r: 255, g: 165, b: 0 },
          greek: { r: 255, g: 215, b: 0 },
          logic: { r: 255, g: 170, b: 0 },
          kana: { r: 255, g: 224, b: 102 }
        }

        const color = baseColors[this.type]
        const depthFactor = 0.6 + this.depth * 0.4 // 奥は暗く、手前は明るく
        const pulseIntensity = Math.sin(this.phase) * 0.15 + 0.85 // パルス効果

        // 文字の描画（深度感とパルス）
        ctx.save()
        ctx.globalAlpha = this.opacity * pulseIntensity
        ctx.fillStyle = `rgb(${color.r * depthFactor}, ${color.g * depthFactor}, ${color.b * depthFactor})`
        ctx.font = `${this.size * 10}px "Noto Sans JP", "Noto Sans Math", sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        // 微細なシャドウで立体感
        ctx.shadowBlur = 10 + this.depth * 20
        ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${this.depth * 0.5})`
        ctx.fillText(this.char, this.x, this.y)
        ctx.restore()

        // グローエフェクト（手前のパーティクルほど強く光る）
        if (this.depth > 0.5) {
          ctx.save()
          ctx.globalAlpha = (this.opacity * 0.3) * pulseIntensity * this.depth
          ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
          ctx.filter = `blur(${8 + this.depth * 12}px)`
          ctx.beginPath()
          ctx.arc(this.x, this.y, this.size * 2 * this.depth, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
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

      // 背景のグラデーション（より深い階層感とダイナミックな動き）
      const time = Date.now() * 0.0001 // 時間による変化
      const gradient = ctx.createRadialGradient(
        currentWidth * (0.5 + Math.sin(time) * 0.1), // 中心をゆっくり移動
        currentHeight * (0.5 + Math.cos(time * 0.7) * 0.1),
        0,
        currentWidth * 0.5,
        currentHeight * 0.5,
        Math.max(currentWidth, currentHeight) * 0.8
      )
      gradient.addColorStop(0, '#0d2d4d') // 中心は少し明るく
      gradient.addColorStop(0.4, '#0A2540') // メインカラー
      gradient.addColorStop(0.7, '#0a1f35') // 少し暗く
      gradient.addColorStop(1, '#08192b') // 端は深い青
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, currentWidth, currentHeight)

      // パーティクルを更新・描画
      particles.forEach(particle => {
        particle.update()
        particle.draw()
      })

      // パーティクル間の接続線（近い粒子同士を繋ぐ - 深度感を追加）
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            // 深度の平均を計算（近い深度同士を強く結ぶ）
            const avgDepth = (p1.depth + p2.depth) / 2
            const depthDiff = Math.abs(p1.depth - p2.depth)
            const depthFactor = 1 - depthDiff * 0.5 // 深度差が大きいと線を薄く

            ctx.save()
            ctx.globalAlpha = (1 - distance / 150) * 0.15 * depthFactor * (0.6 + avgDepth * 0.4)
            ctx.strokeStyle = `rgba(255, 215, 0, ${0.6 + avgDepth * 0.4})` // 深度で明るさ調整
            ctx.lineWidth = 0.3 + avgDepth * 0.4 // 深度で太さ調整
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
