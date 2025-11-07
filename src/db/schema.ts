import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const medicaments = sqliteTable('medicaments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nom: text('nom').notNull(),
  prix: real('prix').notNull(),
  quantite: integer('quantite').notNull(),
  dateExpiration: text('date_expiration').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});