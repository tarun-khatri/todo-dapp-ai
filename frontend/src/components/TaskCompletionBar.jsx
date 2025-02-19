import React from 'react';
import { Box, Typography, LinearProgress, Paper } from '@mui/material';

const TaskCompletionBar = ({ tasks }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const percentage = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Paper elevation={2} sx={{ p: 2, my: 3 }}>
      <Typography variant="subtitle1" align="center" gutterBottom>
        Task Completion
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <LinearProgress 
          variant="determinate" 
          value={percentage} 
          sx={{ flex: 1, height: 10, borderRadius: 5 }} 
        />
        <Typography variant="body2" sx={{ minWidth: 120 }}>
          {completedTasks} of {totalTasks} ({percentage}%)
        </Typography>
      </Box>
    </Paper>
  );
};

export default TaskCompletionBar;
