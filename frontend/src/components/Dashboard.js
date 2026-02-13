import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { appointmentsAPI } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await appointmentsAPI.getAll();
      const appointments = response.data;

      const newStats = {
        total: appointments.length,
        pending: appointments.filter((a) => a.status === 'pending').length,
        confirmed: appointments.filter((a) => a.status === 'confirmed').length,
        completed: appointments.filter((a) => a.status === 'completed').length,
        cancelled: appointments.filter((a) => a.status === 'cancelled').length,
      };

      setStats(newStats);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h3" component="div" sx={{ color }}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ color, fontSize: 48 }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Appointments"
            value={stats.total}
            icon={<CalendarIcon fontSize="inherit" />}
            color="#1976d2"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending"
            value={stats.pending}
            icon={<PeopleIcon fontSize="inherit" />}
            color="#ed6c02"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={<CheckCircleIcon fontSize="inherit" />}
            color="#2e7d32"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Cancelled"
            value={stats.cancelled}
            icon={<CancelIcon fontSize="inherit" />}
            color="#d32f2f"
          />
        </Grid>
      </Grid>

      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Welcome to Hospital Appointment Assistant
        </Typography>
        <Typography variant="body1" paragraph>
          This AI-powered system helps automate patient triage and appointment scheduling through
          voice calls.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Features:
        </Typography>
        <ul>
          <li>
            <Typography variant="body1">Real-time voice call handling via LiveKit</Typography>
          </li>
          <li>
            <Typography variant="body1">
              AI-powered symptom triage using Groq Llama-3.3-70b
            </Typography>
          </li>
          <li>
            <Typography variant="body1">Automated appointment scheduling</Typography>
          </li>
          <li>
            <Typography variant="body1">Natural speech interaction with patients</Typography>
          </li>
          <li>
            <Typography variant="body1">Comprehensive appointment management dashboard</Typography>
          </li>
        </ul>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          To get started, click on "Start Call" in the navigation bar to initiate a voice
          consultation.
        </Typography>
      </Paper>
    </Box>
  );
}

export default Dashboard;
