import { Form, Button } from 'react-bootstrap';

const CheckoutForm = ({ onSubmit, loading = false }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;

    onSubmit({
      payment_method: form.payment_method.value,
      notes: form.notes.value,
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Metode Pembayaran</Form.Label>
        <Form.Select name="payment_method" required>
          <option value="">Pilih metode</option>
          <option value="transfer">Transfer Bank</option>
          <option value="ewallet">E-Wallet</option>
          <option value="qris">QRIS</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Catatan (opsional)</Form.Label>
        <Form.Control as="textarea" rows={2} name="notes" />
      </Form.Group>

      <Button type="submit" disabled={loading}>
        {loading ? 'Memproses...' : 'Bayar Sekarang'}
      </Button>
    </Form>
  );
};

export default CheckoutForm;
