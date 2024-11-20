const bcrypt = require("bcrypt");
const hashPassword = async password => {
  try {
    const saltrounds = 10;
    const hashedPasswords = await bcrypt.hash(password, saltrounds);
    return hashedPasswords;
  } catch (error) {
    console.log(error);
  }
};
const comparePassword = async (password, hashedPasswords) => {
  try {
    return bcrypt.compare(password, hashedPasswords);
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  comparePassword,
  hashPassword
};