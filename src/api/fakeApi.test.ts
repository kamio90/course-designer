import { describe, expect, it, vi } from 'vitest'
import { login, register } from './fakeApi'

vi.useFakeTimers()

describe('fakeApi.login', () => {
  it('resolves with user data for valid credentials', async () => {
    const promise = login({ email: 'user@example.com', password: 'password123' })
    vi.runAllTimers()
    await expect(promise).resolves.toEqual({ email: 'user@example.com', username: 'user@example.com' })
  })

  it('rejects for invalid email', async () => {
    const promise = login({ email: 'invalid', password: 'password123' })
    vi.runAllTimers()
    await expect(promise).rejects.toThrow('Invalid email')
  })

  it('rejects for short password', async () => {
    const promise = login({ email: 'user@example.com', password: 'short' })
    vi.runAllTimers()
    await expect(promise).rejects.toThrow('Password too short')
  })

  it('rejects for invalid credentials', async () => {
    const promise = login({ email: 'error@example.com', password: 'password123' })
    vi.runAllTimers()
    await expect(promise).rejects.toThrow('Invalid credentials')
  })
})

describe('fakeApi.register', () => {
  it('resolves with user data for valid input', async () => {
    const promise = register({
      email: 'new@example.com',
      username: 'newuser',
      password: 'password123!',
      acceptedTerms: true,
    })
    vi.runAllTimers()
    await expect(promise).resolves.toEqual({
      email: 'new@example.com',
      username: 'newuser',
    })
  })

  it('rejects when user already exists', async () => {
    const promise = register({
      email: 'exists@example.com',
      username: 'newuser',
      password: 'password123!',
      acceptedTerms: true,
    })
    vi.runAllTimers()
    await expect(promise).rejects.toThrow('User already exists')
  })
})
