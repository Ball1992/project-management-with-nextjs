'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

// ----------------------------------------------------------------------

export function GuideExploreView() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 5 }}>
        <Card>
          <CardHeader
            title="Guide & Explore"
            subheader="Discover Thailand's finest penthouses and exclusive lifestyle experiences"
          />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="body1" color="text.secondary">
                Welcome to Guide & Explore - your gateway to discovering the most exclusive penthouses and lifestyle experiences in Thailand.
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                This page is currently under development. Please check back soon for exciting content about:
              </Typography>

              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • Curated Lifestyle experiences and categories
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • Exclusive Neighborhoods and prime locations
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • Future Projects and upcoming developments
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Comprehensive Buyer's Guide
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
