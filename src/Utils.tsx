import {useEffect, useRef, useState} from 'react';

export function useInterval(callback: any, delay: number) {
  const [fence, setFence] = useState<number>(0);
  const tick = useRef();
  tick.current = callback;

  useEffect(() => {
    function trigger() {
      setFence(fence => fence + 1);
    }

    if (delay != null) {
      setFence(0);
      const id = setInterval(trigger, delay)
      return () => clearInterval(id)
    }
  }, [delay])

  useEffect(() => {
    if (fence > 0) (tick.current as any)();
  }, [fence]);
}

export function useIntervalImmediate(callback: any, delay: number) {
  const [fence, setFence] = useState<number>(0);
  const tick = useRef();
  tick.current = callback;

  useEffect(() => {
    function trigger() {
      setFence(fence => fence + 1);
    }

    if (delay != null) {
      setFence(fence => fence + 1);
      const id = setInterval(trigger, delay)
      return () => clearInterval(id);
    }
  }, [delay])

  useEffect(() => {
    (tick.current as any)();
  }, [fence]);
}
