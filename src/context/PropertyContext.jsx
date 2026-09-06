import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { PROPERTIES } from '../data/properties';

const PropertyContext = createContext(null);

const STORAGE_KEY = 'divic:property';
const isValid = (id) => Boolean(id && PROPERTIES[id]);

function readInitial() {
  if (typeof window === 'undefined') return null;
  const fromUrl = new URLSearchParams(window.location.search).get('property');
  if (isValid(fromUrl)) return fromUrl;
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (isValid(saved)) return saved;
  } catch {
    /* private browsing */
  }
  return null;
}

export function PropertyProvider({ children }) {
  // null means the guest has not chosen yet, which is what raises the gate
  const [propertyId, setPropertyId] = useState(readInitial);

  // The document carries the active property so CSS resolves one accent for the whole
  // tree. No component needs to know which property it is rendering.
  useEffect(() => {
    document.documentElement.dataset.property = propertyId || 'exclusive';
  }, [propertyId]);

  const choose = useCallback((id, { remember = true } = {}) => {
    if (!isValid(id)) return;
    setPropertyId(id);
    if (remember) {
      try {
        sessionStorage.setItem(STORAGE_KEY, id);
      } catch {
        /* private browsing */
      }
      const url = new URL(window.location.href);
      url.searchParams.set('property', id);
      window.history.replaceState(null, '', url);
    }
  }, []);

  const clear = useCallback(() => {
    setPropertyId(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* private browsing */
    }
    const url = new URL(window.location.href);
    url.searchParams.delete('property');
    window.history.replaceState(null, '', url);
  }, []);

  const value = useMemo(
    () => ({
      propertyId,
      property: propertyId ? PROPERTIES[propertyId] : null,
      // before a choice is made, fall back to Exclusive so nothing renders empty
      activeProperty: PROPERTIES[propertyId || 'exclusive'],
      hasChosen: Boolean(propertyId),
      choose,
      clear,
    }),
    [propertyId, choose, clear],
  );

  return <PropertyContext.Provider value={value}>{children}</PropertyContext.Provider>;
}

export function useProperty() {
  const ctx = useContext(PropertyContext);
  if (!ctx) throw new Error('useProperty must be used inside a PropertyProvider');
  return ctx;
}
