const Database = require('better-sqlite3');
const path = require('path');

// Adjust path to your SQLite DB file
const dbPath = path.resolve(__dirname, '../dev.sqlite');
const db = new Database(dbPath);

try {
    // Prepare statements
    const insertCollection = db.prepare(
        'INSERT INTO collections (name) VALUES (?)'
    );
    const insertRequest = db.prepare(
        'INSERT INTO requests (collection_id, name, method, url, headers, body) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const getCollectionId = db.prepare(
        'SELECT id FROM collections WHERE name = ?'
    );

    // Seed collections in a transaction
    const seedCollections = db.transaction((names) => {
        for (const name of names) insertCollection.run(name);
    });
    seedCollections(['Users', 'Orders']);

    // Retrieve generated IDs
    const usersId = getCollectionId.get('Users').id;
    const ordersId = getCollectionId.get('Orders').id;

    // Seed requests in a transaction
    const seedRequests = db.transaction((items) => {
        for (const r of items) {
            insertRequest.run(
                r.collectionId,
                r.name,
                r.method,
                r.url,
                JSON.stringify(r.headers),
                JSON.stringify(r.body)
            );
        }
    });

    seedRequests([
        {
            collectionId: usersId,
            name: 'Get all users',
            method: 'GET',
            url: 'https://api.example.com/users',
            headers: {},
            body: {},
        },
        {
            collectionId: usersId,
            name: 'Get user',
            method: 'GET',
            url: 'https://api.example.com/users/1',
            headers: {},
            body: {},
        },
        {
            collectionId: ordersId,
            name: 'Create order',
            method: 'POST',
            url: 'https://api.example.com/orders',
            headers: { 'Content-Type': 'application/json' },
            body: { foo: 'bar' },
        },
        {
            collectionId: null,
            name: 'Ping healthcheck',
            method: 'GET',
            url: 'https://api.example.com/health',
            headers: {},
            body: {},
        },
    ]);

    console.log('Seed complete');
} catch (err) {
    console.error('X Seed failed:', err);
    process.exit(1);
}
