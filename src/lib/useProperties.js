import { useEffect, useState } from 'react';
import { divic } from './divic-api';
import { PROPERTY_SEED, decorate } from '../data/properties';

/**
 * Property records, live where possible.
 *
 * API.md: "Rates come from the live database, so when the manager changes a price in the
 * PMS the website updates on its own. Do not hardcode prices on the site."
 *
 * So: fetch on mount and let live values win. The seed only renders the site before the
 * API is configured or reachable — `ratesAreLive` says which you are looking at, and the
 * UI marks indicative rates rather than passing them off as current.
 */
export function useProperties() {
  const [state, setState] = useState({
    properties: PROPERTY_SEED.map(decorate),
    ratesAreLive: false,
    loading: divic.configured,
    error: null,
  });

  useEffect(() => {
    if (!divic.configured) return undefined;
    const controller = new AbortController();
    let active = true;

    divic
      .loadProperties({ signal: controller.signal })
      .then((list) => {
        if (!active || !Array.isArray(list) || list.length === 0) return;
        setState({
          properties: list.map(decorate),
          ratesAreLive: true,
          loading: false,
          error: null,
        });
      })
      .catch((err) => {
        if (!active || err.name === 'AbortError') return;
        // Falling back is not a failure the guest needs to see — the site still works,
        // it just shows the last known published rates.
        console.warn('Divic API unavailable, using published rates from API.md:', err.message);
        setState((s) => ({ ...s, loading: false, error: err }));
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  return state;
}
