import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import transactionService from '../../services/transactionService';
import './buyer.css';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    transactionService.getTransactionById(id).then(setOrder);
  }, [id]);

  if (!order) return null;

  return (
    <div className="buyer-page">
      <h2 className="page-title mb-4">Order #{order.id}</h2>

      <div className="section-card">
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Total:</strong> ${order.total}</p>
      </div>
    </div>
  );
}
