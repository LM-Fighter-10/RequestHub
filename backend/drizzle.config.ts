// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
    schema: './src/schema.ts',  // your Drizzle schema
    out:    './migrations',     // where SQL snapshots/migrations go

    dialect: 'sqlite',          // ← switch to SQLite

    dbCredentials: {
        // this path is relative to your project root
        url: 'file:./dev.sqlite'
    }
})
