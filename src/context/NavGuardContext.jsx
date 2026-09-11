import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';

const NavGuardContext = createContext(null);

const DEFAULT_MESSAGE = {
  title: 'Leave without finishing?',
  body: "You haven't finished this yet. If you leave now, what you've entered will be lost.",
  confirmLabel: 'Leave this page',
  cancelLabel: 'Stay on this page',
};

/**
 * Lets a page ask to be warned about before the guest leaves it, as an in-page
 * popup rather than the browser's own dialog — three exit paths, one modal:
 *
 *  · any in-app link (site nav, sidebar, footer) — caught here once, rather
 *    than teaching every nav component about every guarded page.
 *  · the browser's own back/forward button — caught by keeping a sentinel
 *    history entry on top while guarded, so a pop can be turned into a question.
 *  · an actual tab close or refresh — the one case no page can draw its own UI
 *    over, since the browser is closing itself. That still falls back to the
 *    browser's native prompt, wired only while a guard is active.
 */
export function NavGuardProvider({ children }) {
  const navigate = useNavigate();
  const [pending, setPending] = useState(null); // { to: string | -1 } | null
  const guardRef = useRef(null); // { message } | null
  const [, bump] = useState(0);

  const setGuard = useCallback((message) => {
    const wasActive = Boolean(guardRef.current);
    guardRef.current = message ? { message } : null;
    if (message && !wasActive) {
      // So the very first back-press lands on a popstate this can intercept,
      // instead of leaving before anyone gets asked.
      window.history.pushState(null, '', window.location.href);
    }
    bump((n) => n + 1);
  }, []);

  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (!guardRef.current) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      if (!guardRef.current) return;
      window.history.pushState(null, '', window.location.href);
      setPending({ to: -1 });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (!guardRef.current) return;
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest('a');
      if (!a || !a.href) return;
      if (a.target && a.target !== '_self') return;
      if (a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      e.preventDefault();
      setPending({ to: url.pathname + url.search + url.hash });
    };
    // Capture phase: this has to see the click before react-router's own
    // Link handler does, so it can preventDefault ahead of the navigation.
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  const confirmLeave = useCallback(() => {
    const to = pending?.to;
    guardRef.current = null;
    setPending(null);
    bump((n) => n + 1);
    if (to === -1) window.history.back();
    else if (typeof to === 'string') navigate(to);
  }, [pending, navigate]);

  const cancelLeave = useCallback(() => setPending(null), []);

  const message = guardRef.current?.message || DEFAULT_MESSAGE;

  return (
    <NavGuardContext.Provider value={{ setGuard }}>
      {children}
      {pending && (
        <ConfirmModal
          title={message.title}
          body={message.body}
          confirmLabel={message.confirmLabel}
          cancelLabel={message.cancelLabel}
          onConfirm={confirmLeave}
          onCancel={cancelLeave}
        />
      )}
    </NavGuardContext.Provider>
  );
}

/** A page calls this with `active` true while it holds unsaved/unsent input. */
export function useNavGuard(active, message) {
  const ctx = useContext(NavGuardContext);
  if (!ctx) throw new Error('useNavGuard must be used inside a NavGuardProvider');
  const { setGuard } = ctx;

  useEffect(() => {
    setGuard(active ? message || DEFAULT_MESSAGE : null);
    return () => setGuard(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, setGuard]);
}
