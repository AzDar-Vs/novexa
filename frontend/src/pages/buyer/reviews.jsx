import { useEffect, useState } from 'react';
import reviewService from '../../services/reviewService';
import ReviewForm from '../../components/buyer/ReviewForm';
import './buyer.css';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    reviewService.getUserReviews().then(setReviews);
  }, []);

  return (
    <div className="buyer-page">
      <h2 className="page-title mb-4">My Reviews</h2>

      <ReviewForm />

      {reviews.map(r => (
        <div key={r.id} className="section-card mt-3">
          <p><strong>{r.book}</strong></p>
          <p>{r.comment}</p>
        </div>
      ))}
    </div>
  );
}
