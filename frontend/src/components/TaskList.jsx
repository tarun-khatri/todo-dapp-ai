import React, { useState, useMemo, useCallback } from 'react';
import api from '../services/api';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Checkbox,
  CircularProgress,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button as MuiButton,
  Snackbar,
  Alert,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import Web3 from 'web3'; // Add this import at the top
import { Flag as FlagIcon } from '@mui/icons-material';


const getPriorityColor = (priority) => {
  switch (priority) {
    case 3: return 'error';
    case 2: return 'warning';
    case 1: return 'info';
    default: return 'text';
  }
};

const getPriorityLabel = (priority) => {
  switch (priority) {
    case 3: return 'High';
    case 2: return 'Medium';
    case 1: return 'Low';
    default: return 'None';
  }
};

// Replace with your deployed contract address and ABI
const CONTRACT_ADDRESS = '0xa3ed26669cAD09FBB32bDb3C431F8E9A7D093E0C';
const contractABI = [
  // Minimal ABI: only completeTask function and event
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "taskHash",
        "type": "bytes32"
      }
    ],
    "name": "completeTask",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "bytes32", "name": "taskHash", "type": "bytes32" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "TaskCompleted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "taskHash",
        "type": "bytes32"
      }
    ],
    "name": "isTaskCompleted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

function TaskList({ tasks = [], onTaskUpdated, loading }) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editPriority, setEditPriority] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Process tasks array with useMemo
  const taskArray = useMemo(() => Array.isArray(tasks) ? tasks : [], [tasks]);

  // Sort tasks with useMemo
  const sortedTasks = useMemo(() => {
    return [...taskArray].sort((a, b) => {
      // First sort by completion status
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;  // Completed tasks go to the end
      }
      // Then sort by priority for non-completed tasks
      if (!a.completed && !b.completed) {
        return b.priority - a.priority;
      }
      return 0;
    });
  }, [taskArray]);

  // Handler functions
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  const openEditDialog = useCallback((task) => {
    setCurrentTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditDeadline(task.deadline || '');
    setEditPriority(task.priority);
    setEditDialogOpen(true);
  }, []);

  const closeEditDialog = useCallback(() => {
    setEditDialogOpen(false);
    setCurrentTask(null);
  }, []);

  const handleEditSubmit = async () => {
    if (!currentTask) return;
    try {
      const token = localStorage.getItem('token');
      await api.put(
        `/api/tasks/${currentTask._id}`,
        {
          title: editTitle,
          description: editDescription,
          deadline: editDeadline,
          priority: editPriority,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      closeEditDialog();
      onTaskUpdated();
    } catch (error) {
      console.error("Edit error:", error);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onTaskUpdated();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      if (!window.ethereum) {
        setSnackbar({
          open: true,
          message: 'Ethereum wallet not detected',
          severity: 'error'
        });
        return;
      }
  
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const userAccount = accounts[0];
      const token = localStorage.getItem('token');
      
      // Create task hash consistently
      const taskString = task.title + task.description + (task.deadline || '');
      const taskHash = web3.utils.keccak256(taskString);
      
      // Create contract instance
      const contract = new web3.eth.Contract(contractABI, CONTRACT_ADDRESS);
  
      // First check if task is already completed on blockchain
      try {
        const isCompleted = await contract.methods.isTaskCompleted(task.completedBy || userAccount, taskHash).call();
        
        if (isCompleted || task.isVerifiedOnChain) {
          setSnackbar({
            open: true,
            message: 'This task has already been verified on blockchain',
            severity: 'info'
          });
          return;
        }
      } catch (error) {
        console.error('Error checking blockchain status:', error);
      }
  
      // If task is not completed, complete it
      if (!task.completed) {
        try {
          const tx = await contract.methods.completeTask(taskHash)
            .send({ from: userAccount });
          
          await api.put(
            `/api/tasks/${task._id}`,
            { 
              completed: true,
              blockchainTaskHash: tx.transactionHash,
              completedBy: userAccount,
              isVerifiedOnChain: true // Add this field
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          setSnackbar({
            open: true,
            message: 'Task completed and verified on blockchain',
            severity: 'success'
          });
          
          onTaskUpdated();
        } catch (error) {
          console.error('Blockchain transaction failed:', error);
          setSnackbar({
            open: true,
            message: 'Failed to complete task on blockchain',
            severity: 'error'
          });
        }
      }
    } catch (error) {
      console.error('Toggle error:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Error updating task',
        severity: 'error'
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  // Empty state
  if (taskArray.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography align="center">No tasks found</Typography>
      </Paper>
    );
  }

  return (
    <>
      <Paper elevation={3} sx={{ mb: 3 }}>
        <List>
          {sortedTasks.map((task) => (
            <ListItem 
              key={task._id} 
              divider 
              sx={{
                borderLeft: (theme) => `4px solid ${theme.palette[getPriorityColor(task.priority)].main}`,
                transition: 'background-color 0.2s',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <Checkbox
                checked={Boolean(task.completed)}
                onChange={() => handleToggleComplete(task)}
                disabled={Boolean(task.completed)}
                sx={{
                  color: task.blockchainTaskHash ? 'grey.500' : 'primary.main',
                  '&.Mui-checked': {
                    color: task.blockchainTaskHash ? 'grey.500' : 'primary.main',
                  },
                  '&.Mui-disabled': {
                    color: task.blockchainTaskHash ? 'grey.500' : 'rgba(0, 0, 0, 0.38)',
                  }
                }}
              />
              <ListItemText
                primary={
                  <Typography
                    component="div" // Changed from default 'p' to 'div'
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <Typography
                      component="span" // Using span instead of p
                      sx={{
                        textDecoration: task.completed ? 'line-through' : 'none',
                        opacity: task.completed ? 0.7 : 1
                      }}
                    >
                      {task.title}
                    </Typography>
                    <FlagIcon 
                      sx={{ 
                        color: `${getPriorityColor(task.priority)}.main`,
                        fontSize: '1rem',
                        opacity: task.priority === 0 ? 0 : 1
                      }} 
                    />
                  </Typography>
                }
                secondary={
                  <Box component="span"> {/* Changed from div to span */}
                    <Typography 
                      component="span" 
                      display="block"
                      sx={{
                        textDecoration: task.completed ? 'line-through' : 'none',
                        opacity: task.completed ? 0.7 : 1
                      }}
                    >
                      {task.description}
                    </Typography>
                    <Typography 
                      component="span" 
                      variant="caption" 
                      sx={{ 
                        color: `${getPriorityColor(task.priority)}.main`,
                        display: 'block',
                        mt: 0.5
                      }}
                    >
                      Priority: {getPriorityLabel(task.priority)}
                    </Typography>
                    {task.deadline && (
                      <Typography 
                        component="span" 
                        variant="caption" 
                        display="block"
                        sx={{ mt: 0.5 }}
                      >
                        Deadline: {new Date(task.deadline).toLocaleDateString()}
                      </Typography>
                    )}
                    {task.blockchainTaskHash && (
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{
                          color: 'success.main',
                          fontWeight: 'medium',
                          display: 'block',
                          mt: 0.5
                        }}
                      >
                        ✓ Verified on blockchain
                      </Typography>
                    )}
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleDelete(task._id)}
                  disabled={Boolean(task.isVerifiedOnChain)}
                  sx={{ display: task.isVerifiedOnChain ? 'none' : 'inline-flex' }}
                >
                  <DeleteIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => openEditDialog(task)}
                  disabled={Boolean(task.isVerifiedOnChain)}
                  sx={{ display: task.isVerifiedOnChain ? 'none' : 'inline-flex' }}
                >
                  <EditIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog open={editDialogOpen} onClose={closeEditDialog}>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Task Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            margin="normal"
            multiline
            rows={3}
          />
         <TextField
  fullWidth
  label="Deadline"
  type="date"
  value={editDeadline ? editDeadline.split('T')[0] : ''} // Format the date
  onChange={(e) => setEditDeadline(e.target.value)}
  InputLabelProps={{ shrink: true }}
  margin="normal"
/>
<TextField
  fullWidth
  select
  label="Priority"
  value={editPriority}
  onChange={(e) => setEditPriority(Number(e.target.value))}
  margin="normal"
  SelectProps={{
    native: true,
  }}
>
  <option value={0}>None</option>
  <option value={1}>Low</option>
  <option value={2}>Medium</option>
  <option value={3}>High</option>
</TextField>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={closeEditDialog}>Cancel</MuiButton>
          <MuiButton variant="contained" onClick={handleEditSubmit}>Save</MuiButton>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          elevation={6}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default TaskList;
