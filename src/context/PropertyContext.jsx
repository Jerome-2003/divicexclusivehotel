import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useProperties } from '../lib/useProperties';

const PropertyContext = createContext(null);

const STORAGE_KEY = 'divic:property';
const IDS = ['exclusive', 'urban'];
const isValid = (id) => IDS.includes(id);

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
  const [propertyId, setPropertyId] = useState(readInitial);
  const { properties, ratesAreLive, loading } = useProperties();

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

  const value = useMemo(() => {
    const byId = Object.fromEntries(properties.map((p) => [p.id, p]));
    return {
      propertyId,
      properties,
      byId,
      property: propertyId ? byId[propertyId] : null,
      // before a choice is made, fall back to Exclusive so nothing renders empty
      activeProperty: byId[propertyId || 'exclusive'],
      hasChosen: Boolean(propertyId),
      ratesAreLive,
      loading,
      choose,
    };
  }, [propertyId, properties, ratesAreLive, loading, choose]);

  return <PropertyContext.Provider value={value}>{children}</PropertyContext.Provider>;
}

export function useProperty() {
  const ctx = useContext(PropertyContext);
  if (!ctx) throw new Error('useProperty must be used inside a PropertyProvider');
  return ctx;
}
