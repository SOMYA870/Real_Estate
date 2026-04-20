const db = require('./config/db');
async function run() {
    try {
        await db.query('UPDATE Property SET agent_id = (property_id % 20) + 1 WHERE agent_id IS NULL');
        console.log("Global backfill successfully mapped legacy properties natively to default systemic agents.");
    } catch(err) {
        console.error("Backfill failed: ", err);
    }
    process.exit(0);
}
run();
