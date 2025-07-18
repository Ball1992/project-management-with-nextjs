'use client'

import { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  Alert,
  Paper,
  Typography,
  Avatar,
  Divider
} from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { authenticateUser, generateToken, storeUser, type LoginCredentials } from '@/lib/auth'

interface LoginFormProps {
  onLoginSuccess: () => void
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const user = await authenticateUser(credentials)
      if (user) {
        const token = generateToken(user)
        storeUser(user, token)
        onLoginSuccess()
      } else {
        setError('Invalid username or password')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof LoginCredentials) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  return (
    <Paper 
      elevation={8} 
      sx={{ 
        p: 4, 
        width: '100%', 
        maxWidth: 450,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 102, 204, 0.1)',
        borderRadius: 3,
        boxShadow: '0 20px 40px rgba(0, 102, 204, 0.1)'
      }}
      className="fade-in"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        <Avatar sx={{ 
          m: 1, 
          bgcolor: 'primary.main',
          background: 'linear-gradient(135deg, #0066CC 0%, #00A0E6 100%)',
          width: 64,
          height: 64,
          boxShadow: '0 8px 24px rgba(0, 102, 204, 0.3)'
        }}>
          <LockOutlinedIcon sx={{ fontSize: 32 }} />
        </Avatar>
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ 
          fontWeight: 700,
          color: '#0066CC',
          mt: 2
        }}>
          Welcome Back
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ fontSize: '1.1rem' }}>
          Please sign in to access your account
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 4, bgcolor: 'primary.main', height: 2, borderRadius: 1 }} />
      
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Username"
          value={credentials.username}
          onChange={handleChange('username')}
          margin="normal"
          required
          autoFocus
          variant="outlined"
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={credentials.password}
          onChange={handleChange('password')}
          margin="normal"
          required
          variant="outlined"
          sx={{ mb: 2 }}
        />

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mt: 2, 
              mb: 2,
              borderRadius: 2,
              '& .MuiAlert-icon': {
                color: '#d32f2f'
              }
            }}
          >
            {error}
          </Alert>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          sx={{ 
            mt: 2, 
            mb: 3,
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 600,
            borderRadius: 2,
            textTransform: 'none'
          }}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ 
        p: 3, 
        bgcolor: 'rgba(0, 102, 204, 0.05)', 
        borderRadius: 2,
        border: '1px solid #E8F4FD'
      }}>
        <Typography variant="subtitle2" gutterBottom sx={{ 
          color: 'primary.main', 
          fontWeight: 600,
          mb: 2
        }}>
          🔑 Demo Accounts
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2" sx={{ 
            p: 1, 
            bgcolor: 'white', 
            borderRadius: 1,
            border: '1px solid #E8F4FD'
          }}>
            <strong>Sub Contractor:</strong><br />
            subcontractor1 / password123
          </Typography>
          <Typography variant="body2" sx={{ 
            p: 1, 
            bgcolor: 'white', 
            borderRadius: 1,
            border: '1px solid #E8F4FD'
          }}>
            <strong>Admin Install:</strong><br />
            admininstall / admin123
          </Typography>
          <Typography variant="body2" sx={{ 
            p: 1, 
            bgcolor: 'white', 
            borderRadius: 1,
            border: '1px solid #E8F4FD'
          }}>
            <strong>Admin Credit:</strong><br />
            admincredit / admin123
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
}
