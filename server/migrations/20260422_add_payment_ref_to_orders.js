export const up = async function(knex) {
  const hasPaymentRef = await knex.schema.hasColumn('orders', 'payment_ref');
  if (!hasPaymentRef) {
    await knex.schema.alterTable('orders', (table) => {
      table.string('payment_ref').nullable();
      table.string('customer_email').nullable();
      table.timestamp('paid_at').nullable();
    });
  }
};

export const down = function(knex) {
  return knex.schema.alterTable('orders', (table) => {
    table.dropColumn('payment_ref');
    table.dropColumn('paid_at');
  });
};
