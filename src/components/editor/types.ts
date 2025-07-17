import type { SxProps, Theme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export interface EditorProps {
  sx?: SxProps<Theme>;
  error?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  helperText?: React.ReactNode;
  className?: string;
  editable?: boolean;
  fullItem?: boolean;
  resetValue?: boolean;
  slotProps?: {
    wrapper?: {
      sx?: SxProps<Theme>;
    };
  };
}
