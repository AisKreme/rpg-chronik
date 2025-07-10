// components/NoFlip.js
export default function NoFlip({ children }) {
  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className="w-full"
    >
      {children}
    </div>
  )
}