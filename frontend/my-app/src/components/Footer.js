import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'lightgray',
        width: '100%',
        textAlign: 'center',
        padding: '10px 0',
        mt: 'auto' // This helps to push the footer to the bottom when the content is insufficient
      }}
    >
      <Container maxWidth="xl">
        <Typography variant="body1">© 2024 My supermarket.</Typography>
      </Container>
    </Box>
  );
}

export default Footer;
