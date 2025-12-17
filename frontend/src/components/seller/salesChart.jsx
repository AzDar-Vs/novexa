import { Card, Table } from 'react-bootstrap';

const SalesChart = ({ data }) => {
  return (
    <Card className="shadow-sm">
      <Card.Body>
        <h5>Ringkasan Penjualan</h5>
        <Table size="sm" className="mt-3">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Transaksi</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                <td>{row.date}</td>
                <td>{row.count}</td>
                <td>Rp {row.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default SalesChart;
