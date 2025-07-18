import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#0066CC', // Daikin Blue
      light: '#3385D6',
      dark: '#004499',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#00A0E6', // Daikin Light Blue
      light: '#33B3EA',
      dark: '#0080B8',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FAFE',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
    },
    grey: {
      50: '#F8FAFE',
      100: '#E8F4FD',
      200: '#D1E9FB',
      300: '#A3D3F7',
      400: '#75BDF3',
      500: '#47A7EF',
      600: '#0066CC',
      700: '#004499',
      800: '#003366',
      900: '#002244',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      color: '#0066CC',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      color: '#0066CC',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      color: '#0066CC',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: '#0066CC',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#0066CC',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      color: '#0066CC',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 102, 204, 0.3)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #0066CC 0%, #00A0E6 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #004499 0%, #0080B8 100%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0, 102, 204, 0.1)',
          borderRadius: 12,
        },
        elevation3: {
          boxShadow: '0 8px 32px rgba(0, 102, 204, 0.15)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #0066CC 0%, #00A0E6 100%)',
          boxShadow: '0 4px 20px rgba(0, 102, 204, 0.2)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#0066CC',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#0066CC',
              borderWidth: 2,
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#0066CC',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
        },
        colorPrimary: {
          background: 'linear-gradient(135deg, #0066CC 0%, #00A0E6 100%)',
          color: '#FFFFFF',
        },
        colorSecondary: {
          background: 'linear-gradient(135deg, #00A0E6 0%, #47A7EF 100%)',
          color: '#FFFFFF',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
})

export default theme
