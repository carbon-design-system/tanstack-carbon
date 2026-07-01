import { describe, expect, it, vi } from 'vitest';
import {
  buildAllFiltersMap,
  buildCustomChangedFilters,
  buildDeltaChangedFilters,
  cloneFilterPayload,
  isEqualFilterValue,
} from '../filterPayloadHelpers';

describe('filterPayloadHelpers', () => {
  it('cloneFilterPayload uses structuredClone when available', () => {
    const originalStructuredClone = globalThis.structuredClone;
    const structuredCloneMock = vi.fn((value) => ({ ...value, cloned: true }));
    globalThis.structuredClone = structuredCloneMock;

    const result = cloneFilterPayload({ a: 1 });

    expect(structuredCloneMock).toHaveBeenCalledWith({ a: 1 });
    expect(result).toEqual({ a: 1, cloned: true });

    globalThis.structuredClone = originalStructuredClone;
  });

  it('cloneFilterPayload falls back to JSON cloning and handles nullish values', () => {
    const originalStructuredClone = globalThis.structuredClone;
    globalThis.structuredClone = undefined;

    expect(cloneFilterPayload({ nested: { a: 1 } })).toEqual({ nested: { a: 1 } });
    expect(cloneFilterPayload(undefined)).toEqual({});

    globalThis.structuredClone = originalStructuredClone;
  });

  it('isEqualFilterValue compares cloned values for equality', () => {
    expect(isEqualFilterValue({ a: [1, 2] }, { a: [1, 2] })).toBe(true);
    expect(isEqualFilterValue({ a: [1, 2] }, { a: [2, 1] })).toBe(false);
  });

  it('buildAllFiltersMap builds a map from filters and supports empty input', () => {
    expect(
      buildAllFiltersMap([
        { id: 'status', value: ['open'] },
        { id: 'priority', value: { min: 1, max: 3 } },
      ])
    ).toEqual({
      status: ['open'],
      priority: { min: 1, max: 3 },
    });

    expect(buildAllFiltersMap()).toEqual({});
  });

  it('buildDeltaChangedFilters returns only changed current filters', () => {
    const currentFilters = [
      { id: 'status', value: ['open'] },
      { id: 'priority', value: { min: 2, max: 4 } },
      { id: 'owner', value: 'alice' },
    ];
    const previousFilters = [
      { id: 'status', value: ['open'] },
      { id: 'priority', value: { min: 1, max: 3 } },
    ];

    expect(buildDeltaChangedFilters(currentFilters, previousFilters)).toEqual([
      { id: 'priority', value: { min: 2, max: 4 } },
      { id: 'owner', value: 'alice' },
    ]);
  });

  it('buildCustomChangedFilters returns changed and removed keys with cloned values', () => {
    const filterValues = {
      status: ['open'],
      owner: { id: 'alice' },
    };
    const previousFilterValues = {
      status: ['closed'],
      owner: { id: 'alice' },
      priority: { min: 1 },
    };

    expect(buildCustomChangedFilters(filterValues, previousFilterValues)).toEqual([
      { id: 'status', value: ['open'] },
      { id: 'priority', value: undefined },
    ]);
  });
});
