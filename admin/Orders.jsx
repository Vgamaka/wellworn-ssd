import { Link } from 'react-router-dom';
import './Orders.scss';
import Notification from "./Notification";

const Orders = () => {
  return (
    <div>
      <Notification />

      <div className='main-containerorr'>
        <Link to="/admin/refundorder"><button type="button" className='order-button'>Refund Orders</button></Link>
        <Link to="/admin/OrderTable"><button type="button" className='order-button'>Active Orders</button></Link>
        <Link to="/admin/OrderCancellation"><button type="button" className='order-button'>Cancel Orders</button></Link>
      </div>
    </div>

  );
};

export default Orders;
