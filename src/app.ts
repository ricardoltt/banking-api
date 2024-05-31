import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { accountsRoutes } from './routes/accounts'
import { loginRoutes } from './routes/login'
import { descriptionRoutes } from './routes/description'

export const app = fastify()

app.register(cookie)

app.register(loginRoutes, {
  prefix: '/api/v1/login',
})

app.register(accountsRoutes, {
  prefix: '/api/v1/accounts',
})

app.register(descriptionRoutes, {
  prefix: '/api/v1/description',
})
