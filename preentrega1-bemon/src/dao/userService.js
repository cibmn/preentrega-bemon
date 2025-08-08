import userModel from '../models/userModel.js';

class UserService {
  async createUser(userData) {
    const user = await userModel.create(userData);
    return user;
  }

  async getUserByEmail(email) {
    return await userModel.findOne({ email });
  }

  async getUserById(id) {
    return await userModel.findById(id);
  }

  async updateUser(id, updateData) {
    return await userModel.findByIdAndUpdate(id, updateData, { new: true });
  }
}

export default new UserService();
