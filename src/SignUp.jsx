import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  ArrowForward
} from '@mui/icons-material';
import * as authService from './services/auth';

// Theme configuration
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

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    lastname: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.name) {
      newErrors.name = 'First name is required';
    }
    
    if (!formData.lastname) {
      newErrors.lastname = 'Last name is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      
      try {
        // Register user via API
        await authService.register({
          username: formData.username,
          email: formData.email,
          name: formData.name,
          lastname: formData.lastname,
          password: formData.password
        });
        
        // Show success message
        showSnackbar('Account created successfully! Please log in.', 'success');
        
        // Redirect to login after a delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } catch (error) {
        console.error("Registration error:", error);
        showSnackbar(
          error.message || 'Registration failed. Please try again.',
          'error'
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const showSnackbar = (message, severity = 'error') => {
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

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
        p: 2
      }}>
        <Paper 
          elevation={3} 
          sx={{ maxWidth: 550, width: '100%', overflow: 'hidden' }}
        >
          <Box sx={{ 
            bgcolor: 'primary.main', 
            p: 3, 
            color: 'white',
            backgroundImage: 'linear-gradient(to right, #e91e63, #f48fb1)'
          }}>
            <Typography variant="h5" fontWeight="bold">
              Create Account
            </Typography>
          </Box>

          <CardContent sx={{ p: 3 }}>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={formData.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="First Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="lastname"
                  label="Last Name"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  error={!!errors.lastname}
                  helperText={errors.lastname}
                />
              </Box>
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ 
                  mt: 3, 
                  mb: 2,
                  py: 1.5,
                  backgroundImage: 'linear-gradient(to right, #e91e63, #f48fb1)',
                  '&:hover': {
                    backgroundImage: 'linear-gradient(to right, #c2185b, #f06292)',
                  }
                }}
                endIcon={isLoading ? null : <ArrowForward />}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : "Create Account"}
              </Button>
              
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link component={RouterLink} to="/login" variant="body2" color="primary" underline="hover">
                    Sign in
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Paper>

        {/* Snackbar for messages */}
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

export default SignUp;