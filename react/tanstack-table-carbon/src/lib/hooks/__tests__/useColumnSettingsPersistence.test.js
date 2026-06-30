import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useColumnSettingsPersistence } from '../useColumnSettingsPersistence';

let localStorageMock;

beforeEach(() => {
  // NOTE: Mock localStorage
  localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  global.localStorage = localStorageMock;

  // NOTE: Mock console.error to avoid noise in tests
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useColumnSettingsPersistence - Client-side mode with localStorage', () => {
  it('should initialize with empty settings when no localStorage data', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() =>
      useColumnSettingsPersistence({
        localStorageKey: 'test-table',
        isServerSideTable: false,
      })
    );

    expect(result.current.visibility).toEqual({});
    expect(result.current.order).toEqual([]);
    expect(result.current.isUsingLocalStorage).toBe(true);
  });

  it('should load settings from localStorage on mount', () => {
    const savedSettings = {
      visibility: { col1: true, col2: false },
      order: ['col1', 'col2', 'col3'],
      timestamp: '2024-01-01T00:00:00.000Z',
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedSettings));

    const { result } = renderHook(() =>
      useColumnSettingsPersistence({
        localStorageKey: 'test-table',
        isServerSideTable: false,
      })
    );

    expect(result.current.visibility).toEqual({ col1: true, col2: false });
    expect(result.current.order).toEqual(['col1', 'col2', 'col3']);
  });

  it('should save visibility changes to localStorage', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() =>
      useColumnSettingsPersistence({
        localStorageKey: 'test-table',
        isServerSideTable: false,
      })
    );

    act(() => {
      result.current.setVisibility({ col1: false, col2: true });
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'table_test-table',
      expect.stringContaining('"visibility":{"col1":false,"col2":true}')
    );
  });

  it('should save order changes to localStorage', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() =>
      useColumnSettingsPersistence({
        localStorageKey: 'test-table',
        isServerSideTable: false,
      })
    );

    act(() => {
      result.current.setOrder(['col3', 'col1', 'col2']);
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'table_test-table',
      expect.stringContaining('"order":["col3","col1","col2"]')
    );
  });

  it('should handle function updaters for visibility', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() =>
      useColumnSettingsPersistence({
        localStorageKey: 'test-table',
        isServerSideTable: false,
      })
    );

    act(() => {
      result.current.setVisibility({ col1: true });
    });

    act(() => {
      result.current.setVisibility((prev) => ({ ...prev, col2: false }));
    });

    expect(result.current.visibility).toEqual({ col1: true, col2: false });
  });

  it('should handle function updaters for order', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() =>
      useColumnSettingsPersistence({
        localStorageKey: 'test-table',
        isServerSideTable: false,
      })
    );

    act(() => {
      result.current.setOrder(['col1', 'col2']);
    });

    act(() => {
      result.current.setOrder((prev) => [...prev, 'col3']);
    });

    expect(result.current.order).toEqual(['col1', 'col2', 'col3']);
  });

  it('should clear settings from localStorage', () => {
    const savedSettings = {
      visibility: { col1: true },
      order: ['col1'],
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedSettings));

    const { result } = renderHook(() =>
      useColumnSettingsPersistence({
        localStorageKey: 'test-table',
        isServerSideTable: false,
      })
    );

    act(() => {
      result.current.clearSettings();
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('table_test-table');
    expect(result.current.visibility).toEqual({});
    expect(result.current.order).toEqual([]);
  });

  it('should handle localStorage errors gracefully on load', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const { result } = renderHook(() =>
      useColumnSettingsPersistence({
        localStorageKey: 'test-table',
        isServerSideTable: false,
      })
    );

    expect(result.current.visibility).toEqual({});
    expect(result.current.order).toEqual([]);
  });

  it('should handle localStorage errors gracefully on save', () => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const { result } = renderHook(() =>
      useColumnSettingsPersistence({
        localStorageKey: 'test-table',
        isServerSideTable: false,
      })
    );

    expect(() => {
      act(() => {
        result.current.setVisibility({ col1: true });
      });
    }).not.toThrow();
  });

  it('should handle invalid JSON in localStorage', () => {
    localStorageMock.getItem.mockReturnValue('invalid json');

    const { result } = renderHook(() =>
      useColumnSettingsPersistence({
        localStorageKey: 'test-table',
        isServerSideTable: false,
      })
    );

    expect(result.current.visibility).toEqual({});
    expect(result.current.order).toEqual([]);
  });

  it('should include timestamp when saving to localStorage', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() =>
      useColumnSettingsPersistence({
        localStorageKey: 'test-table',
        isServerSideTable: false,
      })
    );

    act(() => {
      result.current.setVisibility({ col1: true });
    });

    const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedData.timestamp).toBeDefined();
    expect(new Date(savedData.timestamp)).toBeInstanceOf(Date);
  });
});

describe('useColumnSettingsPersistence - Server-side mode with callbacks', () => {
  it('should use controlled visibility and order', () => {
    const controlledVisibility = { col1: false, col2: true };
    const controlledOrder = ['col2', 'col1'];

    const { result } = renderHook(() =>
      useColumnSettingsPersistence({
        isServerSideTable: true,
        controlledVisibility,
        controlledOrder,
      })
    );

    expect(result.current.visibility).toEqual(controlledVisibility);
    expect(result.current.order).toEqual(controlledOrder);
    expect(result.current.isUsingLocalStorage).toBe(false);
  });

  it('should call onVisibilityChange callback', () => {
    const onVisibilityChange = vi.fn();

    const { result } = renderHook(() =>
      useColumnSettingsPersistence({
        isServerSideTable: true,
        onVisibilityChange,
      })
    );

    const newVisibility = { col1: false };

    act(() => {
      result.current.setVisibility(newVisibility);
    });

    expect(onVisibilityChange).toHaveBeenCalledWith(newVisibility);
  });

  it('should call onOrderChange callback', () => {
    const onOrderChange = vi.fn();

    const { result } = renderHook(() =>
      useColumnSettingsPersistence({
        isServerSideTable: true,
        onOrderChange,
      })
    );

    const newOrder = ['col3', 'col1', 'col2'];

    act(() => {
      result.current.setOrder(newOrder);
    });

    expect(onOrderChange).toHaveBeenCalledWith(newOrder);
  });

  it('should update when controlled values change', () => {
    const { result, rerender } = renderHook(
      ({ controlledVisibility, controlledOrder }) =>
        useColumnSettingsPersistence({
          isServerSideTable: true,
          controlledVisibility,
          controlledOrder,
        }),
      {
        initialProps: {
          controlledVisibility: { col1: true },
          controlledOrder: ['col1'],
        },
      }
    );

    expect(result.current.visibility).toEqual({ col1: true });
    expect(result.current.order).toEqual(['col1']);

    rerender({
      controlledVisibility: { col1: false, col2: true },
      controlledOrder: ['col2', 'col1'],
    });

    expect(result.current.visibility).toEqual({ col1: false, col2: true });
    expect(result.current.order).toEqual(['col2', 'col1']);
  });

  it('should not use localStorage in server-side mode', () => {
    const { result } = renderHook(() =>
      useColumnSettingsPersistence({
        localStorageKey: 'test-table',
        isServerSideTable: true,
        onVisibilityChange: vi.fn(),
      })
    );

    act(() => {
      result.current.setVisibility({ col1: true });
    });

    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('should not clear settings in server-side mode', () => {
    const { result } = renderHook(() =>
      useColumnSettingsPersistence({
        localStorageKey: 'test-table',
        isServerSideTable: true,
      })
    );

    act(() => {
      result.current.clearSettings();
    });

    expect(localStorageMock.removeItem).not.toHaveBeenCalled();
  });
});

describe('useColumnSettingsPersistence - Client-side mode with manual callbacks (no localStorage)', () => {
  it('should not use localStorage when callbacks are provided', () => {
    const onVisibilityChange = vi.fn();
    const onOrderChange = vi.fn();

    const { result } = renderHook(() =>
      useColumnSettingsPersistence({
        localStorageKey: 'test-table',
        isServerSideTable: false,
        onVisibilityChange,
        onOrderChange,
      })
    );

    expect(result.current.isUsingLocalStorage).toBe(false);

    act(() => {
      result.current.setVisibility({ col1: true });
    });

    expect(localStorageMock.setItem).not.toHaveBeenCalled();
    expect(onVisibilityChange).toHaveBeenCalledWith({ col1: true });
  });
});

describe('useColumnSettingsPersistence - Uncontrolled mode without localStorage', () => {
  it('should manage state internally when no localStorage key or callbacks', () => {
    const { result } = renderHook(() =>
      useColumnSettingsPersistence({
        isServerSideTable: false,
      })
    );

    expect(result.current.isUsingLocalStorage).toBe(false);

    act(() => {
      result.current.setVisibility({ col1: false });
    });

    expect(result.current.visibility).toEqual({ col1: false });
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('should handle order changes in uncontrolled mode', () => {
    const { result } = renderHook(() =>
      useColumnSettingsPersistence({
        isServerSideTable: false,
      })
    );

    act(() => {
      result.current.setOrder(['col2', 'col1']);
    });

    expect(result.current.order).toEqual(['col2', 'col1']);
  });
});

describe('useColumnSettingsPersistence - Edge Cases', () => {
  it('should handle missing visibility in saved data', () => {
    const savedSettings = {
      order: ['col1', 'col2'],
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedSettings));

    const { result } = renderHook(() =>
      useColumnSettingsPersistence({
        localStorageKey: 'test-table',
        isServerSideTable: false,
      })
    );

    expect(result.current.visibility).toEqual({});
    expect(result.current.order).toEqual(['col1', 'col2']);
  });

  it('should handle missing order in saved data', () => {
    const savedSettings = {
      visibility: { col1: true },
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedSettings));

    const { result } = renderHook(() =>
      useColumnSettingsPersistence({
        localStorageKey: 'test-table',
        isServerSideTable: false,
      })
    );

    expect(result.current.visibility).toEqual({ col1: true });
    expect(result.current.order).toEqual([]);
  });

  it('should handle undefined controlled values', () => {
    const { result } = renderHook(() =>
      useColumnSettingsPersistence({
        isServerSideTable: true,
        controlledVisibility: undefined,
        controlledOrder: undefined,
      })
    );

    expect(result.current.visibility).toEqual({});
    expect(result.current.order).toEqual([]);
  });

  it('should handle null controlled values', () => {
    const { result } = renderHook(() =>
      useColumnSettingsPersistence({
        isServerSideTable: true,
        controlledVisibility: null,
        controlledOrder: null,
      })
    );

    expect(result.current.visibility).toEqual({});
    expect(result.current.order).toEqual([]);
  });

  it('should prefix localStorage key with "table_"', () => {
    localStorageMock.getItem.mockReturnValue(null);

    renderHook(() =>
      useColumnSettingsPersistence({
        localStorageKey: 'my-table',
        isServerSideTable: false,
      })
    );

    expect(localStorageMock.getItem).toHaveBeenCalledWith('table_my-table');
  });

  it('should handle clearSettings error gracefully', () => {
    localStorageMock.removeItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const { result } = renderHook(() =>
      useColumnSettingsPersistence({
        localStorageKey: 'test-table',
        isServerSideTable: false,
      })
    );

    expect(() => {
      act(() => {
        result.current.clearSettings();
      });
    }).not.toThrow();
  });
});
