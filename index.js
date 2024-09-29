
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.post('/register', (req, res) => {
  const { name, address } = req.body;

  if (!name || !address) {
    return res.status(400).json({ error: 'Name and address are required' });
  }

  db.run(`INSERT INTO User (name) VALUES (?)`, [name], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to insert user' });
    }

    const userId = this.lastID;

    db.run(
      `INSERT INTO Address (user_id, address) VALUES (?, ?)`,
      [userId, address],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to insert address' });
        }

        res.status(201).json({ message: 'User and address registered successfully' });
      }
    );
  });
});


app.get('/users', (req, res) => {
  db.all(
    `SELECT User.id AS user_id, User.name, Address.id AS address_id, Address.address
     FROM User
     LEFT JOIN Address ON User.id = Address.user_id`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch data' });
      }

      const result = rows.reduce((acc, row) => {
        const user = acc.find((u) => u.user_id === row.user_id);
        if (user) {
          user.addresses.push({ address_id: row.address_id, address: row.address });
        } else {
          acc.push({
            user_id: row.user_id,
            name: row.name,
            addresses: row.address ? [{ address_id: row.address_id, address: row.address }] : [],
          });
        }
        return acc;
      }, []);

      res.json(result);
    }
  );
});

// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
