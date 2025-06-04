export function matchShortcut(e: KeyboardEvent, shortcut: string): boolean {
  const parts = shortcut.toLowerCase().split('+')
  let keyMatched = false
  for (const part of parts) {
    if (part === 'ctrl' || part === 'control') {
      if (!e.ctrlKey) return false
    } else if (part === 'shift') {
      if (!e.shiftKey) return false
    } else if (part === 'alt') {
      if (!e.altKey) return false
    } else {
      keyMatched = e.key.toLowerCase() === part
    }
  }
  return keyMatched
}
