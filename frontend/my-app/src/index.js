import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './features/login/Login';
import Prods from './features/prods/Prods';
import Checkout from './features/cart/Checkout';
import Register from './features/login/Register';
import Toastify from './components/Toastify';
import Profile from './features/login/Profile';
import Orders from './features/orders/Orders';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Toastify />
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Prods />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/checkout' element={<Checkout />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/orders' element={<Orders />} />
          </Route>
          <Route path="*" element={<h1 style={{ textAlign: 'center' }}>Error: Page not found</h1>}></Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
