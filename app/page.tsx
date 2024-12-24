import { AsciiGenerator } from "@/components/ascii-generator"

export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-16">
        <h1 className="text-5xl md:text-6xl font-bold text-center font-ivar">
          ASCII Art Generator
        </h1>
        <AsciiGenerator />
      </div>
    </main>
  )
}

