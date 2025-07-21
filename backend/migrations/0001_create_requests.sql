CREATE TABLE requests (
                          id            INTEGER PRIMARY KEY NOT NULL,
                          collection_id INTEGER REFERENCES collections(id),
                          name          TEXT    NOT NULL,
                          method        TEXT    NOT NULL,
                          url           TEXT    NOT NULL,
                          headers       TEXT    NOT NULL,
                          body          TEXT    NOT NULL
);
