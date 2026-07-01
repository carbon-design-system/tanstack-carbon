import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useEditableCell } from '../useEditableCell';

// NOTE: Mock useKeyPress hook
vi.mock('../useKeyPress', () => ({
  useKeyPress: vi.fn(() => false),
}));

let tableContainerRef;
let mockTableBody;
let mockRows;
let mockCells;

beforeEach(() => {
  // NOTE: Create mock DOM structure
  mockCells = [
    { tabIndex: -1, focus: vi.fn(), blur: vi.fn(), closest: vi.fn() },
    { tabIndex: -1, focus: vi.fn(), blur: vi.fn(), closest: vi.fn() },
    { tabIndex: -1, focus: vi.fn(), blur: vi.fn(), closest: vi.fn() },
  ];

  mockRows = [
    {
      children: mockCells,
      previousElementSibling: null,
      nextElementSibling: null,
    },
  ];

  mockTableBody = {
    contains: vi.fn(() => true),
  };

  const mockTable = {
    querySelector: vi.fn((selector) => {
      if (selector === 'tbody') {
        return mockTableBody;
      }
      if (selector === 'td[tabindex="0"]') {
        return mockCells.find((cell) => cell.tabIndex === 0) || null;
      }
      return null;
    }),
    querySelectorAll: vi.fn((selector) => {
      if (selector === 'td') {
        return mockCells;
      }
      return [];
    }),
  };

  tableContainerRef = {
    current: mockTable,
  };

  // NOTE: Setup cell.closest() to return parent row
  mockCells.forEach((cell, index) => {
    cell.closest = vi.fn((selector) => {
      if (selector === 'td') {
        return cell;
      }
      if (selector === 'tr') {
        return mockRows[0];
      }
      return null;
    });
    cell.previousElementSibling = index > 0 ? mockCells[index - 1] : null;
    cell.nextElementSibling = index < mockCells.length - 1 ? mockCells[index + 1] : null;
    cell.parentNode = { children: mockCells };
  });

  // NOTE: Mock document.activeElement
  Object.defineProperty(document, 'activeElement', {
    writable: true,
    value: { blur: vi.fn() },
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useEditableCell - Initialization', () => {
  it('should initialize with null editingId', () => {
    const { result } = renderHook(() => useEditableCell(tableContainerRef));

    expect(result.current.editingId).toBeNull();
  });

  it('should initialize with commandLeft as false', () => {
    const { result } = renderHook(() => useEditableCell(tableContainerRef));

    expect(result.current.commandLeft).toBe(false);
  });

  it('should provide all required methods', () => {
    const { result } = renderHook(() => useEditableCell(tableContainerRef));

    expect(result.current.setEditingId).toBeInstanceOf(Function);
    expect(result.current.handleFocusChange).toBeInstanceOf(Function);
    expect(result.current.handleKeyDownActiveCell).toBeInstanceOf(Function);
  });
});

describe('useEditableCell - setEditingId', () => {
  it('should update editingId state', () => {
    const { result } = renderHook(() => useEditableCell(tableContainerRef));

    act(() => {
      result.current.setEditingId('cell-123');
    });

    expect(result.current.editingId).toBe('cell-123');
  });

  it('should clear editingId when set to null', () => {
    const { result } = renderHook(() => useEditableCell(tableContainerRef));

    act(() => {
      result.current.setEditingId('cell-123');
    });

    act(() => {
      result.current.setEditingId(null);
    });

    expect(result.current.editingId).toBeNull();
  });
});

describe('useEditableCell - handleFocusChange', () => {
  it('should set active cell on focus', () => {
    const { result } = renderHook(() => useEditableCell(tableContainerRef));

    const mockEvent = {
      target: mockCells[0],
    };

    act(() => {
      result.current.handleFocusChange(mockEvent);
    });

    expect(mockCells[0].tabIndex).toBe(0);
    expect(mockCells[0].focus).toHaveBeenCalled();
  });

  it('should remove previous active cell before setting new one', () => {
    const { result } = renderHook(() => useEditableCell(tableContainerRef));

    // NOTE: Set first cell as active
    mockCells[0].tabIndex = 0;

    const mockEvent = {
      target: mockCells[1],
    };

    act(() => {
      result.current.handleFocusChange(mockEvent);
    });

    expect(mockCells[0].tabIndex).toBe(-1);
    expect(mockCells[1].tabIndex).toBe(0);
  });

  it('should not change focus if target is outside table body', () => {
    const { result } = renderHook(() => useEditableCell(tableContainerRef));

    mockTableBody.contains = vi.fn(() => false);

    const mockEvent = {
      target: document.createElement('div'),
    };

    act(() => {
      result.current.handleFocusChange(mockEvent);
    });

    expect(mockCells.every((cell) => cell.tabIndex === -1)).toBe(true);
  });

  it('should not change focus when editing', () => {
    const { result } = renderHook(() => useEditableCell(tableContainerRef));

    act(() => {
      result.current.setEditingId('cell-123');
    });

    const mockEvent = {
      target: mockCells[0],
    };

    act(() => {
      result.current.handleFocusChange(mockEvent);
    });

    expect(mockCells[0].tabIndex).toBe(-1);
    expect(mockCells[0].focus).not.toHaveBeenCalled();
  });

  it('should handle null tableContainerRef', () => {
    const { result } = renderHook(() => useEditableCell({ current: null }));

    const mockEvent = {
      target: mockCells[0],
    };

    expect(() => {
      act(() => {
        result.current.handleFocusChange(mockEvent);
      });
    }).not.toThrow();
  });
});

describe('useEditableCell - handleKeyDownActiveCell - Arrow Navigation', () => {
  it('should navigate left with ArrowLeft', () => {
    const { result } = renderHook(() => useEditableCell(tableContainerRef));

    // NOTE: Set middle cell as active
    mockCells[1].tabIndex = 0;

    const mockEvent = {
      code: 'ArrowLeft',
      preventDefault: vi.fn(),
    };

    act(() => {
      result.current.handleKeyDownActiveCell(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockCells[1].tabIndex).toBe(-1);
    expect(mockCells[0].tabIndex).toBe(0);
    expect(mockCells[0].focus).toHaveBeenCalled();
  });

  it('should not navigate left if at first cell', () => {
    const { result } = renderHook(() => useEditableCell(tableContainerRef));

    mockCells[0].tabIndex = 0;

    const mockEvent = {
      code: 'ArrowLeft',
      preventDefault: vi.fn(),
    };

    act(() => {
      result.current.handleKeyDownActiveCell(mockEvent);
    });

    expect(mockCells[0].tabIndex).toBe(0);
  });

  it('should navigate right with ArrowRight', () => {
    const { result } = renderHook(() => useEditableCell(tableContainerRef));

    mockCells[0].tabIndex = 0;

    const mockEvent = {
      code: 'ArrowRight',
      preventDefault: vi.fn(),
    };

    act(() => {
      result.current.handleKeyDownActiveCell(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockCells[0].tabIndex).toBe(-1);
    expect(mockCells[1].tabIndex).toBe(0);
    expect(mockCells[1].focus).toHaveBeenCalled();
  });

  it('should not navigate right if at last cell', () => {
    const { result } = renderHook(() => useEditableCell(tableContainerRef));

    mockCells[2].tabIndex = 0;

    const mockEvent = {
      code: 'ArrowRight',
      preventDefault: vi.fn(),
    };

    act(() => {
      result.current.handleKeyDownActiveCell(mockEvent);
    });

    expect(mockCells[2].tabIndex).toBe(0);
  });

  it('should navigate up with ArrowUp', () => {
    const { result } = renderHook(() => useEditableCell(tableContainerRef));

    // NOTE: Create second row
    const secondRowCells = [
      { tabIndex: -1, focus: vi.fn(), closest: vi.fn(), parentNode: { children: [] } },
      { tabIndex: 0, focus: vi.fn(), closest: vi.fn(), parentNode: { children: [] } },
      { tabIndex: -1, focus: vi.fn(), closest: vi.fn(), parentNode: { children: [] } },
    ];

    const secondRow = {
      children: secondRowCells,
      previousElementSibling: mockRows[0],
      nextElementSibling: null,
    };

    mockRows[0].nextElementSibling = secondRow;
    secondRowCells[1].tabIndex = 0;

    secondRowCells.forEach((cell) => {
      cell.closest = vi.fn((selector) => {
        if (selector === 'td') {
          return cell;
        }
        if (selector === 'tr') {
          return secondRow;
        }
        return null;
      });
      cell.parentNode = { children: secondRowCells };
    });

    // NOTE: Combine all cells for querySelectorAll
    const allCells = [...mockCells, ...secondRowCells];

    // NOTE: Update querySelector and querySelectorAll
    tableContainerRef.current.querySelector = vi.fn((selector) => {
      if (selector === 'tbody') {
        return mockTableBody;
      }
      if (selector === 'td[tabindex="0"]') {
        return secondRowCells[1];
      }
      return null;
    });

    tableContainerRef.current.querySelectorAll = vi.fn((selector) => {
      if (selector === 'td') {
        return allCells;
      }
      return [];
    });

    const mockEvent = {
      code: 'ArrowUp',
      preventDefault: vi.fn(),
    };

    act(() => {
      result.current.handleKeyDownActiveCell(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(secondRowCells[1].tabIndex).toBe(-1);
    expect(mockCells[1].tabIndex).toBe(0);
    expect(mockCells[1].focus).toHaveBeenCalled();
  });

  it('should navigate down with ArrowDown', () => {
    const { result } = renderHook(() => useEditableCell(tableContainerRef));

    // NOTE: Create second row
    const secondRowCells = [
      { tabIndex: -1, focus: vi.fn(), closest: vi.fn(), parentNode: { children: [] } },
      { tabIndex: -1, focus: vi.fn(), closest: vi.fn(), parentNode: { children: [] } },
      { tabIndex: -1, focus: vi.fn(), closest: vi.fn(), parentNode: { children: [] } },
    ];

    const secondRow = {
      children: secondRowCells,
      previousElementSibling: mockRows[0],
      nextElementSibling: null,
    };

    mockRows[0].nextElementSibling = secondRow;
    mockCells[1].tabIndex = 0;

    mockCells[1].closest = vi.fn((selector) => {
      if (selector === 'td') {
        return mockCells[1];
      }
      if (selector === 'tr') {
        return mockRows[0];
      }
      return null;
    });

    secondRowCells.forEach((cell) => {
      cell.closest = vi.fn((selector) => {
        if (selector === 'td') {
          return cell;
        }
        if (selector === 'tr') {
          return secondRow;
        }
        return null;
      });
      cell.parentNode = { children: secondRowCells };
    });

    const mockEvent = {
      code: 'ArrowDown',
      preventDefault: vi.fn(),
    };

    act(() => {
      result.current.handleKeyDownActiveCell(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockCells[1].tabIndex).toBe(-1);
    expect(secondRowCells[1].tabIndex).toBe(0);
    expect(secondRowCells[1].focus).toHaveBeenCalled();
  });
});

describe('useEditableCell - handleKeyDownActiveCell - Special Keys', () => {
  it('should handle Tab key', () => {
    const { result } = renderHook(() => useEditableCell(tableContainerRef));

    mockCells[0].tabIndex = 0;

    const mockEvent = {
      code: 'Tab',
      preventDefault: vi.fn(),
    };

    act(() => {
      result.current.handleKeyDownActiveCell(mockEvent);
    });

    expect(mockCells[0].tabIndex).toBe(-1);
  });

  it('should handle Enter key', () => {
    const { result } = renderHook(() => useEditableCell(tableContainerRef));

    mockCells[0].tabIndex = 0;

    const mockEvent = {
      code: 'Enter',
      preventDefault: vi.fn(),
    };

    act(() => {
      result.current.handleKeyDownActiveCell(mockEvent);
    });

    // NOTE: Enter key doesn't change anything, just returns
    expect(mockCells[0].tabIndex).toBe(0);
  });

  it('should not handle keys when no active cell', () => {
    const { result } = renderHook(() => useEditableCell(tableContainerRef));

    const mockEvent = {
      code: 'ArrowLeft',
      preventDefault: vi.fn(),
    };

    act(() => {
      result.current.handleKeyDownActiveCell(mockEvent);
    });

    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
  });

  it('should not handle keys when commandLeft is active', async () => {
    const { useKeyPress } = await import('../useKeyPress');
    useKeyPress.mockReturnValue(true);

    const { result } = renderHook(() => useEditableCell(tableContainerRef));

    mockCells[0].tabIndex = 0;

    const mockEvent = {
      code: 'ArrowLeft',
      preventDefault: vi.fn(),
    };

    act(() => {
      result.current.handleKeyDownActiveCell(mockEvent);
    });

    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    expect(mockCells[0].tabIndex).toBe(0);
  });
});

describe('useEditableCell - Edge Cases', () => {
  it('should handle null tableContainerRef.current', () => {
    const nullRef = { current: null };
    const { result } = renderHook(() => useEditableCell(nullRef));

    expect(() => {
      act(() => {
        result.current.handleKeyDownActiveCell({ code: 'ArrowLeft', preventDefault: vi.fn() });
      });
    }).not.toThrow();
  });

  it('should handle missing querySelector results', () => {
    const emptyRef = {
      current: {
        querySelector: vi.fn(() => null),
        querySelectorAll: vi.fn(() => []),
      },
    };

    const { result } = renderHook(() => useEditableCell(emptyRef));

    expect(() => {
      act(() => {
        result.current.handleFocusChange({ target: document.createElement('div') });
      });
    }).not.toThrow();
  });

  it('should handle cells without siblings', () => {
    const { result } = renderHook(() => useEditableCell(tableContainerRef));

    const singleCell = {
      tabIndex: 0,
      focus: vi.fn(),
      blur: vi.fn(),
      closest: null,
      previousElementSibling: null,
      nextElementSibling: null,
      parentNode: null,
    };

    // NOTE: Set closest after cell is defined
    singleCell.closest = vi.fn(() => singleCell);
    singleCell.parentNode = { children: [singleCell] };

    tableContainerRef.current.querySelector = vi.fn(() => singleCell);

    const mockEvent = {
      code: 'ArrowLeft',
      preventDefault: vi.fn(),
    };

    act(() => {
      result.current.handleKeyDownActiveCell(mockEvent);
    });

    expect(singleCell.tabIndex).toBe(0);
  });
});
