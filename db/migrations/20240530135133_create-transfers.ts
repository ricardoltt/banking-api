import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('transfers', (table) => {
    table.uuid('id').primary()
    table.text('from').notNullable()
    table.text('to').notNullable()
    table.decimal('amount', 10, 2).notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('transfers')
}
