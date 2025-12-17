import FavoritRepository from '../db/repositories/favoritRepository.js';

class FavoritService {
  static async tambah(userId, bukuId) {
    return FavoritRepository.create(userId, bukuId);
  }

  static async hapus(userId, bukuId) {
    return FavoritRepository.delete(userId, bukuId);
  }

  static async list(userId) {
    return FavoritRepository.findByUser(userId);
  }
}

export default FavoritService;
