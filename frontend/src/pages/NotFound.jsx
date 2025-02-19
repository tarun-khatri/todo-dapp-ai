import React from 'react';
import { Container, Typography } from '@mui/material';

function NotFound() {
  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h3" align="center">
        404 - Page Not Found
      </Typography>
    </Container>
  );
}

export default NotFound;
