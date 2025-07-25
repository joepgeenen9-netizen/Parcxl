"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { FileText, X } from "lucide-react"
import { jsPDF } from "jspdf"

interface PrintLabelsModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    id: string
    name: string
    sku: string
    barcode?: string | null
  }
}

export function PrintLabelsModal({ isOpen, onClose, product }: PrintLabelsModalProps) {
  const [quantity, setQuantity] = useState([1])

  // Determine barcode value based on priority order
  const getBarcodeValue = (): string => {
    // 1. First check barcode field
    if (product.barcode && product.barcode.trim()) {
      return product.barcode.trim()
    }

    // 2. If barcode is empty, check SKU field
    if (product.sku && product.sku.trim()) {
      return product.sku.trim()
    }

    // 3. If both are empty, use product ID as fallback
    return product.id
  }

  const barcodeValue = getBarcodeValue()

  // Construct the BarcodeAPI.org URL with type 128
  const barcodeImageUrl = `https://barcodeapi.org/api/128/${encodeURIComponent(barcodeValue)}`

  const generatePDF = async () => {
    try {
      // Create new PDF document with standard label dimensions (54mm x 28mm)
      const doc = new jsPDF({
        orientation: "landscape", // 54mm wide x 28mm high
        unit: "mm",
        format: [54, 28], // width: 54mm, height: 28mm
      })

      // Load the barcode image
      const img = new Image()
      img.crossOrigin = "anonymous"

      const generateLabels = () => {
        // Remove the default first page since we'll add pages in the loop
        let isFirstPage = true

        for (let i = 0; i < quantity[0]; i++) {
          // Add a new page for each label (except the first one which already exists)
          if (!isFirstPage) {
            doc.addPage()
          }
          isFirstPage = false

          // Label dimensions and margins
          const pageWidth = 54 // 54mm
          const pageHeight = 28 // 28mm
          const margin = 3 // Clean margins on sides

          // Add product name with significantly larger font size
          doc.setFontSize(14) // Increased from 8 to 14
          doc.setFont("helvetica", "bold")
          const maxNameWidth = pageWidth - 2 * margin
          const productNameLines = doc.splitTextToSize(product.name, maxNameWidth)
          // Only use first line to ensure it fits
          const productNameText = Array.isArray(productNameLines) ? productNameLines[0] : productNameLines

          // Center the product name horizontally
          const textWidth = doc.getTextWidth(productNameText)
          const textX = (pageWidth - textWidth) / 2
          doc.text(productNameText, textX, 8) // Positioned higher up

          // Add barcode image with increased size
          try {
            const barcodeWidth = pageWidth - 2 * margin // Utilize more width with clean margins
            const barcodeHeight = 16 // Increased height from 12 to 16
            const barcodeX = margin // Centered with margins
            const barcodeY = 10 // Positioned below the product name

            doc.addImage(img, "PNG", barcodeX, barcodeY, barcodeWidth, barcodeHeight)
          } catch (error) {
            console.warn("Could not add barcode image to PDF:", error)
            // Fallback: just add text representation
            doc.setFontSize(10)
            doc.setFont("helvetica", "normal")
            doc.text("Barcode not available", margin, 18)
          }
        }

        // Open PDF in new window - with mobile-friendly approach
        try {
          const pdfBlob = doc.output("blob")
          const pdfUrl = URL.createObjectURL(pdfBlob)

          // For mobile devices, use a different approach
          if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            // Create a temporary link and click it
            const link = document.createElement("a")
            link.href = pdfUrl
            link.download = `labels-${product.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`
            link.target = "_blank"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            // Clean up the URL after a delay
            setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000)
          } else {
            // Desktop: open in new window
            window.open(pdfUrl, "_blank")
          }
        } catch (error) {
          console.error("Error opening PDF:", error)
          // Fallback to original method
          doc.output("dataurlnewwindow")
        }
      }

      img.onload = generateLabels

      img.onerror = () => {
        console.warn("Barcode image failed to load, generating PDF without image")
        generateLabels()
      }

      // Load the barcode image
      img.src = barcodeImageUrl
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Er is een fout opgetreden bij het genereren van de PDF. Probeer het opnieuw.")
    }
  }

  return (
    <>
      {/* Enhanced responsive and animation styles with refined desktop scroll */}
      <style jsx global>{`
        /* Modal animation styles */
        .modal-overlay {
          animation: fadeIn 0.3s ease-out;
          backdrop-filter: blur(8px);
          background: rgba(0, 0, 0, 0.4);
        }
        
        .modal-content {
          animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: center center;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Desktop-first modal positioning with proper scroll behavior */
        .print-modal-content {
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          width: min(90vw, 600px) !important;
          max-height: min(90vh, 800px) !important;
          height: auto !important;
          margin: 0 !important;
          z-index: 50;
          border-radius: 1.5rem !important;
          overflow: hidden !important;
          display: flex !important;
          flex-direction: column !important;
        }

        /* Mobile adjustments */
        @media (max-width: 640px) {
          .print-modal-content {
            width: calc(100vw - 1rem) !important;
            max-width: 500px !important;
            max-height: calc(100vh - 2rem) !important;
            border-radius: 0 !important;
          }
        }

        /* Very small screens - full viewport */
        @media (max-width: 480px) {
          .print-modal-content {
            width: 100vw !important;
            height: 100vh !important;
            max-height: 100vh !important;
            border-radius: 0 !important;
            top: 0 !important;
            left: 0 !important;
            transform: none !important;
          }
        }

        /* Short screens - ensure scrollability */
        @media (max-height: 700px) {
          .print-modal-content {
            max-height: 95vh !important;
          }
        }

        @media (max-height: 600px) {
          .print-modal-content {
            max-height: 100vh !important;
            height: 100vh !important;
            top: 0 !important;
            transform: translateX(-50%) !important;
          }
        }

        /* Enhanced scrollbar styling for better desktop experience */
        .modal-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 101, 255, 0.3) rgba(0, 0, 0, 0.1);
          scroll-behavior: smooth;
        }

        .modal-scroll::-webkit-scrollbar {
          width: 8px;
        }

        .modal-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
          margin: 4px 0;
        }

        .modal-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(0, 101, 255, 0.4) 0%, rgba(0, 82, 204, 0.4) 100%);
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.2s ease;
        }

        .modal-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(0, 101, 255, 0.6) 0%, rgba(0, 82, 204, 0.6) 100%);
          transform: scaleX(1.2);
        }

        .modal-scroll::-webkit-scrollbar-thumb:active {
          background: linear-gradient(180deg, rgba(0, 101, 255, 0.8) 0%, rgba(0, 82, 204, 0.8) 100%);
        }

        /* Quantity display styling */
        .quantity-display {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 1rem;
          text-align: center;
          font-weight: 600;
          color: #334155;
          margin-top: 1rem;
        }

        /* Mobile button improvements */
        @media (max-width: 640px) {
          .mobile-button {
            min-height: 48px !important;
            font-size: 16px !important;
          }
        }

        /* Modal structure for proper scroll behavior */
        .modal-content-wrapper {
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 0;
          max-height: 100%;
        }

        .modal-header-fixed {
          flex-shrink: 0;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .modal-body-scrollable {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          min-height: 0;
          position: relative;
        }

        /* Smooth scroll behavior for all browsers */
        .modal-body-scrollable {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }

        /* Focus management for better accessibility */
        .modal-body-scrollable:focus {
          outline: none;
        }

        /* Ensure content doesn't get cut off */
        .modal-content-inner {
          min-height: min-content;
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }

        /* Desktop hover effects for scroll area */
        @media (hover: hover) and (pointer: fine) {
          .modal-body-scrollable:hover::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, rgba(0, 101, 255, 0.5) 0%, rgba(0, 82, 204, 0.5) 100%);
          }
        }
      `}</style>

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="print-modal-content modal-content border-0 shadow-2xl bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 backdrop-blur-sm p-0">
          <div className="modal-content-wrapper">
            {/* Fixed Header */}
            <DialogHeader className="modal-header-fixed bg-gradient-to-r from-white/95 to-blue-50/30 backdrop-blur-sm p-4 sm:p-6 border-b border-slate-200/50">
              <DialogTitle className="flex items-center gap-3 text-xl sm:text-2xl font-bold text-slate-900">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#0065FF] to-[#0052CC] flex items-center justify-center shadow-lg">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                Label printen
              </DialogTitle>
            </DialogHeader>

            {/* Scrollable Body Content */}
            <div className="modal-body-scrollable modal-scroll" tabIndex={-1}>
              <div className="modal-content-inner">
                <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
                  {/* Product Information */}
                  <div className="text-center space-y-2">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-tight">{product.name}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 font-mono bg-slate-100/60 px-3 py-1 rounded-lg inline-block">
                      SKU: {product.sku}
                    </p>
                  </div>

                  {/* Enhanced Barcode Display Container */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-inner border border-slate-200/50">
                    <div className="flex justify-center">
                      <img
                        src={barcodeImageUrl || "/placeholder.svg"}
                        alt={`Barcode for ${barcodeValue}`}
                        className="max-w-full h-auto border border-slate-200 rounded-xl bg-white p-2 sm:p-4 shadow-sm"
                        style={{ maxHeight: "120px" }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src =
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjEwMCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJhcmNvZGUgbm90IGF2YWlsYWJsZTwvdGV4dD48L3N2Zz4="
                        }}
                      />
                    </div>
                  </div>

                  {/* Enhanced Identifier Text */}
                  <div className="text-center">
                    <p className="text-xs sm:text-sm font-mono text-slate-700 bg-gradient-to-r from-slate-100/80 to-slate-50/80 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-3 rounded-xl inline-block shadow-sm border border-slate-200/50">
                      Code: <span className="font-bold text-slate-900">{barcodeValue}</span>
                    </p>
                  </div>

                  {/* Slider for Quantity Selection */}
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold text-slate-700">Aantal labels</Label>

                    <div className="space-y-4">
                      {/* Slider Component */}
                      <div className="px-2">
                        <Slider
                          value={quantity}
                          onValueChange={setQuantity}
                          max={500}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      {/* Quantity Display */}
                      <div className="quantity-display">
                        <div className="text-2xl font-bold text-slate-900">{quantity[0]}</div>
                        <div className="text-sm text-slate-600 mt-1">{quantity[0] === 1 ? "label" : "labels"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 pb-6">
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="mobile-button w-full sm:flex-1 h-12 hover:bg-slate-50 bg-white/80 backdrop-blur-sm border-slate-200 rounded-xl font-medium transition-all duration-200 hover:shadow-sm"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Sluiten
                    </Button>
                    <Button
                      onClick={generatePDF}
                      className="mobile-button w-full sm:flex-1 h-12 bg-gradient-to-r from-[#0065FF] to-[#0052CC] hover:from-[#0052CC] hover:to-[#0065FF] text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl font-semibold"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Open PDF
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
