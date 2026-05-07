export const up = function(knex) {
  return knex.schema.table('users', (table) => {
    table.string('address');
    table.string('city');
    table.string('postal_code');
  });
};

export const down = function(knex) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('address');
    table.dropColumn('city');
    table.dropColumn('postal_code');
  });
};
