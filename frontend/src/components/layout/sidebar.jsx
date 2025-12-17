import AdminSidebar from './AdminSidebar';
import SellerSidebar from './SellerSidebar';
import BuyerSidebar from './BuyerSidebar';

const Sidebar = ({ role }) => {
  switch (role) {
    case 'admin':
      return <AdminSidebar />;
    case 'seller':
      return <SellerSidebar />;
    case 'buyer':
      return <BuyerSidebar />;
    default:
      return null;
  }
};

export default Sidebar;
