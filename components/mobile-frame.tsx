import Image from "next/image"
import type { ReactNode } from "react"
import { GameHeader } from "./game-header"

interface MobileFrameProps {
  children: ReactNode
}

export function MobileFrame({ children }: MobileFrameProps) {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Image
        src="/images/stadium-background.png"
        alt="Football Stadium Background"
        layout="fill"
        objectFit="cover"
        quality={100}
        className="z-0"
      />

      <div className="fixed inset-0 flex items-center justify-center z-10 p-4">
        <div className="relative w-[380px] h-[700px] bg-mobile-frame-dark rounded-3xl shadow-2xl flex flex-col border-4 border-gray-900">
          <GameHeader />
          <div className="flex-1 min-h-0">{children}</div>
        </div>
      </div>
    </div>
  )
}
