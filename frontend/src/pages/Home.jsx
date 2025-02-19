import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { useAccount } from 'wagmi';
import axios from 'axios';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import TaskCompletionBar from '../components/TaskCompletionBar';
import AISuggestions from '../components/AISuggestions';

function Home() {
  const { address, isConnected } = useAccount();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);

  const fetchTasks = async () => {
    if (!address) {
      setTasks([]);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      setTasks([]);
    }
    setLoading(false);
  };

  // When wallet changes, re-log in and fetch tasks.
  useEffect(() => {
    if (isConnected && address) {
      setTasks([]);
      axios
        .post('/api/auth/login', { walletAddress: address })
        .then((res) => {
          localStorage.setItem('token', res.data.token);
          fetchTasks();
        })
        .catch((err) => {
          console.error('Login error:', err);
        });
    }
  }, [address, isConnected]);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Your Tasks</Typography>
        <Button variant="contained" onClick={() => setOpenForm(true)}>
          Add New Task
        </Button>
      </Box>

      {/* Place the Task Completion Bar at a prominent position */}
      <TaskCompletionBar tasks={tasks} />

      <AISuggestions tasks={tasks} />

      {tasks.length === 0 && !loading ? (
        <Typography variant="h6" align="center">
          No tasks yet. Create one to get started!
        </Typography>
      ) : (
        <TaskList tasks={tasks} onTaskUpdated={fetchTasks} loading={loading} />
      )}

      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          <TaskForm
            onTaskCreated={() => {
              setOpenForm(false);
              fetchTasks();
            }}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default Home;
