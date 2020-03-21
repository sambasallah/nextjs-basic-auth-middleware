import { createRequest, createResponse } from 'node-mocks-http'

import basicAuthMiddleware from '../src'
import { createAuthorizationHeader } from './utils'

describe('Basic auth middleware', () => {
  it('does not authenticate when no users are set', () => {
    const req = createRequest({
      method: 'GET',
      url: '/test',
    })
    const res = createResponse()

    basicAuthMiddleware(req, res, {})

    expect(res.statusCode).toBe(200)
  })

  it('returns a 401 when no credentials are given', () => {
    const req = createRequest({
      method: 'GET',
      url: '/test',
    })
    const res = createResponse()

    basicAuthMiddleware(req, res, {
      users: [{ name: 'test', password: 'test' }],
    })

    expect(res.statusCode).toBe(401)
  })

  it('returns a 200 when the user is authenticated', () => {
    const req = createRequest({
      method: 'GET',
      url: '/test',
      headers: {
        Authorization: createAuthorizationHeader('test', 'test'),
      },
    })
    const res = createResponse()

    basicAuthMiddleware(req, res, {
      users: [{ name: 'test', password: 'test' }],
    })

    expect(res.statusCode).toBe(200)
  })

  it('returns a 401 when the credentials are wrong', () => {
    const req = createRequest({
      method: 'GET',
      url: '/test',
      headers: {
        Authorization: createAuthorizationHeader('test', 'test'),
      },
    })
    const res = createResponse()

    basicAuthMiddleware(req, res, {
      users: [{ name: 'test', password: 'testing' }],
    })

    expect(res.statusCode).toBe(401)
  })

  it('returns the correct realm name on a 401', () => {
    const req = createRequest({
      method: 'GET',
      url: '/test',
      headers: {
        Authorization: createAuthorizationHeader('test', 'test'),
      },
    })
    const res = createResponse()

    basicAuthMiddleware(req, res, {
      realm: 'Test',
      users: [{ name: 'test', password: 'testing' }],
    })

    expect(res._getHeaders()['www-authenticate']).toBe('Basic realm="Test"')
  })

  it('prefers using the environment variables when set', () => {
    process.env.BASIC_AUTH_CREDENTIALS = 'test:testing'

    const req = createRequest({
      method: 'GET',
      url: '/test',
      headers: {
        Authorization: createAuthorizationHeader('test', 'test'),
      },
    })
    const res = createResponse()

    basicAuthMiddleware(req, res, {
      realm: 'Test',
      users: [{ name: 'test', password: 'test' }],
    })

    expect(res.statusCode).toBe(401)
  })
})
