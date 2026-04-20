const db = require('../config/db');

exports.getAdminDashboard = async (req, res) => {
  try {
    const [salesSum] = await db.query('SELECT SUM(price) as totalSales FROM Sale');
    const [rentSum] = await db.query('SELECT SUM(rent_amount) as totalRent FROM Rental');
    const [agentCount] = await db.query('SELECT COUNT(*) as totalAgents FROM Agent');
    const [clientCount] = await db.query('SELECT COUNT(*) as totalClients FROM Client');
    
    // Explicitly getting rows
    const [agentRows] = await db.query('SELECT agent_id, name, email, phone, joining_date FROM Agent');
    const [clientRows] = await db.query('SELECT client_id, name, email, phone, type FROM Client');
    const [ownerRows] = await db.query('SELECT owner_id, name, email, phone FROM Owner');
    
    const [propRows] = await db.query(`
        SELECT p.property_id, p.status, c.city_name, p.address, p.selling_price, p.rent_price, p.bedrooms, p.bathrooms, p.size, pt.type_name, o.name as owner_name, a.name as agent_name 
        FROM Property p 
        JOIN City c ON p.city_id = c.city_id
        JOIN PropertyType pt ON p.type_id = pt.type_id
        JOIN Owner o ON p.owner_id = o.owner_id
        LEFT JOIN Agent a ON p.agent_id = a.agent_id
    `);

    // Fetch transaction logs mapped across constraints
    const [sales] = await db.query(`SELECT s.sale_id as id, 'sale' as intent, a.name as agent_name, c.name as client_name, s.price as amount, p.property_id 
      FROM Sale s JOIN Agent a ON s.agent_id = a.agent_id JOIN Client c ON s.buyer_id = c.client_id JOIN Property p ON s.property_id = p.property_id`);
    const [rentals] = await db.query(`SELECT r.rental_id as id, 'rent' as intent, a.name as agent_name, c.name as client_name, r.rent_amount as amount, p.property_id 
      FROM Rental r JOIN Agent a ON r.agent_id = a.agent_id JOIN Client c ON r.client_id = c.client_id JOIN Property p ON r.property_id = p.property_id`);

    res.json({
      financials: {
        totalSales: salesSum[0]?.totalSales || 0,
        totalRent: rentSum[0]?.totalRent || 0,
        totalCapital: (salesSum[0]?.totalSales || 0) + (rentSum[0]?.totalRent || 0)
      },
      oversight: {
        totalAgents: agentCount[0]?.totalAgents || 0,
        totalClients: clientCount[0]?.totalClients || 0,
        totalSalesCount: sales.length,
        totalRentalsCount: rentals.length
      },
      agents: agentRows,
      clients: clientRows,
      owners: ownerRows,
      properties: propRows,
      completedTransactions: [...sales, ...rentals]
    });
  } catch(err) {
    console.error("ADMIN DB ERROR:", err);
    res.status(500).json({ error: 'Database fetch failed' });
  }
};

exports.executeCustomQuery = async (req, res) => {
  try {
    const { query } = req.body;
    // VERY INSECURE: Do not do this in actual production without constraints.
    // However, it fulfills project requirement Step 4.
    const [results] = await db.query(query);
    res.json({ data: results });
  } catch(err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAgentDashboard = async (req, res) => {
  try {
    const agentId = req.user.id;
    // Workaround: We'll count properties associated with this agent through sales and rentals until property mapping is updated
    const [managedProps] = await db.query(`
        SELECT p.*, c.city_name 
        FROM Property p 
        JOIN City c ON p.city_id = c.city_id 
        WHERE p.agent_id = ? OR p.property_id IN (
            SELECT property_id FROM Sale WHERE agent_id = ?
            UNION 
            SELECT property_id FROM Rental WHERE agent_id = ?
        )
    `, [agentId, agentId, agentId]);
    
    const [sales] = await db.query('SELECT s.*, p.city_id FROM Sale s JOIN Property p ON s.property_id=p.property_id WHERE s.agent_id = ?', [agentId]);
    const [rentals] = await db.query('SELECT r.*, p.city_id FROM Rental r JOIN Property p ON r.property_id=p.property_id WHERE r.agent_id = ?', [agentId]);
    const [reviews] = await db.query(`
        SELECT rv.*, c.name as client_name 
        FROM Review rv 
        JOIN Client c ON rv.client_id = c.client_id
        WHERE rv.property_id IN (
            SELECT property_id FROM Sale WHERE agent_id = ?
            UNION 
            SELECT property_id FROM Rental WHERE agent_id = ?
        )
    `, [agentId, agentId]);

    const [inquiries] = await db.query(`
        SELECT i.*, p.city_id, c.name as client_name, c.phone as client_phone
        FROM Inquiry i
        JOIN Property p ON i.property_id = p.property_id
        JOIN Client c ON i.client_id = c.client_id
        WHERE i.agent_id = ?
        ORDER BY i.created_at DESC
    `, [agentId]);

    res.json({
      metrics: {
         totalProperties: managedProps.length,
         activeSales: sales.length,
         activeRentals: rentals.length
      },
      managedPortfolio: managedProps,
      transactions: [...sales.map(s => ({...s, type: 'Sale'})), ...rentals.map(r => ({...r, type: 'Rental'}))],
      reviews: reviews,
      inquiries: inquiries
    });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
};

exports.getClientDashboard = async (req, res) => {
  try {
    const clientId = req.user.id;
    // Clients can be buyers or renters, so we fetch both activities just in case
    const [purchases] = await db.query(`
       SELECT s.sale_id, p.property_id, c.city_name, s.price, s.sale_date
       FROM Sale s
       JOIN Property p ON s.property_id = p.property_id
       JOIN City c ON p.city_id = c.city_id
       WHERE s.buyer_id = ?
    `, [clientId]);

    const [rentals] = await db.query(`
       SELECT r.rental_id, p.property_id, c.city_name, r.rent_amount, r.start_date, r.end_date
       FROM Rental r
       JOIN Property p ON r.property_id = p.property_id
       JOIN City c ON p.city_id = c.city_id
       WHERE r.client_id = ? 
    `, [clientId]);

    const [reviews] = await db.query(`
       SELECT rv.*, p.city_id 
       FROM Review rv
       JOIN Property p ON rv.property_id = p.property_id
       WHERE rv.client_id = ?
    `, [clientId]);

    const [inquiries] = await db.query(`
       SELECT i.*, c.city_name, a.name as agent_name
       FROM Inquiry i
       JOIN Property p ON i.property_id = p.property_id
       JOIN City c ON p.city_id = c.city_id
       JOIN Agent a ON i.agent_id = a.agent_id
       WHERE i.client_id = ?
       ORDER BY i.created_at DESC
    `, [clientId]);

    res.json({
      purchases,
      rentals,
      reviews,
      inquiries,
      totalSpent: purchases.reduce((sum, p) => sum + p.price, 0)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch client dashboard metrics' });
  }
};

exports.getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const [portfolio] = await db.query(`
       SELECT p.property_id, c.city_name, pt.type_name, p.status, p.selling_price, p.rent_price, p.bedrooms, a.name as agent_name
       FROM Property p
       JOIN City c ON p.city_id = c.city_id
       JOIN PropertyType pt ON p.type_id = pt.type_id
       LEFT JOIN Agent a ON p.agent_id = a.agent_id
       WHERE p.owner_id = ?
    `, [ownerId]);

    const activeAssets = portfolio.filter(p => p.status === 'available').length;
    const leasedAssets = portfolio.filter(p => p.status === 'rent').length;
    const totalValue = portfolio.reduce((sum, p) => sum + (p.selling_price || 0), 0);
    
    const [agents] = await db.query('SELECT agent_id, name FROM Agent');
    const [amenities] = await db.query('SELECT amenity_id, amenity_name FROM Amenity');
    const [cities] = await db.query('SELECT city_id, city_name FROM City');
    const [types] = await db.query('SELECT type_id, type_name FROM PropertyType');

    res.json({
      portfolio,
      activeAssets,
      leasedAssets,
      totalValue,
      agents,
      amenities,
      cities,
      types
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch owner dashboard metrics' });
  }
};

exports.resolveInquiry = async (req, res) => {
    try {
        const agentId = req.user.id;
        const { inquiry_id } = req.params;
        const { status } = req.body; 

        const [inq] = await db.query('SELECT * FROM Inquiry WHERE inquiry_id = ? AND agent_id = ?', [inquiry_id, agentId]);
        if (!inq.length) return res.status(404).json({ error: 'Inquiry not found' });

        await db.query('UPDATE Inquiry SET status = ? WHERE inquiry_id = ?', [status, inquiry_id]);

        if (status === 'accepted') {
            const propId = inq[0].property_id;
            const clientId = inq[0].client_id;
            
            const isPurchaseIntent = inq[0].intent === 'buy';
            
            const [propRec] = await db.query('SELECT selling_price, rent_price, status FROM Property WHERE property_id = ?', [propId]);
            if (propRec[0].status === 'sold' && isPurchaseIntent) {
                 return res.status(400).json({ error: 'Transaction failed. This asset has already been permanently acquired by another collector' });
            }
            
            const finalSalePrice = propRec[0].selling_price || propRec[0].rent_price || 1000;
            const finalRentPrice = propRec[0].rent_price || propRec[0].selling_price || 1000;
            
            if (isPurchaseIntent) {
                await db.query(`
                   INSERT IGNORE INTO Sale (sale_id, property_id, buyer_id, agent_id, sale_date, price, days_on_market) 
                   VALUES ((SELECT COALESCE(MAX(sale_id),0)+1 FROM Sale AS s), ?, ?, ?, CURDATE(), ?, 0)
                `, [propId, clientId, agentId, finalSalePrice]);
                
                const [clientData] = await db.query('SELECT * FROM Client WHERE client_id = ?', [clientId]);
                const [existingOwner] = await db.query('SELECT owner_id FROM Owner WHERE email = ? OR phone = ?', [clientData[0].email, clientData[0].phone]);
                let newOwnerId;
                if (existingOwner.length > 0) {
                    newOwnerId = existingOwner[0].owner_id;
                } else {
                    const [maxId] = await db.query('SELECT COALESCE(MAX(owner_id),0)+1 as nextId FROM Owner');
                    newOwnerId = maxId[0].nextId;
                    await db.query(`INSERT INTO Owner (owner_id, name, phone, email, password) VALUES (?, ?, ?, ?, ?)`, 
                    [newOwnerId, clientData[0].name, clientData[0].phone, clientData[0].email, clientData[0].password]);
                }
                await db.query('UPDATE Property SET owner_id = ? WHERE property_id = ?', [newOwnerId, propId]);
            } else {
                await db.query(`
                   INSERT INTO Rental (rental_id, property_id, client_id, agent_id, rent_amount, start_date, end_date, days_on_market) 
                   VALUES ((SELECT COALESCE(MAX(rental_id),0)+1 FROM Rental AS r), ?, ?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 0)
                `, [propId, clientId, agentId, finalRentPrice]);
            }
        }
        res.json({ message: 'Inquiry resolved and mapped to transaction.' });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Failed' });
    }
};

exports.deleteUserAccount = async (req, res) => {
   try {
       const { type, id } = req.params;
       if (type === 'agents') {
           await db.query('DELETE FROM Agent WHERE agent_id = ?', [id]);
       } else if (type === 'owners') {
           await db.query('DELETE FROM Owner WHERE owner_id = ?', [id]);
       } else if (type === 'clients') {
           await db.query('DELETE FROM Client WHERE client_id = ?', [id]);
       } else {
           return res.status(400).json({error: 'Invalid entity architecture request.'});
       }
       res.json({ message: 'User root entity cleanly erased guaranteeing downstream database consistency.' });
   } catch(err) {
       console.error("ADMIN DEL ERROR:", err);
       res.status(500).json({ error: 'Failed to erase securely. Please check SQL constraints.' });
   }
};
