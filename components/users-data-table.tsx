"use client"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { SuperAdmin } from "@/types/user"

interface UsersDataTableProps {
  users: SuperAdmin[]
  onEdit: (user: SuperAdmin) => void
  onDelete: (user: SuperAdmin) => void
}

export function UsersDataTable({ users, onEdit, onDelete }: UsersDataTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200">
            <TableHead className="font-semibold text-gray-900">Naam</TableHead>
            <TableHead className="font-semibold text-gray-900">E-mail</TableHead>
            <TableHead className="font-semibold text-gray-900">Aangemaakt op</TableHead>
            <TableHead className="font-semibold text-gray-900">Laatste login</TableHead>
            <TableHead className="font-semibold text-gray-900 w-[100px]">Acties</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="border-gray-100 hover:bg-gray-50">
              <TableCell className="font-medium">{user.display_name}</TableCell>
              <TableCell className="text-gray-600">{user.email}</TableCell>
              <TableCell className="text-gray-600">{formatDate(user.created_at)}</TableCell>
              <TableCell className="text-gray-600">
                {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : "Nooit"}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 rounded-xl">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-2xl border-gray-200">
                    <DropdownMenuItem onClick={() => onEdit(user)} className="rounded-xl cursor-pointer">
                      <Pencil className="mr-2 h-4 w-4" />
                      Bewerken
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(user)}
                      className="rounded-xl cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Verwijderen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
