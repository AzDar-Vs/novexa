import CheckoutForm from '../../components/cart/CheckoutForm';
import './buyer.css';

export default function Checkout() {
  return (
    <div className="buyer-page">
      <h2 className="page-title mb-4">Checkout</h2>

      <div className="section-card">
        <CheckoutForm />
      </div>
    </div>
  );
}
