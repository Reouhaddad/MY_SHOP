import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsLoading, selectIsRegistered, registerAsync, selectRegError } from './loginSlice';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Container, Grid, TextField, Button, Typography, FormControlLabel, Checkbox } from '@mui/material';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isSuperuser, setIsSuperuser] = useState(false);
  
  const isRegistered = useSelector(selectIsRegistered);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectRegError);
  const dispatch = useDispatch();

  const handleRegister = async () => {
    if (password === confirmPassword) {
      dispatch(registerAsync({ username, password, first_name: firstName, last_name: lastName, email, is_superuser: isSuperuser }));
    } else {
      toast.error('Passwords do not match!');
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Register
      </Typography>
      <form id="registerForm">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isSuperuser}
                  onChange={(e) => setIsSuperuser(e.target.checked)}
                  color="primary"
                />
              }
              label="Is Superuser"
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register'}
            </Button>
          </Grid>
        </Grid>
      </form>
      <br />
      {!isRegistered && (
        <Typography align="center">
          Already have an account? <Button component={Link} to="/login">Login here</Button>
        </Typography>
      )}
      {error && (
        <Typography align="center" color="error">
          {error}
        </Typography>
      )}
      {isRegistered && (
        <Typography align="center" color="primary">
          Registration successful!

         Already have an account? <Button component={Link} to="/login">Login here</Button>
       </Typography>
      )}
    </Container>
  );
};

export default Register;
