import { useEffect, useRef, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Search,
  SearchX,
  X,
} from 'lucide-react';
import { initials } from '../../utils/helpers.js';
export function Button({
  children,
  variant = 'primary',
  className = '',
  loading = false,
  ...props
}) {
  return (
    <button
      className={`btn btn-${variant} ${className}`}
      {...props}
      disabled={loading || props.disabled}
    >
      {loading && <LoaderCircle size={17} className="spin" />}
      {children}
    </button>
  );
}
export function ButtonLink({
  children,
  to,
  variant = 'primary',
  className = '',
  ...props
}) {
  return (
    <Link to={to} className={`btn btn-${variant} ${className}`} {...props}>
      {children}
    </Link>
  );
}
export function Input({ label, error, className = '', ...props }) {
  const id = useId();
  return (
    <label className={`field ${className}`} htmlFor={id}>
      {label && <span>{label}</span>}
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? id + '-error' : undefined}
        {...props}
      />
      {error && (
        <small className="error" id={id + '-error'}>
          {error}
        </small>
      )}
    </label>
  );
}
export function Select({ label, children, className = '', ...props }) {
  const id = useId();
  return (
    <label className={`field ${className}`} htmlFor={id}>
      {label && <span>{label}</span>}
      <select id={id} {...props}>
        {children}
      </select>
    </label>
  );
}
export function Textarea({ label, ...props }) {
  const id = useId();
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <textarea id={id} rows={4} {...props} />
    </label>
  );
}
export function Card({ children, className = '', ...props }) {
  return (
    <section className={`card ${className}`} {...props}>
      {children}
    </section>
  );
}
export function Badge({ children, tone = 'neutral' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
export function Avatar({ name, src, size = 'normal' }) {
  return src ? (
    <img className={`avatar avatar-${size}`} src={src} alt={name} />
  ) : (
    <span className={`avatar avatar-${size}`} aria-label={name}>
      {initials(name)}
    </span>
  );
}
export function CompanyLogo({ company, size = '' }) {
  if (company?.picture)
    return (
      <img
        className={`company-logo ${size}`}
        src={company.picture}
        alt={`${company.name} logo`}
      />
    );
  return (
    <span
      className={`company-logo ${size}`}
      style={{ background: company?.color || 'var(--color-primary)' }}
      aria-label={`${company?.name || 'Company'} logo`}
    >
      {company?.mark || company?.name?.[0] || 'I'}
    </span>
  );
}
export function EmptyState({
  title = 'Nothing here yet',
  description = 'Your next chapter is just getting started.',
  action,
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <SearchX size={28} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function LoadingSpinner() {
  return (
    <div className="loading" role="status">
      <LoaderCircle className="spin" />
      <span>Getting things ready…</span>
    </div>
  );
}
export function Skeleton({ count = 3 }) {
  return (
    <div className="job-grid" aria-label="Loading opportunities" role="status">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card skeleton">
          <div />
          <div />
          <div />
          <div />
        </div>
      ))}
    </div>
  );
}
export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function SectionHeader({
  eyebrow,
  title,
  description,
  to,
  link = 'View all',
  children,
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {to && (
        <Link className="text-link" to={to}>
          {link}
          <ArrowRight size={17} />
        </Link>
      )}
      {children}
    </div>
  );
}
export function Modal({ open, onClose, title, children }) {
  const ref = useRef();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    const key = (e) => {
      if (e.key === 'Escape') onCloseRef.current();
      if (e.key === 'Tab') {
        const els = ref.current.querySelectorAll(
          'button:not(:disabled),a[href],input:not(:disabled),select,textarea,[tabindex="0"]',
        );
        const first = els[0],
          last = els[els.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first || document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', key);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener('keydown', key);
      prev?.focus();
    };
  }, [open]);
  if (!open) return null;
  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        ref={ref}
        tabIndex={-1}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="modal-heading">
          <h2 id={titleId}>{title}</h2>
          <button
            type="button"
            className="icon-btn"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  loading,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="muted">{description}</p>
      <div className="form-actions">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" loading={loading} onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </Modal>
  );
}
export function Pagination({ page, total, onChange }) {
  if (total <= 1) return null;
  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        aria-label="Previous page"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft size={18} />
      </button>
      {Array.from({ length: total }, (_, i) => (
        <button
          aria-label={`Page ${i + 1}`}
          aria-current={page === i + 1 ? 'page' : undefined}
          className={page === i + 1 ? 'selected' : ''}
          key={i}
          onClick={() => onChange(i + 1)}
        >
          {i + 1}
        </button>
      ))}
      <button
        aria-label="Next page"
        disabled={page === total}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}
export function SearchBar({ value, onChange, placeholder = 'Search opportunities…' }) {
  return (
    <label className="search-input">
      <Search size={18} />
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
export function Dropdown({ label, children }) {
  return (
    <details className="dropdown">
      <summary>
        {label}
        <ChevronDown size={15} />
      </summary>
      <div className="dropdown-content">{children}</div>
    </details>
  );
}
export function SkillTags({ value, onChange }) {
  const [text, setText] = useState('');
  const add = () => {
    const clean = text.trim();
    if (clean && !value.includes(clean)) onChange([...value, clean]);
    setText('');
  };
  return (
    <div className="field">
      <span>Skills</span>
      <div className="skill-editor">
        {value.map((s) => (
          <span key={s} className="badge">
            {s}
            <button
              type="button"
              aria-label={`Remove ${s}`}
              onClick={() => onChange(value.filter((x) => x !== s))}
            >
              <X size={13} />
            </button>
          </span>
        ))}
        <input
          aria-label="Add skill"
          placeholder="Add a skill, press Enter"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={add}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add();
            }
          }}
        />
      </div>
    </div>
  );
}
