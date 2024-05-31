/* eslint-disable camelcase */
import { it, beforeEach, beforeAll, afterAll, describe, expect } from 'vitest'

import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'child_process'

describe('Test routes', () => {
  beforeAll(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
    await app.ready()
  })

  afterAll(async () => {
    execSync('npm run knex migrate:rollback --all')
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  describe('Transaction routes', () => {
    it('should be able to create a new account', async () => {
      await request(app.server)
        .post('/api/v1/accounts')
        .send({
          account_number: '1234',
        })
        .expect(201)
    })

    it('should be able to create a deposit', async () => {
      const account_number = '123'

      const createAccountResponse = await request(app.server)
        .post('/api/v1/accounts')
        .send({
          account_number,
        })

      const cookies = createAccountResponse.get('Set-Cookie') ?? []

      await request(app.server)
        .post(`/api/v1/accounts/${account_number}/deposit`)
        .set('Cookie', cookies)
        .send({
          amount: 1000,
        })
        .expect(200)
    })

    it('should be able to create a transfer', async () => {
      const accountNumberFrom = '123'
      const accountNumberTo = '1234'

      await request(app.server).post('/api/v1/accounts').send({
        account_number: accountNumberTo,
      })

      const createAccountResponse = await request(app.server)
        .post('/api/v1/accounts')
        .send({
          account_number: accountNumberFrom,
        })

      const cookies = createAccountResponse.get('Set-Cookie') ?? []

      await request(app.server)
        .post(`/api/v1/accounts/${accountNumberFrom}/deposit`)
        .set('Cookie', cookies)
        .send({
          amount: 1000,
        })

      await request(app.server)
        .post(`/api/v1/accounts/transfer`)
        .set('Cookie', cookies)
        .send({
          amount: 200,
          from: accountNumberFrom,
          to: accountNumberTo,
        })
        .expect(200)
    })

    it('should be able to get an account', async () => {
      const accountNumber = '1234'

      const createAccountResponse = await request(app.server)
        .post('/api/v1/accounts')
        .send({
          account_number: accountNumber,
        })

      const cookies = createAccountResponse.get('Set-Cookie') ?? []

      const account = await request(app.server)
        .get(`/api/v1/accounts/${accountNumber}`)
        .set('Cookie', cookies)
        .expect(200)

      expect(account.body).toEqual(
        expect.objectContaining({
          account_number: accountNumber,
        }),
      )
    })

    it('should be able to get a balance', async () => {
      const accountNumber = '1234'

      const createAccountResponse = await request(app.server)
        .post('/api/v1/accounts')
        .send({
          account_number: accountNumber,
        })

      const cookies = createAccountResponse.get('Set-Cookie') ?? []

      const balance = await request(app.server)
        .get(`/api/v1/accounts/${accountNumber}/balance`)
        .set('Cookie', cookies)
        .expect(200)

      expect(balance.body).toEqual(
        expect.objectContaining({
          balance: 0,
        }),
      )
    })

    it('should be able to list transfers', async () => {
      const accountNumberFrom = '123'
      const accountNumberTo = '1234'

      const createAccountResponse = await request(app.server)
        .post('/api/v1/accounts')
        .send({
          account_number: accountNumberFrom,
        })

      const cookies = createAccountResponse.get('Set-Cookie') ?? []

      await request(app.server).post('/api/v1/accounts').send({
        account_number: accountNumberTo,
      })

      await request(app.server)
        .post(`/api/v1/accounts/${accountNumberFrom}/deposit`)
        .set('Cookie', cookies)
        .send({
          amount: 1000,
        })

      await request(app.server)
        .post(`/api/v1/accounts/transfer`)
        .set('Cookie', cookies)
        .send({
          amount: 200,
          from: accountNumberFrom,
          to: accountNumberTo,
        })

      const transfers = await request(app.server)
        .get(`/api/v1/accounts/${accountNumberFrom}/transfers`)
        .set('Cookie', cookies)
        .expect(200)

      expect(transfers.body.transfers).toEqual([
        expect.objectContaining({
          from: '123',
          to: '1234',
          amount: 200,
        }),
      ])
    })
  })

  describe('Description route', () => {
    it('should be able to get version and description from api', async () => {
      const description = await request(app.server)
        .get('/api/v1/description')
        .expect(200)

      expect(description.body).toEqual(
        expect.objectContaining({
          version: '1.0.0',
          description: 'API for managing an account',
        }),
      )
    })
  })

  describe('Login route', () => {
    it('should be able to login', async () => {
      const accountNumber = '123'

      await request(app.server).post('/api/v1/accounts').send({
        account_number: accountNumber,
      })

      await request(app.server)
        .post('/api/v1/login')
        .send({
          account_number: accountNumber,
        })
        .expect(200)
    })

    it("should not be able to login with an account that doesn't exist", async () => {
      const accountNumber = '999999'

      await request(app.server)
        .post('/api/v1/login')
        .send({
          account_number: accountNumber,
        })
        .expect(404)
    })
  })
})
