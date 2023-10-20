const { Schema, model, Types } = require("mongoose");
const Salary = require("./Salary");

const positionSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please enter the position name'],
  },
  department: {
    type: Types.ObjectId,
    ref: 'Department',
    required: [true, 'Please specify the department'],
  },
  employeeId: {
    type: Types.ObjectId,
    ref: 'Employee',
  },
  salary: {
    type: Types.ObjectId,
    ref:'Salary',
  },
  startDate: {
    type: Date,
    required: [true, 'Please specify the startDate'],
  },
  endDate: {
    type: Date,//TODO:end date logic on active change
  },
  active: {
    type: Boolean,
    default: true
  }
});

// Cascade delete the related Salary
positionSchema.pre('deleteOne',async function(next) {
  await Salary.deleteOne({positionId: this.getQuery()._id});
  next();
});

const Position = model('Position', positionSchema);

module.exports = Position