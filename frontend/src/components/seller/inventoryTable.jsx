import { Table, Button, Badge } from 'react-bootstrap';

const InventoryTable = ({ books, onEdit, onDelete }) => {
  return (
    <Table striped hover responsive>
      <thead>
        <tr>
          <th>Judul</th>
          <th>Harga</th>
          <th>Stok</th>
          <th>Status</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        {books.map((book) => (
          <tr key={book.id}>
            <td>{book.judul}</td>
            <td>Rp {book.harga.toLocaleString()}</td>
            <td>{book.stok}</td>
            <td>
              <Badge bg={book.stok > 0 ? 'success' : 'danger'}>
                {book.stok > 0 ? 'Tersedia' : 'Habis'}
              </Badge>
            </td>
            <td>
              <Button
                size="sm"
                variant="warning"
                className="me-2"
                onClick={() => onEdit(book)}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => onDelete(book.id)}
              >
                Hapus
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default InventoryTable;
