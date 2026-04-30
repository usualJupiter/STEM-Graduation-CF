"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import CreateGroup from "@/components/applications/createGroup"

interface ManageApplicationsProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const tableData = [
  { group: "2026", totalApplications: "7", status: "ON" },
  { group: "2025", totalApplications: "115", status: "OFF" },
  { group: "2024", totalApplications: "625", status: "OFF" },
  { group: "2023", totalApplications: "121", status: "OFF" },
  { group: "2022", totalApplications: "78", status: "OFF" },
]

export default function ManageApplications({
  open,
  onOpenChange,
}: ManageApplicationsProps) {
  const [createGroupOpen, setCreateGroupOpen] = useState(false)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[653px]">
          <DialogHeader>
            <DialogTitle>Manage Applications</DialogTitle>
            <DialogDescription>
              filter applications with groups.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group</TableHead>
                  <TableHead>Total Applications</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead className="w-[88px]">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((row) => (
                  <TableRow key={row.group}>
                    <TableCell>{row.group}</TableCell>
                    <TableCell>{row.totalApplications}</TableCell>
                    <TableCell className="text-right">{row.status}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Activate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange?.(false)}>
              Cancel
            </Button>
            <Button onClick={() => setCreateGroupOpen(true)}>
              Create New Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateGroup
        open={createGroupOpen}
        onOpenChange={setCreateGroupOpen}
      />
    </>
  )
}
