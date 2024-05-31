/* eslint-disable camelcase */
import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'

export async function loginRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const accountNumberBodySchema = z.object({
      account_number: z.string(),
    })

    const { account_number } = accountNumberBodySchema.parse(request.body)

    const account = await knex('accounts')
      .select()
      .where({
        account_number,
      })
      .first()

    if (!account) {
      return reply.status(404).send('Conta não encontrada.')
    }

    reply.cookie('sessionId', account.session_id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return reply.status(200).send()
  })
}
