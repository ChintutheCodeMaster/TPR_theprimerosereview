
import React, { useState, useEffect, useRef } from "react";

interface AnimatedNumberProps {
  value: number;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const startValueRef = useRef<number>(0);
  const endValueRef = useRef<number>(Math.min(100, Math.max(0, value)));

  const animate = (time: number) => {
    if (previousTimeRef.current === null) {
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
      return;
    }

    const deltaTime = time - previousTimeRef.current;
    const duration = 1500;
    const progress = Math.min(1, deltaTime / duration);
    const newValue = startValueRef.current + progress * (endValueRef.current - startValueRef.current);

    if (progress < 1) {
      setDisplayValue(Math.floor(newValue));
      requestRef.current = requestAnimationFrame(animate);
    } else {
      setDisplayValue(endValueRef.current);
    }

    previousTimeRef.current = time;
  };

  useEffect(() => {
    startValueRef.current = displayValue;
    endValueRef.current = Math.min(100, Math.max(0, value));

    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }

    previousTimeRef.current = null;
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [value]);

  return (
    <span className="font-bold text-red-700 transition-all duration-300">
      {displayValue}
    </span>
  );
};

export default AnimatedNumber;
