export default function transactionTable({ transactions }) {
  return (
    <div className="card">
      <div className="card-header fw-bold">Transactions</div>
      <div className="table-responsive">
        <table className="table table-bordered mb-0">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Total</th>
              <th>Status</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((trx, i) => (
              <tr key={trx.id}>
                <td>{i + 1}</td>
                <td>{trx.user}</td>
                <td>Rp {trx.total}</td>
                <td>
                  <span
                    className={`badge ${
                      trx.status === 'paid'
                        ? 'bg-success'
                        : trx.status === 'pending'
                        ? 'bg-warning'
                        : 'bg-danger'
                    }`}
                  >
                    {trx.status}
                  </span>
                </td>
                <td>{trx.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
