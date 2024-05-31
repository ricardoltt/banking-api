import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export async function checkAccountTransferExistsAndIsLogged(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const sessionId = request.cookies.sessionId

    const getParamsSchema = z.object({
      from: z.string(),
      to: z.string(),
    })

    const { from, to } = getParamsSchema.parse(request.body)

    if (from === to) {
      return reply.status(404).send('Conta de origem e destino estão iguais.')
    }

    const fromAccount = await knex('accounts')
      .select()
      .where({ account_number: from })
      .first()

    if (!fromAccount) {
      return reply.status(404).send('Conta de origem não encontrada.')
    }

    if (fromAccount && sessionId !== fromAccount.session_id) {
      return reply.status(401).send('Unauthorized')
    }

    const toAccount = await knex('accounts')
      .select()
      .where({ account_number: to })
      .first()

    if (!toAccount) {
      return reply.status(404).send('Conta de destino não encontrada.')
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send(JSON.parse(error.message))
    } else {
      return reply.status(500).send(error)
    }
  }
}
