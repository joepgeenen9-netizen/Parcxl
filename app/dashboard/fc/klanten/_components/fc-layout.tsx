"use client"

import type React from "react"
import RealFCLayout from "../../_components/fc-layout"

/**
 * Thin proxy so pages under `fc/klanten/` can import from
 * "@/app/dashboard/fc/klanten/_components/fc-layout".
 *
 * - Keeps a **default function export** (required by the bundler)
 * - Re-exports the same component under the named export `FCLayout`
 */
export default function FCLayout(props: React.ComponentProps<typeof RealFCLayout>) {
  return <RealFCLayout {...props} />
}

export { FCLayout }
