const mongoose = require("mongoose");

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
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true
    },
    cinema_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinemas'
    },
  }
);

const Employee = mongoose.model("Employees", EmployeeSchema);

module.exports = Employee;