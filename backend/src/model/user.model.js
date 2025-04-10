
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, 
    },
    password: {
        type: String,
        required: true,
    },
    contact: {
        type: Number,
        required: true,
    },
    refreshToken: {
        type: String,
    },
    profileImage: {
  type: String,
  default: "", // or a default placeholder image URL
}
});

const Users = mongoose.model('User', userSchema);
module.exports = Users;
