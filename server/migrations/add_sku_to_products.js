export const up = (knex) => {
  return knex.schema.alterTable('products', (table) => {
    table.string('sku').unique().nullable();
  });
};

export const down = (knex) => {
  return knex.schema.alterTable('products', (table) => {
    table.dropColumn('sku');
  });
};