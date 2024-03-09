const mysql = require('mysql2/promise');
require('dotenv').config({ path: './diploy.env' })

const connectToDatabase = async (host, user, password, database) => {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'leke',
            password: process.env.DIPLOY_PASSWORD,
            database: 'Organisation'
        });

        return {
            connection,
            query: async (sql, params) => {
                try {
                    const [results] = await connection.execute(sql, params);
                    return results;
                } catch (err) {
                    throw new Error(`Error executing query: ${err.message}`); // Provide descriptive message
                }
            }
        };
    } catch (error) {
        throw new Error(`Error connecting to database: ${error.message}`); // Include context
    }
}

module.exports =  connectToDatabase;
console.log(module.exports);