import { useEffect } from 'react';

/**
 * The site's one confirm/cancel dialog, shared by anything that needs to ask
 * "are you sure" — the exit guard in NavGuardContext today, possibly more later.
 *
 * Visually it is SiteNotices' Popup: same backdrop, same card, same button
 * pair. z-[100] puts it above every other fixed layer on the site (the header
 * and SiteNotices' own popup sit at z-50, the mobile menu at z-60) — so a
 * hero section or anything else already on screen can never sit over it, and
 * the dimmed backdrop leaves it the only thing that reads as active.
 */
export default function ConfirmModal({
  title,
  body,
  confirmLabel = 'Leave this page',
  cancelLabel = 'Stay on this page',
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 p-5"
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div role="alertdialog" aria-modal="true" aria-label={title} className="w-full max-w-sm bg-shell p-8">
        <h2 className="font-display text-d3">{title}</h2>
        {body && <p className="prose-body mt-3 text-sm">{body}</p>}
        <div className="mt-7 flex flex-wrap gap-4">
          {/* Staying is the safe default, so it gets the solid button and the focus. */}
          <button type="button" onClick={onCancel} className="btn btn-solid" autoFocus>
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} className="btn btn-outline">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
