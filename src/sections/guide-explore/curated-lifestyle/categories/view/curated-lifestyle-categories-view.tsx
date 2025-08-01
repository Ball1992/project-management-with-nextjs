'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

// ----------------------------------------------------------------------

export function CuratedLifestyleCategoriesView() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 5 }}>
        <Card>
          <CardHeader
            title="Lifestyle Categories"
            subheader="Explore premium lifestyle categories and experiences"
          />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="body1" color="text.secondary">
                Discover our carefully curated lifestyle categories designed for the most discerning penthouse residents.
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Categories will include:
              </Typography>

              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • Luxury Amenities & Services
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • Fine Dining & Entertainment
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • Wellness & Recreation
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • Art & Culture
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Exclusive Events & Experiences
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Content coming soon...
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
