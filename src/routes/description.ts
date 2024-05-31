/* eslint-disable camelcase */
import { FastifyInstance } from 'fastify'
import { promises as fs } from 'fs'
import * as path from 'path'

export async function descriptionRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const packageJsonPath = path.resolve(__dirname, '../../package.json')
    const data = await fs.readFile(packageJsonPath, 'utf-8')
    const packageJson = JSON.parse(data)
    const { version, description } = packageJson
    return { version, description }
  })
}
