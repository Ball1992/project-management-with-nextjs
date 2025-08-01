'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

// ----------------------------------------------------------------------

export function BuyersGuideView() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 5 }}>
        <Card>
          <CardHeader
            title="Buyer's Guide"
            subheader="Your comprehensive guide to purchasing luxury penthouses in Thailand"
          />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="body1" color="text.secondary">
                Navigate the luxury penthouse market in Thailand with confidence using our comprehensive buyer's guide.
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Our guide will cover:
              </Typography>

              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • Legal requirements and foreign ownership regulations
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • Financing options and investment strategies
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • Market analysis and pricing trends
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • Due diligence and property inspection checklists
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • Tax implications and ongoing costs
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Step-by-step purchase process
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Comprehensive guide coming soon...
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
