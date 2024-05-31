import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('accounts', (table) => {
    table.uuid('id').primary().notNullable()
    table.text('account_number').notNullable()
    table.integer('deposit_quantity').notNullable()
    table.decimal('balance', 10, 2).notNullable()
    table.uuid('session_id').index().notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('accounts')
}
