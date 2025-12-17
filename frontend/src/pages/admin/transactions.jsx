import TransactionTable from '../../components/admin/transactionTable';

const Transaction = () => {
  return (
    <div className="container-fluid">
      <h4 className="mb-3">Transactions</h4>

      <div className="card">
        <div className="card-body">
          <TransactionTable />
        </div>
      </div>
    </div>
  );
};

export default Transaction;
