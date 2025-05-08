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
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error(
            "Mật khẩu phải chứa ít nhất 1 số hoặc 1 ký tự"
          );
        }
      },
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
    }
  },
  {
    timestamps: true
  }, options
);

UserSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
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