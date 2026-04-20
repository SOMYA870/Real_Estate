const db = require('./config/db');

async function test() {
    try {
        const [inq] = await db.query('SELECT * FROM Inquiry ORDER BY inquiry_id DESC LIMIT 5');
        console.log("INQUIRIES:", inq);
        
        const [prop] = await db.query('SELECT property_id, selling_price, rent_price FROM Property WHERE property_id IN (22)');
        console.log("PROP 22:", prop);

    } catch(err) {
        console.error(err);
    }
    process.exit(0);
}
test();
