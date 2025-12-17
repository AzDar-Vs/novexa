export default function UserTable({ users, onEdit, onDelete }) {
  return (
    <div className="card">
      <div className="card-header fw-bold">Users</div>
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Nama</th>
              <th>Email</th>
              <th>Role</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-muted">
                  Tidak ada data
                </td>
              </tr>
            )}

            {users.map((user, i) => (
              <tr key={user.id}>
                <td>{i + 1}</td>
                <td>{user.nama}</td>
                <td>{user.email}</td>
                <td>
                  <span className="badge bg-secondary">
                    {user.role}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => onEdit(user)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => onDelete(user.id)}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
