const db = require('./config/db');

async function migrate() {
    try {
        console.log('Initiating tracking map for Agent explicit dependencies...');
        await db.query('ALTER TABLE Property ADD agent_id INT DEFAULT NULL');
        await db.query('ALTER TABLE Property ADD CONSTRAINT fk_property_agent FOREIGN KEY (agent_id) REFERENCES Agent(agent_id) ON DELETE SET NULL');
        console.log("Migration successfully updated tracking column constraints.");
    } catch(err) {
        if(err.message.includes('Duplicate column')) {
            console.log("Migration already applied locally, proceeding natively.");
        } else {
            console.error("Migration fatal fault: ", err.message);
        }
    }
    process.exit(0);
}
migrate();
