import React, { useState, useEffect } from 'react';
import {
  Box,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Slide,
  Grid,
  Chip,
} from '@mui/material';
import {
  Assignment,
  Notifications,
  Psychology,
  Close,
  Lightbulb,
  AddAlarm,
  Share
} from '@mui/icons-material';
import axios from 'axios';

const AISuggestions = ({ tasks }) => {
  const [suggestions, setSuggestions] = useState('');
  const [reminders, setReminders] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState('');
  const [error, setError] = useState('');
  const [tip, setTip] = useState('');

  const actions = [
    { icon: <Assignment />, name: 'Task Analysis', key: 'suggest' },
    { icon: <Notifications />, name: 'Smart Reminders', key: 'reminders' },
  ];

  useEffect(() => {
    let isMounted = true;
    let tipTimeout;
    let tipGenerationTimeout;

    const generateTip = async () => {
      try {
        const incompleteTasks = tasks.filter(t => !t.completed);
        if (incompleteTasks.length > 0) {
          const response = await axios.post('http://localhost:5000/api/ai/quick-tip', 
            { tasks: incompleteTasks },
            { 
              headers: { 
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (isMounted && response.data && response.data.tip) {
            setTip(response.data.tip);
            // Show tip for 15 seconds
            tipTimeout = setTimeout(() => {
              if (isMounted) {
                setTip('');
                // Generate next tip after 30 seconds (total 45-second cycle)
                tipGenerationTimeout = setTimeout(generateTip, 30000);
              }
            }, 15000);
          }
        }
      } catch (error) {
        console.error('AI tip error:', error);
        if (isMounted) {
          setTip('');
          // Retry after 45 seconds on error
          tipGenerationTimeout = setTimeout(generateTip, 45000);
        }
      }
    };

    generateTip();

    return () => {
      isMounted = false;
      if (tipTimeout) clearTimeout(tipTimeout);
      if (tipGenerationTimeout) clearTimeout(tipGenerationTimeout);
    };
  }, [tasks]);

  const fetchData = async (type) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:5000/api/ai/${type}`, 
        { tasks: tasks.filter(t => !t.completed) },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );
      
      if (response.data) {
        if (type === 'suggest') {
          setSuggestions(response.data.analysis || response.data.message);
        } else if (type === 'reminders') {
          setReminders(response.data.reminders || response.data.message);
        }
        setOpenDialog(type);
      }
    } catch (error) {
      console.error('AI Error:', error);
      setError(error.response?.data?.message || 'AI service temporarily unavailable');
    } finally {
      setLoading(false);
    }
  };

  // Add these helper functions in your component
  const getDeadlineColor = (deadline) => {
    if (!deadline) return 'grey.400';
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'error.main';
    if (days < 2) return 'warning.main';
    if (days < 7) return 'info.main';
    return 'success.main';
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return 'No deadline';
    const date = new Date(deadline);
    const days = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return `Overdue by ${Math.abs(days)} days`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `Due in ${days} days`;
  };

  const handleSetReminders = (tasks) => {
    // Implement calendar integration here
    console.log('Setting calendar reminders');
  };

  const handleShareTasks = (tasks) => {
    // Implement share functionality here
    console.log('Sharing task timeline');
  };

  const getSuggestedTimeBlock = (task) => {
    const deadline = new Date(task.deadline);
    const hour = deadline.getHours();
    
    if (hour < 12) return 'Morning Block (9AM-12PM)';
    if (hour < 17) return 'Afternoon Block (1PM-5PM)';
    return 'Evening Block (5PM-8PM)';
  };
  
  const getDaysDifference = (deadline) => {
    if (!deadline) return Infinity;
    return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
  };

  const getPriorityLabel = (deadline) => {
    const days = getDaysDifference(deadline);
    if (days < 0) return 'Overdue';
    if (days <= 1) return 'Urgent';
    if (days <= 3) return 'High';
    if (days <= 7) return 'Medium';
    return 'Low';
  };

  const getPriorityColor = (deadline) => {
    const days = getDaysDifference(deadline);
    if (days < 0) return 'error';
    if (days <= 1) return 'warning';
    if (days <= 3) return 'info';
    return 'success';
  };

  // Add this notification function
  const showNotification = (title, body) => {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications");
      return;
    }

    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(title, {
          body: body,
          icon: "/path/to/your/icon.png" // Add your icon path
        });
      }
    });
  };

  // Add this hook for automatic reminders
  useEffect(() => {
    const checkDeadlines = () => {
      const urgentTasks = tasks.filter(task => {
        if (task.completed) return false;
        const daysUntilDue = getDaysDifference(task.deadline);
        return daysUntilDue <= 1 && daysUntilDue >= 0;
      });

      urgentTasks.forEach(task => {
        showNotification(
          "Task Reminder! 🚨",
          `"${task.title}" is due ${formatDeadline(task.deadline)}!`
        );
      });
    };

    // Check deadlines every 30 minutes
    const reminderInterval = setInterval(checkDeadlines, 1800000);
    checkDeadlines(); // Initial check

    return () => clearInterval(reminderInterval);
  }, [tasks]);

  // Add this helper function
  const getNotificationSchedule = (deadline) => {
    const now = new Date();
    const taskDate = new Date(deadline);
    const hoursUntilDue = (taskDate - now) / (1000 * 60 * 60);

    if (hoursUntilDue <= 24 && hoursUntilDue > 0) {
      return {
        shouldNotify: true,
        message: `Task due in ${Math.round(hoursUntilDue)} hours!`
      };
    } else if (hoursUntilDue <= 48 && hoursUntilDue > 24) {
      return {
        shouldNotify: true,
        message: 'Task due tomorrow!'
      };
    }
    return { shouldNotify: false };
  };

  // Modify your useEffect for automatic notifications
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const checkAndNotify = () => {
      tasks.forEach(task => {
        if (!task.completed) {
          const { shouldNotify, message } = getNotificationSchedule(task.deadline);
          if (shouldNotify) {
            showNotification('Task Reminder', `${task.title}: ${message}`);
          }
        }
      });
    };

    // Check every 15 minutes
    const notificationInterval = setInterval(checkAndNotify, 900000);
    checkAndNotify(); // Initial check

    return () => clearInterval(notificationInterval);
  }, [tasks]);

  return (
    <>
      {/* Floating Tip */}
      <Slide direction="up" in={Boolean(tip)} mountOnEnter unmountOnExit>
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            bottom: 100,
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: 400,
            p: 2,
            backgroundColor: 'primary.light',
            color: 'primary.contrastText',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            zIndex: 1000
          }}
        >
          <Lightbulb sx={{ color: 'inherit' }} />
          <Typography variant="body2">{tip}</Typography>
        </Paper>
      </Slide>

      {/* AI SpeedDial */}
      <SpeedDial
        ariaLabel="AI Assistant"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon icon={<Psychology />} openIcon={<Close />} />}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.key}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => fetchData(action.key)}
          />
        ))}
      </SpeedDial>

      {/* AI Dialog */}
      <Dialog 
        open={Boolean(openDialog)} 
        onClose={() => setOpenDialog('')}
        fullWidth 
        maxWidth="sm"
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            {openDialog === 'suggest' ? <Assignment color="primary" /> : <Notifications color="primary" />}
            <Typography variant="h6">
              {openDialog === 'suggest' ? 'AI Task Analysis' : 'Smart Reminders'}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          {loading ? (
            <Box display="flex" flexDirection="column" alignItems="center" py={4}>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary" mt={2}>
                Analyzing your tasks...
              </Typography>
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
          ) : (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', my: 2 }}>
              {openDialog === 'suggest' ? suggestions : reminders}
            </Typography>
          )}

          {/* Add this inside your Dialog content for reminders */}
          {openDialog === 'reminders' && !loading && !error && (
            <Box sx={{ my: 2 }}>
              {/* Critical Deadlines */}
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 2, 
                  mb: 2, 
                  bgcolor: 'error.light',
                  color: 'error.contrastText' 
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  ⚠️ Critical Deadlines
                </Typography>
                {tasks
                  .filter(t => !t.completed && getDaysDifference(t.deadline) <= 2)
                  .map((task, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                      <Typography variant="body2">{task.title}</Typography>
                      <Typography variant="caption">{formatDeadline(task.deadline)}</Typography>
                    </Box>
                  ))}
              </Paper>
          
              {/* Suggested Schedule */}
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  📅 Suggested Schedule
                </Typography>
                {tasks
                  .filter(t => !t.completed)
                  .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                  .map((task, index) => (
                    <Box 
                      key={index}
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1,
                        my: 1,
                        borderLeft: 3,
                        borderColor: getDeadlineColor(task.deadline),
                        bgcolor: 'background.default',
                        borderRadius: 1
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {task.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Suggested: {getSuggestedTimeBlock(task)}
                        </Typography>
                      </Box>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: getDeadlineColor(task.deadline),
                          fontWeight: 'medium'
                        }}
                      >
                        {formatDeadline(task.deadline)}
                      </Typography>
                    </Box>
                  ))}
              </Paper>
          
              {/* Quick Actions */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddAlarm />}
                  onClick={() => handleSetReminders(tasks)}
                >
                  Set Calendar Alerts
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Share />}
                  onClick={() => handleShareTasks(tasks)}
                >
                  Share Schedule
                </Button>
              </Box>
            </Box>
          )}

          {/* Replace the analysis section in your Dialog content */}
          {openDialog === 'suggest' && !loading && !error && (
            <Box sx={{ my: 2 }}>
              {/* Analysis Display */}
              <Paper 
                elevation={3} 
                sx={{ p: 2, mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  🎯 Priority Analysis
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {suggestions}
                </Typography>
              </Paper>

              {/* Task Priority Grid */}
              <Grid container spacing={2}>
                {tasks
                  .filter(t => !t.completed)
                  .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                  .map((task, index) => (
                    <Grid item xs={12} key={index}>
                      <Paper 
                        sx={{ 
                          p: 1.5,
                          borderLeft: 3,
                          borderColor: getDeadlineColor(task.deadline),
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {task.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDeadline(task.deadline)}
                          </Typography>
                        </Box>
                        <Chip 
                          size="small"
                          label={getPriorityLabel(task.deadline)}
                          color={getPriorityColor(task.deadline)}
                        />
                      </Paper>
                    </Grid>
                  ))}
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog('')}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AISuggestions;
