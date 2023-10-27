const Leave = require("../models/Leave");
const CustomError = require("../utilities/CustomError");
const isAuthorizedUser = require("../utilities/isAuthorizedUser");
const Service = require("./Service");

class LeaveService extends Service {
  constructor() {
    super(Leave);
  }



  async getAll(query, user) {
    let { page = 1, limit = 5, sort = '_id', order = 'asc', ...filters } = query;
    let results;
    // User limited access(only own leaves)
    if (user.role === 'user') {
      filters = { employeeId: user.employeeId };
      results = await this.model.find(filters)
        .sort({ [sort]: order })
        .limit(+limit)
        .skip((page - 1) * limit)
        .populate('employeeId', 'name');
    } else {
      results = await this.model.find(query)
        .sort({ [sort]: order })
        .limit(+limit)
        .skip((page - 1) * limit)
        .populate('employeeId', 'name')
        ;
    }
    const paginationObj = await this.createPagination(page, limit, filters);
    return { results, ...paginationObj }
  }

  async getById(id, user) {
    const leave = await this.model.findById(id);
    const leaveEmployeeId = leave.employeeId;
    if (!isAuthorizedUser(user.role, user.employeeId, leaveEmployeeId)) {
      throw new CustomError('Unauthorized: User can only read his own leaves');
    }

    return leave;
  }

  async resolve(id, status) {
    const leave = await this.model.findById(id);
    if (leave.status !== 'pending') throw new Error(`This leave request is already ${leave.status}`);
    leave.status = status;

    return await leave.save()
  }

  async create(input, user) {
    input.employeeId = user.employeeId;
    input.status = 'pending'

    return await this.model.create(input);
  }
}
module.exports = new LeaveService()