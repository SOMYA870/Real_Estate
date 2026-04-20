const db = require('./config/db');
async function run() {
    try {
        await db.query(`DROP TRIGGER IF EXISTS trg_after_sale_delete`);
        await db.query(`
            CREATE TRIGGER trg_after_sale_delete
            AFTER DELETE ON Sale
            FOR EACH ROW
            BEGIN
                UPDATE Property SET status = 'available' WHERE property_id = OLD.property_id;
            END
        `);
        await db.query(`DROP TRIGGER IF EXISTS trg_after_rent_delete`);
        await db.query(`
            CREATE TRIGGER trg_after_rent_delete
            AFTER DELETE ON Rental
            FOR EACH ROW
            BEGIN
                UPDATE Property SET status = 'available' WHERE property_id = OLD.property_id;
            END
        `);
        console.log("Release triggers initialized successfully inside live MySQL Node.");
    } catch(err) {
        console.error(err);
    }
    process.exit(0);
}
run();
