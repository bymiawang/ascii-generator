"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Paperclip, Download } from 'lucide-react'
import { cn } from "@/lib/utils"

export function AsciiGenerator() {
  const [image, setImage] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [settings, setSettings] = useState({
    brightness: 1.1,
    resolution: 150,
    spacing: 2.1,
    isColorMode: false,
  })

  // Unicode block levels (darkest to lightest)
  const blocks = [
    "\u2588",
    "\u2589",
    "\u258A",
    "\u258B",
    "\u258C",
    "\u258D",
    "\u258E",
    "\u258F",
    " ",
  ]

  const handleFile = useCallback((file: File) => {
    if (file.type.startsWith("image/")) {
      setImage(file)
    } else {
      alert("Please upload an image file!")
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      handleFile(file)
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = 'ascii-art.png'
    link.href = canvas.toDataURL()
    link.click()
  }, [])

  useEffect(() => {
    if (!image || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.src = URL.createObjectURL(image)
    img.onload = () => {
      // Set canvas dimensions
      canvas.width = 1024
      canvas.height = 1024

      // Calculate dimensions
      const cols = settings.resolution
      const rows = Math.floor((cols * img.height) / img.width / 2) // Adjust for character aspect ratio

      // Clear canvas
      ctx.fillStyle = "#B9BFC8"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = `${(canvas.width / cols) * settings.spacing}px monospace`
      ctx.textAlign = "left"
      ctx.textBaseline = "top"

      // Create temporary canvas for pixel manipulation
      const tempCanvas = document.createElement("canvas")
      const tempCtx = tempCanvas.getContext("2d")
      if (!tempCtx) return

      tempCanvas.width = img.width
      tempCanvas.height = img.height
      tempCtx.drawImage(img, 0, 0)
      const imageData = tempCtx.getImageData(0, 0, img.width, img.height)

      // Process each cell
      const w = canvas.width / cols
      const h = canvas.height / rows

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          // Sample image at grid position
          const imgX = Math.floor((x / cols) * img.width)
          const imgY = Math.floor((y / rows) * img.height)
          const i = (imgY * img.width + imgX) * 4

          // Get color values
          const r = imageData.data[i]
          const g = imageData.data[i + 1]
          const b = imageData.data[i + 2]

          if (settings.isColorMode) {
            // Color mode
            const brightness = (r + g + b) / (3 * 255) * settings.brightness
            const blockIndex = Math.floor(((blocks.length - 1) * brightness))
            const char = blocks[Math.max(0, Math.min(blockIndex, blocks.length - 1))]

            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
            ctx.fillText(char, x * w, y * h)
          } else {
            // Black and white mode
            const brightness = (r + g + b) / (3 * 255) * settings.brightness
            const blockIndex = Math.floor(((blocks.length - 1) * brightness))
            const char = blocks[Math.max(0, Math.min(blockIndex, blocks.length - 1))]

            ctx.fillStyle = "black"
            ctx.fillText(char, x * w, y * h)
          }
        }
      }
    }
  }, [image, settings, blocks])

  return (
    <div className="space-y-6 w-full">
      {!image ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => {
            const input = document.createElement("input")
            input.type = "file"
            input.accept = "image/*"
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0]
              if (file) handleFile(file)
            }
            input.click()
          }}
          className={cn(
            "relative cursor-pointer border border-gray-800 rounded-lg p-16",
            "flex flex-col items-center justify-center gap-4",
            "transition-all duration-200",
            "bg-gray-900/20 hover:bg-gray-900/30",
            isDragging && "border-white bg-gray-900/40"
          )}
        >
          <div className="h-16 w-16 rounded-2xl bg-gray-900 flex items-center justify-center">
            <Paperclip className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-center mb-2">Upload a File</h2>
            <p className="text-gray-400 text-center">
              Drag your file here or click to upload
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-8">
            <div className="space-y-2">
              <label className="text-sm font-medium">Brightness</label>
              <input
                type="range"
                min={0}
                max={2}
                step={0.1}
                value={settings.brightness}
                onChange={(e) => setSettings(s => ({ ...s, brightness: parseFloat(e.target.value) }))}
                className="w-full slider-thumb"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Resolution</label>
              <input
                type="range"
                min={40}
                max={250}
                step={10}
                value={settings.resolution}
                onChange={(e) => setSettings(s => ({ ...s, resolution: parseFloat(e.target.value) }))}
                className="w-full slider-thumb"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Character Spacing</label>
              <input
                type="range"
                min={0.8}
                max={3}
                step={0.1}
                value={settings.spacing}
                onChange={(e) => setSettings(s => ({ ...s, spacing: parseFloat(e.target.value) }))}
                className="w-full slider-thumb"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.isColorMode}
                  onChange={(e) => setSettings(s => ({ ...s, isColorMode: e.target.checked }))}
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-300">Color Mode</span>
              </label>
            </div>
          </div>
          <canvas
            ref={canvasRef}
            className="w-full aspect-square bg-[#B9BFC8] rounded-lg"
          />
          <div className="flex space-x-4">
            <button
              onClick={() => setImage(null)}
              className="px-4 py-2 bg-gray-900 rounded-md hover:bg-gray-800 transition-colors"
            >
              Upload New Image
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-gray-900 rounded-md hover:bg-gray-800 transition-colors flex items-center"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

