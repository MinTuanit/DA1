const mongoose = require("mongoose");
const User = require("./user");

const EmployeeSchema = new mongoose.Schema(
  {
    position: {
      type: String,
      required: true,
      trim: true
    },
    shift: {
      type: String,
      required: true,
      trim: true
    },
    cinema_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinemas'
    },
  }
);

const Employee = User.discriminator('Employees', EmployeeSchema);

module.exports = Employee;