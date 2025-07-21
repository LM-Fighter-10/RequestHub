import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

export const collections = sqliteTable('collections', {
    id: integer('id').primaryKey(),
    name: text('name').notNull()
})

export const requests = sqliteTable('requests', {
    id: integer('id').primaryKey(),

    collectionId: integer('collection_id')
        .references(() => collections.id),

    name:   text('name').notNull(),
    method: text('method').notNull(),
    url:    text('url').notNull(),

    headers: text('headers', { mode: 'json' })
        .$type<Record<string, string>>()
        .notNull(),

    body: text('body', { mode: 'json' })
        .$type<any>()
})
