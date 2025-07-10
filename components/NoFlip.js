// components/NoFlipWrapper.js
export default function NoFlipWrapper({ children, active }) {
  return (
    <div
      onMouseDown={active ? (e) => e.stopPropagation() : undefined}
      onTouchStart={active ? (e) => e.stopPropagation() : undefined}
      onClick={active ? (e) => e.stopPropagation() : undefined}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </div>
  )
}