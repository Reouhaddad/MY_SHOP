import { configureStore } from '@reduxjs/toolkit';
import loginSlice from '../features/login/loginSlice';
import prodsReducer from '../features/prods/prodsSlice';
import cartReducer from '../features/cart/cartSlice';
import ordersReducer from '../features/orders/ordersSlice';

export const store = configureStore({
  reducer: {
    login: loginSlice,
    prod: prodsReducer,
    cart: cartReducer,
    orders: ordersReducer,
  },
});
