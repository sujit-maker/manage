const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 

const app = express();
const port = 3000;
const saltRounds = 10;
const jwtSecret = 'random#secret';  

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'manage'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Middleware to verify JWT token
function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(403).send('Unauthorized');
  
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) return res.status(403).send('Unauthorized');
      req.user = decoded;
      next();
    });
  }

// Endpoint to fetch all users
app.get('/api/users', (req, res) => {
    db.query('SELECT id, username, usertype FROM users', (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            res.status(500).send('Error fetching users');
            return;
        }
        res.json(results);
    });
});

// Endpoint to add a new user
app.post('/api/users', (req, res) => {
    const { username, password, usertype } = req.body;

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.error('Error hashing password:', err);
            res.status(500).send('Error hashing password');
            return;
        }

        db.query('INSERT INTO users (username, password, usertype) VALUES (?, ?, ?)', [username, hash, usertype], (err, results) => {
            if (err) {
                console.error('Error adding user:', err);
                res.status(500).send('Error adding user');
                return;
            }
            res.status(201).json({ id: results.insertId, username, usertype });
        });
    });
});



// Endpoint to handle change password
app.put('/change-password', verifyToken, (req, res) => {
    const { newPassword } = req.body;
    const userId = req.user.id;

    // Validate new password (e.g., check length, complexity, etc.)
    if (!newPassword || newPassword.length < 3) {
        return res.status(400).json({ message: 'New password is invalid or too short' });
    }

    bcrypt.hash(newPassword, saltRounds, (err, hashedNewPassword) => {
        if (err) {
            console.error('Error hashing new password:', err);
            return res.status(500).json({ message: 'Failed to hash new password' });
        }

        db.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, userId], (err, result) => {
            if (err) {
                console.error('Error updating password:', err);
                return res.status(500).json({ message: 'Failed to update password' });
            }
            res.status(200).json({ message: 'Password updated successfully' });
        });
    });
});

// Endpoint to handle user login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
      if (err) {
        console.error('Error fetching user:', err);
        res.status(500).send('Error fetching user');
        return;
      }
  
      if (results.length === 0) {
        res.status(401).send('Invalid username or password');
        return;
      }
  
      const user = results[0];
  
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error('Error comparing passwords:', err);
          res.status(500).send('Error comparing passwords');
          return;
        }
  
        if (!isMatch) {
          res.status(401).send('Invalid username or password');
          return;
        }
  
        const token = jwt.sign({ id: user.id, username: user.username, usertype: user.usertype }, jwtSecret, { expiresIn: '1h' });
        res.json({ token, usertype: user.usertype });
      });
    });
  });

// Endpoint to update user details (including password)
app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const { username, password, usertype } = req.body;

    if (password) {
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
                console.error('Error hashing password:', err);
                res.status(500).send('Error hashing password');
                return;
            }

            db.query('UPDATE users SET username = ?, password = ?, usertype = ? WHERE id = ?', [username, hash, usertype, id], (err) => {
                if (err) {
                    console.error('Error updating user:', err);
                    res.status(500).send('Error updating user');
                    return;
                }
                res.sendStatus(200);
            });
        });
    } else {
        db.query('UPDATE users SET username = ?, usertype = ? WHERE id = ?', [username, usertype, id], (err) => {
            if (err) {
                console.error('Error updating user:', err);
                res.status(500).send('Error updating user');
                return;
            }
            res.sendStatus(200);
        });
    }
});

// Endpoint to handle change password
app.put('/change-password', verifyToken, (req, res) => {
    const { newPassword } = req.body;
    const userId = req.user.id;

    // Validate new password (e.g., check length, complexity, etc.)
    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'New password is invalid or too short' });
    }

    bcrypt.hash(newPassword, saltRounds, (err, hashedNewPassword) => {
        if (err) {
            console.error('Error hashing new password:', err);
            return res.status(500).send('Failed to update password');
        }

        db.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, userId], (err, result) => {
            if (err) {
                console.error('Error updating password:', err);
                return res.status(500).send('Failed to update password');
            }
            res.send('Password updated successfully');
        });
    });
});


// Endpoint to delete a user
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM users WHERE id = ?', [id], (err) => {
        if (err) {
            console.error('Error deleting user:', err);
            res.status(500).send('Error deleting user');
            return;
        }
        res.sendStatus(200);
    });
});


//Services backend

// Fetch all services
app.get('/api/services', (req, res) => {
    db.query('SELECT id, service_id, service_name,description FROM services', (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            res.status(500).send('Error fetching users');
            return;
        }
        res.json(results);
    });
});

// Add a new service
app.post('/api/services', (req, res) => {
    const { service_id, service_name, description } = req.body;

    // Insert into MySQL
    db.query('INSERT INTO services (service_id, service_name, description) VALUES (?, ?, ?)', [service_id, service_name, description], (err, result) => {
        if (err) {
            console.error('Error adding service:', err);
            res.status(500).send('Error adding service');
            return;
        }

        // Successful insertion
        console.log('Service added successfully');
        
        // Fetch all services after adding
        db.query('SELECT * FROM services', (err, results) => {
            if (err) {
                console.error('Error fetching services:', err);
                res.status(500).send('Error fetching services');
                return;
            }
            
            // Send back the updated list of services
            res.status(201).json(results);
        });
    });
});

// Update a service
app.put('/api/services/:id', (req, res) => {
    const { id } = req.params;
    const { service_name, description } = req.body;

    const sql = 'UPDATE services SET service_name = ?, description = ? WHERE id = ?';
    db.query(sql, [service_name, description, id], (err, result) => {
        if (err) {
            console.error('Error updating service:', err);
            return res.status(500).send('Error updating service');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Service not found');
        }

        res.sendStatus(200);
    });
});



// Delete a service
app.delete('/api/services/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM services WHERE id = ?', [id], (err) => {
        if (err) {
            console.error('Error deleting user:', err);
            res.status(500).send('Error deleting user');
            return;
        }
        res.sendStatus(200);
    });
});


//customers backend

//fetch all customers
app.get('/api/customers', (req, res) => {
    const sql = 'SELECT * FROM customers';
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});
 
//add customers
app.post('/api/customers', (req, res) => {
    const { customer_name, customer_address, gst_no, contacts } = req.body;

    if (!customer_name || !customer_address || !gst_no || !contacts) {
        return res.status(400).send('All fields are required'); // Bad request if any required field is missing
    }

    try {
        // Insert into MySQL
        db.query('INSERT INTO customers (customer_name, customer_address, gst_no, contacts) VALUES (?, ?, ?, ?)', [customer_name, customer_address, gst_no, JSON.stringify(contacts)], (err, result) => {
            if (err) {
                console.error('Error adding customer:', err);
                return res.status(500).send('Error adding customer'); // Internal server error
            }

            // Successful insertion
            console.log('Customer added successfully');
            
            // Fetch all customers after adding
            db.query('SELECT * FROM customers', (err, results) => {
                if (err) {
                    console.error('Error fetching customers:', err);
                    return res.status(500).send('Error fetching customers');
                }
                
                // Send back the updated list of customers
                res.status(201).json(results);
            });
        });
    } catch (error) {
        console.error('Exception while adding customer:', error);
        res.status(500).send('Exception while adding customer');
    }
});


// Edit customer endpoint
app.put('/api/customers/:id', (req, res) => {
    const customerId = req.params.id;
    const { customer_name, customer_address, gst_no, contacts } = req.body;

    console.log('Received PUT request to update customer:', customerId);
    console.log('Request body:', req.body);

    const updateCustomerQuery = 'UPDATE customers SET customer_name = ?, customer_address = ?, gst_no = ?, contacts = ? WHERE id = ?';
    
    db.query(updateCustomerQuery, [customer_name, customer_address, gst_no, JSON.stringify(contacts), customerId], (err, result) => {
        if (err) {
            console.error('Error updating customer:', err.message);
            return res.status(500).json({ error: err.message });
        }

        console.log('Customer updated successfully, result:', result);
        res.json({ message: 'Customer updated successfully!' });
    });
});





// Delete a service
app.delete('/api/customers/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM customers WHERE id = ?', [id], (err) => {
        if (err) {
            console.error('Error deleting user:', err);
            res.status(500).send('Error deleting user');
            return;
        }
        res.sendStatus(200);
    });
});

// sites backend

// Create a new site
app.post('/api/sites', (req, res) => {
    const { customer_name, branch_name, branch_address, contacts } = req.body;

    const site = {
        customer_name,
        branch_name,
        branch_address,
        contacts: JSON.stringify(contacts) // Convert contacts array to JSON string
    };

    db.query(
        'INSERT INTO sites SET ?',
        site,
        (err, result) => {
            if (err) {
                console.error('Error inserting site:', err);
                res.status(500).json({ error: 'Error inserting site' });
                return;
            }

            res.status(201).json({ message: 'Site added successfully' });
        }
    );
});

// Get all sites
app.get('/api/sites', (req, res) => {
    const sql = 'SELECT * FROM sites';
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});

// Update a site
app.put('/api/sites/:id', (req, res) => {
    const { customer_name, branch_name, branch_address, contacts } = req.body;
    const { id } = req.params;

    const site = {
        customer_name,
        branch_name,
        branch_address,
        contacts: JSON.stringify(contacts) // Convert contacts array to JSON string
    };

    db.query(
        'UPDATE sites SET ? WHERE id=?',
        [site, id],
        (err, result) => {
            if (err) {
                console.error('Error updating site:', err);
                res.status(500).json({ error: 'Error updating site' });
                return;
            }

            res.status(200).json({ message: 'Site updated successfully' });
        }
    );
});

 // Example endpoint to fetch customer names
app.get('/api/customers', (req, res) => {
    // Assuming you have a function to fetch data from MySQL
    db.query('SELECT customer_name FROM customers', (err, results) => {
        if (err) {
            console.error('Error fetching customers:', err);
            res.status(500).json({ error: 'Failed to fetch customers' });
        } else {
            const customerNames = results.map(result => result.customer_name);
            res.json(customerNames);
        }
    });
});



// Delete a sites
app.delete('/api/sites/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM sites WHERE id = ?', [id], (err) => {
        if (err) {
            console.error('Error deleting sites:', err);
            res.status(500).send('Error deleting sites');
            return;
        }
        res.sendStatus(200);
    });
});

//tasks backend
// Get all tasks
app.get('/api/tasks', (req, res) => {
    const sql = 'SELECT * FROM tasks';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching tasks:', err);
            res.status(500).json({ error: 'Error fetching tasks' });
            return;
        }
        res.status(200).json(result);
    });
});


// Add a new task
app.post('/api/tasks', (req, res) => {
    const taskData = req.body;
    const sql = 'INSERT INTO tasks SET ?';
    db.query(sql, taskData, (err, result) => {
        if (err) {
            console.error('Error adding task:', err);
            res.status(500).json({ error: 'Error adding task' });
            return;
        }
        console.log('New task added:', result);
        res.json({ message: 'Task added successfully', id: result.insertId });
    });
});

// Update an existing task
app.put('/api/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    const { customer_name, branch_name, service_name, service_type, service_description, date, remark } = req.body;
    const sql = 'UPDATE tasks SET customer_name = ?, branch_name = ?, service_name = ?, service_type = ?, service_description = ?, date = ?, remark = ? WHERE id = ?';
    
    db.query(sql, [customer_name, branch_name, service_name, service_type, service_description, date, remark, taskId], (err, result) => {
        if (err) {
            console.error('Error updating task:', err);
            return res.status(500).json({ error: 'Error updating task' });
        }

        if (result.affectedRows === 0) {
            console.error('Task with the provided ID not found');
            return res.status(404).json({ error: 'Task not found' });
        }

        console.log('Task updated:', result);
        res.json({ message: 'Task updated successfully' });
    });
});





// Delete a task
app.delete('/api/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    const sql = 'DELETE FROM tasks WHERE id = ?';
    db.query(sql, taskId, (err, result) => {
        if (err) {
            console.error('Error deleting task:', err);
            res.status(500).json({ error: 'Error deleting task' });
            return;
        }
        console.log('Task deleted:', result);
        res.json({ message: 'Task deleted successfully' });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
