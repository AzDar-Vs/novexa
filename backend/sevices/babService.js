import BabRepository from '../db/repositories/babRepository.js';

class BabService {
  static async listByBuku(bukuId) {
    return BabRepository.findByBuku(bukuId);
  }

  static async create(data) {
    return BabRepository.create(data);
  }
}

export default BabService;
