export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  username: string
  password: string
  acceptedTerms: boolean
}

export interface User {
  email: string
  username: string
}

export interface Project {
  id: string
  createdAt: string
  title: string
  location: string
  courses: number
  level: string
}

export const publicProjects: Project[] = [
  {
    id: '1',
    createdAt: new Date().toISOString(),
    title: 'Regional Show',
    location: 'Warsaw',
    courses: 2,
    level: 'regional',
  },
  {
    id: '2',
    createdAt: new Date().toISOString(),
    title: 'National Cup',
    location: 'Krakow',
    courses: 3,
    level: 'national',
  },
]

const API_DELAY = 800

function mockResponse<T>(data: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), API_DELAY))
}

export async function login(payload: LoginPayload): Promise<User> {
  await new Promise((r) => setTimeout(r, API_DELAY))

  if (!payload.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)) {
    throw new Error('Invalid email')
  }

  if (payload.password.length < 8) {
    throw new Error('Password too short')
  }

  if (payload.email === 'error@example.com') {
    throw new Error('Invalid credentials')
  }

  return { email: payload.email, username: payload.email }
}

export async function register(payload: RegisterPayload): Promise<User> {
  if (!payload.email || !payload.username || payload.password.length < 8 || !payload.acceptedTerms) {
    throw new Error('Invalid registration data')
  }
  return mockResponse({ email: payload.email, username: payload.username })
}

export async function fetchPublicProjects(): Promise<Project[]> {
  return mockResponse(publicProjects)
}
