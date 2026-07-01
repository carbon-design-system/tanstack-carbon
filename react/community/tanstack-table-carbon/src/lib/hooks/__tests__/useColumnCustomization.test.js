import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useColumnCustomization } from '../useColumnCustomization';

let mockTable;
let mockColumns;
let onColumnOrderChange;
let onColumnVisibilityChange;

beforeEach(() => {
  // NOTE: Create mock columns
  mockColumns = [
    {
      id: 'col1',
      getIsVisible: vi.fn(() => true),
    },
    {
      id: 'col2',
      getIsVisible: vi.fn(() => true),
    },
    {
      id: 'col3',
      getIsVisible: vi.fn(() => false),
    },
  ];

  // NOTE: Create mock table
  mockTable = {
    getAllLeafColumns: vi.fn(() => mockColumns),
    setColumnOrder: vi.fn(),
    setColumnVisibility: vi.fn(),
  };

  onColumnOrderChange = vi.fn();
  onColumnVisibilityChange = vi.fn();
});

describe('useColumnCustomization - Initialization', () => {
  it('should initialize with panel closed', () => {
    const { result } = renderHook(() =>
      useColumnCustomization(mockTable, onColumnOrderChange, onColumnVisibilityChange)
    );

    expect(result.current.showCustomizePanel).toBe(false);
  });

  it('should initialize with empty temp states', () => {
    const { result } = renderHook(() =>
      useColumnCustomization(mockTable, onColumnOrderChange, onColumnVisibilityChange)
    );

    expect(result.current.tempColumnOrder).toEqual([]);
    expect(result.current.tempColumnVisibility).toEqual({});
  });

  it('should provide all required methods', () => {
    const { result } = renderHook(() =>
      useColumnCustomization(mockTable, onColumnOrderChange, onColumnVisibilityChange)
    );

    expect(result.current.openCustomizePanel).toBeInstanceOf(Function);
    expect(result.current.closeCustomizePanel).toBeInstanceOf(Function);
    expect(result.current.applyCustomization).toBeInstanceOf(Function);
    expect(result.current.toggleColumnVisibility).toBeInstanceOf(Function);
    expect(result.current.reorderColumns).toBeInstanceOf(Function);
  });
});

describe('useColumnCustomization - openCustomizePanel', () => {
  it('should open the customize panel', () => {
    const { result } = renderHook(() =>
      useColumnCustomization(mockTable, onColumnOrderChange, onColumnVisibilityChange)
    );

    act(() => {
      result.current.openCustomizePanel();
    });

    expect(result.current.showCustomizePanel).toBe(true);
  });

  it('should initialize temp column order from table columns', () => {
    const { result } = renderHook(() =>
      useColumnCustomization(mockTable, onColumnOrderChange, onColumnVisibilityChange)
    );

    act(() => {
      result.current.openCustomizePanel();
    });

    expect(result.current.tempColumnOrder).toEqual(['col1', 'col2', 'col3']);
  });

  it('should initialize temp column visibility from table columns', () => {
    const { result } = renderHook(() =>
      useColumnCustomization(mockTable, onColumnOrderChange, onColumnVisibilityChange)
    );

    act(() => {
      result.current.openCustomizePanel();
    });

    expect(result.current.tempColumnVisibility).toEqual({
      col1: true,
      col2: true,
      col3: false,
    });
  });

  it('should call getAllLeafColumns when panel opens', () => {
    const { result } = renderHook(() =>
      useColumnCustomization(mockTable, onColumnOrderChange, onColumnVisibilityChange)
    );

    act(() => {
      result.current.openCustomizePanel();
    });

    expect(mockTable.getAllLeafColumns).toHaveBeenCalled();
  });

  it('should handle null table gracefully', () => {
    const { result } = renderHook(() =>
      useColumnCustomization(null, onColumnOrderChange, onColumnVisibilityChange)
    );

    expect(() => {
      act(() => {
        result.current.openCustomizePanel();
      });
    }).not.toThrow();
  });
});

describe('useColumnCustomization - closeCustomizePanel', () => {
  it('should close the customize panel', () => {
    const { result } = renderHook(() =>
      useColumnCustomization(mockTable, onColumnOrderChange, onColumnVisibilityChange)
    );

    act(() => {
      result.current.openCustomizePanel();
    });

    act(() => {
      result.current.closeCustomizePanel();
    });

    expect(result.current.showCustomizePanel).toBe(false);
  });

  it('should not apply changes when closing without saving', () => {
    const { result } = renderHook(() =>
      useColumnCustomization(mockTable, onColumnOrderChange, onColumnVisibilityChange)
    );

    act(() => {
      result.current.openCustomizePanel();
    });

    act(() => {
      result.current.toggleColumnVisibility('col1');
    });

    act(() => {
      result.current.closeCustomizePanel();
    });

    expect(mockTable.setColumnVisibility).not.toHaveBeenCalled();
    expect(onColumnVisibilityChange).not.toHaveBeenCalled();
  });
});

describe('useColumnCustomization - toggleColumnVisibility', () => {
  it('should toggle column visibility in temp state', () => {
    const { result } = renderHook(() =>
      useColumnCustomization(mockTable, onColumnOrderChange, onColumnVisibilityChange)
    );

    act(() => {
      result.current.openCustomizePanel();
    });

    act(() => {
      result.current.toggleColumnVisibility('col1');
    });

    expect(result.current.tempColumnVisibility.col1).toBe(false);
  });

  it('should toggle column visibility back to original state', () => {
    const { result } = renderHook(() =>
      useColumnCustomization(mockTable, onColumnOrderChange, onColumnVisibilityChange)
    );

    act(() => {
      result.current.openCustomizePanel();
    });

    act(() => {
      result.current.toggleColumnVisibility('col1');
    });

    act(() => {
      result.current.toggleColumnVisibility('col1');
    });

    expect(result.current.tempColumnVisibility.col1).toBe(true);
  });

  it('should toggle hidden column to visible', () => {
    const { result } = renderHook(() =>
      useColumnCustomization(mockTable, onColumnOrderChange, onColumnVisibilityChange)
    );

    act(() => {
      result.current.openCustomizePanel();
    });

    act(() => {
      result.current.toggleColumnVisibility('col3');
    });

    expect(result.current.tempColumnVisibility.col3).toBe(true);
  });

  it('should handle multiple column toggles', () => {
    const { result } = renderHook(() =>
      useColumnCustomization(mockTable, onColumnOrderChange, onColumnVisibilityChange)
    );

    act(() => {
      result.current.openCustomizePanel();
    });

    act(() => {
      result.current.toggleColumnVisibility('col1');
      result.current.toggleColumnVisibility('col2');
      result.current.toggleColumnVisibility('col3');
    });

    expect(result.current.tempColumnVisibility).toEqual({
      col1: false,
      col2: false,
      col3: true,
    });
  });
});

describe('useColumnCustomization - reorderColumns', () => {
  it('should update temp column order', () => {
    const { result } = renderHook(() =>
      useColumnCustomization(mockTable, onColumnOrderChange, onColumnVisibilityChange)
    );

    act(() => {
      result.current.openCustomizePanel();
    });

    const newOrder = ['col3', 'col1', 'col2'];

    act(() => {
      result.current.reorderColumns(newOrder);
    });

    expect(result.current.tempColumnOrder).toEqual(newOrder);
  });

  it('should handle empty order array', () => {
    const { result } = renderHook(() =>
      useColumnCustomization(mockTable, onColumnOrderChange, onColumnVisibilityChange)
    );

    act(() => {
      result.current.openCustomizePanel();
    });

    act(() => {
      result.current.reorderColumns([]);
    });

    expect(result.current.tempColumnOrder).toEqual([]);
  });

  it('should handle partial column order', () => {
    const { result } = renderHook(() =>
      useColumnCustomization(mockTable, onColumnOrderChange, onColumnVisibilityChange)
    );

    act(() => {
      result.current.openCustomizePanel();
    });

    act(() => {
      result.current.reorderColumns(['col2', 'col1']);
    });

    expect(result.current.tempColumnOrder).toEqual(['col2', 'col1']);
  });
});

describe('useColumnCustomization - applyCustomization', () => {
  it('should apply column order changes', () => {
    const { result } = renderHook(() =>
      useColumnCustomization(mockTable, onColumnOrderChange, onColumnVisibilityChange)
    );

    act(() => {
      result.current.openCustomizePanel();
    });

    const newOrder = ['col2', 'col3', 'col1'];

    act(() => {
      result.current.reorderColumns(newOrder);
    });

    act(() => {
      result.current.applyCustomization();
    });

    expect(mockTable.setColumnOrder).toHaveBeenCalledWith(newOrder);
  });

  it('should apply column visibility changes', () => {
    const { result } = renderHook(() =>
      useColumnCustomization(mockTable, onColumnOrderChange, onColumnVisibilityChange)
    );

    act(() => {
      result.current.openCustomizePanel();
    });

    act(() => {
      result.current.toggleColumnVisibility('col1');
    });

    act(() => {
      result.current.applyCustomization();
    });

    expect(mockTable.setColumnVisibility).toHaveBeenCalledWith({
      col1: false,
      col2: true,
      col3: false,
    });
  });

  it('should call onColumnOrderChange callback', () => {
    const { result } = renderHook(() =>
      useColumnCustomization(mockTable, onColumnOrderChange, onColumnVisibilityChange)
    );

    act(() => {
      result.current.openCustomizePanel();
    });

    const newOrder = ['col3', 'col2', 'col1'];

    act(() => {
      result.current.reorderColumns(newOrder);
    });

    act(() => {
      result.current.applyCustomization();
    });

    expect(onColumnOrderChange).toHaveBeenCalledWith(newOrder);
  });

  it('should call onColumnVisibilityChange callback', () => {
    const { result } = renderHook(() =>
      useColumnCustomization(mockTable, onColumnOrderChange, onColumnVisibilityChange)
    );

    act(() => {
      result.current.openCustomizePanel();
    });

    act(() => {
      result.current.toggleColumnVisibility('col2');
    });

    act(() => {
      result.current.applyCustomization();
    });

    expect(onColumnVisibilityChange).toHaveBeenCalledWith({
      col1: true,
      col2: false,
      col3: false,
    });
  });

  it('should close the panel after applying', () => {
    const { result } = renderHook(() =>
      useColumnCustomization(mockTable, onColumnOrderChange, onColumnVisibilityChange)
    );

    act(() => {
      result.current.openCustomizePanel();
    });

    act(() => {
      result.current.applyCustomization();
    });

    expect(result.current.showCustomizePanel).toBe(false);
  });

  it('should not call onColumnOrderChange if callback not provided', () => {
    const { result } = renderHook(() => useColumnCustomization(mockTable));

    act(() => {
      result.current.openCustomizePanel();
    });

    act(() => {
      result.current.reorderColumns(['col2', 'col1', 'col3']);
    });

    expect(() => {
      act(() => {
        result.current.applyCustomization();
      });
    }).not.toThrow();
  });

  it('should not call onColumnVisibilityChange if callback not provided', () => {
    const { result } = renderHook(() => useColumnCustomization(mockTable));

    act(() => {
      result.current.openCustomizePanel();
    });

    act(() => {
      result.current.toggleColumnVisibility('col1');
    });

    expect(() => {
      act(() => {
        result.current.applyCustomization();
      });
    }).not.toThrow();
  });

  it('should not apply column order if temp order is empty', () => {
    const { result } = renderHook(() =>
      useColumnCustomization(mockTable, onColumnOrderChange, onColumnVisibilityChange)
    );

    act(() => {
      result.current.openCustomizePanel();
    });

    act(() => {
      result.current.reorderColumns([]);
    });

    act(() => {
      result.current.applyCustomization();
    });

    expect(mockTable.setColumnOrder).not.toHaveBeenCalled();
    expect(onColumnOrderChange).not.toHaveBeenCalled();
  });

  it('should apply both order and visibility changes together', () => {
    const { result } = renderHook(() =>
      useColumnCustomization(mockTable, onColumnOrderChange, onColumnVisibilityChange)
    );

    act(() => {
      result.current.openCustomizePanel();
    });

    act(() => {
      result.current.reorderColumns(['col3', 'col1', 'col2']);
      result.current.toggleColumnVisibility('col1');
      result.current.toggleColumnVisibility('col3');
    });

    act(() => {
      result.current.applyCustomization();
    });

    expect(mockTable.setColumnOrder).toHaveBeenCalledWith(['col3', 'col1', 'col2']);
    expect(mockTable.setColumnVisibility).toHaveBeenCalledWith({
      col1: false,
      col2: true,
      col3: true,
    });
    expect(onColumnOrderChange).toHaveBeenCalledWith(['col3', 'col1', 'col2']);
    expect(onColumnVisibilityChange).toHaveBeenCalledWith({
      col1: false,
      col2: true,
      col3: true,
    });
  });
});

describe('useColumnCustomization - Edge Cases', () => {
  it('should handle table with no columns', () => {
    mockTable.getAllLeafColumns = vi.fn(() => []);

    const { result } = renderHook(() =>
      useColumnCustomization(mockTable, onColumnOrderChange, onColumnVisibilityChange)
    );

    act(() => {
      result.current.openCustomizePanel();
    });

    expect(result.current.tempColumnOrder).toEqual([]);
    expect(result.current.tempColumnVisibility).toEqual({});
  });

  it('should handle reopening panel with different column state', () => {
    const { result } = renderHook(() =>
      useColumnCustomization(mockTable, onColumnOrderChange, onColumnVisibilityChange)
    );

    // NOTE: First open
    act(() => {
      result.current.openCustomizePanel();
    });

    const firstOrder = result.current.tempColumnOrder;

    act(() => {
      result.current.closeCustomizePanel();
    });

    // NOTE: Change mock columns
    mockColumns[0].getIsVisible = vi.fn(() => false);

    // NOTE: Second open
    act(() => {
      result.current.openCustomizePanel();
    });

    expect(result.current.tempColumnOrder).toEqual(firstOrder);
    expect(result.current.tempColumnVisibility.col1).toBe(false);
  });

  it('should handle column with undefined visibility', () => {
    mockColumns[0].getIsVisible = vi.fn(() => undefined);

    const { result } = renderHook(() =>
      useColumnCustomization(mockTable, onColumnOrderChange, onColumnVisibilityChange)
    );

    act(() => {
      result.current.openCustomizePanel();
    });

    expect(result.current.tempColumnVisibility.col1).toBeUndefined();
  });
});
