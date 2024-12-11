const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

// We don't specify username or password in our user schema
// but require that information on the following step 
const usuarioSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String
    }
});

// it's going to add fields like name and password on our schema
usuarioSchema.plugin(passportLocalMongoose);



module.exports = mongoose.model('Usuario', usuarioSchema);