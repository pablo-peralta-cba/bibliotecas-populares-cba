const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const usuarioSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
  },
  verificationTokenExpiry: {
    type: Date,
  },
}, { timestamps: true });

// TTL index: auto-delete unverified accounts after 1 day (86400 seconds)
// Only applies to documents where isVerified is false
usuarioSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 86400, partialFilterExpression: { isVerified: false } }
);

usuarioSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Usuario', usuarioSchema);
