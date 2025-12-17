import UserRepository from './userRepository.js';

class AuthRepository {
  static async findUserByEmail(email) {
    return UserRepository.findByEmail(email);
  }

  static async createUser(data) {
    return UserRepository.create(data);
  }
}

export default AuthRepository;
