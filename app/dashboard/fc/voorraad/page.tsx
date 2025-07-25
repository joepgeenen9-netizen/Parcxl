"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useTenant } from "@/contexts/tenant-context"
import FCLayout from "../_components/fc-layout"

interface TenantUser {
  id: string
  tenant_id: string
  username: string
  email: string
  is_admin: boolean
}

interface WarehouseLocation {
  id: string
  code: string
  type: "pick" | "bulk"
  aisle: string
  position: number
}

export default function VoorraadPage() {
  const router = useRouter()
  const { tenant, isTenantDomain, isLoading: tenantLoading } = useTenant()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<TenantUser | null>(null)

  // Generate warehouse locations
  const generateWarehouseLocations = (): WarehouseLocation[] => {
    const locations: WarehouseLocation[] = []
    const aisles = ["A", "B", "C", "D", "E", "F"]

    aisles.forEach((aisle) => {
      for (let i = 1; i <= 20; i++) {
        const code = `${aisle}.${i.toString().padStart(2, "0")}`
        const type = Math.random() > 0.6 ? "pick" : "bulk" // 40% pick locations, 60% bulk
        locations.push({
          id: `${aisle}-${i}`,
          code,
          type,
          aisle,
          position: i,
        })
      }
    })

    return locations
  }

  const [warehouseLocations] = useState<WarehouseLocation[]>(generateWarehouseLocations())

  useEffect(() => {
    if (tenantLoading) return

    // Redirect if this is not a tenant domain
    if (!isTenantDomain) {
      router.push("/login")
      return
    }

    // Check if tenant is FC type
    if (tenant?.type !== "FC") {
      router.push("/login")
      return
    }

    // Check if user is logged in
    const tenantUser = localStorage.getItem("tenant-user")
    if (!tenantUser) {
      router.push("/login")
      return
    }

    try {
      const userData = JSON.parse(tenantUser)
      if (userData.tenant_id !== tenant.id) {
        router.push("/login")
        return
      }
      setUser(userData)
    } catch (error) {
      router.push("/login")
      return
    }

    setIsLoading(false)
  }, [router, isTenantDomain, tenant, tenantLoading])

  if (tenantLoading || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2069ff] mx-auto mb-4" />
          <p className="text-gray-600">Bezig met laden...</p>
        </div>
      </div>
    )
  }

  if (!user || !tenant) {
    return null
  }

  // Group locations by aisle
  const locationsByAisle = warehouseLocations.reduce(
    (acc, location) => {
      if (!acc[location.aisle]) {
        acc[location.aisle] = []
      }
      acc[location.aisle].push(location)
      return acc
    },
    {} as Record<string, WarehouseLocation[]>,
  )

  return (
    <FCLayout user={user} tenant={tenant} searchPlaceholder="Zoek in warehouse...">
      <div className="w-full h-full min-h-screen bg-gray-50">
        {/* Primary Container for WarehouseView */}
        <div className="w-full h-full flex flex-col">
          {/* Prominent Title */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">WarehouseView</h1>
            <p className="text-slate-600 mt-2">Digital Twin - 3D Warehouse Visualization & Management</p>
          </div>

          {/* Legend */}
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded shadow-sm"
                  style={{
                    background: "linear-gradient(135deg, #2ECC71 0%, #28B463 100%)",
                  }}
                ></div>
                <span className="text-sm text-slate-600 font-medium">Pick Locations</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded shadow-sm"
                  style={{
                    background: "linear-gradient(135deg, #BDC3C7 0%, #95A5A6 100%)",
                  }}
                ></div>
                <span className="text-sm text-slate-600 font-medium">Bulk Locations</span>
              </div>
            </div>
          </div>

          {/* Warehouse Grid Layout - Digital Twin Floor */}
          <div className="flex-1 w-full h-full warehouse-floor overflow-auto">
            <div className="warehouse-container">
              {Object.entries(locationsByAisle).map(([aisle, locations]) => (
                <div key={aisle} className="warehouse-aisle">
                  {/* Aisle Label */}
                  <div className="aisle-label">
                    <h3 className="text-lg font-bold text-white mb-4 text-shadow-lg">Aisle {aisle}</h3>
                  </div>

                  {/* Warehouse Racks */}
                  <div className="warehouse-rack-container">
                    {locations.map((location) => (
                      <div
                        key={location.id}
                        className={`warehouse-location ${location.type === "pick" ? "pick-location" : "bulk-location"}`}
                        title={`${location.code} - ${location.type === "pick" ? "Pick Location" : "Bulk Location"}`}
                      >
                        <span className="location-code">{location.code}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced CSS Styles for Premium Digital Twin Effect */}
        <style jsx>{`
          .warehouse-floor {
            background: #2C3E50;
            background-image: 
              linear-gradient(90deg, rgba(52, 73, 94, 0.3) 1px, transparent 1px),
              linear-gradient(rgba(52, 73, 94, 0.3) 1px, transparent 1px);
            background-size: 100px 100px;
            padding: 2rem;
            position: relative;
          }

          .warehouse-floor::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
            pointer-events: none;
          }

          .warehouse-container {
            display: flex;
            flex-direction: column;
            gap: 4rem;
            perspective: 1200px;
            transform-style: preserve-3d;
          }

          .warehouse-aisle {
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .aisle-label {
            margin-bottom: 1.5rem;
            z-index: 10;
          }

          .aisle-label h3 {
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
            letter-spacing: 0.05em;
          }

          .warehouse-rack-container {
            display: grid;
            grid-template-columns: repeat(10, 1fr);
            gap: 0.75rem;
            transform: rotateX(45deg) rotateY(-15deg);
            transform-style: preserve-3d;
          }

          .warehouse-location {
            width: 85px;
            height: 65px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
            transform: skewY(-15deg);
            position: relative;
            border: 1px solid rgba(0, 0, 0, 0.2);
          }

          .pick-location {
            background: linear-gradient(135deg, #2ECC71 0%, #28B463 100%);
            box-shadow: 
              0 8px 16px rgba(46, 204, 113, 0.3),
              0 4px 8px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.2),
              inset 0 -1px 0 rgba(0, 0, 0, 0.1);
          }

          .bulk-location {
            background: linear-gradient(135deg, #BDC3C7 0%, #95A5A6 100%);
            box-shadow: 
              0 8px 16px rgba(189, 195, 199, 0.3),
              0 4px 8px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.3),
              inset 0 -1px 0 rgba(0, 0, 0, 0.1);
          }

          .warehouse-location::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.05) 100%);
            border-radius: 6px;
            pointer-events: none;
          }

          .warehouse-location:hover {
            transform: skewY(-15deg) translateY(-5px) scale(1.02);
            z-index: 10;
          }

          .pick-location:hover {
            box-shadow: 
              0 12px 24px rgba(46, 204, 113, 0.4),
              0 6px 12px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.3),
              inset 0 -1px 0 rgba(0, 0, 0, 0.1);
            background: linear-gradient(135deg, #27AE60 0%, #229954 100%);
          }

          .bulk-location:hover {
            box-shadow: 
              0 12px 24px rgba(189, 195, 199, 0.4),
              0 6px 12px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.4),
              inset 0 -1px 0 rgba(0, 0, 0, 0.1);
            background: linear-gradient(135deg, #AEB6BF 0%, #85929E 100%);
          }

          .location-code {
            font-size: 0.8rem;
            font-weight: 700;
            color: white;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
            transform: skewY(15deg);
            display: block;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            letter-spacing: 0.025em;
          }

          .bulk-location .location-code {
            color: #2C3E50;
            text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.5);
          }

          @media (max-width: 768px) {
            .warehouse-rack-container {
              grid-template-columns: repeat(5, 1fr);
              transform: rotateX(35deg) rotateY(-10deg);
              gap: 0.5rem;
            }
            
            .warehouse-location {
              width: 65px;
              height: 50px;
            }
            
            .location-code {
              font-size: 0.7rem;
            }

            .warehouse-container {
              gap: 2.5rem;
            }
          }

          @media (max-width: 480px) {
            .warehouse-floor {
              padding: 1rem;
            }
            
            .warehouse-rack-container {
              grid-template-columns: repeat(4, 1fr);
            }
            
            .warehouse-location {
              width: 55px;
              height: 42px;
            }
            
            .location-code {
              font-size: 0.65rem;
            }
          }
        `}</style>
      </div>
    </FCLayout>
  )
}
