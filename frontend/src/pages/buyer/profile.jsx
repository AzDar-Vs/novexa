import { useAuth } from '../../context/authContext';
import './buyer.css';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="buyer-page">
      <h2 className="page-title mb-4">My Profile</h2>

      <div className="section-card">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
    </div>
  );
}
