'use client';

import type { Theme, SxProps } from '@mui/material/styles';
import type { ButtonBaseProps } from '@mui/material/ButtonBase';

import { useState, useCallback, useEffect } from 'react';
import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';
import { FlagIcon } from 'src/components/flag-icon';

import { languageService } from 'src/services/language.service';
import type { ILanguage } from 'src/types/language';

// ----------------------------------------------------------------------

export type LanguagePopoverProps = ButtonBaseProps & {
  onLanguageChange?: (language: ILanguage) => void;
};

export function LanguagePopover({ sx, onLanguageChange, ...other }: LanguagePopoverProps) {
  const mediaQuery = 'sm';

  const { open, anchorEl, onClose, onOpen } = usePopover();

  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<ILanguage | null>(null);

  // Fetch languages
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await languageService.getLanguages({ limit: 100 });
        const activeLanguages = response.data.data.filter((lang: ILanguage) => lang.isActive);
        setLanguages(activeLanguages);
        
        // Get saved language from localStorage or use default
        const savedLanguageId = localStorage.getItem('selectedLanguageId');
        const savedLanguage = savedLanguageId 
          ? activeLanguages.find((lang: ILanguage) => lang.id === savedLanguageId)
          : null;
        
        const defaultLang = savedLanguage || 
          activeLanguages.find((lang: ILanguage) => lang.isDefault) || 
          activeLanguages[0];
          
        setSelectedLanguage(defaultLang);
        
        // Store in localStorage
        if (defaultLang) {
          localStorage.setItem('selectedLanguageId', defaultLang.id);
          localStorage.setItem('selectedLanguageCode', defaultLang.code);
        }
      } catch (error) {
        console.error('Error fetching languages:', error);
      }
    };
    fetchLanguages();
  }, []);

  const handleChangeLanguage = useCallback(
    (newLanguage: ILanguage) => {
      setSelectedLanguage(newLanguage);
      
      // Store in localStorage
      localStorage.setItem('selectedLanguageId', newLanguage.id);
      localStorage.setItem('selectedLanguageCode', newLanguage.code);
      
      // Trigger callback
      if (onLanguageChange) {
        onLanguageChange(newLanguage);
      }
      
      // Reload page to apply language change
      window.location.reload();
      
      onClose();
    },
    [onClose, onLanguageChange]
  );

  const buttonBg: SxProps<Theme> = {
    height: 1,
    zIndex: -1,
    opacity: 0,
    content: "''",
    borderRadius: 1,
    position: 'absolute',
    visibility: 'hidden',
    bgcolor: 'action.hover',
    width: 'calc(100% + 8px)',
    transition: (theme) =>
      theme.transitions.create(['opacity', 'visibility'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.shorter,
      }),
    ...(open && {
      opacity: 1,
      visibility: 'visible',
    }),
  };

  const renderButton = () => (
    <ButtonBase
      disableRipple
      onClick={onOpen}
      sx={[
        {
          py: 0.5,
          gap: { xs: 0.5, [mediaQuery]: 1 },
          '&::before': buttonBg,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {selectedLanguage?.code && (
        <Box sx={{ width: 24, height: 24, display: 'flex', alignItems: 'center' }}>
          <FlagIcon code={selectedLanguage.code.toUpperCase()} />
        </Box>
      )}

      <Box
        component="span"
        sx={{ typography: 'subtitle2', display: { xs: 'none', [mediaQuery]: 'inline-flex' } }}
      >
        {selectedLanguage?.name || 'Language'}
      </Box>

      <Box
        component="span"
        sx={{ 
          typography: 'subtitle2', 
          color: 'text.secondary',
          display: { xs: 'none', [mediaQuery]: 'inline-flex' },
          ml: 1
        }}
      >
        {selectedLanguage?.code?.toUpperCase() || ''}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', ml: 0.5 }}>
        <Iconify width={12} icon="carbon:chevron-up" sx={{ color: 'text.disabled', mb: -0.5 }} />
        <Iconify width={12} icon="carbon:chevron-down" sx={{ color: 'text.disabled' }} />
      </Box>
    </ButtonBase>
  );

  const renderMenuList = () => (
    <CustomPopover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      slotProps={{
        arrow: { placement: 'top-left' },
        paper: { sx: { mt: 0.5, ml: -1.55 } },
      }}
    >
      <MenuList sx={{ width: 240 }}>
        {languages.map((language) => (
          <MenuItem
            key={language.id}
            selected={language.id === selectedLanguage?.id}
            onClick={() => handleChangeLanguage(language)}
            sx={{ height: 48 }}
          >
            <Box sx={{ width: 24, height: 24, mr: 2, display: 'flex', alignItems: 'center' }}>
              <FlagIcon code={language.code.toUpperCase()} />
            </Box>

            <Box component="span" sx={{ flexGrow: 1, fontWeight: 'fontWeightMedium' }}>
              {language.name}
            </Box>

            {language.isDefault && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Default
              </Typography>
            )}
          </MenuItem>
        ))}
      </MenuList>
    </CustomPopover>
  );

  return (
    <>
      {renderButton()}
      {renderMenuList()}
    </>
  );
}
