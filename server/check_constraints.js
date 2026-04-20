const db = require('./config/db');
(async () => {
    try {
        const [rows] = await db.query(`
            SELECT CONSTRAINT_NAME, CHECK_CLAUSE 
            FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS 
            WHERE CONSTRAINT_SCHEMA = 'core_db' AND TABLE_NAME = 'Property'
        `);
        console.log(rows);
    } catch(err) { console.error(err) }
    process.exit();
})();
