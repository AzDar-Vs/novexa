import UserRepository from '../db/repositories/userRepository.js';

class UserService {
  static async getProfile(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new Error('USER_NOT_FOUND');
    return user;
  }

  static async updateProfile(userId, data) {
    return UserRepository.updateProfile(userId, data);
  }
}

export default UserService;
