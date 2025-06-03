import { useState } from 'react'

interface Props {
  showGrid: boolean
  toggleGrid: () => void
  scale: number
  toggleScale: () => void
}

export default function DesignTopBar({ showGrid, toggleGrid, scale, toggleScale }: Props) {
  const [helpVisible, setHelpVisible] = useState(false)

  return (
    <header className="topbar design-topbar">
      <div className="logo">{scale === 10 ? '1m = 10px' : 'px'}</div>
      <button onClick={toggleScale}>Toggle Scale</button>
      <button onClick={toggleGrid}>{showGrid ? 'Hide Grid' : 'Show Grid'}</button>
      <button onClick={() => setHelpVisible(true)}>?</button>
      {helpVisible && (
        <div className="modal" role="dialog">
          <div className="modal-content">
            <p>Left click to add point. Drag points to adjust. Close shape to enable save.</p>
            <button onClick={() => setHelpVisible(false)}>Close</button>
          </div>
        </div>
      )}
    </header>
  )
}
