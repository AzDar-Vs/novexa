import BukuRepository from '../db/repositories/bukuRepository.js';

class BukuService {
  static async list() {
    return BukuRepository.findAll();
  }

  static async detail(id) {
    const buku = await BukuRepository.findById(id);
    if (!buku) throw new Error('BUKU_NOT_FOUND');
    return buku;
  }

  static async create(data) {
    return BukuRepository.create(data);
  }
}

export default BukuService;
