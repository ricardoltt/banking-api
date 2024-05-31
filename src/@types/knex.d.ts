// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    transfers: {
      id: string
      from: string
      to: string
      amount: number
      created_at: string
    }
  }
}
