import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export async function checkAccountExistsAndIsLogged(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const sessionId = request.cookies.sessionId

    if (!sessionId) {
      return reply.status(401).send('Unauthorized.')
    }

    const getParamsSchema = z.object({
      accountNumber: z.string(),
    })

    const { accountNumber } = getParamsSchema.parse(request.params)

    const account = await knex('accounts')
      .select()
      .where({ account_number: accountNumber })
      .first()

    if (!account) {
      return reply.status(404).send('Account not found.')
    }

    if (account && sessionId !== account.session_id) {
      return reply.status(401).send('Unauthorized')
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send(JSON.parse(error.message))
    } else {
      return reply.status(500).send(error)
    }
  }
}
