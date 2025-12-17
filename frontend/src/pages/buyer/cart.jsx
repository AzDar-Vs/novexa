import { useCart } from '../../context/cartContext';
import CartItem from '../../components/cart/CartItem';
import CartSummary from '../../components/cart/CartSummary';
import './buyer.css';

export default function Cart() {
  const { items } = useCart();

  return (
    <div className="buyer-page">
      <h2 className="page-title mb-4">Shopping Cart</h2>

      <div className="row">
        <div className="col-md-8">
          {items.map(item => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        <div className="col-md-4">
          <CartSummary />
        </div>
      </div>
    </div>
  );
}
