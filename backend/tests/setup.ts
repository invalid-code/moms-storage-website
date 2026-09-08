// Runs before any test module is imported, so `db.ts` (which throws when
// MONGO_DB_CONN_STR is missing) can always be imported safely.
if (!process.env.MONGO_DB_CONN_STR) {
  process.env.MONGO_DB_CONN_STR = 'mongodb://127.0.0.1:27017/test';
}
