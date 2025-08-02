import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { MobileFrame } from "@/components/mobile-frame"

export default function CreateSquadPage() {
  return (
    <MobileFrame>
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-900 to-black text-white p-4">
        <h1 className="text-4xl font-extrabold mb-6 text-green-400 drop-shadow-lg">Create Squad</h1>
        <p className="text-lg text-gray-400 mb-8 text-center max-w-xs">
          This is where you'll assemble your dream team!
        </p>
        <Link href="/" passHref>
          <Button className="bg-gradient-to-r from-button-green to-green-600 hover:from-green-600 hover:to-button-green text-white py-3 px-6 text-lg rounded-lg shadow-lg transition-all duration-300">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back to Game
          </Button>
        </Link>
      </div>
    </MobileFrame>
  )
}
