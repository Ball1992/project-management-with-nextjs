'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

// ----------------------------------------------------------------------

export function FutureProjectsView() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 5 }}>
        <Card>
          <CardHeader
            title="Future Projects"
            subheader="Upcoming luxury penthouse developments in Thailand"
          />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="body1" color="text.secondary">
                Discover upcoming luxury penthouse developments that will redefine Thailand's skyline and set new standards for premium living.
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Future projects will feature:
              </Typography>

              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • Ultra-luxury penthouse developments in prime locations
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • Innovative architectural designs and smart home technology
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • Exclusive amenities and world-class facilities
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • Sustainable and eco-friendly building practices
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Pre-launch investment opportunities
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Project details coming soon...
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
