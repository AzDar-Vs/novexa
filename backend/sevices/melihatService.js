import MelihatRepository from '../db/repositories/melihatRepository.js';

class MelihatService {

  static async track(userId, bukuId) {
    const exists = await MelihatRepository.exists(userId, bukuId);
    if (exists) return;

    return MelihatRepository.create(userId, bukuId);
  }

  static async listByUser(userId) {
    return MelihatRepository.findByUser(userId);
  }

  static async countByBuku(bukuId) {
    return MelihatRepository.countByBuku(bukuId);
  }
}

export default MelihatService;
