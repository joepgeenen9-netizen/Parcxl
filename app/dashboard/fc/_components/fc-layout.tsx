"use client"

import type React from "react"
import { useState } from "react"
import { FCSidebar } from "./fc-sidebar"
import { FCNavbar } from "./fc-navbar"
import { BackgroundElements } from "./background-elements"
import { MobileSidebarOverlay } from "./mobile-sidebar-overlay"

interface TenantUser {
  id: string
  tenant_id: string
  username: string
  email: string
  is_admin: boolean
}

interface FCLayoutProps {
  user: TenantUser
  tenant: any
  children: React.ReactNode
  searchPlaceholder?: string
}

export function FCLayout({ user, tenant, children, searchPlaceholder = "Zoek orders..." }: FCLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      <div
        className="min-h-screen bg-white text-slate-900 overflow-x-hidden lg:transform lg:origin-top-left lg:scale-[0.98]"
        style={{ width: "100%", height: "100%" }}
      >
        <BackgroundElements />

        <div className="flex h-screen relative">
          {/* Desktop Sidebar */}
          <div className="hidden lg:flex w-[280px] bg-white/95 backdrop-blur-[20px] border-r border-[#2069ff]/20 relative z-10 shadow-[0_0_50px_rgba(32,105,255,0.15)] flex-col h-full">
            <FCSidebar tenant={tenant} />
          </div>

          {/* Mobile Sidebar Overlay */}
          <MobileSidebarOverlay isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)}>
            <FCSidebar tenant={tenant} isMobile={true} />
          </MobileSidebarOverlay>

          {/* Main Content */}
          <div className="flex-1 bg-white relative z-[5] flex flex-col h-full overflow-hidden">
            <FCNavbar
              user={user}
              onMenuClick={() => setIsMobileSidebarOpen(true)}
              searchPlaceholder={searchPlaceholder}
            />

            <div className="flex-1 p-3 sm:p-4 lg:p-10 bg-slate-50 overflow-y-auto pb-safe">
              <div className="pb-16 sm:pb-20 md:pb-12 max-w-full">{children}</div>
            </div>
          </div>
        </div>

        <style jsx global>{`
          @keyframes ripple {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }
          
          /* Mobile-specific optimizations */
          @media (max-width: 640px) {
            .overflow-x-auto {
              -webkit-overflow-scrolling: touch;
              overscroll-behavior-x: contain;
            }
            
            /* Improve touch targets */
            button, [role="button"], input, select, textarea {
              min-height: 44px;
              touch-action: manipulation;
            }
            
            /* Prevent zoom on input focus */
            input, select, textarea {
              font-size: 16px;
            }
          }
          
          /* Safe area handling for mobile devices */
          @supports (padding: max(0px)) {
            .pb-safe {
              padding-bottom: max(1rem, env(safe-area-inset-bottom));
            }
          }
          
          /* Improve scrolling performance */
          .overflow-y-auto {
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
          }
        `}</style>
      </div>
    </div>
  )
}

export default FCLayout
