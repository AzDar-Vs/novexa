import { Form, Button } from 'react-bootstrap';

const BookForm = ({ initialData = {}, onSubmit, loading = false }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;

    onSubmit({
      judul: form.judul.value,
      harga: Number(form.harga.value),
      stok: Number(form.stok.value),
      deskripsi: form.deskripsi.value,
      cover: form.cover.files[0] || null,
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Judul Buku</Form.Label>
        <Form.Control
          name="judul"
          defaultValue={initialData.judul}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Harga</Form.Label>
        <Form.Control
          type="number"
          name="harga"
          defaultValue={initialData.harga}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Stok</Form.Label>
        <Form.Control
          type="number"
          name="stok"
          defaultValue={initialData.stok}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Deskripsi</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="deskripsi"
          defaultValue={initialData.deskripsi}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Cover Buku</Form.Label>
        <Form.Control type="file" name="cover" />
      </Form.Group>

      <Button type="submit" disabled={loading}>
        {loading ? 'Menyimpan...' : 'Simpan Buku'}
      </Button>
    </Form>
  );
};

export default BookForm;
