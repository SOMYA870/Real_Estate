const db = require('./config/db');

async function migrate() {
    try {
        console.log('Initiating table creation for Inquiry interactions...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS Inquiry (
                inquiry_id INT PRIMARY KEY AUTO_INCREMENT,
                property_id INT NOT NULL,
                client_id INT NOT NULL,
                agent_id INT NOT NULL,
                message TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (property_id) REFERENCES Property(property_id) ON DELETE CASCADE,
                FOREIGN KEY (client_id) REFERENCES Client(client_id) ON DELETE CASCADE,
                FOREIGN KEY (agent_id) REFERENCES Agent(agent_id) ON DELETE CASCADE
            )
        `);
        console.log("Inquiry table initialized successfully.");
    } catch(err) {
        console.error("Migration fatal fault: ", err.message);
    }
    process.exit(0);
}
migrate();
