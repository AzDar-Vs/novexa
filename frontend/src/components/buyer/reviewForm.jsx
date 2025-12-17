const ReviewForm = ({ onSubmit }) => (
  <form onSubmit={onSubmit}>
    <textarea name="comment" className="form-control mb-2" />
    <select name="rating" className="form-select mb-2">
      {[1,2,3,4,5].map(n => <option key={n}>{n}</option>)}
    </select>
    <button className="btn btn-success">Submit</button>
  </form>
);

export default ReviewForm;
