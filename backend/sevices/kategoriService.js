import KategoriRepository from '../db/repositories/kategoriRepository.js';

class KategoriService {
  static async list() {
    return KategoriRepository.findAll();
  }

  static async create(data) {
    return KategoriRepository.create(data);
  }
}

export default KategoriService;
