import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const statusVariant = (status) => {
  switch (status) {
    case 'paid':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'danger';
    default:
      return 'secondary';
  }
};

const OrderCard = ({ order }) => {
  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between">
          <div>
            <h6 className="mb-1">
              Order #{order.id}
            </h6>
            <small className="text-muted">
              {new Date(order.created_at).toLocaleDateString()}
            </small>
          </div>

          <Badge bg={statusVariant(order.status)}>
            {order.status}
          </Badge>
        </div>

        <hr />

        <div className="d-flex justify-content-between align-items-center">
          <strong>
            Total: Rp {order.total_harga?.toLocaleString()}
          </strong>

          <Link to={`/buyer/orders/${order.id}`}>
            <Button size="sm" variant="outline-primary">
              Detail
            </Button>
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default OrderCard;
