interface Props {
  onSave: () => void
  canSave: boolean
}

export default function LayoutTools({ onSave, canSave }: Props) {
  return (
    <aside className="sidebar left" aria-label="layout tools">
      <h2>Tools</h2>
      <button onClick={onSave} disabled={!canSave}>
        Save layout
      </button>
      <ul>
        <li>Water feature</li>
        <li>Grass section</li>
        <li>Entrance</li>
        <li>Exit</li>
        <li>Gazebo</li>
      </ul>
    </aside>
  )
}
