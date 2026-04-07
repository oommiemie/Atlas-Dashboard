import { useState, useEffect, useRef } from 'react';

export default function CountUp({ end, duration = 1200, delay = 0, decimals = 0, prefix = '', suffix = '', style, className }) {
  const [val, setVal] = useState(0);
  const ref = useRef();

  // Extract numeric value — only pure numbers or numbers with % suffix
  const raw = typeof end === 'number' ? end : typeof end === 'string' && /^[\d.]+$/.test(end.trim()) ? parseFloat(end) : NaN;
  const target = raw;
  const isNumeric = !isNaN(target) && isFinite(target);

  useEffect(() => {
    if (!isNumeric) return;

    const timer = setTimeout(() => {
      const start = performance.now();
      const step = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setVal(eased * target);
        if (progress < 1) ref.current = requestAnimationFrame(step);
      };
      ref.current = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [end, duration, delay, isNumeric, target]);

  if (!isNumeric) {
    return <span style={style} className={className}>{end}</span>;
  }

  const display = decimals > 0
    ? val.toFixed(decimals)
    : Math.round(val).toLocaleString();

  return <span style={style} className={className}>{prefix}{display}{suffix}</span>;
}
