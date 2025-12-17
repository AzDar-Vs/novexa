import { Badge as BsBadge } from 'react-bootstrap';

const Badge = ({ variant = 'secondary', children }) => {
  return (
    <BsBadge bg={variant}>
      {children}
    </BsBadge>
  );
};

export default Badge;
