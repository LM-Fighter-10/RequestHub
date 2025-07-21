const Database = require('better-sqlite3')
const path     = require('path')

// open the DB file (adjust path if needed)
const dbPath = path.resolve(__dirname, '../dev.sqlite')
const db     = new Database(dbPath, { readonly: true })

console.log('=== collections ===')
console.table(db.prepare('SELECT * FROM collections').all())

console.log('\n=== requests ===')
console.table(db.prepare('SELECT * FROM requests').all())
