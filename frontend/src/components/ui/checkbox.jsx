import { Form } from 'react-bootstrap';

const Checkbox = ({ label, ...props }) => {
  return (
    <Form.Check
      type="checkbox"
      label={label}
      {...props}
    />
  );
};

export default Checkbox;
