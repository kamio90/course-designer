export interface LoginLogEntry {
  id: string
  hashedEmail: string
  success: boolean
  time: number
}

function hash(str: string): string {
  let h = 0
  for (let i = 0; i < str.length; i += 1) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return String(h >>> 0)
}

export function logLoginAttempt(email: string, success: boolean) {
  const entry: LoginLogEntry = {
    id: crypto.randomUUID(),
    hashedEmail: hash(email.toLowerCase()),
    success,
    time: Date.now(),
  }
  try {
    const raw = localStorage.getItem('loginLogs')
    const logs: LoginLogEntry[] = raw ? JSON.parse(raw) : []
    logs.push(entry)
    localStorage.setItem('loginLogs', JSON.stringify(logs))
  } catch {
    // ignore storage errors
  }
  console.log('login attempt', { hashedEmail: entry.hashedEmail, success })
}
