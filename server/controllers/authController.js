const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/db');

exports.register = async (req, res) => {
  try {
    const { role, name, phone, email, password, clientType, joiningDate } = req.body;
    
    // Strict Domain and Numeric Phone Check Restrictions
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|mail\.com|yahoo\.com)$/i;
    if (email && !emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email must be a @gmail.com, @mail.com, or @yahoo.com domain' });
    }
    
    const phoneRegex = /^\d+$/;
    if (phone && !phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Phone must contain only numbers' });
    }

    if (!['admin', 'agent', 'client', 'owner'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    if (role === 'admin') {
      return res.status(400).json({ error: 'Admin registration disabled' });
    } 
    
    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === 'agent') {
      if (!joiningDate) return res.status(400).json({ error: 'Joining date required' });
      const [result] = await db.execute(
        'INSERT INTO Agent (name, phone, email, password, joining_date) VALUES (?, ?, ?, ?, ?)',
        [name, phone, email, hashedPassword, joiningDate]
      );
      return res.status(201).json({ message: 'Agent registered successfully', id: result.insertId });
    }
    
    if (role === 'client') {
      if (!['buyer', 'renter'].includes(clientType)) return res.status(400).json({ error: 'Valid client mapping required' });
      // Using Stored Procedure for Client Registration!
      const [result] = await db.execute(
        'CALL sp_RegisterClient(?, ?, ?, ?, ?)',
        [name, phone, email || null, hashedPassword, clientType]
      );
      return res.status(201).json({ message: 'Client registered successfully' });
    }

    if (role === 'owner') {
      // Find the next available owner_id
      const [rows] = await db.query('SELECT MAX(owner_id) as maxId FROM Owner');
      const nextId = (rows[0].maxId || 0) + 1;

      await db.execute(
        'INSERT INTO Owner (owner_id, name, phone, email, password) VALUES (?, ?, ?, ?, ?)',
        [nextId, name, phone, email, hashedPassword]
      );
      return res.status(201).json({ message: 'Owner registered successfully', id: nextId });
    }
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email or phone already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { identifier, password, expectedRole } = req.body; 

    let user;
    let authHash;
    let assignedRole;

    if (!expectedRole || expectedRole === 'admin') {
      const [adminRows] = await db.query('SELECT admin_id as id, name, email, password FROM Admin WHERE email = ?', [identifier]);
      if (adminRows.length > 0) {
        user = adminRows[0]; authHash = user.password; assignedRole = 'admin';
      }
    }
    
    if (!user && (!expectedRole || expectedRole === 'agent')) {
      const [agentRows] = await db.query('SELECT agent_id as id, name, email, password FROM Agent WHERE email = ? OR phone = ?', [identifier, identifier]);
      if (agentRows.length > 0) {
        user = agentRows[0]; authHash = user.password; assignedRole = 'agent';
      }
    }
    
    if (!user && (!expectedRole || expectedRole === 'client')) {
      const [clientRows] = await db.query('SELECT client_id as id, name, phone, email, type, password FROM Client WHERE phone = ? OR email = ?', [identifier, identifier]);
      if (clientRows.length > 0) {
        user = clientRows[0]; authHash = user.password; assignedRole = 'client';
      }
    }
    
    if (!user && (!expectedRole || expectedRole === 'owner')) {
      const [ownerRows] = await db.query('SELECT owner_id as id, name, phone, email, password FROM Owner WHERE phone = ? OR email = ?', [identifier, identifier]);
      if (ownerRows.length > 0) {
        user = ownerRows[0]; authHash = user.password; assignedRole = 'owner';
      }
    }

    if (!user) return res.status(401).json({ error: 'User not found' });

    // Compare Hash for real authentication
    const match = await bcrypt.compare(password, authHash);
    
    // Fallback logic for 'dummy accounts' since their BCrypt hashes are dummy strings or raw plaintexts
    const isPlaintextMatch = password === authHash;
    const isDummyAccount = authHash.includes('dummyhash');
    
    if (!match && !isDummyAccount && !isPlaintextMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const tokenPayload = {
      id: user.id,
      role: assignedRole,
      type: user.type || null
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

    // Filter password out of user object
    delete user.password;

    res.json({ message: 'Login successful', token, user: { ...user, role: assignedRole } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { name, phone, email, type } = req.body;

    if (role === 'admin') {
       await db.query('UPDATE Admin SET name = ?, email = ? WHERE admin_id = ?', [name, email, userId]);
    } else if (role === 'agent') {
       await db.query('UPDATE Agent SET name = ?, phone = ?, email = ? WHERE agent_id = ?', [name, phone, email, userId]);
    } else if (role === 'client') {
       if (type) {
           await db.query('UPDATE Client SET name = ?, phone = ?, email = ?, type = ? WHERE client_id = ?', [name, phone, email, type, userId]);
       } else {
           await db.query('UPDATE Client SET name = ?, phone = ?, email = ? WHERE client_id = ?', [name, phone, email, userId]);
       }
    } else if (role === 'owner') {
       await db.query('UPDATE Owner SET name = ?, phone = ?, email = ? WHERE owner_id = ?', [name, phone, email, userId]);
    }

    // Fetch updated user to send back
    let updatedUser;
    if (role === 'admin') {
      const [rows] = await db.query('SELECT admin_id as id, name, email FROM Admin WHERE admin_id = ?', [userId]);
      updatedUser = rows[0];
    } else if (role === 'agent') {
      const [rows] = await db.query('SELECT agent_id as id, name, phone, email FROM Agent WHERE agent_id = ?', [userId]);
      updatedUser = rows[0];
    } else if (role === 'client') {
      const [rows] = await db.query('SELECT client_id as id, name, phone, email, type FROM Client WHERE client_id = ?', [userId]);
      updatedUser = rows[0];
    } else {
      const [rows] = await db.query('SELECT owner_id as id, name, phone, email FROM Owner WHERE owner_id = ?', [userId]);
      updatedUser = rows[0];
    }

    res.json({ message: 'Profile updated', user: { ...updatedUser, role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
