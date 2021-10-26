import {useEffect, useRef, useState} from 'react';


export function useInterval(callback: () => void, delay: number, immediate?: boolean) {
  const tick = useRef(() => {
  });

  tick.current = callback;
  useEffect(() => {
    function tickFn() {
      tick.current();
    }

    if (immediate === true)
      tickFn();

    const key = setInterval(tickFn, delay);
    return () => clearInterval(key);
  }, [delay, immediate]);
}

export function useIntervalImmediate(callback: any,  delay:number){
  useInterval(callback, delay, true);
}

export function useIntervalState(callback: any, delay: number, immediate?: boolean) {
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
    if (immediate === true)
      (tick.current as any)();
    else if (fence > 0)
      (tick.current as any)();
  }, [fence, immediate]);
}

export function useIntervalStateImmediate(callback: any, delay: number) {
  useIntervalState(callback, delay, true);
}
