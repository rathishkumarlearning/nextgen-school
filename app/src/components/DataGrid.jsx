import React, { useMemo } from 'react';

export default function DataGrid({
  columns = [],
  data = [],
  total = 0,
  page = 1,
  pageSize = 20,
  onPageChange,
  onSort,
  sortKey,
  sortDir,
  searchValue = '',
  onSearch,
  searchPlaceholder = 'Search...',
  onRowClick,
  selectable = false,
  selectedIds = new Set(),
  onSelectionChange,
  loading = false,
  emptyMessage = 'No data found',
  actions,
  bulkActions = [],
  filters = [],
  headerExtra,
  onPageSizeChange,
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const allSelected = data.length > 0 && data.every(r => selectedIds.has(r.id));

  const toggleAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      const next = new Set(selectedIds);
      data.forEach(r => next.delete(r.id));
      onSelectionChange(next);
    } else {
      const next = new Set(selectedIds);
      data.forEach(r => next.add(r.id));
      onSelectionChange(next);
    }
  };

  const toggleOne = (id) => {
    if (!onSelectionChange) return;
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    onSelectionChange(next);
  };

  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [page, totalPages]);

  const handleSort = (col) => {
    if (!col.sortable || !onSort) return;
    const dir = sortKey === col.key && sortDir === 'asc' ? 'desc' : 'asc';
    onSort(col.key, dir);
  };

  return (
    <div className="dg-container">
      {/* Header */}
      <div className="dg-header">
        <div className="dg-header-left">
          {onSearch && (
            <div className="dg-search">
              <span className="dg-search-icon">🔍</span>
              <input
                type="text"
                value={searchValue}
                onChange={e => onSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="dg-search-input"
              />
            </div>
          )}
          {filters.map(f => (
            <div key={f.key} className="dg-filter-group">
              {f.options.map(opt => (
                <button
                  key={opt.value}
                  className={`dg-filter-pill ${f.value === opt.value ? 'active' : ''}`}
                  onClick={() => f.onChange(opt.value)}
                >
                  {opt.label}
                  {opt.count != null && <span className="dg-filter-count">{opt.count}</span>}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="dg-header-right">
          {selectable && selectedIds.size > 0 && bulkActions.map((ba, i) => (
            <button
              key={i}
              className={`dg-bulk-btn ${ba.variant || ''}`}
              onClick={() => ba.onClick(selectedIds)}
            >
              {ba.icon && <span>{ba.icon}</span>} {ba.label}
            </button>
          ))}
          {headerExtra}
        </div>
      </div>

      {/* Table */}
      <div className="dg-table-wrap">
        <table className="dg-table">
          <thead>
            <tr>
              {selectable && (
                <th className="dg-th dg-th-check">
                  <label className="dg-checkbox">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                    <span className="dg-checkmark" />
                  </label>
                </th>
              )}
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`dg-th ${col.sortable ? 'sortable' : ''}`}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => handleSort(col)}
                >
                  <span>{col.label}</span>
                  {col.sortable && sortKey === col.key && (
                    <span className="dg-sort-icon">{sortDir === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              ))}
              {actions && <th className="dg-th dg-th-actions">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: pageSize > 5 ? 5 : pageSize }).map((_, i) => (
                <tr key={`skel-${i}`} className="dg-row dg-skeleton-row">
                  {selectable && <td className="dg-td"><div className="dg-skeleton" style={{ width: 18, height: 18 }} /></td>}
                  {columns.map(col => (
                    <td key={col.key} className="dg-td">
                      <div className="dg-skeleton" style={{ width: `${60 + Math.random() * 30}%`, height: 14 }} />
                    </td>
                  ))}
                  {actions && <td className="dg-td"><div className="dg-skeleton" style={{ width: 60, height: 14 }} /></td>}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} className="dg-empty">
                  <div className="dg-empty-inner">
                    <span className="dg-empty-icon">📭</span>
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={row.id || i}
                  className={`dg-row ${i % 2 === 0 ? 'dg-row-even' : ''} ${onRowClick ? 'clickable' : ''} ${selectedIds.has(row.id) ? 'selected' : ''}`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {selectable && (
                    <td className="dg-td dg-td-check" onClick={e => e.stopPropagation()}>
                      <label className="dg-checkbox">
                        <input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleOne(row.id)} />
                        <span className="dg-checkmark" />
                      </label>
                    </td>
                  )}
                  {columns.map(col => (
                    <td key={col.key} className="dg-td">
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                  {actions && (
                    <td className="dg-td dg-td-actions" onClick={e => e.stopPropagation()}>
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="dg-pagination">
          <div className="dg-pagination-info">
            Showing {startItem}–{endItem} of {total}
            {onPageSizeChange && (
              <select
                className="dg-pagesize-select"
                value={pageSize}
                onChange={e => onPageSizeChange(Number(e.target.value))}
              >
                {[10, 20, 50, 100].map(s => (
                  <option key={s} value={s}>{s} / page</option>
                ))}
              </select>
            )}
          </div>
          <div className="dg-pagination-buttons">
            <button className="dg-page-btn" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>‹</button>
            {pageNumbers.map(p => (
              <button
                key={p}
                className={`dg-page-btn ${p === page ? 'active' : ''}`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            ))}
            <button className="dg-page-btn" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>›</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* Utility: Status Badge */
export function StatusBadge({ status }) {
  const colors = {
    active: '#10b981', success: '#10b981', completed: '#10b981',
    failed: '#ef4444', error: '#ef4444',
    pending: '#f59e0b', processing: '#f59e0b',
    deactivated: '#6b7280', inactive: '#6b7280', expired: '#6b7280', depleted: '#6b7280',
    refunded: '#8b5cf6',
  };
  const color = colors[(status || '').toLowerCase()] || '#6b7280';
  return (
    <span className="dg-status-badge" style={{ '--badge-color': color }}>
      {status}
    </span>
  );
}

export function ActionButton({ icon, title, onClick, variant }) {
  return (
    <button
      className={`dg-action-btn ${variant || ''}`}
      title={title}
      onClick={onClick}
    >
      {icon}
    </button>
  );
}
