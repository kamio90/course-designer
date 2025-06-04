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

function mockResponse<T>(data: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), 500))
}

export async function login(payload: LoginPayload): Promise<User> {
  if (!payload.email || payload.password.length < 6) {
    throw new Error('Invalid credentials')
  }
  return mockResponse({ email: payload.email, username: payload.email })
}

export async function register(payload: RegisterPayload): Promise<User> {
  if (!payload.email || !payload.username || payload.password.length < 6 || !payload.acceptedTerms) {
    throw new Error('Invalid registration data')
  }
  return mockResponse({ email: payload.email, username: payload.username })
}

export async function fetchPublicProjects(): Promise<Project[]> {
  return mockResponse(publicProjects)
}
