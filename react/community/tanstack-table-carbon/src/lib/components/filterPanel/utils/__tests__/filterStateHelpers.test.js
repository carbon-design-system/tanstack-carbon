import { describe, expect, it } from 'vitest';
import {
  getFilterValue,
  isEmptyFilterValue,
  setOrRemoveFilter,
  toggleCheckboxFilterValue,
} from '../filterStateHelpers';

describe('filterStateHelpers', () => {
  it('identifies empty filter values correctly', () => {
    expect(isEmptyFilterValue(undefined)).toBe(true);
    expect(isEmptyFilterValue('')).toBe(true);
    expect(isEmptyFilterValue([])).toBe(true);
    expect(isEmptyFilterValue(['open'])).toBe(false);
    expect(isEmptyFilterValue(0)).toBe(false);
  });

  it('gets a filter value by column id', () => {
    const filters = [
      { id: 'status', value: ['open'] },
      { id: 'owner', value: 'alice' },
    ];

    expect(getFilterValue(filters, 'status')).toEqual(['open']);
    expect(getFilterValue(filters, 'missing')).toBeUndefined();
  });

  it('adds a new filter when value is not empty', () => {
    expect(setOrRemoveFilter([], 'status', 'open')).toEqual([{ id: 'status', value: 'open' }]);
  });

  it('updates an existing filter when value is not empty', () => {
    expect(
      setOrRemoveFilter(
        [
          { id: 'status', value: 'open' },
          { id: 'owner', value: 'alice' },
        ],
        'status',
        'closed'
      )
    ).toEqual([
      { id: 'status', value: 'closed' },
      { id: 'owner', value: 'alice' },
    ]);
  });

  it('removes an existing filter when the next value is empty', () => {
    expect(
      setOrRemoveFilter(
        [
          { id: 'status', value: 'open' },
          { id: 'owner', value: 'alice' },
        ],
        'status',
        ''
      )
    ).toEqual([{ id: 'owner', value: 'alice' }]);
  });

  it('returns filters unchanged when removing a missing filter', () => {
    expect(setOrRemoveFilter([{ id: 'owner', value: 'alice' }], 'status', undefined)).toEqual([
      { id: 'owner', value: 'alice' },
    ]);
  });

  it('adds a checkbox filter when checked and no existing filter is present', () => {
    expect(toggleCheckboxFilterValue([], 'status', 'open', true)).toEqual([
      { id: 'status', value: ['open'] },
    ]);
  });

  it('appends a checkbox value when checked and filter already exists', () => {
    expect(
      toggleCheckboxFilterValue([{ id: 'status', value: ['open'] }], 'status', 'closed', true)
    ).toEqual([{ id: 'status', value: ['open', 'closed'] }]);
  });

  it('removes a checkbox value but keeps the filter when other values remain', () => {
    expect(
      toggleCheckboxFilterValue(
        [{ id: 'status', value: ['open', 'closed'] }],
        'status',
        'open',
        false
      )
    ).toEqual([{ id: 'status', value: ['closed'] }]);
  });

  it('removes the entire checkbox filter when the last value is unchecked', () => {
    expect(
      toggleCheckboxFilterValue([{ id: 'status', value: ['open'] }], 'status', 'open', false)
    ).toEqual([]);
  });

  it('returns filters unchanged when unchecking a missing checkbox filter', () => {
    expect(
      toggleCheckboxFilterValue([{ id: 'owner', value: ['alice'] }], 'status', 'open', false)
    ).toEqual([{ id: 'owner', value: ['alice'] }]);
  });
});
