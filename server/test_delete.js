const db = require('./config/db');
(async () => {
    try {
        await db.query('DELETE FROM Property WHERE property_id=?', [11]);
        console.log("Deleted successfully! (Warning: actually deleted)");
    } catch(err) { 
        console.error("DEBUG ERROR SQL:", err.sqlMessage || err); 
    }
    process.exit();
})();
