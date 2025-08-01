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
import { storeUser, type LoginCredentials } from '@/lib/auth'

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
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const result = await response.json()

      if (result.success && result.data) {
        const { user, token } = result.data
        storeUser(user, token)
        onLoginSuccess()
      } else {
        setError(result.error || 'Invalid username or password')
      }
    } catch (err) {
      // console.error('Login error:', err)
      setError('Login failed. Please check your connection and try again.')
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
    </Paper>
  )
}
