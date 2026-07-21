export const up = async function(knex) {
  const hasColumn = await knex.schema.hasColumn('users', 'kingschat_id');
  if (!hasColumn) {
    await knex.schema.table('users', (table) => {
      table.string('kingschat_id').unique().nullable();
    });
  }

  // Ensure password column allows null for OAuth/KingsChat users
  await knex.schema.alterTable('users', (table) => {
    table.string('password').nullable().alter();
  });
};

export const down = async function(knex) {
  const hasColumn = await knex.schema.hasColumn('users', 'kingschat_id');
  if (hasColumn) {
    await knex.schema.table('users', (table) => {
      table.dropColumn('kingschat_id');
    });
  }
};
