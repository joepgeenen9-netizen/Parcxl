"use client"

import { useEffect, useRef } from "react"

interface BarcodeGeneratorProps {
  value: string
  width?: number
  height?: number
  displayValue?: boolean
}

export function BarcodeGenerator({ value, width = 2, height = 100, displayValue = true }: BarcodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !value) return

    // Simple barcode generation using canvas
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = value.length * 12 + 40
    canvas.height = height + (displayValue ? 30 : 0)

    // Clear canvas
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Generate simple barcode pattern
    ctx.fillStyle = "black"
    let x = 20

    // Start pattern
    ctx.fillRect(x, 10, 2, height)
    x += 4
    ctx.fillRect(x, 10, 1, height)
    x += 3

    // Data pattern (simplified)
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i)
      const pattern = char % 4

      for (let j = 0; j < 4; j++) {
        if ((pattern >> j) & 1) {
          ctx.fillRect(x, 10, width, height)
        }
        x += width + 1
      }
      x += 2
    }

    // End pattern
    ctx.fillRect(x, 10, 1, height)
    x += 3
    ctx.fillRect(x, 10, 2, height)

    // Display value text
    if (displayValue) {
      ctx.fillStyle = "black"
      ctx.font = "14px monospace"
      ctx.textAlign = "center"
      ctx.fillText(value, canvas.width / 2, height + 25)
    }
  }, [value, width, height, displayValue])

  if (!value) {
    return (
      <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
        <span className="text-gray-500">Geen barcode waarde</span>
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        className="border border-gray-200 rounded-lg bg-white"
        style={{ maxWidth: "100%", height: "auto" }}
      />
    </div>
  )
}
