import { useState } from 'react';
import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Button from './Button';

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  pagination = true,
  pageSize = 10,
  currentPage = 1,
  totalItems = 0,
  onPageChange,
  onSort,
  sortBy,
  sortOrder = 'asc',
  selectable = false,
  onSelectionChange,
  actions,
  stickyHeader = false,
  maxHeight = '500px',
  onRowClick,
}) {
  const [selectedRows, setSelectedRows] = useState(new Set());

  const totalPages = Math.ceil(totalItems / pageSize);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(new Set(data.map((_, idx) => idx)));
    } else {
      setSelectedRows(new Set());
    }
    onSelectionChange?.(checked ? data : []);
  };

  const handleSelectRow = (index, checked) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(index);
    } else {
      newSelected.delete(index);
    }
    setSelectedRows(newSelected);
    onSelectionChange?.(data.filter((_, idx) => newSelected.has(idx)));
  };

  const handleSort = (column) => {
    if (!column.sortable) return;
    const newOrder = sortBy === column.key && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort?.(column.key, newOrder);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className={clsx("w-full", stickyHeader && "h-full flex flex-col")}>
      {/* Actions */}
      {actions && selectedRows.size > 0 && (
        <div className="mb-4 p-3 bg-primary-50 rounded-md flex items-center justify-between flex-shrink-0">
          <span className="text-sm text-primary-700">
            {selectedRows.size} item dipilih
          </span>
          <div className="flex gap-2">{actions}</div>
        </div>
      )}

      {/* Table */}
      <div
        className={clsx(
          "overflow-x-auto border border-gray-200 rounded-lg",
          stickyHeader && "overflow-y-auto flex-1"
        )}
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={clsx(
            "bg-gray-50",
            stickyHeader && "sticky top-0 z-10 shadow-sm"
          )}>
            <tr>
              {selectable && (
                <th className="w-12 px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === data.length && data.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={clsx(
                    'px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.sortable && 'cursor-pointer hover:bg-gray-100',
                    column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left',
                    column.width && `w-[${column.width}]`
                  )}
                  style={column.width ? { width: column.width } : undefined}
                  onClick={() => handleSort(column)}
                >
                  {column.align === 'center' ? (
                    <span>{column.label}</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && sortBy === column.key && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  Tidak ada data
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={clsx(
                    'hover:bg-gray-50 transition-colors',
                    selectedRows.has(rowIndex) && 'bg-primary-50',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(row, rowIndex)}
                >
                  {selectable && (
                    <td className="px-4 py-1.5">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(rowIndex)}
                        onChange={(e) => handleSelectRow(rowIndex, e.target.checked)}
                        className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={clsx(
                        column.className || 'px-4 py-1.5 text-sm text-gray-900',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                    >
                      {column.render
                        ? column.render(row[column.key], row, rowIndex)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Menampilkan {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalItems)} dari {totalItems} data
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Halaman Pertama"
            >
              <ChevronsLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>

            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={clsx(
                      "min-w-[28px] h-7 px-2 text-xs rounded transition-colors",
                      currentPage === pageNum
                        ? "bg-primary-500 text-white font-medium"
                        : "hover:bg-gray-100 text-gray-700"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Selanjutnya"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Halaman Terakhir"
            >
              <ChevronsRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <div className="text-xs text-gray-500">
            Halaman {currentPage} dari {totalPages}
          </div>
        </div>
      )}
    </div>
  );
}
