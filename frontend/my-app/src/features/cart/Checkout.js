import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, TextField, Typography, Box, Grid, Checkbox, FormControlLabel } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';
import Paypal from './Paypal';
import { selectIsLoggedIn, selectFirstName, selectLastName, selectEmail } from '../login/loginSlice';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const firstName = useSelector(selectFirstName);
  const lastName = useSelector(selectLastName);
  const email = useSelector(selectEmail);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login'); // Redirect to login page if not logged in
    }
  }, [isLoggedIn, navigate]);

  const [fullName, setFullName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const shoppingData = useSelector((state) => state.cart.shoppingData);

  useEffect(() => {
    if (firstName && lastName) {
      setFullName(`${firstName} ${lastName}`);
    }
    if (email) {
      setUserEmail(email);
    }
  }, [firstName, lastName, email]);

  const calculateTotalAmount = () => {
    return shoppingData.reduce((total, item) => total + item.price * item.amount, 0).toFixed(2);
  };

  const totalAmount = calculateTotalAmount();

  return (
    <Container maxWidth="md" className="checkout-container">
      <Box p={3} bgcolor="background.paper" boxShadow={3}>
        <form>
          <Typography variant="h5" gutterBottom>
            Billing Address
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                id="fname"
                name="fullname"
                label="Full Name"
                fullWidth
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                id="email"
                name="email"
                label="Email"
                fullWidth
                autoComplete="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                id="adr"
                name="address"
                label="Address"
                fullWidth
                autoComplete="address"
                placeholder="542 W. 15th Street"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                id="city"
                name="city"
                label="City"
                fullWidth
                autoComplete="address-level2"
                placeholder="New York"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                required
                id="state"
                name="state"
                label="State"
                fullWidth
                placeholder="NY"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                required
                id="zip"
                name="zip"
                label="Zip"
                fullWidth
                autoComplete="postal-code"
                placeholder="10001"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
              />
            </Grid>
          </Grid>

          <Typography variant="h5" gutterBottom mt={3}>
            Payment
          </Typography>
          <FormControlLabel
            control={<Checkbox name="sameadr" color="primary" defaultChecked />}
            label="Shipping address same as billing"
            sx={{ mt: 3 }}
          />
        </form>
        <Paypal
          fullName={fullName}
          email={userEmail}
          address={address}
          city={city}
          state={state}
          zip={zip}
        />
      </Box>
    </Container>
  );
};

export default Checkout;
