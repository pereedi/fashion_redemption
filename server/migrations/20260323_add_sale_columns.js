export const up = function(knex) {
  return knex.schema.alterTable('products', (table) => {
    table.boolean('on_sale').defaultTo(false);
    table.decimal('sale_price', 12, 2);
  });
};

export const down = function(knex) {
  return knex.schema.alterTable('products', (table) => {
    table.dropColumn('on_sale');
    table.dropColumn('sale_price');
  });
};
