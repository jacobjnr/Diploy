const transformCompanyData = (data) => {
    return {
      companyName: data?.Name,
      companyEmail: data?.Email,
      companyPhone: data?.Phone,
    };
  }

  module.exports = transformCompanyData;
  