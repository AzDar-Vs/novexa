import { useState } from 'react';
import Input from '../ui/input';
import Button from '../ui/button';

export default function registerForm({ onSubmit, loading = false }) {
  const [form, setForm] = useState({
    nama: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Nama"
        name="nama"
        value={form.nama}
        onChange={handleChange}
        required
      />

      <Input
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        required
      />

      <Input
        label="Password"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        required
      />

      <Input
        label="Konfirmasi Password"
        name="confirmPassword"
        type="password"
        value={form.confirmPassword}
        onChange={handleChange}
        required
      />

      <Button type="submit" className="w-100" disabled={loading}>
        {loading ? 'Loading...' : 'Register'}
      </Button>
    </form>
  );
}
