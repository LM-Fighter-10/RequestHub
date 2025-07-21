// src/db.ts
import { Database } from 'bun:sqlite'
import { drizzle }  from 'drizzle-orm/bun-sqlite'

// this will create (or open) dev.sqlite in your backend folder
const sqliteDb = new Database('dev.sqlite')

export const db = drizzle(sqliteDb)
