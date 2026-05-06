import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const waitlistEntries = sqliteTable('waitlist_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});
