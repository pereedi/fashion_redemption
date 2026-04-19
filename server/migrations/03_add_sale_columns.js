export const up = async function(knex) {
  const hasOnSale = await knex.schema.hasColumn('products', 'on_sale');
  const hasSalePrice = await knex.schema.hasColumn('products', 'sale_price');
  
  if (!hasOnSale || !hasSalePrice) {
    await knex.schema.alterTable('products', (table) => {
      if (!hasOnSale) table.boolean('on_sale').defaultTo(false);
      if (!hasSalePrice) table.decimal('sale_price', 12, 2);
    });
  }
};

export const down = function(knex) {
  return knex.schema.alterTable('products', (table) => {
    table.dropColumn('on_sale');
    table.dropColumn('sale_price');
  });
};
