import { useState, useEffect, useRef, useMemo } from 'react';

/**
 * useKeyPress Hook
 * Based on @xyflow/react implementation
 * Handles key combinations and modifier keys
 *
 * @param {string|Array<string>} keyCode - Key code(s) to watch for
 * @param {Object} options - Configuration options
 * @returns {boolean} - True if key combination is pressed
 */

const defaultDoc = typeof document !== 'undefined' ? document : null;
const inputTags = ['INPUT', 'SELECT', 'TEXTAREA'];

function isInputDOMNode(event) {
  // NOTE: using composed path for handling shadow dom
  const target = event.composedPath?.()?.[0] || event.target;
  const isInput = inputTags.includes(target?.nodeName) || target?.hasAttribute('contenteditable');

  // NOTE: when an input field is focused we don't want to trigger deletion or movement of nodes
  return isInput || !!target?.closest('.nokey');
}

function isMatchingKey(keyCodes, pressedKeys, isUp) {
  /* NOTE: we only want to compare same sizes of keyCode definitions
    and pressed keys. When the user specified 'Meta' as a key somewhere
    this would also be truthy without this filter when user presses 'Meta' + 'r'
    since we want to support multiple possibilities only one of the
    combinations need to be part of the pressed keys
  */
  return keyCodes
    .filter((keys) => isUp || keys.length === pressedKeys.size)
    .some((keys) => keys.every((k) => pressedKeys.has(k)));
}

export const useKeyPress = (
  keyCode = null,
  options = {
    target: defaultDoc,
    actInsideInputWithModifier: true,
  }
) => {
  const [keyPressed, setKeyPressed] = useState(false);

  // NOTE: we need to remember if a modifier key is pressed in order to track it
  const modifierPressed = useRef(false);

  // NOTE: we need to remember the pressed keys in order to support combinations
  const pressedKeys = useRef(new Set([]));

  /*
    NOTE: keyCodes = array with single keys [['a']] or key combinations [['a', 's']]
    keysToWatch = array with all keys flattened ['a', 'd', 'ShiftLeft']
  */
  const [keyCodes, keysToWatch] = useMemo(() => {
    if (keyCode !== null) {
      const keyCodeArr = Array.isArray(keyCode) ? keyCode : [keyCode];
      const keys = keyCodeArr.filter((kc) => typeof kc === 'string').map((kc) => kc.split('+'));
      const keysFlat = keys.reduce((res, item) => res.concat(...item), []);

      return [keys, keysFlat];
    }

    return [[], []];
  }, [keyCode]);

  useEffect(() => {
    // NOTE: Helper function to determine whether to use 'code' or 'key' property
    const getKeyOrCode = (eventCode, keysToWatch) => {
      return keysToWatch.includes(eventCode) ? 'code' : 'key';
    };

    const target = options?.target || defaultDoc;

    if (keyCode !== null) {
      const downHandler = (event) => {
        modifierPressed.current = event.ctrlKey || event.metaKey || event.shiftKey;
        const preventAction =
          (!modifierPressed.current ||
            (modifierPressed.current && !options.actInsideInputWithModifier)) &&
          isInputDOMNode(event);

        if (preventAction) {
          return false;
        }

        const keyOrCode = getKeyOrCode(event.code, keysToWatch);
        pressedKeys.current.add(event[keyOrCode]);

        if (isMatchingKey(keyCodes, pressedKeys.current, false)) {
          event.preventDefault();
          setKeyPressed(true);
        }
      };

      const upHandler = (event) => {
        const preventAction =
          (!modifierPressed.current ||
            (modifierPressed.current && !options.actInsideInputWithModifier)) &&
          isInputDOMNode(event);

        if (preventAction) {
          return false;
        }

        const keyOrCode = getKeyOrCode(event.code, keysToWatch);

        if (isMatchingKey(keyCodes, pressedKeys.current, true)) {
          setKeyPressed(false);
          pressedKeys.current.clear();
        } else {
          pressedKeys.current.delete(event[keyOrCode]);
        }

        // NOTE: fix for Mac: when cmd key is pressed, keyup is not triggered for any other key
        if (event.key === 'Meta') {
          pressedKeys.current.clear();
        }

        modifierPressed.current = false;
      };

      const resetHandler = () => {
        pressedKeys.current.clear();
        setKeyPressed(false);
      };

      target?.addEventListener('keydown', downHandler);
      target?.addEventListener('keyup', upHandler);
      window.addEventListener('blur', resetHandler);
      window.addEventListener('contextmenu', resetHandler);

      return () => {
        target?.removeEventListener('keydown', downHandler);
        target?.removeEventListener('keyup', upHandler);
        window.removeEventListener('blur', resetHandler);
        window.removeEventListener('contextmenu', resetHandler);
      };
    }
  }, [keyCode, setKeyPressed, options, keyCodes, keysToWatch]);

  return keyPressed;
};
