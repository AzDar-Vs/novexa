import NotifikasiRepository from '../db/repositories/notifikasiRepository.js';

class NotifikasiService {
  static async listByUser(userId) {
    return NotifikasiRepository.findByUser(userId);
  }
}

export default NotifikasiService;
