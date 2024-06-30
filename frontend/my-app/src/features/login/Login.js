import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectError, selectIsLoading, selectIsLoggedIn, loginAsync } from './loginSlice';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Grid, TextField, Button, Typography, FormControlLabel, Checkbox, Box } from '@mui/material';
import { toast } from 'react-toastify';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [includeRefreshToken, setIncludeRefreshToken] = useState(false);

  const isLoggedIn = useSelector(selectIsLoggedIn);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    dispatch(loginAsync({ credentials: { username, password }, includeRefreshToken }));
  };

  useEffect(() => {
    if (isLoggedIn) {
      toast.success('Login successful!');
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        <Box component="form" onSubmit={(e) => e.preventDefault()} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
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
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeRefreshToken}
                    onChange={(e) => setIncludeRefreshToken(e.target.checked)}
                    color="primary"
                  />
                }
                label="Remember Me"
              />
            </Grid>
          </Grid>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
                <Typography align="center" color="primary">
                    Don't have an account? <Link to="/register">Register here</Link>
                </Typography>
            </Grid>
          </Grid>
        </Box>
        {error && (
          <Typography align="center" color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default Login;
