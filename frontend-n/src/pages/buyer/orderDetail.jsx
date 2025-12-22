import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card, Badge, Button } from 'react-bootstrap';
import { getOrderDetailApi } from '../../api/order.api';
import ReviewForm from '../../components/reviewForm';


const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    getOrderDetailApi(id).then(res => setOrder(res.data.data));
  }, [id]);

  if (!order) return null;

  return (
    <Container className="py-4">
      <h3>Order Detail</h3>

      <Card className="p-3 mb-3">
        <div><strong>Invoice:</strong> {order.invoice}</div>
        <div>
          <strong>Status:</strong>{' '}
          <Badge bg={order.status === 'paid' ? 'success' : 'warning'}>
            {order.status}
          </Badge>
        </div>
        <div><strong>Total:</strong> Rp {order.total.toLocaleString()}</div>
      </Card>

      {order.items.map(item => (
        <Card key={item.id} className="mb-2 p-3 d-flex justify-content-between">
          <span>{item.title}</span>
          <span>Rp {item.price.toLocaleString()}</span>
          <Button as={Link} to={`/buyer/read/${item.id}`} variant="success" size="sm">  
          Read
          </Button>
          <ReviewForm bookId={item.id} onSuccess={() => {}} />
        </Card>
      ))}
    </Container>
  );
};

export default OrderDetail;
