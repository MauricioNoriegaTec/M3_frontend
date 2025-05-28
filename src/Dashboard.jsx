import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  AppBar,
  Toolbar,
  CircularProgress,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExitToApp as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import * as authService from './services/auth';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#e91e63',
    },
    secondary: {
      main: '#f50057',
    },
  },
  shape: {
    borderRadius: 8,
  },
});

const Dashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    lastname: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Check if user is logged in
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    // Set the logged in user
    const user = authService.getCurrentUser();
    setLoggedInUser(user);
  }, [navigate]);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authService.getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      showSnackbar(err.message, 'error');
      
      // If unauthorized, redirect to login
      if (err.message.includes('401') || err.message.includes('403') || 
          err.message.includes('unauthorized') || err.message.includes('Unauthorized')) {
        authService.logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteClick = (user) => {
    setCurrentUser(user);
    setOpenDialog(true);
  };

  const handleEditClick = (user) => {
    setCurrentUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      name: user.name || '',
      lastname: user.lastname || '',
    });
    setOpenEditDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await authService.deleteUser(currentUser.user_id);
      fetchUsers();
      showSnackbar('User deleted successfully', 'success');
    } catch (err) {
      showSnackbar(err.message, 'error');
      // Handle authentication errors
      if (err.message.includes('401') || err.message.includes('403')) {
        authService.logout();
        navigate('/login');
      }
    } finally {
      setOpenDialog(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async () => {
    try {
      // Update existing user
      await authService.updateUser(currentUser.user_id, {
        username: formData.username,
        email: formData.email,
        name: formData.name,
        lastname: formData.lastname
      });
      
      showSnackbar('User updated successfully', 'success');
      fetchUsers();
      setOpenEditDialog(false);
    } catch (err) {
      showSnackbar(err.message, 'error');
      // Handle authentication errors
      if (err.message.includes('401') || err.message.includes('403')) {
        authService.logout();
        navigate('/login');
      }
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  // Check if a user is the currently logged in user
  const isCurrentUser = (user) => {
    if (!loggedInUser) return false;
    return user.user_id === loggedInUser.user_id || user.email === loggedInUser.email;
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar 
          position="static" 
          sx={{ 
            backgroundImage: 'linear-gradient(to right, #e91e63)'
          }}
        >
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              User Management Dashboard
            </Typography>
            <Button 
              color="inherit" 
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h4" component="h1">
              Users
            </Typography>
            {loggedInUser && (
              <Typography variant="subtitle1" sx={{ alignSelf: 'center' }}>
                Logged in as: <strong>{loggedInUser.username || loggedInUser.email}</strong>
              </Typography>
            )}
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
              <Typography>{error}</Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Last Name</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow 
                      key={user.user_id}
                      sx={isCurrentUser(user) ? { bgcolor: 'action.hover' } : {}}
                    >
                      <TableCell>{user.user_id}</TableCell>
                      <TableCell>
                        {user.username}
                        {isCurrentUser(user) && (
                          <Chip
                            icon={<PersonIcon />}
                            label="You"
                            size="small"
                            color="primary"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.lastname}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleEditClick(user)} color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleDeleteClick(user)} 
                          color="error"
                          disabled={isCurrentUser(user)} // Prevent deleting current user
                          title={isCurrentUser(user) ? "Cannot delete your own account" : "Delete user"}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Container>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the user "{currentUser?.username}"?
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="username"
              label="Username"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.username}
              onChange={handleFormChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="email"
              label="Email Address"
              type="email"
              fullWidth
              variant="outlined"
              value={formData.email}
              onChange={handleFormChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="name"
              label="First Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleFormChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="lastname"
              label="Last Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.lastname}
              onChange={handleFormChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditSubmit} 
              variant="contained"
              sx={{
                backgroundImage: 'linear-gradient(to right, #e91e63, #f48fb1)',
                '&:hover': {
                  backgroundImage: 'linear-gradient(to right, #c2185b, #f06292)',
                }
              }}
            >
              Update
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;