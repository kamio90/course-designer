import { useRef, useState } from 'react'

export default function useUndoable<T>(initial: T) {
  const [state, setState] = useState<T>(initial)
  const past = useRef<T[]>([])
  const future = useRef<T[]>([])

  const set = (value: T | ((prev: T) => T)) => {
    setState((prev) => {
      const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value
      past.current.push(prev)
      future.current = []
      return next
    })
  }

  const undo = () => {
    setState((prev) => {
      if (!past.current.length) return prev
      const last = past.current.pop() as T
      future.current.push(prev)
      return last
    })
  }

  const redo = () => {
    setState((prev) => {
      if (!future.current.length) return prev
      const next = future.current.pop() as T
      past.current.push(prev)
      return next
    })
  }

  const replace = (value: T) => {
    setState(value)
  }

  return {
    state,
    set,
    replace,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  }
}
