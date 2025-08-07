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

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (boxRef.current) {
      resizingRef.current = true;
      startPosRef.current = { x: e.clientX, y: e.clientY };
      startSizeRef.current = { width: size.width, height: size.height };
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      e.preventDefault();
    }
  }, [size]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (resizingRef.current) {
      const deltaX = e.clientX - startPosRef.current.x;
      const deltaY = e.clientY - startPosRef.current.y;

      const newWidth = Math.max(minWidth, startSizeRef.current.width + deltaX);
      const newHeight = Math.max(minHeight, startSizeRef.current.height + deltaY);

      setSize({ width: newWidth, height: newHeight });
    }
  }, [minWidth, minHeight]);

  const handleMouseUp = useCallback(() => {
    resizingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

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
        className="absolute bottom-0 right-0 w-5 h-5 bg-primary-600 cursor-nwse-resize"
        style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};
