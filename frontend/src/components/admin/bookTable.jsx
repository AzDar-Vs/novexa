export default function bookTable({ books, onEdit, onDelete }) {
  return (
    <div className="card">
      <div className="card-header fw-bold">Books</div>
      <div className="table-responsive">
        <table className="table table-striped mb-0">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Judul</th>
              <th>Harga</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book, i) => (
              <tr key={book.id}>
                <td>{i + 1}</td>
                <td>{book.judul}</td>
                <td>Rp {book.harga}</td>
                <td>
                  <span
                    className={`badge ${
                      book.status === 'active'
                        ? 'bg-success'
                        : 'bg-secondary'
                    }`}
                  >
                    {book.status}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => onEdit(book)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => onDelete(book.id)}
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
