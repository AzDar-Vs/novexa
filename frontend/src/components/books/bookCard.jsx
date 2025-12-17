const BookCard = ({ book, onClick }) => (
  <div className="card h-100" onClick={onClick}>
    <img src={book.cover} className="card-img-top" />
    <div className="card-body">
      <h6>{book.title}</h6>
      <p className="text-muted">Rp {book.price}</p>
    </div>
  </div>
);

export default BookCard;
