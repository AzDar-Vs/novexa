import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import './auth.css';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      return setError('Password does not match');
    }

    const res = await resetPassword(token, password);
    if (res?.success) {
      navigate('/login');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-left">
          <h2>Create New Password</h2>
          <p>Make sure your password is strong and secure.</p>
        </div>

        <div className="auth-right">
          <h3 className="mb-4">New Password</h3>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={submit}>
            <input
              type="password"
              className="form-control mb-3"
              placeholder="New password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              type="password"
              className="form-control mb-4"
              placeholder="Confirm password"
              required
              onChange={(e) => setConfirm(e.target.value)}
            />

            <button className="auth-btn">RESET PASSWORD</button>
          </form>
        </div>
      </div>
    </div>
  );
}
