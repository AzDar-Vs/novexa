import { Button as BsButton, Spinner } from 'react-bootstrap';

const Button = ({
  children,
  variant = 'primary',
  loading = false,
  ...props
}) => {
  return (
    <BsButton variant={variant} disabled={loading} {...props}>
      {loading && (
        <Spinner
          animation="border"
          size="sm"
          className="me-2"
        />
      )}
      {children}
    </BsButton>
  );
};

export default Button;
