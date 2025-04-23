//app/(admin)/support-messages/DataTable.tsx

 "use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState, useMemo } from "react";
import { SupportMessage } from "@/types/support";

interface DataTableProps {
  columns: {
    id: string;
    header: string;
    accessorKey?: string;
    cell: (message: SupportMessage) => React.ReactNode;
  }[];
  data: SupportMessage[];
}

const ITEMS_PER_PAGE = 10;

export function DataTable({ columns, data }: DataTableProps) {
  const [filterValue, setFilterValue] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      item.title.toLowerCase().includes(filterValue.toLowerCase()) ||
      item.message.toLowerCase().includes(filterValue.toLowerCase())
    );
  }, [data, filterValue]);

  const pageCount = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = currentPage * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, pageCount - 1));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Filter messages..."
        value={filterValue}
        onChange={(e) => {
          setFilterValue(e.target.value);
          setCurrentPage(0);
        }}
        className="max-w-sm"
        aria-label="Filter messages"
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <TableRow 
                  key={row.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  {columns.map((column) => (
                    <TableCell key={`${row.id}-${column.id}`}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell 
                  colSpan={columns.length} 
                  className="h-24 text-center text-muted-foreground"
                >
                  No messages found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousPage}
          disabled={currentPage === 0}
          className="gap-2"
        >
          Previous
        </Button>
        <div className="text-sm text-muted-foreground">
          Page {currentPage + 1} of {pageCount}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={currentPage >= pageCount - 1}
          className="gap-2"
        >
          Next
        </Button>
      </div>
    </div>
  );
}