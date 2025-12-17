import ReviewRepository from '../db/repositories/reviewRepository.js';

class ReviewService {
  static async create(data) {
    return ReviewRepository.create(data);
  }
}

export default ReviewService;
