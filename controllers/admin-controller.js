
const User = require("../models/usermodel");

const   getallusers = async (req, res) => {
  try {
    const users = await User.find();
    console.log(users)
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }
    res.status(200).json(users);
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
};



 
module.exports=getallusers;