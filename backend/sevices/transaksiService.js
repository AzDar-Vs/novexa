import TransaksiRepository from '../db/repositories/transaksiRepository.js';
import NotifikasiRepository from '../db/repositories/notifikasiRepository.js';

class TransaksiService {
  static async create({ userId, totalHarga }) {
    const notifId = await NotifikasiRepository.create('Transaksi dibuat');

    return TransaksiRepository.create({
      idUser: userId,
      totalHarga,
      status: 'pending',
      idNotif: notifId
    });
  }

  static async listByUser(userId) {
    return TransaksiRepository.findByUser(userId);
  }
}

export default TransaksiService;
