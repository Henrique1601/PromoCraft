'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { FilterState } from '@/components/SidebarFilters';

export const INITIAL_FILTERS: FilterState = {
  search: '',
  store: '',
  sortBy: 'Deal Rating',
  underPrice: '',
  onlyFree: false,
  page: 0,
  pageSize: 32,
  minRating: '',
  onlyAAA: false,
  topic: 'all',
};

export interface CatalogFilterContextType {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  applyFilters: (updates: Partial<FilterState>) => void;
  resetAllFilters: () => void;
  activeFiltersCount: number;
}

const CatalogFilterContext = createContext<CatalogFilterContextType | null>(null);

export function CatalogFilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  const applyFilters = useCallback((updates: Partial<FilterState>) => {
    setFilters((prev) => {
      const shouldResetPage =
        updates.page === undefined &&
        (updates.search !== undefined ||
          updates.store !== undefined ||
          updates.underPrice !== undefined ||
          updates.topic !== undefined ||
          updates.onlyAAA !== undefined ||
          updates.onlyFree !== undefined ||
          updates.minRating !== undefined ||
          updates.sortBy !== undefined);

      return {
        ...prev,
        ...updates,
        page: shouldResetPage ? 0 : (updates.page ?? prev.page),
      };
    });
  }, []);

  const resetAllFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  const activeFiltersCount = [
    Boolean(filters.search.trim()),
    Boolean(filters.store),
    Boolean(filters.underPrice),
    Boolean(filters.onlyFree),
    Boolean(filters.minRating),
    Boolean(filters.onlyAAA),
    Boolean(filters.topic && filters.topic !== 'all'),
  ].filter(Boolean).length;

  return (
    <CatalogFilterContext.Provider
      value={{
        filters,
        setFilters,
        applyFilters,
        resetAllFilters,
        activeFiltersCount,
      }}
    >
      {children}
    </CatalogFilterContext.Provider>
  );
}

export function useCatalogFilters() {
  return useContext(CatalogFilterContext);
}
