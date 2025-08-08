import React, { useState, useRef, useCallback } from 'react';

interface ResizableBoxProps {
  children: React.ReactNode;
  className?: string;
  initialWidth?: number;
  initialHeight?: number;
  minWidth?: number;
  minHeight?: number;
}

export const ResizableBox: React.FC<ResizableBoxProps> = ({
  children,
  className = '',
  initialWidth = 400,
  initialHeight = 300,
  minWidth = 100,
  minHeight = 100,
}) => {
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const boxRef = useRef<HTMLDivElement>(null);
  const resizingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startSizeRef = useRef({ width: 0, height: 0 });
  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (boxRef.current) {
      resizingRef.current = true;
      startPosRef.current = { x: clientX, y: clientY };
      startSizeRef.current = { width: size.width, height: size.height };
    }
  }, [size]);
  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (resizingRef.current) {
      const deltaX = clientX - startPosRef.current.x;
      const deltaY = clientY - startPosRef.current.y;

      const newWidth = Math.max(minWidth, startSizeRef.current.width + deltaX);
      const newHeight = Math.max(minHeight, startSizeRef.current.height + deltaY);

      setSize({ width: newWidth, height: newHeight });
    }
  }, [minWidth, minHeight]);
  const handleEnd = useCallback(() => {
    resizingRef.current = false;
  }, []);
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    handleStart(e.clientX, e.clientY);

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleMouseUp = () => {
      handleEnd();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    e.preventDefault();
  }, [handleStart, handleMove, handleEnd]);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // Prevent scrolling
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = () => {
      handleEnd();
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    e.preventDefault();
  }, [handleStart, handleMove, handleEnd]);

  return (
    <div
      ref={boxRef}
      className={`relative overflow-hidden shadow-md transition-shadow duration-300 ${className}`}
      style={{
        width: size.width,
        height: size.height,
        boxSizing: 'border-box'
      }}
    >
      {children}
      <div
        className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 cursor-nwse-resize touch-none select-none"
        style={{
          clipPath: 'polygon(100% 0, 100% 100%, 0 100%)'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      />
    </div>
  );
};
