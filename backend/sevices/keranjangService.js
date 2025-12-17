import KeranjangRepository from '../db/repositories/keranjangRepository.js';

class KeranjangService {
  static async create() {
    return KeranjangRepository.create();
  }

  static async addItem(keranjangId, bukuId, harga) {
    return KeranjangRepository.addItem(keranjangId, bukuId, harga);
  }

  static async getItems(keranjangId) {
    return KeranjangRepository.getItems(keranjangId);
  }
}

export default KeranjangService;
