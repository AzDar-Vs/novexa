import { Form } from 'react-bootstrap';

const Select = ({ label, options = [], error, ...props }) => {
  return (
    <Form.Group className="mb-3">
      {label && <Form.Label>{label}</Form.Label>}
      <Form.Select isInvalid={!!error} {...props}>
        <option value="">-- pilih --</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Form.Select>
      {error && (
        <Form.Control.Feedback type="invalid">
          {error}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

export default Select;
