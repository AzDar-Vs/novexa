import { useEffect, useState } from 'react';
import { Container, Table, Button, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getMyBooksApi, deleteBookApi, publishBookApi } from '../../../api/buku.api';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = async () => {
    try {
      const res = await getMyBooksApi();
      setBooks(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus buku ini?')) return;
    await deleteBookApi(id);
    fetchBooks();
  };

  const togglePublish = async (id, currentStatus) => {
    const nextStatus =
    currentStatus === 'published' ? 'draft' : 'published';
    
    await publishBookApi(id, nextStatus);
    fetchBooks();
};

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner />
      </div>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between mb-3">
        <h4>Buku Saya</h4>
        <Button as={Link} to="/seller/books/add">
          + Tambah Buku
        </Button>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Cover</th>
            <th>Judul</th>
            <th>Status</th>
            <th>Harga</th>
            <th width="200">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {books.length ? books.map(b => (
            <tr key={b.id}>
              <td>
                {b.cover ? (
                  <img
                    src={`http://localhost:5000/uploads/${b.cover}`}
                    alt=""
                    width="50"
                  />
                ) : '-'}
              </td>
              <td>{b.judul}</td>
              <td>
                <Badge bg={b.status === 'published' ? 'success' : 'secondary'}>
                  {b.status}
                </Badge>
              </td>
              <td>
                {b.harga === 0 ? 'Gratis' : `Rp ${b.harga.toLocaleString()}`}
              </td>
              <td>
                <Button
                    size="sm"
                    variant={b.status === 'published' ? 'secondary' : 'success'}
                    className="me-2"
                    onClick={() => togglePublish(b.id, b.status)}
                  >
                    {b.status === 'published' ? 'Unpublish' : 'Publish'}
                </Button>

                <Button
                    size="sm"
                    variant="warning"
                    as={Link}
                    to={`/seller/books/edit/${b.id}`}
                    className="me-2"
                >
                Edit
                </Button>

                <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(b.id)}
                >
                Hapus
                </Button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="5" className="text-center">
                Belum ada buku
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default BookList;
