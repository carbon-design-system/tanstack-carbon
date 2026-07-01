import { describe, it, expect, vi } from 'vitest';
import { getCommonPinningStyles, processColumnPinning } from '../stickyColumnHelpers';

describe('stickyColumnHelpers', () => {
  it('returns left pinned header styles for the last left pinned column', () => {
    const column = {
      getIsPinned: vi.fn(() => 'left'),
      getIsLastColumn: vi.fn((side) => side === 'left'),
      getIsFirstColumn: vi.fn(() => false),
      getStart: vi.fn(() => 24),
      getAfter: vi.fn(() => 0),
      getSize: vi.fn(() => 180),
      columnDef: { size: 180 },
    };

    const styles = getCommonPinningStyles(column, true);

    expect(styles).toEqual({
      borderRight: '1px solid var(--cds-border-subtle)',
      borderLeft: 0,
      left: '24px',
      right: undefined,
      opacity: 0.95,
      position: 'sticky',
      width: '180px',
      zIndex: 4,
      backgroundColor: 'var(--cds-layer-accent)',
    });
  });

  it('returns right pinned body styles for the first right pinned column', () => {
    const column = {
      getIsPinned: vi.fn(() => 'right'),
      getIsLastColumn: vi.fn(() => false),
      getIsFirstColumn: vi.fn((side) => side === 'right'),
      getStart: vi.fn(() => 0),
      getAfter: vi.fn(() => 36),
      getSize: vi.fn(() => 120),
      columnDef: { size: 120 },
    };

    const styles = getCommonPinningStyles(column, false);

    expect(styles).toEqual({
      borderRight: 0,
      borderLeft: '1px solid var(--cds-border-subtle)',
      left: undefined,
      right: '36px',
      opacity: 0.95,
      position: 'sticky',
      width: '120px',
      zIndex: 3,
      backgroundColor: 'null',
    });
  });

  it('returns unpinned relative styles when column is not pinned', () => {
    const column = {
      getIsPinned: vi.fn(() => false),
      getIsLastColumn: vi.fn(() => false),
      getIsFirstColumn: vi.fn(() => false),
      getStart: vi.fn(() => 0),
      getAfter: vi.fn(() => 0),
      getSize: vi.fn(() => 90),
    };

    const styles = getCommonPinningStyles(column);

    expect(styles).toEqual({
      borderRight: 0,
      borderLeft: 0,
      left: undefined,
      right: undefined,
      opacity: 1,
      position: 'relative',
      zIndex: 0,
      backgroundColor: 'null',
    });
  });

  it('processes column pinning and fills missing sides with empty arrays', () => {
    expect(processColumnPinning(null)).toBeUndefined();

    expect(processColumnPinning({ left: ['name'] })).toEqual({
      left: ['name'],
      right: [],
    });

    expect(processColumnPinning({ right: ['actions'] })).toEqual({
      left: [],
      right: ['actions'],
    });

    expect(processColumnPinning({ left: ['name'], right: ['actions'] })).toEqual({
      left: ['name'],
      right: ['actions'],
    });
  });
});
