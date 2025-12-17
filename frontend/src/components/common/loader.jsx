import { Spinner } from 'react-bootstrap';

const Loader = ({ text = 'Loading...' }) => {
  return (
    <div className="d-flex flex-column align-items-center py-5">
      <Spinner animation="border" />
      <small className="mt-2 text-muted">{text}</small>
    </div>
  );
};

export default Loader;
