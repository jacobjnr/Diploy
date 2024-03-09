const crypto = require('crypto')
function generateJWTSecret() {
    return crypto.randomBytes(32).toString('hex');
  }
  
  const secret = generateJWTSecret();
  console.log(secret);
module.exports = generateJWTSecret();