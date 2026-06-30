import { describe, expect, it, vi } from 'vitest';
import useFilterSidePanelController from '../useFilterSidePanelController';

vi.mock('react', async () => {
  const actual = await vi.importActual('react');

  return {
    ...actual,
    useState: (initial) => [initial, vi.fn()],
    useRef: (initial) => ({ current: initial }),
    useEffect: vi.fn(),
    useCallback: (fn) => fn,
  };
});

describe('useFilterSidePanelController', () => {
  it('returns handlers and calls apply/clear callbacks', () => {
    const onApplyFilters = vi.fn();
    const onClearFilters = vi.fn();
    const onSidePanelApply = vi.fn();
    const onSidePanelReset = vi.fn();

    function useApplyScenario() {
      return useFilterSidePanelController({
        columnFilters: [{ id: 'status', value: 'active' }],
        onApplyFilters,
        onClearFilters,
        onSidePanelApply,
        onSidePanelReset,
      });
    }

    expect(useApplyScenario().getFilterValue('status')).toBe('active');

    useApplyScenario().handleApply();
    useApplyScenario().handleClearAll();

    expect(onApplyFilters).toHaveBeenCalledWith([{ id: 'status', value: 'active' }]);
    expect(onClearFilters).toHaveBeenCalledTimes(1);
    expect(onSidePanelApply).toHaveBeenCalledWith({
      changedFilters: [{ id: 'status', value: 'active' }],
    });
    expect(onSidePanelReset).toHaveBeenCalledWith({
      changedFilters: [],
    });
  });

  it('calls custom filter callbacks and optional branches', () => {
    const onCustomFiltersApply = vi.fn();
    const onCustomFiltersReset = vi.fn();
    const resetFilters = vi.fn(() => ({ owner: 'team-b' }));

    function useCustomScenario() {
      return useFilterSidePanelController({
        columnFilters: [],
        onApplyFilters: vi.fn(),
        onClearFilters: vi.fn(),
        onCustomFiltersApply,
        onCustomFiltersReset,
      });
    }

    useCustomScenario().handleCustomFilterApply({ owner: 'team-a' });
    useCustomScenario().handleCustomFilterStateChange({
      filterValues: { owner: 'team-a' },
      resetFilters,
    });
    useCustomScenario().handleCustomApplyClick();
    useCustomScenario().handleCustomClearClick();
    useCustomScenario().handleCustomFilterReset();
    useCustomScenario().handleValidationChange(false);

    expect(onCustomFiltersApply).toHaveBeenCalledWith({
      allFilters: { owner: 'team-a' },
      changedFilters: [{ id: 'owner', value: 'team-a' }],
    });
    expect(onCustomFiltersApply).toHaveBeenNthCalledWith(2, {
      allFilters: {},
      changedFilters: [],
    });
    expect(resetFilters).toHaveBeenCalledTimes(0);
    expect(onCustomFiltersReset).toHaveBeenNthCalledWith(1, {
      allFilters: {},
      changedFilters: [],
    });

    function useOptionalScenario() {
      return useFilterSidePanelController({
        columnFilters: [{ id: 'priority', value: ['high'] }],
        onApplyFilters: vi.fn(),
        onClearFilters: vi.fn(),
      });
    }

    useOptionalScenario().handleCustomFilterApply();
    useOptionalScenario().handleCustomFilterStateChange({
      filterValues: { severity: 'critical' },
      resetFilters: undefined,
    });
    useOptionalScenario().handleCustomApplyClick();
    useOptionalScenario().handleCustomClearClick();

    expect(useOptionalScenario().getFilterValue('priority')).toEqual(['high']);
  });
});
