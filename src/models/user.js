const mongoose = require('mongoose');
const validator = require("validator");
const bcrypt = require("bcryptjs");

const options = { discriminatorKey: 'kind', collection: 'users' };

const UserSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email không hợp lệ");
        }
      },
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      private: true,
    },
    dateOfBirth: {
      type: Date,
      required: false,
    },
    cccd: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    role: {
      type: String,
      enum: ['customer', 'admin', 'employee'],
      default: 'customer'
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true
  }, options
);

UserSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

UserSchema.statics.isPhoneTaken = async function (phone, excludeUserId) {
  const user = await this.findOne({ phone, _id: { $ne: excludeUserId } });
  return !!user;
};

UserSchema.statics.isCccdTaken = async function (cccd, excludeUserId) {
  const user = await this.findOne({ cccd, _id: { $ne: excludeUserId } });
  return !!user;
};

UserSchema.methods.isPasswordMatch = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const User = mongoose.model("Users", UserSchema);

module.exports = User;