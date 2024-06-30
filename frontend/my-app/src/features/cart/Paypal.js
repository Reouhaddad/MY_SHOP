import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { clearItems, selectShoppingData, sendOrderAsync, captureOrder, selectOrderId } from '../cart/cartSlice';
import { selectUsername } from '../login/loginSlice';

const Paypal = ({ fullName, email, address, city, state, zip }) => {
  const shoppingData = useSelector(selectShoppingData);
  const username = useSelector(selectUsername);
  const orderId = useSelector(selectOrderId);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const totalAmount = shoppingData.reduce((acc, curr) => acc + curr.price * curr.amount, 0).toFixed(2);

  const paypalOptions = {
    'client-id': "YOUR_PAYPAL_CLIENT_ID",
    currency: 'USD',
  };

  const createOrder = async (data, actions) => {
    // Create the order in the backend first
    const items = shoppingData.map(item => ({
      id: item.id,
      amount: item.amount,
      price: item.price,
    }));

    const orderResponse = await dispatch(sendOrderAsync({
      items,
      fullName,
      email,
      address,
      city,
      state,
      zip
    }));

    if (orderResponse.error) {
      toast.error('Failed to create order');
      throw new Error('Failed to create order');
    }

    return actions.order.create({
      purchase_units: [{
        amount: {
          value: totalAmount,
        },
      }],
    });
  };

  const onApprove = async (data, actions) => {
    const paypalOrderId = data.orderID;

    const captureResponse = await dispatch(captureOrder({
      orderId,
      paypalOrderId,
    }));

    if (captureResponse.error) {
      toast.error('Failed to capture order');
      throw new Error('Failed to capture order');
    }

    dispatch(clearItems());
    toast.success('Order captured successfully!');
    navigate('/orders');
  };

  const onError = (err) => {
    console.error(err);
    toast.error('Payment failed. Please try again.');
  };

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <PayPalButtons
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
      />
    </PayPalScriptProvider>
  );
};

export default Paypal;
