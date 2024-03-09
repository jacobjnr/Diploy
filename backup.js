const express = require('express');
const mysql = require('mysql2/promise'); // Not needed if using db.js
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//const { check, validationResult } = require('express-validator');


const app = express();

app.use(bodyParser.json());
const connectToDatabase = require('./db'); 
const transformCompanyData = require('./transformer');
const { validateCompanyData, createUserValidation } = require('./validator');
require('dotenv').config({ path: './diploy.env' });


app.post('/signup', async (req, res) => {
    const { Username, Password } = req.body;
  
    try {
      const connection = await connectToDatabase();
      const validationErrors = await createUserValidation(req.body, connection);
      if (Object.keys(validationErrors).length > 0) {
        return res.status(400).json({ errors: validationErrors });
      }  
  
      const createUser = async (Username, Password, connection) => {
  
        const hashedPassword = await bcrypt.hash(Password, 10);
        
        const sql = 'INSERT INTO Users (Username, Password) VALUES (?, ?)';
        await connection.query(sql, [Username, hashedPassword]);
        return Username, hashedPassword;
      };
  
      await createUser(Username, Password, connection);
      console.log(Username);
      res.json({ message: 'User created successfully!', Username});
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: err.message || 'Error creating user' });
    }
  });

  app.post('/login', async (req, res) => {
  const { Username, Password } = req.body;

  try {
    const connection = await connectToDatabase();

    // Find user by username
    const sql = 'SELECT * FROM Users WHERE Username = ?';
    const [results] = await connection.query(sql, [Username]);
    console.log(results);
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = results;
    console.log(user);

    // Compare password hashes
    const passwordMatch = await bcrypt.compare(Password, user.Password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate JWT
    const secret = process.env.JWT_SECRET; // Replace with a strong, unique secret
    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '30m' });

    res.json({ message: 'Login successful!', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error logging in' });
  }
});



  


(async () => {
    try {

        const connection = await connectToDatabase(); 
        app.post('/companies', async (req, res) => {
            const { Name, Email, Phone } = req.body;
            const errors = validateCompanyData(req.body);
            if (Object.keys(errors).length > 0) {
              return res.status(400).json({ errors }); 
            }
            console.log(req.body);

            try {
                const sql = 'INSERT INTO Companies (Name, Email, Phone) VALUES (?, ?, ?)';
                await connection.query(sql, [Name, Email, Phone]);
                res.json({ message: 'Company added successfully!' });
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: 'Error adding company!' });
            }
        });


        app.get('/companies', async (req, res) => {
            try{
                const sql = 'SELECT * FROM Companies';
                const results = await connection.query(sql);
                const transformer = results.map(company => transformCompanyData(company));
                console.log(transformer);
                res.json(transformer);
            }catch(err){
                console.error(err);
                res.status(500).json({ message: 'Error Fetching Information' });
            }
        });


        app.get('/companies/:id', async (req, res) => {
            try {
              const companyId = parseInt(req.params.id, 10);
              console.log(companyId)
          
              const sql = 'SELECT * FROM Companies WHERE id = ?';
              const [results] = await connection.query(sql, [companyId]);
                console.log(results);
              if (results.length === 0) {
                return res.status(404).json({ message: 'Company not found' });
              }
          
              const company = results;
              const transformedCompany = transformCompanyData(company);
              console.log(transformedCompany)

              res.json(transformedCompany);
            } catch (err) {
              console.error(err);
              res.status(500).json({ message: 'Error fetching company' });
            }
          });
          

        app.patch('/companies/:id', async (req, res) => {
            try {
                const companyId = req.params.id;
                const { Name, Email, Phone, } = req.body;
        
                let setClause = "";
                if (Name) {
                    setClause += "Name = ?";
                }
                if (Email) {
                    if (setClause) setClause += ", "; 
                    setClause += "Email = ?";
                }
                if (Phone) {
                    if (setClause) setClause += ", "; 
                    setClause += "Phone = ?";
                }

        
                if (!setClause) {
                    return res.status(400).json({ message: 'No fields provided for update' });
                }
        
                const sql = `UPDATE Companies SET ${setClause} WHERE id = ?`;
                const values = [Name, Email, Phone, companyId]; 
        
                await connection.query(sql, values); 
                console.log(values);
                res.json({ message: 'Company updated successfully!' }); 
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: 'Error updating company!' }); 
            }
        });

        app.delete('/companies/:id', async (req, res) => {
            try {
                const companyId = req.params.id; 
        
               
                if (isNaN(companyId)) {
                    return res.status(400).json({ message: 'Invalid company ID' });
                }
        
                const sql = 'DELETE FROM Companies WHERE id = ?';
                const result = await connection.query(sql, [companyId]); 
        
                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: 'Company not found' });
                }
        
                res.json({ message: 'Company deleted successfully' });
        
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: 'Error deleting company' }); 
            }
        });
        
        
        // ... rest of your application logic ...

    } catch (error) {
        console.error(error);
    }

})();





app.listen(8000, () => {
    console.log("Server is listening on port 8000....");
})
