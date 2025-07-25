"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface Product {
  id: string
  name: string
  sku: string
  stock?: number
  article_number?: string | null
  barcode?: string | null
}

interface SearchableProductSelectProps {
  products: Product[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function SearchableProductSelect({
  products,
  value,
  onValueChange,
  placeholder = "Selecteer een product...",
  disabled = false,
  className,
}: SearchableProductSelectProps) {
  const [open, setOpen] = React.useState(false)

  const selectedProduct = products.find((product) => product.id === value)

  const handleSelect = React.useCallback(
    (productId: string) => {
      onValueChange(productId === value ? "" : productId)
      setOpen(false)
    },
    [value, onValueChange],
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full h-14 justify-between text-left font-normal border-2 border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 hover:border-green-300 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:shadow-md",
            !value && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed",
            className,
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Package className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              {selectedProduct ? (
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 truncate">{selectedProduct.name}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs px-2 py-0.5 rounded-md">
                      {selectedProduct.sku}
                    </Badge>
                    {selectedProduct.stock !== undefined && (
                      <Badge
                        variant={selectedProduct.stock > 10 ? "default" : "destructive"}
                        className="text-xs px-2 py-0.5 rounded-md"
                      >
                        Voorraad: {selectedProduct.stock}
                      </Badge>
                    )}
                  </div>
                </div>
              ) : (
                <span className="text-gray-500">{placeholder}</span>
              )}
            </div>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 rounded-2xl border-2 border-gray-200 bg-white shadow-xl z-50"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <Command className="rounded-2xl">
          <CommandInput
            placeholder="Zoek op naam, SKU, artikelnummer of barcode..."
            className="h-12 border-0 focus:ring-0"
          />
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty className="py-6 text-center text-sm text-gray-500">
              <div className="flex flex-col items-center gap-2">
                <Package className="h-8 w-8 text-gray-300" />
                <span>Geen producten gevonden</span>
                <span className="text-xs text-gray-400">Probeer een andere zoekterm</span>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={`${product.name} ${product.sku} ${product.article_number || ""} ${product.barcode || ""}`}
                  onSelect={() => handleSelect(product.id)}
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-green-50 rounded-xl transition-colors duration-200 aria-selected:bg-green-50"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Package className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{product.name}</div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="secondary" className="text-xs px-2 py-0.5 rounded-md">
                          {product.sku}
                        </Badge>
                        {product.article_number && (
                          <Badge variant="outline" className="text-xs px-2 py-0.5 rounded-md">
                            Art: {product.article_number}
                          </Badge>
                        )}
                        {product.stock !== undefined && (
                          <Badge
                            variant={product.stock > 10 ? "default" : "destructive"}
                            className="text-xs px-2 py-0.5 rounded-md"
                          >
                            Voorraad: {product.stock}
                          </Badge>
                        )}
                      </div>
                      {product.barcode && (
                        <div className="text-xs text-gray-500 mt-1 truncate">Barcode: {product.barcode}</div>
                      )}
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "ml-2 h-4 w-4 flex-shrink-0 text-green-600",
                      value === product.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
