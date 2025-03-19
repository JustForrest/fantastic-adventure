import { describe, it, expect } from 'vitest'
import { env } from './env'

describe('env configuration', () => {
  it('should have NODE_ENV defined', () => {
    expect(env.NODE_ENV).toBeDefined()
  })

  it('should be in test environment', () => {
    expect(env.NODE_ENV).toBe('test')
  })
}) 