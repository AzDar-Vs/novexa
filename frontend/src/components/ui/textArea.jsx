import { Form } from 'react-bootstrap';

const TextArea = ({ label, error, rows = 4, ...props }) => {
  return (
    <Form.Group className="mb-3">
      {label && <Form.Label>{label}</Form.Label>}
      <Form.Control
        as="textarea"
        rows={rows}
        isInvalid={!!error}
        {...props}
      />
      {error && (
        <Form.Control.Feedback type="invalid">
          {error}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

export default TextArea;
