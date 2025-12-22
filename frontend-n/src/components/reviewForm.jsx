import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { createReviewApi } from '../api/review.api';

const ReviewForm = ({ bookId, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createReviewApi({ bookId, rating, comment });
      alert('Review saved');
      setComment('');
      onSuccess?.();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={submit}>
      <Form.Group className="mb-2">
        <Form.Label>Rating</Form.Label>
        <Form.Select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        >
          {[5,4,3,2,1].map(n => (
            <option key={n} value={n}>{n} ⭐</option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Comment</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </Form.Group>

      <Button size="sm" type="submit" disabled={loading}>
        Submit Review
      </Button>
    </Form>
  );
};

export default ReviewForm;
