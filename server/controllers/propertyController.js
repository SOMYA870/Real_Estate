const db = require('../config/db');

exports.getAllProperties = async (req, res) => {
  try {
    const { city_id, type_id, min_price, max_price, amenity_id, amenities, page = 1, limit = 10, sort = 'price_low_high' } = req.query;
    
    let query = `
      SELECT p.*, c.city_name, t.type_name, o.name as owner_name 
      FROM Property p
      JOIN City c ON p.city_id = c.city_id
      JOIN PropertyType t ON p.type_id = t.type_id
      JOIN Owner o ON p.owner_id = o.owner_id
      WHERE p.status = 'available'
    `;
    const params = [];

    if (city_id) { query += ' AND p.city_id = ?'; params.push(Number(city_id)); }
    if (type_id) { query += ' AND p.type_id = ?'; params.push(Number(type_id)); }
    if (min_price) { query += ' AND (p.selling_price >= ? OR p.rent_price >= ?)'; params.push(Number(min_price), Number(min_price)); }
    if (max_price) { query += ' AND (p.selling_price <= ? OR p.rent_price <= ?)'; params.push(Number(max_price), Number(max_price)); }
    
    if (amenities) {
       const am_list = amenities.split(',').map(Number).filter(n => !isNaN(n));
       if (am_list.length > 0) {
           query += ` AND p.property_id IN (
               SELECT property_id 
               FROM Property_Amenity 
               WHERE amenity_id IN (${am_list.map(()=>'?').join(',')})
               GROUP BY property_id
               HAVING COUNT(DISTINCT amenity_id) = ?
           )`;
           params.push(...am_list, am_list.length);
       }
    } else if (amenity_id) {
       query += ' AND p.property_id IN (SELECT property_id FROM Property_Amenity WHERE amenity_id = ?)';
       params.push(Number(amenity_id));
    }

    if (sort === 'price_low_high') {
      query += ' ORDER BY COALESCE(p.selling_price, p.rent_price) ASC';
    } else if (sort === 'price_high_low') {
      query += ' ORDER BY COALESCE(p.selling_price, p.rent_price) DESC';
    }

    // Pagination
    const offset = (Number(page) - 1) * Number(limit);
    query += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [rows] = await db.query(query, params);
    
    // Get total count
    const [countRow] = await db.query('SELECT COUNT(*) as total FROM Property');
    
    res.json({
       data: rows,
       total: countRow[0].total,
       page: Number(page),
       limit: Number(limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const [prop] = await db.query(`
      SELECT p.*, c.city_name, t.type_name, o.name as owner_name, o.phone as owner_phone, o.email as owner_email, a.name as agent_name 
      FROM Property p
      JOIN City c ON p.city_id = c.city_id
      JOIN PropertyType t ON p.type_id = t.type_id
      JOIN Owner o ON p.owner_id = o.owner_id
      LEFT JOIN Agent a ON p.agent_id = a.agent_id
      WHERE p.property_id = ?
    `, [id]);

    if (prop.length === 0) return res.status(404).json({ error: 'Not found' });

    const [amenities] = await db.query(`
      SELECT a.amenity_id, a.amenity_name 
      FROM Property_Amenity pa
      JOIN Amenity a ON pa.amenity_id = a.amenity_id
      WHERE pa.property_id = ?
    `, [id]);

    const [reviews] = await db.query(`
      SELECT r.*, c.name as client_name 
      FROM Review r
      JOIN Client c ON r.client_id = c.client_id
      WHERE r.property_id = ?
    `, [id]);

    res.json({ ...prop[0], amenities, reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
};

exports.createProperty = async (req, res) => {
  try {
    const { city_id, type_id, size, bedrooms, bathrooms, year_of_construction, selling_price, rent_price, owner_id, amenities, agent_id, address } = req.body;
    
    // Explicit runtime fallback protecting against 'property_chk_5' bounds
    const safeSelling = parseFloat(selling_price) >= 0 ? parseFloat(selling_price) : 0;
    const safeRent = parseFloat(rent_price) >= 0 ? parseFloat(rent_price) : 0;
    const safeAgent = (agent_id === '' || agent_id === 0) ? null : parseInt(agent_id);
    
    const [{ insertId }] = await db.query(`
      INSERT INTO Property 
      (property_id, city_id, type_id, size, bedrooms, bathrooms, year_of_construction, selling_price, rent_price, owner_id, agent_id, address, listed_on) 
      VALUES ((SELECT COALESCE(MAX(property_id),0)+1 FROM Property AS p), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())
    `, [city_id, type_id, size, bedrooms, bathrooms, year_of_construction, safeSelling, safeRent, owner_id, safeAgent, address || null]);

    if(amenities && amenities.length > 0) {
      for(let am_id of amenities) {
        await db.query('INSERT INTO Property_Amenity (property_id, amenity_id) VALUES (?, ?)', [insertId, am_id]);
      }
    }
    res.status(201).json({ id: insertId, message: 'Property listed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create' });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { selling_price, rent_price, status } = req.body;
    await db.query('UPDATE Property SET selling_price=?, rent_price=?, status=? WHERE property_id=?', [selling_price, rent_price, status, id]);
    res.json({ message: 'Updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update' });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [prop] = await db.query('SELECT agent_id FROM Property WHERE property_id=?', [id]);
    if (!prop.length) return res.status(404).json({ error: 'Property mapping invalid.' });
    
    // Rigid Mutex check protecting Handled objects natively over Agent scope. Bypassed safely if Admin.
    if (prop[0].agent_id && req.user.role !== 'admin') {
       return res.status(403).json({ error: 'Deletion explicitly blocked. This structural asset is currently locked dynamically under an active Washub Agent.' });
    }

    await db.query('DELETE FROM Property_Amenity WHERE property_id=?', [id]);
    await db.query('DELETE FROM Property WHERE property_id=?', [id]);
    res.json({ message: 'Deleted successfully' });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete securely' });
  }
};

exports.releasePropertyAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const client_id = req.user.id;
    
    // We only process lease terminations. Sales are strictly permanent ownership transfers.
    // Close the lease duration explicitly, and rebound Property status manually 
    // since DELETE triggers are bypassed to save history logs.
    const [openRental] = await db.query('SELECT * FROM Rental WHERE property_id = ? AND client_id = ? AND end_date > CURDATE()', [id, client_id]);
    if(openRental.length > 0) {
        await db.query('UPDATE Rental SET end_date = CURDATE() WHERE rental_id = ?', [openRental[0].rental_id]);
        await db.query('UPDATE Property SET status = "available" WHERE property_id = ?', [id]);
    }
    
    res.json({ message: 'Lease terminated successfully. Asset returned to market.' });
  } catch(err) {
    res.status(500).json({ error: 'Failed to terminate lease' });
  }
};

exports.inquireProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const client_id = req.user.id;
    const { message, intent } = req.body;

    const [prop] = await db.query('SELECT agent_id FROM Property WHERE property_id = ?', [id]);
    if (!prop.length || !prop[0].agent_id) return res.status(400).json({ error: 'Property has no verified agent assigned.' });

    await db.query(`INSERT INTO Inquiry (property_id, client_id, agent_id, message, intent) VALUES (?, ?, ?, ?, ?)`, 
    [id, client_id, prop[0].agent_id, message, intent || 'buy']);
    
    res.status(201).json({ message: 'Inquiry active.' });
  } catch(err) {
    res.status(500).json({ error: 'Failed to inquire' });
  }
};
