const db = require('./config/db');

async function execute() {
    try {
        console.log("Updating live definitions...");
        await db.query(`UPDATE Amenity SET amenity_name='Parking' WHERE amenity_id=3`);
        await db.query(`INSERT IGNORE INTO Amenity (amenity_id, amenity_name) VALUES (9, 'Gym')`);
        await db.query(`INSERT IGNORE INTO Property_Amenity VALUES (1,9),(5,9),(8,9),(12,9),(15,9),(20,9)`);
        console.log("Done");
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
execute();
