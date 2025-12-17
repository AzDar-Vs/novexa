import { useState } from 'react';
import Input from '../ui/input';
import Button from '../ui/button';

export default function forgotPasswordForm({ onSubmit, loading = false }) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Button type="submit" className="w-100" disabled={loading}>
        {loading ? 'Mengirim...' : 'Kirim Reset Link'}
      </Button>
    </form>
  );
}
