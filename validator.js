const mysql = require('mysql2')
const validateCompanyData = (data) => {
    const requiredFields = ["Name", "Email", "Phone"];
    const errors = {};
  
    for (const field of requiredFields) {
      if (typeof data[field] === "undefined" || data[field] === "") {
        errors[field] = "This field is required";
      }
    }
  
    return errors;
  };

  
  const createUserValidation = async (data, connection) => {
    const requiredFields = ["Username", "Password"];
    const errors = {};
  
    for (const field of requiredFields) {
      if (typeof data[field] === "undefined" || data[field] === "") {
        errors[field] = "This field is required";
      }
    }
  
    return errors;
  };
  
  module.exports =  { validateCompanyData, createUserValidation };
  