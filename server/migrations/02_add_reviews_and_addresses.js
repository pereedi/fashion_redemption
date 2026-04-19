export const up = async function(knex) {
  const hasReviews = await knex.schema.hasTable('reviews');
  if (!hasReviews) {
    await knex.schema.createTable('reviews', (table) => {
      table.increments('id').primary();
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE');
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
      table.string('customer_name').notNullable();
      table.integer('rating').notNullable();
      table.text('comment').notNullable();
      table.timestamps(true, true);
    });
  }

  const hasAddresses = await knex.schema.hasTable('addresses');
  if (!hasAddresses) {
    await knex.schema.createTable('addresses', (table) => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.string('street').notNullable();
      table.string('city').notNullable();
      table.string('state');
      table.string('postal_code').notNullable();
      table.string('country').defaultTo('Nigeria');
      table.boolean('is_default').defaultTo(false);
      table.timestamps(true, true);
    });
  }
};

export const down = function(knex) {
  return knex.schema
    .dropTableIfExists('addresses')
    .dropTableIfExists('reviews');
};
