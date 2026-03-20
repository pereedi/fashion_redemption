export const up = function(knex) {
  return knex.schema
    .createTable('users', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('email').unique().notNullable();
      table.string('password').notNullable();
      table.enum('role', ['customer', 'admin']).defaultTo('customer');
      table.timestamps(true, true);
    })
    .createTable('products', (table) => {
      table.increments('id').primary();
      table.string('external_id').unique().notNullable();
      table.string('name').notNullable();
      table.text('description').notNullable();
      table.string('category').notNullable();
      table.string('type').notNullable();
      table.decimal('base_price', 12, 2).notNullable();
      table.decimal('rating', 3, 2).defaultTo(0);
      table.integer('review_count').defaultTo(0);
      table.timestamps(true, true);
    })
    .createTable('product_images', (table) => {
      table.increments('id').primary();
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE');
      table.string('url').notNullable();
      table.boolean('is_primary').defaultTo(false);
    })
    .createTable('product_variants', (table) => {
      table.increments('id').primary();
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE');
      table.string('size');
      table.string('color');
      table.integer('stock').defaultTo(0);
      table.decimal('price_override', 12, 2);
    })
    .createTable('orders', (table) => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
      table.string('status').defaultTo('pending');
      table.decimal('subtotal', 12, 2).notNullable();
      table.decimal('tax', 12, 2).defaultTo(0);
      table.decimal('discount', 12, 2).defaultTo(0);
      table.decimal('total', 12, 2).notNullable();
      table.string('shipping_method').notNullable();
      table.decimal('shipping_price', 12, 2).defaultTo(0);
      table.string('payment_method').notNullable();
      table.string('customer_name').notNullable();
      table.text('customer_address').notNullable();
      table.string('customer_city').notNullable();
      table.string('customer_postal_code').notNullable();
      table.timestamps(true, true);
    })
    .createTable('order_items', (table) => {
      table.increments('id').primary();
      table.integer('order_id').unsigned().references('id').inTable('orders').onDelete('CASCADE');
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('SET NULL');
      table.string('name').notNullable();
      table.decimal('price', 12, 2).notNullable();
      table.integer('quantity').notNullable();
      table.string('size');
      table.string('image');
    })
    .createTable('wishlist', (table) => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE');
      table.unique(['user_id', 'product_id']);
    });
};

export const down = function(knex) {
  return knex.schema
    .dropTableIfExists('wishlist')
    .dropTableIfExists('order_items')
    .dropTableIfExists('orders')
    .dropTableIfExists('product_variants')
    .dropTableIfExists('product_images')
    .dropTableIfExists('products')
    .dropTableIfExists('users');
};
