import React from 'react';
import { Box } from '@mui/material';
import Header from './components/Header';
import Home from './pages/Home';

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Home />
    </Box>
  );
}

export default App;
