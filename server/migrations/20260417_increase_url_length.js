
export const up = function(knex) {
  return knex.schema.alterTable('product_images', (table) => {
    table.text('url', 'longtext').notNullable().alter();
  })
  .alterTable('order_items', (table) => {
    table.text('image', 'longtext').alter();
  });
};

export const down = function(knex) {
  return knex.schema.alterTable('product_images', (table) => {
    table.string('url', 255).notNullable().alter();
  })
  .alterTable('order_items', (table) => {
    table.string('image', 255).alter();
  });
};
