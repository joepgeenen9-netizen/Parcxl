import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2069ff] mx-auto mb-4" />
        <p className="text-gray-600">Leveringen worden geladen...</p>
      </div>
    </div>
  )
}
