import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useKeyPress } from '../useKeyPress';

describe('useKeyPress', () => {
  it('tracks normal key press and reset on keyup', () => {
    const target = document.createElement('div');
    const { result } = renderHook(() => useKeyPress('a', { target }));

    act(() => {
      target.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    });
    expect(result.current).toBe(true);

    act(() => {
      target.dispatchEvent(new KeyboardEvent('keyup', { key: 'a', bubbles: true }));
    });
    expect(result.current).toBe(false);
  });

  it('supports key combinations, ignores input without modifier, allows input with modifier when configured, and resets on blur/meta/contextmenu', () => {
    const target = document.createElement('div');
    const input = document.createElement('input');
    document.body.appendChild(input);

    const { result } = renderHook(() =>
      useKeyPress(['Meta+s', 'Control+s'], {
        target,
        actInsideInputWithModifier: false,
      })
    );

    act(() => {
      input.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          code: 'KeyS',
          bubbles: true,
        })
      );
    });
    expect(result.current).toBe(false);

    act(() => {
      input.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Meta',
          code: 'MetaLeft',
          metaKey: true,
          bubbles: true,
        })
      );
      input.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          code: 'KeyS',
          metaKey: true,
          bubbles: true,
        })
      );
    });
    expect(result.current).toBe(false);

    const { result: allowedResult } = renderHook(() =>
      useKeyPress('Meta+s', {
        target: input,
        actInsideInputWithModifier: true,
      })
    );

    act(() => {
      input.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Meta',
          code: 'MetaLeft',
          metaKey: true,
          bubbles: true,
        })
      );
      input.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          code: 'KeyS',
          metaKey: true,
          bubbles: true,
        })
      );
    });
    expect(allowedResult.current).toBe(true);

    act(() => {
      input.dispatchEvent(
        new KeyboardEvent('keyup', {
          key: 'Meta',
          code: 'MetaLeft',
          metaKey: true,
          bubbles: true,
        })
      );
    });
    expect(allowedResult.current).toBe(false);

    act(() => {
      input.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Meta',
          code: 'MetaLeft',
          metaKey: true,
          bubbles: true,
        })
      );
      input.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          code: 'KeyS',
          metaKey: true,
          bubbles: true,
        })
      );
      window.dispatchEvent(new Event('blur'));
    });
    expect(allowedResult.current).toBe(false);

    act(() => {
      input.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Meta',
          code: 'MetaLeft',
          metaKey: true,
          bubbles: true,
        })
      );
      input.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 's',
          code: 'KeyS',
          metaKey: true,
          bubbles: true,
        })
      );
      window.dispatchEvent(new Event('contextmenu'));
    });
    expect(allowedResult.current).toBe(false);

    document.body.removeChild(input);
  });
});
