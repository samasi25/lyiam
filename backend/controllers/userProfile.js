// const dotenv = require('dotenv');
const User = require("../models/user");
// dotenv.config(); 


const userProfile = async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await User.findById(userId).select('email username mobileNo referralCode');

        if (!user) return res.status(404).json({ message: 'User not found' });//console.log(user);

        const adminUsers = ["67b42373ec0b5dc8a639ef91", "67b41ccb88e950464ab6bd83", "k"]; // List of admin user IDs

        // Manually add the role before sending the response
        const userWithRole = {
            ...user.toObject(), // Convert Mongoose document to plain object
            role: adminUsers.includes(userId) ? "admin" : "user" // Assign role dynamically
        };

        res.json(userWithRole);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching profile.' });
    }
};





module.exports = { userProfile };
