import { Card as BsCard } from 'react-bootstrap';

const Card = ({ title, children, footer }) => {
  return (
    <BsCard className="shadow-sm mb-3">
      {title && (
        <BsCard.Header>
          <strong>{title}</strong>
        </BsCard.Header>
      )}

      <BsCard.Body>{children}</BsCard.Body>

      {footer && <BsCard.Footer>{footer}</BsCard.Footer>}
    </BsCard>
  );
};

export default Card;
