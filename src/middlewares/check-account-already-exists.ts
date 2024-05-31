/* eslint-disable camelcase */
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export async function checkAccountAlreadyExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const getParamsSchema = z.object({
      account_number: z.string(),
    })

    const { account_number } = getParamsSchema.parse(request.body)

    const account = await knex('accounts')
      .select()
      .where({ account_number })
      .first()

    if (account) {
      return reply.status(409).send()
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send(JSON.parse(error.message))
    } else {
      return reply.status(500).send(error)
    }
  }
}
