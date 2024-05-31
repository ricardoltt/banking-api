/* eslint-disable camelcase */
import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { checkAccountExistsAndIsLogged } from '../middlewares/check-account-exists-and-is-logged'
import { checkAccountAlreadyExists } from '../middlewares/check-account-already-exists'
import { checkAccountTransferExistsAndIsLogged } from '../middlewares/check-account-transfer-exists-and-is-logged'

export async function accountsRoutes(app: FastifyInstance) {
  const accountNumberSchema = z.object({
    accountNumber: z.string(),
  })

  app.get(
    '/:accountNumber',
    { preHandler: [checkAccountExistsAndIsLogged] },
    async (request) => {
      const { accountNumber } = accountNumberSchema.parse(request.params)

      const account = await knex('accounts')
        .select()
        .where({ account_number: accountNumber })
        .first()

      return account
    },
  )

  app.get(
    '/:accountNumber/transfers',
    { preHandler: [checkAccountExistsAndIsLogged] },
    async (request) => {
      const { accountNumber } = accountNumberSchema.parse(request.params)

      const transfers = await knex('transfers')
        .select()
        .where({ from: accountNumber })

      const transfersQuantity = await knex('transfers')
        .count()
        .where({ from: accountNumber })
        .first()

      const total = transfersQuantity && transfersQuantity['count(*)']

      return { transfers, total }
    },
  )

  app.post(
    '/',
    { preHandler: [checkAccountAlreadyExists] },
    async (request, reply) => {
      const createAccountBodySchema = z.object({
        account_number: z.string(),
      })

      const { account_number } = createAccountBodySchema.parse(request.body)

      const sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      const accountBody = {
        id: randomUUID(),
        account_number,
        balance: 0,
        deposit_quantity: 0,
        session_id: sessionId,
      }

      await knex('accounts').insert(accountBody)

      return reply.status(201).send(accountBody)
    },
  )

  app.get(
    '/:accountNumber/balance',
    { preHandler: [checkAccountExistsAndIsLogged] },
    async (request) => {
      const { sessionId } = request.cookies

      const { accountNumber } = accountNumberSchema.parse(request.params)

      const balance = await knex('accounts')
        .select('balance')
        .where({ account_number: accountNumber, session_id: sessionId })
        .first()

      return balance
    },
  )

  app.post(
    '/:accountNumber/deposit',
    { preHandler: [checkAccountExistsAndIsLogged] },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const createDepositBodySchema = z.object({
        amount: z.number(),
      })

      const { amount } = createDepositBodySchema.parse(request.body)
      const { accountNumber } = accountNumberSchema.parse(request.params)

      const account = await knex('accounts')
        .select()
        .where({ account_number: accountNumber, session_id: sessionId })
        .first()

      if (!account) {
        return reply.status(404).send('Account not found.')
      }

      const newBalance = amount + account.balance

      await knex('accounts')
        .update({
          balance: newBalance,
          deposit_quantity: account.deposit_quantity + 1,
        })
        .where('account_number', accountNumber)

      return reply.status(200).send()
    },
  )

  app.post(
    '/transfer',
    {
      preHandler: [checkAccountTransferExistsAndIsLogged],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const transferBodySchema = z.object({
        amount: z.number(),
        from: z.string(),
        to: z.string(),
      })

      const {
        amount,
        from: fromAccountNumber,
        to: toAccountNumber,
      } = transferBodySchema.parse(request.body)

      const fromAccount = await knex('accounts')
        .select()
        .where({
          account_number: fromAccountNumber,
          session_id: sessionId,
        })
        .first()

      if (!fromAccount) {
        return reply.status(404).send('Conta de origem não encontrada.')
      }

      if (fromAccount.balance < amount) {
        return reply.status(409).send({
          error: true,
          message: 'Insufficient balance',
        })
      }

      const toAccount = await knex('accounts')
        .select()
        .where({
          account_number: toAccountNumber,
        })
        .first()

      if (!toAccount) {
        return reply.status(404).send('Conta de destino não encontrada.')
      }

      const fromAccountNewBalance = fromAccount.balance - amount
      const toAccountNewBalance = amount + toAccount.balance

      await knex('accounts')
        .update('balance', fromAccountNewBalance)
        .where('account_number', fromAccountNumber)

      await knex('accounts')
        .update('balance', toAccountNewBalance)
        .where('account_number', toAccountNumber)

      await knex('transfers').insert({
        id: randomUUID(),
        amount,
        from: fromAccount.account_number,
        to: toAccount.account_number,
      })

      return reply.status(200).send()
    },
  )
}
