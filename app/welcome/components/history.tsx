import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { ExternalLink } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "~/components/ui/pagination";
import type { UrlHistory } from "~/interface/type";

const ITEMS_PER_PAGE = 13;

type HistoryPageProps = {
  history: UrlHistory[];
};

export function HistoryPage({ history }: HistoryPageProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const filteredHistory = history.filter((item) =>
    item.originalUrl.toLowerCase().includes(search.toLowerCase()) ||
    item.shortCode.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="w-full">
      <Card className="shadow-none border-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-medium text-gray-900">
            Your URL History
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Track and manage your shortened URLs
          </p>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="mb-6">
            <Input
              placeholder="Search URLs or codes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md border-gray-200 focus:border-blue-300 focus:ring-blue-200 rounded-xl bg-gray-50 text-gray-700 placeholder-gray-400"
            />
          </div>

          {paginatedHistory.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">No URL history yet</p>
              <p className="text-gray-400 text-xs mt-1">Start shortening URLs to see them here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-100">
                    <TableHead className="text-gray-600 font-medium">Original URL</TableHead>
                    <TableHead className="text-gray-600 font-medium">Short Code</TableHead>
                    <TableHead className="text-gray-600 font-medium">Created</TableHead>
                    <TableHead className="text-gray-600 font-medium">Clicks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedHistory.map((item) => (
                    <TableRow 
                      key={item.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell className="text-gray-700">
                        <a
                          href={item.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 flex items-center gap-1.5 text-sm"
                        >
                          {item.originalUrl.length > 35
                            ? `${item.originalUrl.substring(0, 35)}...`
                            : item.originalUrl}
                          <ExternalLink size={14} className="text-gray-400" />
                        </a>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`${import.meta.env.VITE_API_URL}/${item.shortCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 font-mono text-sm"
                        >
                          {item.shortCode}
                        </a>
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {item.clickCount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent className="gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-9 h-9 flex items-center justify-center rounded-full text-sm ${
                        i + 1 === currentPage
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>
    </div>
  );
}