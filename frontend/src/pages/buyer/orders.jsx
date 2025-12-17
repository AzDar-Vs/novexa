import { useEffect, useState } from 'react';
import transactionService from '../../services/transactionService';
import Table from '../../components/ui/Table';
import './buyer.css';

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    transactionService.getTransactions().then(setOrders);
  }, []);

  return (
    <div className="buyer-page">
      <h2 className="page-title mb-4">My Orders</h2>

      <div className="section-card">
        <Table
          columns={['ID', 'Total', 'Status', 'Date']}
          data={orders}
        />
      </div>
    </div>
  );
}
