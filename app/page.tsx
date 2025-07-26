"use client"

import CustomerDashboard from "../customer-dashboard"

// Mock user data - in real app this would come from authentication
const mockUser = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  company: "Acme Corp",
}

export default function Page() {
  return <CustomerDashboard />
}
