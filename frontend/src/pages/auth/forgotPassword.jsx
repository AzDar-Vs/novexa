import { useState } from 'react';
import { useAuth } from '../../context/authContext';
import './auth.css';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer',
  });

  const submit = async (e) => {
    e.preventDefault();
    await register(form);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-left">
          <h2>Hello, Friend!</h2>
          <p>Register and start your journey with us</p>
          <a href="/login" className="auth-btn-outline mt-3 text-decoration-none">
            SIGN IN
          </a>
        </div>

        <div className="auth-right">
          <h3 className="mb-4">Create Account</h3>

          <form onSubmit={submit}>
            <input className="form-control mb-3" placeholder="Name" 
              onChange={(e) => setForm({ ...form, name: e.target.value })} />

            <input className="form-control mb-3" placeholder="Email"
              onChange={(e) => setForm({ ...form, email: e.target.value })} />

            <input type="password" className="form-control mb-3" placeholder="Password"
              onChange={(e) => setForm({ ...form, password: e.target.value })} />

            <select className="form-select mb-4"
              onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>

            <button className="auth-btn">SIGN UP</button>
          </form>
        </div>
      </div>
    </div>
  );
}
