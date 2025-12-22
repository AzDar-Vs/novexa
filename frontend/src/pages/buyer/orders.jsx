import { useEffect, useState } from 'react';
import { Container, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getOrdersApi } from '../../api/order.api';

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getOrdersApi().then(res => setOrders(res.data.data));
  }, []);

  return (
    <Container className="py-4">
      <h3 className="mb-3">Order History</h3>

      {orders.map(o => (
        <Card key={o.id} className="mb-3 p-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div className="fw-bold">{o.invoice}</div>
              <small>{new Date(o.createdAt).toLocaleString()}</small>
            </div>
            <div>
              <Badge bg={o.status === 'paid' ? 'success' : 'warning'}>
                {o.status}
              </Badge>
            </div>
            <div className="fw-bold">
              Rp {o.total.toLocaleString()}
            </div>
            <Button as={Link} to={`/buyer/orders/${o.id}`} size="sm">
              Detail
            </Button>
          </div>
        </Card>
      ))}
    </Container>
  );
};

export default Orders;
