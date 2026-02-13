import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { appointmentsAPI } from '../services/api';
import { format } from 'date-fns';

function AppointmentList() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const statusColors = {
    pending: 'warning',
    confirmed: 'info',
    completed: 'success',
    cancelled: 'error',
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await appointmentsAPI.getAll();
      setAppointments(response.data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await appointmentsAPI.cancel(id);
      fetchAppointments();
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError('Failed to cancel appointment');
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const response = await appointmentsAPI.getById(id);
      setSelectedAppointment(response.data);
      setOpenDialog(true);
    } catch (err) {
      console.error('Error fetching appointment details:', err);
      setError('Failed to load appointment details');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Appointments</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchAppointments}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />}>
            New Appointment
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Patient Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      No appointments found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((appointment) => (
                  <TableRow
                    key={appointment.id}
                    hover
                    onClick={() => handleViewDetails(appointment.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{appointment.id}</TableCell>
                    <TableCell>{appointment.patient_name}</TableCell>
                    <TableCell>{appointment.patient_phone}</TableCell>
                    <TableCell>
                      {format(new Date(appointment.appointment_date), 'PPp')}
                    </TableCell>
                    <TableCell>{appointment.department || 'General'}</TableCell>
                    <TableCell>
                      <Chip
                        label={appointment.status}
                        color={statusColors[appointment.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelAppointment(appointment.id);
                        }}
                        disabled={appointment.status === 'cancelled'}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedAppointment && (
          <>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Patient Information
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Name:</strong> {selectedAppointment.patient_name}
                  <br />
                  <strong>Phone:</strong> {selectedAppointment.patient_phone}
                  <br />
                  {selectedAppointment.patient_email && (
                    <>
                      <strong>Email:</strong> {selectedAppointment.patient_email}
                      <br />
                    </>
                  )}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Appointment Details
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Date & Time:</strong>{' '}
                  {format(new Date(selectedAppointment.appointment_date), 'PPpp')}
                  <br />
                  <strong>Department:</strong> {selectedAppointment.department || 'General'}
                  <br />
                  <strong>Doctor:</strong> {selectedAppointment.doctor_name || 'To be assigned'}
                  <br />
                  <strong>Status:</strong>{' '}
                  <Chip
                    label={selectedAppointment.status}
                    color={statusColors[selectedAppointment.status]}
                    size="small"
                  />
                </Typography>

                {selectedAppointment.symptoms && (
                  <>
                    <Typography variant="subtitle2" color="text.secondary">
                      Symptoms
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedAppointment.symptoms}
                    </Typography>
                  </>
                )}

                {selectedAppointment.triage_notes && (
                  <>
                    <Typography variant="subtitle2" color="text.secondary">
                      Triage Notes
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedAppointment.triage_notes}
                    </Typography>
                  </>
                )}

                {selectedAppointment.ai_recommendation && (
                  <>
                    <Typography variant="subtitle2" color="text.secondary">
                      AI Recommendation
                    </Typography>
                    <Typography variant="body1">
                      {selectedAppointment.ai_recommendation}
                    </Typography>
                  </>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default AppointmentList;
