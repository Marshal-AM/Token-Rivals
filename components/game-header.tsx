import Image from "next/image"
import { Plus } from "lucide-react"

export function GameHeader() {
  return (
    <div className="flex items-center justify-between p-4 bg-mobile-frame-dark text-white border-b border-gray-800">
      <div className="flex items-center gap-2">
        <Image src="/placeholder.svg?height=24&width=24" alt="Token" width={24} height={24} />
        <span className="text-lg font-bold text-green-400">0.00</span>
        <Plus className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white transition-colors" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">Menu</span>
        <Image
          src="/placeholder.svg?height=24&width=24"
          alt="User Profile"
          width={24}
          height={24}
          className="rounded-full border border-gray-600"
        />
      </div>
    </div>
  )
}
