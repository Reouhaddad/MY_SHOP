import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Grid, TextField, Button, Typography, Box, Paper } from '@mui/material';
import { selectUsername, selectEmail, selectFirstName, selectLastName, updateUserAsync } from '../login/loginSlice';
import { toast } from 'react-toastify';

const Profile = () => {
  const dispatch = useDispatch();
  
  const username = useSelector(selectUsername);
  const email = useSelector(selectEmail);
  const firstName = useSelector(selectFirstName);
  const lastName = useSelector(selectLastName);

  const [updatedFirstName, setUpdatedFirstName] = useState(firstName);
  const [updatedLastName, setUpdatedLastName] = useState(lastName);
  const [updatedEmail, setUpdatedEmail] = useState(email);

  const handleUpdate = () => {
    dispatch(updateUserAsync({
      firstName: updatedFirstName,
      lastName: updatedLastName,
      email: updatedEmail
    })).then(response => {
      if(response.error) {
        toast.error('Update failed!');
      } else {
        toast.success('Profile updated successfully!');
      }
    });
  };

  useEffect(() => {
    setUpdatedFirstName(firstName);
    setUpdatedLastName(lastName);
    setUpdatedEmail(email);
  }, [firstName, lastName, email]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper sx={{ p: 3, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Profile
          </Typography>
          <Box component="form" onSubmit={(e) => e.preventDefault()} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  value={username}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={updatedFirstName}
                  onChange={(e) => setUpdatedFirstName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={updatedLastName}
                  onChange={(e) => setUpdatedLastName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={updatedEmail}
                  onChange={(e) => setUpdatedEmail(e.target.value)}
                />
              </Grid>
            </Grid>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleUpdate}
            >
              Update Profile
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile;
