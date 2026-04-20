const db = require('./config/db');

async function syncLuxuryDB() {
    try {
        console.log("Starting Live Luxury Sync...");

        // 1. Sync Cities
        console.log("Updating Cities...");
        const cities = [
            [1, 'Delhi'], [2, 'Mumbai'], [3, 'Pune'], [4, 'Patna'], [5, 'Guwahati']
        ];
        for (let c of cities) {
            await db.query(`INSERT INTO City (city_id, city_name) VALUES (?, ?) ON DUPLICATE KEY UPDATE city_name=VALUES(city_name)`, [c[0], c[1]]);
        }

        // 2. Wipe old Junctions and Amenities
        console.log("Clearing Old Amenities...");
        await db.query('DELETE FROM Property_Amenity');
        await db.query('DELETE FROM Amenity');
        await db.query('ALTER TABLE Amenity AUTO_INCREMENT = 1');

        // 3. Inject Luxury Amenities
        console.log("Injecting Luxury Amenities...");
        const amenities = [
            [1, 'Private Gallery'], [2, 'Wine Vault'], [3, 'Heli-pad'], [4, 'Infinity Pool'],
            [5, 'Smart Home System'], [6, 'Home Cinema'], [7, 'Elevator'], [8, 'Spa & Sauna']
        ];
        for (let a of amenities) {
            await db.query(`INSERT INTO Amenity (amenity_id, amenity_name) VALUES (?, ?)`, [a[0], a[1]]);
        }

        // 4. Inject Complex Mappings
        console.log("Mapping Properties to Amenities...");
        const pamap = [
            [1,1],[1,2],[1,4],[1,5],
            [2,3],[2,4],[2,6],[2,8],
            [3,1],[3,5],[3,7],
            [4,2],[4,5],
            [5,4],[5,8],[5,6], [6,5],[6,1],[6,2],
            [7,1],[7,7], [8,2],[8,3],[8,4],[8,8],
            [9,3],[9,5], [10,1],[10,4],[10,6],
            [11,4],[11,5],[11,8], [12,5],[12,2],[12,7],
            [13,2],[13,6], [14,3],[14,4],[14,8],
            [15,1],[15,5], [16,2],[16,4],[16,7],
            [17,4],[17,5],[17,8], [18,1],[18,3],[18,6],
            [19,2],[19,5], [20,3],[20,4],[20,8],
            [21,1],[21,6], [22,4],[22,5],[22,7],
            [23,1],[23,2],[23,8], [24,3],[24,5],[24,6],
            [25,4],[25,7], [26,1],[26,2],[26,3],[26,4],[26,8],
            [27,2],[27,5], [28,1],[28,6],[28,7],
            [29,4],[29,5],[29,8], [30,2],[30,3],[30,6]
        ];
        for (let pa of pamap) {
            await db.query('INSERT INTO Property_Amenity VALUES (?, ?)', [pa[0], pa[1]]);
        }

        // 5. Hard Update Cities & Addresses on Properties
        console.log("Re-aligning Properties with new Cities & Addresses...");
        await db.query(`UPDATE Property SET city_id=4 WHERE property_id IN (5,16,22,10,28)`);
        await db.query(`UPDATE Property SET city_id=5 WHERE property_id IN (11,17,29,6,23)`);
        
        await db.query(`UPDATE Property SET address='Karol Bagh' WHERE property_id IN (1,7,13,19,25)`);
        await db.query(`UPDATE Property SET address='Lajpat Nagar' WHERE property_id IN (4)`);
        await db.query(`UPDATE Property SET address='Dwarka' WHERE property_id IN (10,16)`);
        
        await db.query(`UPDATE Property SET address='Andheri' WHERE property_id IN (2,8,14,20,26)`);

        await db.query(`UPDATE Property SET address='Hinjewadi' WHERE property_id IN (3,12,21,30)`);
        await db.query(`UPDATE Property SET address='Kothrud' WHERE property_id IN (6,15,24)`);
        await db.query(`UPDATE Property SET address='Wakad' WHERE property_id IN (9,18,27)`);

        await db.query(`UPDATE Property SET address='Kankarbagh' WHERE property_id IN (5,16,22)`);
        await db.query(`UPDATE Property SET address='Boring Road' WHERE property_id IN (10,28)`);

        await db.query(`UPDATE Property SET address='Dispur' WHERE property_id IN (11,17,29)`);
        await db.query(`UPDATE Property SET address='AIDC' WHERE property_id IN (6,23)`);

        console.log("Success! Luxury Indian DB Overrides synchronized natively.");
        process.exit(0);
    } catch(err) {
        console.error("FATAL ERROR: ", err);
        process.exit(1);
    }
}

syncLuxuryDB();
