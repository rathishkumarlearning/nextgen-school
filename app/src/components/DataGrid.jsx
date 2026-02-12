import React, { useMemo, useState, useEffect, useRef } from 'react';

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
  searchPlaceholder = 'Search…',
  onRowClick,
  selectable = false,
  selectedIds = new Set(),
  onSelectionChange,
  loading = false,
  emptyMessage = 'No data found',
  emptyIcon = '📭',
  actions,
  bulkActions = [],
  filters = [],
  headerExtra,
  onPageSizeChange,
  onExport,
  title,
  subtitle,
  totalsRow,
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);
  const allSelected = data.length > 0 && data.every(r => selectedIds.has(r.id));
  const wrapRef = useRef(null);

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
      {/* Title bar */}
      {(title || subtitle) && (
        <div className="dg-title-bar">
          {title && <h3 className="dg-title">{title}</h3>}
          {subtitle && <span className="dg-subtitle">{subtitle}</span>}
        </div>
      )}

      {/* Header */}
      <div className="dg-header">
        <div className="dg-header-left">
          {onSearch && (
            <div className="dg-search">
              <svg className="dg-search-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
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
          {selectable && selectedIds.size > 0 && (
            <span className="dg-selected-count">{selectedIds.size} selected</span>
          )}
          {selectable && selectedIds.size > 0 && bulkActions.map((ba, i) => (
            <button
              key={i}
              className={`dg-bulk-btn ${ba.variant || ''}`}
              onClick={() => ba.onClick(selectedIds)}
            >
              {ba.icon && <span>{ba.icon}</span>} {ba.label}
            </button>
          ))}
          {onExport && (
            <button className="dg-bulk-btn" onClick={onExport}>
              <span>📥</span> Export
            </button>
          )}
          {headerExtra}
        </div>
      </div>

      {/* Table */}
      <div className="dg-table-wrap" ref={wrapRef}>
        <table className="dg-table">
          <thead>
            <tr>
              {selectable && (
                <th className="dg-th dg-th-check dg-sticky-col">
                  <label className="dg-checkbox">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                    <span className="dg-checkmark" />
                  </label>
                </th>
              )}
              {columns.map((col, ci) => (
                <th
                  key={col.key}
                  className={`dg-th ${col.sortable ? 'sortable' : ''} ${ci === 0 && !selectable ? 'dg-sticky-col' : ''}`}
                  style={col.width ? { width: col.width, minWidth: col.width } : undefined}
                  onClick={() => handleSort(col)}
                >
                  <span className="dg-th-label">{col.label}</span>
                  {col.sortable && (
                    <span className={`dg-sort-icon ${sortKey === col.key ? 'active' : ''}`}>
                      {sortKey === col.key ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  )}
                </th>
              ))}
              {actions && <th className="dg-th dg-th-actions">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: Math.min(pageSize, 8) }).map((_, i) => (
                <tr key={`skel-${i}`} className="dg-row dg-skeleton-row">
                  {selectable && <td className="dg-td"><div className="dg-skeleton dg-skel-check" /></td>}
                  {columns.map(col => (
                    <td key={col.key} className="dg-td">
                      <div className="dg-skeleton" style={{ width: `${50 + Math.random() * 40}%` }} />
                    </td>
                  ))}
                  {actions && <td className="dg-td"><div className="dg-skeleton" style={{ width: 60 }} /></td>}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} className="dg-empty">
                  <div className="dg-empty-inner">
                    <span className="dg-empty-icon">{emptyIcon}</span>
                    <p className="dg-empty-msg">{emptyMessage}</p>
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
                    <td className="dg-td dg-td-check dg-sticky-col" onClick={e => e.stopPropagation()}>
                      <label className="dg-checkbox">
                        <input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleOne(row.id)} />
                        <span className="dg-checkmark" />
                      </label>
                    </td>
                  )}
                  {columns.map((col, ci) => (
                    <td key={col.key} className={`dg-td ${ci === 0 && !selectable ? 'dg-sticky-col' : ''}`}>
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
            {totalsRow && !loading && data.length > 0 && (
              <tr className="dg-row dg-totals-row">
                {selectable && <td className="dg-td" />}
                {columns.map(col => (
                  <td key={col.key} className="dg-td dg-td-total">
                    {totalsRow[col.key] ?? ''}
                  </td>
                ))}
                {actions && <td className="dg-td" />}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="dg-pagination">
          <div className="dg-pagination-info">
            <span className="dg-pagination-text">
              Showing <strong>{startItem}</strong>–<strong>{endItem}</strong> of <strong>{total.toLocaleString()}</strong>
            </span>
            {onPageSizeChange && (
              <select
                className="dg-pagesize-select"
                value={pageSize}
                onChange={e => onPageSizeChange(Number(e.target.value))}
              >
                {[10, 25, 50, 100].map(s => (
                  <option key={s} value={s}>{s} / page</option>
                ))}
              </select>
            )}
          </div>
          <div className="dg-pagination-buttons">
            <button className="dg-page-btn" disabled={page <= 1} onClick={() => onPageChange(1)} title="First">«</button>
            <button className="dg-page-btn" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>‹</button>
            {pageNumbers[0] > 1 && <span className="dg-page-dots">…</span>}
            {pageNumbers.map(p => (
              <button
                key={p}
                className={`dg-page-btn ${p === page ? 'active' : ''}`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            ))}
            {pageNumbers[pageNumbers.length - 1] < totalPages && <span className="dg-page-dots">…</span>}
            <button className="dg-page-btn" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>›</button>
            <button className="dg-page-btn" disabled={page >= totalPages} onClick={() => onPageChange(totalPages)} title="Last">»</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* Utility: Status Badge */
export function StatusBadge({ status, size = 'sm' }) {
  const colors = {
    active: '#10b981', success: '#10b981', completed: '#10b981', granted: '#10b981',
    failed: '#ef4444', error: '#ef4444', cancelled: '#ef4444', revoked: '#ef4444',
    pending: '#f59e0b', processing: '#f59e0b', depleted: '#f59e0b',
    inactive: '#6b7280', expired: '#6b7280', deactivated: '#6b7280',
    refunded: '#8b5cf6',
    admin: '#8b5cf6', parent: '#3b82f6', child: '#06b6d4',
  };
  const color = colors[(status || '').toLowerCase()] || '#6b7280';
  return (
    <span className={`dg-status-badge dg-badge-${size}`} style={{ '--badge-color': color }}>
      <span className="dg-badge-dot" />
      {status}
    </span>
  );
}

export function ActionButton({ icon, title, onClick, variant = '', disabled = false }) {
  return (
    <button
      className={`dg-action-btn ${variant}`}
      title={title}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
    </button>
  );
}

/* Modal component */
export function Modal({ open, onClose, title, children, width = '520px' }) {
  if (!open) return null;
  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal glass-card" style={{ maxWidth: width }} onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 style={{ margin: 0, fontSize: '16px', color: '#fff' }}>{title}</h3>
          <button className="admin-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="admin-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

/* Animated counter */
export function AnimatedNumber({ value, prefix = '', suffix = '', duration = 800 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const target = Number(value) || 0;
    const start = display;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (target - start) * eased));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };

    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [value]);

  return (
    <span className="dg-animated-number">
      {prefix}{display.toLocaleString()}{suffix}
    </span>
  );
}
