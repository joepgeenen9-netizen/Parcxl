"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Search, Filter, Building2, MapPin, Calendar, Zap, X, ChevronDown, ChevronUp, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Client } from "@/types/client"

interface KlantenPageClientProps {
  clients: Client[]
}

type SortField = "company_name" | "address_city" | "status" | "created_at"
type SortDirection = "asc" | "desc"

export function KlantenPageClient({ clients }: KlantenPageClientProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [countryFilter, setCountryFilter] = useState<string>("all")
  const [cityFilter, setCityFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("created_at")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  // Get unique values for filters
  const uniqueCountries = useMemo(() => {
    const countries = clients
      .map((client) => client.address_country)
      .filter((country): country is string => Boolean(country))
    return Array.from(new Set(countries)).sort()
  }, [clients])

  const uniqueCities = useMemo(() => {
    const cities = clients.map((client) => client.address_city).filter((city): city is string => Boolean(city))
    return Array.from(new Set(cities)).sort()
  }, [clients])

  // Filter and sort clients
  const filteredAndSortedClients = useMemo(() => {
    const filtered = clients.filter((client) => {
      const matchesSearch =
        searchTerm === "" ||
        client.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.address_city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || client.status === statusFilter
      const matchesCountry = countryFilter === "all" || client.address_country === countryFilter
      const matchesCity = cityFilter === "all" || client.address_city === cityFilter

      return matchesSearch && matchesStatus && matchesCountry && matchesCity
    })

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case "company_name":
          aValue = a.company_name.toLowerCase()
          bValue = b.company_name.toLowerCase()
          break
        case "address_city":
          aValue = (a.address_city || "").toLowerCase()
          bValue = (b.address_city || "").toLowerCase()
          break
        case "status":
          aValue = a.status
          bValue = b.status
          break
        case "created_at":
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [clients, searchTerm, statusFilter, countryFilter, cityFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setCountryFilter("all")
    setCityFilter("all")
  }

  const hasActiveFilters =
    searchTerm !== "" || statusFilter !== "all" || countryFilter !== "all" || cityFilter !== "all"

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "suspended":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nl-NL", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
  }

  // Statistics
  const totalClients = clients.length
  const activeClients = clients.filter((c) => c.status === "active").length
  const newClientsThisMonth = clients.filter((c) => {
    const clientDate = new Date(c.created_at)
    const now = new Date()
    return clientDate.getMonth() === now.getMonth() && clientDate.getFullYear() === now.getFullYear()
  }).length

  return (
    <div className="space-y-6 pb-8 md:pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Klanten</h1>
          <p className="text-slate-600 mt-1">Beheer je fulfillment klanten</p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/fc/klanten/nieuw")}
          className="bg-gradient-to-r from-[#0065FF] to-[#0052CC] hover:from-[#0052CC] hover:to-[#0065FF] text-white shadow-[0_4px_12px_rgba(0,101,255,0.3)] transition-all duration-200 hover:shadow-[0_6px_20px_rgba(0,101,255,0.4)] hover:transform hover:translate-y-[-1px]"
        >
          <Building2 className="w-4 h-4 mr-2" />
          Nieuwe klant
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/90 backdrop-blur-[20px] rounded-2xl p-6 border border-[#0065FF]/[0.08] transition-all duration-300 hover:transform hover:translate-y-[-4px] hover:shadow-[0_20px_40px_rgba(0,101,255,0.15)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0065FF]/10 to-[#0065FF]/5 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[#0065FF]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{totalClients}</div>
              <div className="text-sm text-slate-600">Totaal klanten</div>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-[20px] rounded-2xl p-6 border border-[#0065FF]/[0.08] transition-all duration-300 hover:transform hover:translate-y-[-4px] hover:shadow-[0_20px_40px_rgba(0,101,255,0.15)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 flex items-center justify-center">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{activeClients}</div>
              <div className="text-sm text-slate-600">Actieve klanten</div>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-[20px] rounded-2xl p-6 border border-[#0065FF]/[0.08] transition-all duration-300 hover:transform hover:translate-y-[-4px] hover:shadow-[0_20px_40px_rgba(0,101,255,0.15)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF8200]/10 to-[#FF8200]/5 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[#FF8200]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{newClientsThisMonth}</div>
              <div className="text-sm text-slate-600">Nieuw deze maand</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/90 backdrop-blur-[20px] rounded-2xl p-6 border border-[#0065FF]/[0.08]">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Zoek op bedrijfsnaam, stad of contactpersoon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-[#0065FF]/20 focus:border-[#0065FF] focus:ring-[#0065FF]/20"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-48 border-[#0065FF]/20 focus:border-[#0065FF] focus:ring-[#0065FF]/20">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle statussen</SelectItem>
              <SelectItem value="active">Actief</SelectItem>
              <SelectItem value="inactive">Inactief</SelectItem>
              <SelectItem value="suspended">Opgeschort</SelectItem>
            </SelectContent>
          </Select>

          {/* Country Filter */}
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-full lg:w-48 border-[#0065FF]/20 focus:border-[#0065FF] focus:ring-[#0065FF]/20">
              <SelectValue placeholder="Land" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle landen</SelectItem>
              {uniqueCountries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* City Filter */}
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-full lg:w-48 border-[#0065FF]/20 focus:border-[#0065FF] focus:ring-[#0065FF]/20">
              <SelectValue placeholder="Stad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle steden</SelectItem>
              {uniqueCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex items-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200 bg-transparent"
            >
              <X className="w-4 h-4" />
              Wissen
            </Button>
          )}
        </div>

        {/* Results Counter */}
        <div className="mt-4 text-sm text-slate-600">
          {filteredAndSortedClients.length} van {totalClients} klanten
          {hasActiveFilters && " (gefilterd)"}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/90 backdrop-blur-[20px] rounded-2xl border border-[#0065FF]/[0.08] overflow-hidden">
        {filteredAndSortedClients.length === 0 ? (
          <div className="text-center py-12">
            {hasActiveFilters ? (
              <>
                <Filter className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">Geen klanten gevonden met de huidige filters</p>
                <Button variant="outline" onClick={clearFilters}>
                  Filters wissen
                </Button>
              </>
            ) : (
              <>
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">Nog geen klanten toegevoegd</p>
                <Button onClick={() => router.push("/dashboard/fc/klanten/nieuw")}>
                  <Building2 className="w-4 h-4 mr-2" />
                  Eerste klant toevoegen
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/80 border-b border-[#0065FF]/[0.08]">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-slate-700 w-20"></th>
                  <th
                    className="text-left py-4 px-6 font-medium text-slate-700 cursor-pointer hover:text-[#0065FF] transition-colors duration-200 min-w-[200px]"
                    onClick={() => handleSort("company_name")}
                  >
                    <div className="flex items-center">
                      Bedrijf
                      {getSortIcon("company_name")}
                    </div>
                  </th>
                  <th
                    className="text-left py-4 px-6 font-medium text-slate-700 cursor-pointer hover:text-[#0065FF] transition-colors duration-200 min-w-[150px]"
                    onClick={() => handleSort("address_city")}
                  >
                    <div className="flex items-center">
                      Locatie
                      {getSortIcon("address_city")}
                    </div>
                  </th>
                  <th
                    className="text-left py-4 px-6 font-medium text-slate-700 cursor-pointer hover:text-[#0065FF] transition-colors duration-200 min-w-[100px]"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center">
                      Status
                      {getSortIcon("status")}
                    </div>
                  </th>
                  <th
                    className="text-left py-4 px-6 font-medium text-slate-700 cursor-pointer hover:text-[#0065FF] transition-colors duration-200 min-w-[150px]"
                    onClick={() => handleSort("created_at")}
                  >
                    <div className="flex items-center">
                      Toegevoegd
                      {getSortIcon("created_at")}
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-slate-700 w-24">Acties</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedClients.map((client, index) => (
                  <tr
                    key={client.id}
                    className="border-b border-slate-100 hover:bg-[#0065FF]/[0.02] transition-all duration-200 group cursor-pointer"
                    onClick={() => router.push(`/dashboard/fc/klanten/${client.id}`)}
                  >
                    <td className="py-4 px-6 w-20">
                      <div className="w-16 h-16 rounded-xl bg-white border border-[#0065FF]/10 shadow-sm flex items-center justify-center p-2 relative overflow-hidden">
                        {client.logo_url ? (
                          <img
                            src={client.logo_url || "/placeholder.svg"}
                            alt={`${client.company_name} logo`}
                            className="w-full h-full object-contain"
                            sizes="64px"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = "none"
                              const fallback = target.nextElementSibling as HTMLElement
                              if (fallback) fallback.classList.remove("hidden")
                            }}
                          />
                        ) : null}
                        <Building2 className={`w-6 h-6 text-[#0065FF] ${client.logo_url ? "hidden" : ""}`} />
                      </div>
                    </td>
                    <td className="py-4 px-6 min-w-[200px]">
                      <div className="font-medium text-slate-900 group-hover:text-[#0065FF] transition-colors duration-200 truncate">
                        {client.company_name}
                      </div>
                    </td>
                    <td className="py-4 px-6 min-w-[150px]">
                      {client.address_city && client.address_country ? (
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            {client.address_city}, {client.address_country}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 min-w-[100px]">
                      <Badge className={`${getStatusColor(client.status)} font-medium`}>
                        {client.status === "active"
                          ? "Actief"
                          : client.status === "inactive"
                            ? "Inactief"
                            : "Opgeschort"}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 min-w-[150px]">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm truncate">{formatDate(client.created_at)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 w-24">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/dashboard/fc/klanten/${client.id}`)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-[#0065FF]/5 hover:border-[#0065FF]/20 hover:text-[#0065FF]"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
