import {useEffect, useRef, useState} from 'react';

export function useInterval(callback: any, delay: number, immediate?: boolean) {
  const [fence, setFence] = useState(0);
  const tick = useRef();
  tick.current = callback;

  useEffect(() => {
    function trigger() {
      setFence(idx => idx + 1);
    }

    if (delay != null) {
      setFence(0);
      const id = setInterval(trigger, delay)
      return () => clearInterval(id)
    }
  }, [delay])

  useEffect(() => {
    if (immediate == true)
      (tick.current as any)();
    else if (fence > 0)
      (tick.current as any)();
  }, [fence]);
}

export function useIntervalImmediate(callback: any, delay: number) {
  useInterval(callback, delay, true);
}
