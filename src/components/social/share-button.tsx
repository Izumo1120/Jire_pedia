"use client"

import { Share2, Facebook, MessageCircle, Link2, Check } from "lucide-react"
import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ShareButtonProps {
  url: string
  title: string
  text?: string
}

export function ShareButton({ url, title, text }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [hasNativeShare, setHasNativeShare] = useState(false)

  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url

  const shareData = {
    title,
    text: text || title,
    url: fullUrl,
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.error("Share failed:", error)
      }
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Copy failed:", error)
    }
  }

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text || title
    )}&url=${encodeURIComponent(fullUrl)}`
    window.open(twitterUrl, "_blank", "noopener,noreferrer")
  }

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      fullUrl
    )}`
    window.open(facebookUrl, "_blank", "noopener,noreferrer")
  }

  const shareToLine = () => {
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
      fullUrl
    )}`
    window.open(lineUrl, "_blank", "noopener,noreferrer")
  }

  useEffect(() => {
    setMounted(true)
    setHasNativeShare(
      typeof navigator !== "undefined" && navigator.share !== undefined
    )
  }, [])

  // マウント前は常にドロップダウンメニューをレンダリング（Hydration対策）
  if (!mounted) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-2 text-gray-400 hover:text-golden transition-colors"
            aria-label="シェア"
          >
            <Share2 size={20} />
            <span className="text-sm font-medium">シェア</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-deep-blue border border-golden/30">
          <DropdownMenuItem onClick={shareToTwitter} className="cursor-pointer flex items-center gap-2">
            <span className="text-lg font-bold">𝕏</span>
            X (Twitter) でシェア
          </DropdownMenuItem>
          <DropdownMenuItem onClick={shareToFacebook} className="cursor-pointer flex items-center gap-2">
            <Facebook size={16} />
            Facebook でシェア
          </DropdownMenuItem>
          <DropdownMenuItem onClick={shareToLine} className="cursor-pointer flex items-center gap-2">
            <MessageCircle size={16} />
            LINE でシェア
          </DropdownMenuItem>
          <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer flex items-center gap-2">
            {copied ? <Check size={16} className="text-success" /> : <Link2 size={16} />}
            {copied ? "コピーしました！" : "リンクをコピー"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // マウント後、ネイティブシェアが使える場合はシンプルなボタンに切り替え
  if (hasNativeShare) {
    return (
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-2 text-gray-400 hover:text-golden transition-colors"
        aria-label="シェア"
      >
        <Share2 size={20} />
        <span className="text-sm font-medium">シェア</span>
      </button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 text-gray-400 hover:text-golden transition-colors"
          aria-label="シェア"
        >
          <Share2 size={20} />
          <span className="text-sm font-medium">シェア</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-deep-blue border border-golden/30">
        <DropdownMenuItem onClick={shareToTwitter} className="cursor-pointer flex items-center gap-2">
          <span className="text-lg font-bold">𝕏</span>
          X (Twitter) でシェア
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToFacebook} className="cursor-pointer flex items-center gap-2">
          <Facebook size={16} />
          Facebook でシェア
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToLine} className="cursor-pointer flex items-center gap-2">
          <MessageCircle size={16} />
          LINE でシェア
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer flex items-center gap-2">
          {copied ? <Check size={16} className="text-success" /> : <Link2 size={16} />}
          {copied ? "コピーしました！" : "リンクをコピー"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
