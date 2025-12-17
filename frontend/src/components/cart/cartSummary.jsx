import { Card, Button } from 'react-bootstrap';

const CartSummary = ({ totalItem, totalHarga, onCheckout }) => {
  return (
    <Card className="shadow-sm">
      <Card.Body>
        <h5>Ringkasan</h5>
        <hr />

        <div className="d-flex justify-content-between mb-2">
          <span>Total Item</span>
          <strong>{totalItem}</strong>
        </div>

        <div className="d-flex justify-content-between mb-3">
          <span>Total Harga</span>
          <strong>Rp {totalHarga.toLocaleString()}</strong>
        </div>

        <Button
          variant="success"
          className="w-100"
          onClick={onCheckout}
          disabled={totalItem === 0}
        >
          Checkout
        </Button>
      </Card.Body>
    </Card>
  );
};

export default CartSummary;
