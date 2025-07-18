'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container, Typography, Box } from '@mui/material'
import LoginForm from '@/components/LoginForm'
import { getStoredUser } from '@/lib/auth'

export default function LoginPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const user = getStoredUser()
    if (user) {
      setIsAuthenticated(true)
      router.push('/')
    } else {
      setLoading(false)
    }
  }, [router])

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Box 
      className="login-container"
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Left Side - Header Section with Image */}
      <Box 
        className="login-left-panel slide-in-left"
        sx={{
          flex: 1,
          background: 'linear-gradient(135deg, #0066CC 0%, #00A0E6 50%, #47A7EF 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          color: 'white',
          p: 4,
          minHeight: '100vh'
        }}
      >
        {/* Background decorative elements */}
        <Box 
          className="floating"
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            zIndex: 0
          }} 
        />
        <Box 
          className="floating"
          sx={{
            position: 'absolute',
            bottom: -100,
            left: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            zIndex: 0,
            animationDelay: '1s'
          }} 
        />
        
        <Box sx={{ 
          textAlign: 'center',
          zIndex: 1,
          maxWidth: 500
        }}>
          {/* Company Logo/Image Placeholder */}
          <Box 
            className="pulse"
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 4,
              border: '3px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 700,
                color: 'white',
                fontSize: '2.5rem'
              }}
            >
              D
            </Typography>
          </Box>

          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
            DAIKIN
          </Typography>
          
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              mb: 3,
              fontSize: { xs: '1.5rem', md: '2rem' }
            }}
          >
            WorkOrder Management
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              lineHeight: 1.8,
              fontSize: '1.1rem',
              opacity: 0.9,
              mb: 4
            }}
          >
            Professional work order management system for efficient project tracking and coordination. 
            Streamline your workflow with our comprehensive solution.
          </Typography>

          {/* Feature highlights */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2,
            alignItems: 'flex-start',
            maxWidth: 400,
            mx: 'auto'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'rgba(255, 255, 255, 0.8)'
              }} />
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Real-time project tracking
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'rgba(255, 255, 255, 0.8)'
              }} />
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Efficient team coordination
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'rgba(255, 255, 255, 0.8)'
              }} />
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Comprehensive reporting
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Footer on left side */}
        <Box sx={{ 
          position: 'absolute',
          bottom: 20,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: 0.7
        }}>
          <Typography variant="body2">
            © 2025 Daikin WorkOrder System. All rights reserved.
          </Typography>
        </Box>
      </Box>

      {/* Right Side - Login Form */}
      <Box 
        className="login-right-panel slide-in-right"
        sx={{
          flex: 1,
          background: 'linear-gradient(135deg, #F8FAFE 0%, #E8F4FD 50%, #D1E9FB 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          minHeight: '100vh'
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center'
          }}>
            <LoginForm onLoginSuccess={() => {
              setIsAuthenticated(true)
              router.push('/')
            }} />
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
