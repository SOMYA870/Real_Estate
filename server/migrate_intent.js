const db = require('./config/db');
async function run() {
    try {
        await db.query(`ALTER TABLE Inquiry ADD COLUMN intent ENUM('buy', 'rent') DEFAULT 'buy'`);
        console.log("Migration complete: Intent column explicitly tracked inside Inquiry mappings");
    } catch(err) {
        console.error(err);
    }
    process.exit(0);
}
run();
