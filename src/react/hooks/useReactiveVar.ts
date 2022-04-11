import { useEffect, useRef, useState } from 'react';
import { ReactiveVar } from '../../core';

export function useReactiveVar<T>(rv: ReactiveVar<T>): T {
  const value = rv();
  const mounted = useRef(false);

  // We don't actually care what useState thinks the value of the variable
  // is, so we take only the update function from the returned array.
  const setValue = useState(value)[1];

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  // We subscribe to variable updates on initial mount and when the value has
  // changed. This avoids a subtle bug in React.StrictMode where multiple
  // listeners are added, leading to inconsistent updates.
  useEffect(() => {
    const probablySameValue = rv();
    if (value !== probablySameValue) {
      // If the value of rv has already changed, we don't need to listen for the
      // next change, because we can report this change immediately.
      setValue(probablySameValue);
    } else {
      return rv.onNextChange((newValue) => {
        // Check if still mounted before updating state
        if (!mounted.current) {
          return
        }
        setValue(newValue)
      });
    }
  }, [value]);

  return value;
}
