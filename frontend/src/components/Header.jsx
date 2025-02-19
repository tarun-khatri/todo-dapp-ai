import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

function Header() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = async () => {
    if (isConnected) {
      disconnect();
    } else {
      connect({ connector: injected() });
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          TODO DApp
        </Typography>
        <Box>
          <Button color="inherit" onClick={handleConnect}>
            {isConnected ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect Wallet'}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
