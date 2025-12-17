import { Form } from 'react-bootstrap';

const Input = ({
  label,
  error,
  ...props
}) => {
  return (
    <Form.Group className="mb-3">
      {label && <Form.Label>{label}</Form.Label>}
      <Form.Control {...props} isInvalid={!!error} />
      {error && (
        <Form.Control.Feedback type="invalid">
          {error}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

export default Input;
