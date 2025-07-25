"use client"

import { CustomerLayout } from "./components/customer-layout"
import { DashboardContent } from "./components/dashboard-content"

// Mock data - in een echte app zou dit van een API komen
const mockUser = {
  id: "1",
  name: "Jan Janssen",
  email: "jan@example.com",
  company: "Janssen B.V.",
}

const mockStats = {
  totalShipments: 47,
  pendingShipments: 8,
  deliveredShipments: 39,
  totalSpent: 1247,
}

const mockRecentShipments = [
  {
    id: "1",
    recipient: "Maria van der Berg",
    destination: "Amsterdam, NL",
    status: "Afgeleverd",
    date: "2 dagen geleden",
    trackingCode: "PX123456789",
  },
  {
    id: "2",
    recipient: "Peter Smit",
    destination: "Rotterdam, NL",
    status: "Onderweg",
    date: "1 dag geleden",
    trackingCode: "PX987654321",
  },
  {
    id: "3",
    recipient: "Lisa de Vries",
    destination: "Utrecht, NL",
    status: "Verzonden",
    date: "Vandaag",
    trackingCode: "PX456789123",
  },
]

export default function CustomerDashboard() {
  return (
    <CustomerLayout user={mockUser} searchPlaceholder="Zoek zendingen...">
      <DashboardContent stats={mockStats} recentShipments={mockRecentShipments} />
    </CustomerLayout>
  )
}
