const CartItem = ({ item, onRemove }) => (
  <div className="d-flex justify-content-between mb-2">
    <span>{item.title}</span>
    <button className="btn btn-sm btn-danger" onClick={() => onRemove(item.id)}>
      Hapus
    </button>
  </div>
);

export default CartItem;
