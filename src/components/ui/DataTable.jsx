import { useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Button from './Button';

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  searchPlaceholder,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [internalSortBy, setInternalSortBy] = useState(undefined);
  const [internalSortOrder, setInternalSortOrder] = useState('asc');

  const effectiveSortBy = sortBy ?? internalSortBy;
  const effectiveSortOrder = sortBy ? sortOrder : internalSortOrder;

  const normalizedColumns = useMemo(() => {
    return columns
      .map((col, index) => {
        const key = col.key ?? col.accessorKey;
        const label = col.label ?? col.header;
        const render =
          col.render ??
          (typeof col.cell === 'function'
            ? (value, row, rowIndex) =>
              col.cell({
                row: { original: row },
                getValue: () => value,
                rowIndex,
              })
            : undefined);

        return {
          ...col,
          key: key ?? `col_${index}`,
          label: label ?? '',
          render,
          sortable: col.sortable ?? (key !== 'actions'),
        };
      })
      .filter(Boolean);
  }, [columns]);

  const filteredData = useMemo(() => {
    const base = (() => {
      if (!searchPlaceholder) return data;
      const q = (searchQuery || '').trim().toLowerCase();
      if (!q) return data;
      return data.filter((row) => {
        try {
          return JSON.stringify(row).toLowerCase().includes(q);
        } catch {
          return false;
        }
      });
    })();

    if (!effectiveSortBy) return base;

    const sorted = [...base].sort((a, b) => {
      const av = a?.[effectiveSortBy];
      const bv = b?.[effectiveSortBy];

      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;

      const an = typeof av === 'number' ? av : Number(av);
      const bn = typeof bv === 'number' ? bv : Number(bv);
      const bothNumeric = Number.isFinite(an) && Number.isFinite(bn);

      if (bothNumeric) return an - bn;

      return String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: 'base' });
    });

    return effectiveSortOrder === 'desc' ? sorted.reverse() : sorted;
  }, [data, searchPlaceholder, searchQuery, effectiveSortBy, effectiveSortOrder]);

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
    if (onSort) {
      const newOrder = sortBy === column.key && sortOrder === 'asc' ? 'desc' : 'asc';
      onSort(column.key, newOrder);
      return;
    }

    const newOrder = internalSortBy === column.key && internalSortOrder === 'asc' ? 'desc' : 'asc';
    setInternalSortBy(column.key);
    setInternalSortOrder(newOrder);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className={clsx("w-full", stickyHeader && "h-full flex flex-col min-h-0")}>
      {/* Search */}
      {searchPlaceholder && (
        <div className="mb-3 flex items-center gap-3 flex-shrink-0">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className={clsx(
              'w-full px-3 py-2 h-[42px] border rounded-md transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'border-gray-300'
            )}
          />
        </div>
      )}

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
          "border border-gray-200 rounded-lg",
          stickyHeader ? "flex-1 overflow-hidden min-h-0" : "overflow-x-auto"
        )}
        style={stickyHeader ? { maxHeight } : undefined}
      >
        <div className={clsx(stickyHeader ? "h-full overflow-auto" : "")}>
          <table className={clsx("min-w-full divide-y divide-gray-200", stickyHeader && "relative")}>
            <thead className={clsx(
              "bg-gray-50",
              stickyHeader && "sticky top-0 z-10"
            )}>
              <tr>
                {selectable && (
                  <th className="w-12 px-3 py-2.5 bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === data.length && data.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                    />
                  </th>
                )}
                {normalizedColumns.map((column) => (
                  <th
                    key={column.key}
                    className={clsx(
                      'px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50',
                      column.sortable && 'cursor-pointer hover:bg-gray-100',
                      column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left',
                      column.width && `w-[${column.width}]`
                    )}
                    style={column.width ? { width: column.width, minWidth: column.width } : undefined}
                    onClick={() => handleSort(column)}
                  >
                    {column.align === 'center' ? (
                      <span>{column.label}</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        {column.label}
                        {column.sortable && effectiveSortBy === column.key && (
                          <span>{effectiveSortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={normalizedColumns.length + (selectable ? 1 : 0)}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                filteredData.map((row, rowIndex) => (
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
                    {normalizedColumns.map((column) => (
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
      </div>
    </div>
  );
}
