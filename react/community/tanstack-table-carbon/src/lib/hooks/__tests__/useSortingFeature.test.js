import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useSortingFeature } from '../useSortingFeature';

describe('useSortingFeature', () => {
  describe('Uncontrolled Mode', () => {
    it('should initialize with empty sorting', () => {
      const { result } = renderHook(() => useSortingFeature({}));

      expect(result.current.sorting).toEqual([]);
      expect(result.current.isControlledSorting).toBe(false);
      expect(result.current.isServerSideSorting).toBe(false);
    });

    it('should initialize with provided sorting', () => {
      const initialSorting = [{ id: 'name', desc: false }];
      const { result } = renderHook(() => useSortingFeature({ sorting: initialSorting }));

      expect(result.current.sorting).toEqual(initialSorting);
    });

    it('should update sorting state', () => {
      const { result } = renderHook(() => useSortingFeature({}));

      const newSorting = [{ id: 'age', desc: true }];

      act(() => {
        result.current.handleSortingChange(newSorting);
      });

      expect(result.current.sorting).toEqual(newSorting);
    });

    it('should handle function updater', () => {
      const initialSorting = [{ id: 'name', desc: false }];
      const { result } = renderHook(() => useSortingFeature({ sorting: initialSorting }));

      act(() => {
        result.current.handleSortingChange((prev) => [...prev, { id: 'age', desc: true }]);
      });

      expect(result.current.sorting).toEqual([
        { id: 'name', desc: false },
        { id: 'age', desc: true },
      ]);
    });

    it('should handle multiple sorting columns', () => {
      const { result } = renderHook(() => useSortingFeature({}));

      act(() => {
        result.current.handleSortingChange([
          { id: 'name', desc: false },
          { id: 'age', desc: true },
          { id: 'email', desc: false },
        ]);
      });

      expect(result.current.sorting).toHaveLength(3);
    });

    it('should clear sorting', () => {
      const initialSorting = [{ id: 'name', desc: false }];
      const { result } = renderHook(() => useSortingFeature({ sorting: initialSorting }));

      act(() => {
        result.current.handleSortingChange([]);
      });

      expect(result.current.sorting).toEqual([]);
    });
  });

  describe('Controlled Mode', () => {
    it('should detect controlled mode when onChange is provided', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useSortingFeature({ onChange }));

      expect(result.current.isControlledSorting).toBe(true);
      expect(result.current.isServerSideSorting).toBe(true);
    });

    it('should call onChange instead of updating state', () => {
      const onChange = vi.fn();
      const initialSorting = [{ id: 'name', desc: false }];
      const { result } = renderHook(() => useSortingFeature({ sorting: initialSorting, onChange }));

      const newSorting = [{ id: 'age', desc: true }];

      act(() => {
        result.current.handleSortingChange(newSorting);
      });

      expect(onChange).toHaveBeenCalledWith(newSorting);
      expect(result.current.sorting).toEqual(initialSorting);
    });

    it('should call onChange with function updater result', () => {
      const onChange = vi.fn();
      const initialSorting = [{ id: 'name', desc: false }];
      const { result } = renderHook(() => useSortingFeature({ sorting: initialSorting, onChange }));

      act(() => {
        result.current.handleSortingChange((prev) => [...prev, { id: 'age', desc: true }]);
      });

      expect(onChange).toHaveBeenCalledWith([
        { id: 'name', desc: false },
        { id: 'age', desc: true },
      ]);
    });

    it('should update sorting when controlled sorting prop changes', () => {
      const onChange = vi.fn();
      const initialSorting = [{ id: 'name', desc: false }];
      const { result, rerender } = renderHook(
        ({ sorting }) => useSortingFeature({ sorting, onChange }),
        { initialProps: { sorting: initialSorting } }
      );

      expect(result.current.sorting).toEqual(initialSorting);

      const newSorting = [{ id: 'age', desc: true }];
      rerender({ sorting: newSorting });

      expect(result.current.sorting).toEqual(newSorting);
    });

    it('should handle clearing sorting in controlled mode', () => {
      const onChange = vi.fn();
      const initialSorting = [{ id: 'name', desc: false }];
      const { result } = renderHook(() => useSortingFeature({ sorting: initialSorting, onChange }));

      act(() => {
        result.current.handleSortingChange([]);
      });

      expect(onChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null sortingFeature', () => {
      const { result } = renderHook(() => useSortingFeature(null));

      expect(result.current.sorting).toEqual([]);
      expect(result.current.isControlledSorting).toBe(false);
    });

    it('should handle undefined sortingFeature', () => {
      const { result } = renderHook(() => useSortingFeature(undefined));

      expect(result.current.sorting).toEqual([]);
      expect(result.current.isControlledSorting).toBe(false);
    });

    it('should handle empty sortingFeature object', () => {
      const { result } = renderHook(() => useSortingFeature({}));

      expect(result.current.sorting).toEqual([]);
      expect(result.current.isControlledSorting).toBe(false);
    });

    it('should handle sorting with undefined controlled sorting', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useSortingFeature({ sorting: undefined, onChange }));

      expect(result.current.sorting).toEqual([]);
    });

    it('should not update state when controlled sorting is undefined', () => {
      const { result, rerender } = renderHook(({ sorting }) => useSortingFeature({ sorting }), {
        initialProps: { sorting: [{ id: 'name', desc: false }] },
      });

      expect(result.current.sorting).toEqual([{ id: 'name', desc: false }]);

      rerender({ sorting: undefined });

      // NOTE: Should keep previous sorting when new sorting is undefined
      expect(result.current.sorting).toEqual([{ id: 'name', desc: false }]);
    });
  });

  describe('Sorting Direction', () => {
    it('should handle ascending sort', () => {
      const { result } = renderHook(() => useSortingFeature({}));

      act(() => {
        result.current.handleSortingChange([{ id: 'name', desc: false }]);
      });

      expect(result.current.sorting[0].desc).toBe(false);
    });

    it('should handle descending sort', () => {
      const { result } = renderHook(() => useSortingFeature({}));

      act(() => {
        result.current.handleSortingChange([{ id: 'name', desc: true }]);
      });

      expect(result.current.sorting[0].desc).toBe(true);
    });

    it('should toggle sort direction', () => {
      const { result } = renderHook(() => useSortingFeature({}));

      act(() => {
        result.current.handleSortingChange([{ id: 'name', desc: false }]);
      });

      expect(result.current.sorting[0].desc).toBe(false);

      act(() => {
        result.current.handleSortingChange([{ id: 'name', desc: true }]);
      });

      expect(result.current.sorting[0].desc).toBe(true);
    });
  });

  describe('Multiple Columns Sorting', () => {
    it('should handle adding second sort column', () => {
      const { result } = renderHook(() => useSortingFeature({}));

      act(() => {
        result.current.handleSortingChange([{ id: 'name', desc: false }]);
      });

      act(() => {
        result.current.handleSortingChange((prev) => [...prev, { id: 'age', desc: true }]);
      });

      expect(result.current.sorting).toEqual([
        { id: 'name', desc: false },
        { id: 'age', desc: true },
      ]);
    });

    it('should handle removing sort column', () => {
      const initialSorting = [
        { id: 'name', desc: false },
        { id: 'age', desc: true },
      ];
      const { result } = renderHook(() => useSortingFeature({ sorting: initialSorting }));

      act(() => {
        result.current.handleSortingChange([{ id: 'name', desc: false }]);
      });

      expect(result.current.sorting).toEqual([{ id: 'name', desc: false }]);
    });
  });
});
