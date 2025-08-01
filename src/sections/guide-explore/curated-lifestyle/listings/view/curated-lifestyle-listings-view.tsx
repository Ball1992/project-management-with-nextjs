'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

// ----------------------------------------------------------------------

export function CuratedLifestyleListingsView() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 5 }}>
        <Card>
          <CardHeader
            title="Curated Lifestyle Listings"
            subheader="Premium penthouse listings with exclusive lifestyle amenities"
          />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="body1" color="text.secondary">
                Explore our handpicked selection of penthouses that offer the ultimate in luxury lifestyle experiences.
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Featured listings will showcase:
              </Typography>

              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • Penthouses with premium lifestyle amenities
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • Properties with concierge services
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • Exclusive access to luxury facilities
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • Prime locations with lifestyle benefits
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Curated experiences and services
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Listings coming soon...
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
