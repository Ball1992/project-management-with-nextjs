'use client';

import { useState } from 'react';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

const NOTIFICATION_SETTINGS = [
  {
    subheader: 'Activity',
    caption: 'Receive notifications about your account activity',
    items: [
      { id: 'activity_comments', label: 'Email me when someone comments' },
      { id: 'activity_answers', label: 'Email me when someone answers' },
      { id: 'activity_follows', label: 'Email me when someone follows me' },
    ],
  },
  {
    subheader: 'Application',
    caption: 'Receive notifications about application updates',
    items: [
      { id: 'application_news', label: 'News and announcements' },
      { id: 'application_product', label: 'Product updates' },
      { id: 'application_blog', label: 'Weekly blog digest' },
    ],
  },
];

// ----------------------------------------------------------------------

export function AccountNotifications() {
  const [selected, setSelected] = useState<string[]>(['activity_comments', 'application_product']);

  const handleToggle = (value: string) => {
    const currentIndex = selected.indexOf(value);
    const newSelected = [...selected];

    if (currentIndex === -1) {
      newSelected.push(value);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setSelected(newSelected);
  };

  const handleSubmit = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Notification settings updated!');
      console.info('SELECTED', selected);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update settings');
    }
  };

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Notification Settings
      </Typography>

      {NOTIFICATION_SETTINGS.map((category) => (
        <Stack key={category.subheader} spacing={3} sx={{ mb: 3 }}>
          <div>
            <Typography variant="subtitle1">{category.subheader}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {category.caption}
            </Typography>
          </div>

          <Stack spacing={1}>
            {category.items.map((item) => (
              <FormControlLabel
                key={item.id}
                control={
                  <Switch
                    checked={selected.includes(item.id)}
                    onChange={() => handleToggle(item.id)}
                  />
                }
                label={item.label}
              />
            ))}
          </Stack>

          <Divider />
        </Stack>
      ))}

      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
        <LoadingButton variant="contained" onClick={handleSubmit}>
          Save Changes
        </LoadingButton>
      </Stack>
    </Card>
  );
}
