'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import LoadingButton from '@mui/lab/LoadingButton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { toast } from 'src/components/snackbar';


import { contentService } from 'src/services/content.service';
import { languageService } from 'src/services/language.service';

import type { IContent } from 'src/types/content';
import type { ILanguage } from 'src/types/language';

// ----------------------------------------------------------------------

export function CookiePolicyView() {
  const [content, setContent] = useState<IContent | null>(null);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    metaTitle: '',
    metaDescription: '',
  });

  // Helper function to get current translation
  const getCurrentTranslation = () => {
    if (!content) return null;
    
    const translations = Array.isArray(content.translations) ? content.translations : [];
    const translation = translations.find(t => t.languageCode === currentLang);
    
    return translation || {
      title: content.title || '',
      content: content.content || '',
      excerpt: content.excerpt || '',
      metaTitle: content.metaTitle || '',
      metaDescription: content.metaDescription || '',
    };
  };

  // Fetch languages
  const fetchLanguages = useCallback(async () => {
    try {
      const response = await languageService.getLanguages();
      const languagesData = response?.data?.data || response?.data;
      if (languagesData && Array.isArray(languagesData)) {
        setLanguages(languagesData);
        const activeLanguages = languagesData.filter((lang: ILanguage) => lang.isActive);
        if (activeLanguages.length > 0) {
          const defaultLang = activeLanguages.find((lang: ILanguage) => lang.code === 'en') || activeLanguages[0];
          setCurrentLang(defaultLang.code);
        }
      }
    } catch (error) {
      console.error('Error fetching languages:', error);
      setLanguages([
        { id: '1', code: 'en', name: 'English', isActive: true },
        { id: '2', code: 'th', name: 'Thai', isActive: true },
        { id: '3', code: 'zh', name: 'Chinese', isActive: true },
      ] as ILanguage[]);
    }
  }, []);

  // Fetch content by slug
  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      const data = await contentService.getContentBySlug('cookie-policy', currentLang);
      
      if (data) {
        setContent(data);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [currentLang]);

  // Handle language change
  const handleLanguageChange = useCallback((event: React.MouseEvent<HTMLElement>, newLang: string | null) => {
    if (newLang && newLang !== currentLang) {
      setCurrentLang(newLang);
      setEditing(false);
    }
  }, [currentLang]);

  // Update content
  const handleSave = useCallback(async () => {
    if (!content) return;

    try {
      setSaving(true);
      
      await contentService.upsertTranslation(content.id, {
        languageCode: currentLang,
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
      });

      await fetchContent();
      
      setEditing(false);
      toast.success('Content updated successfully');
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error('Failed to update content');
    } finally {
      setSaving(false);
    }
  }, [content, formData, currentLang, fetchContent]);

  // Handle form changes
  const handleChange = useCallback((field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleInputChange = useCallback((field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  }, []);

  // Cancel editing
  const handleCancel = useCallback(() => {
    if (content) {
      setFormData({
        title: content.title || '',
        content: content.content || '',
        excerpt: content.excerpt || '',
        metaTitle: content.metaTitle || '',
        metaDescription: content.metaDescription || '',
      });
    }
    setEditing(false);
  }, [content]);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  useEffect(() => {
    if (content) {
      const translations = Array.isArray(content.translations) ? content.translations : [];
      const translation = translations.find(t => t.languageCode === currentLang);
      
      const translationData = translation || {
        title: content.title || '',
        content: content.content || '',
        excerpt: content.excerpt || '',
        metaTitle: content.metaTitle || '',
        metaDescription: content.metaDescription || '',
      };

      setFormData({
        title: translationData.title || '',
        content: translationData.content || '',
        excerpt: translationData.excerpt || '',
        metaTitle: translationData.metaTitle || '',
        metaDescription: translationData.metaDescription || '',
      });
    }
  }, [currentLang, content]);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 5, textAlign: 'center' }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 5 }}>
        <Card>
          <CardHeader
            title="Cookie Policy"
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                {editing ? (
                  <>
                    <Button
                      variant="outlined"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <LoadingButton
                      variant="contained"
                      onClick={handleSave}
                      loading={saving}
                    >
                      Save
                    </LoadingButton>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => setEditing(true)}
                  >
                    Edit
                  </Button>
                )}
              </Box>
            }
          />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Language Switcher */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Language</Typography>
                <ToggleButtonGroup
                  value={currentLang}
                  exclusive
                  onChange={handleLanguageChange}
                  size="small"
                >
                  {languages.filter(lang => lang.isActive).map((language) => (
                    <ToggleButton key={language.id} value={language.code}>
                      {language.name}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>

              {/* Title */}
              <TextField
                label="Title"
                value={formData.title}
                onChange={handleInputChange('title')}
                disabled={!editing}
                fullWidth
              />

              {/* Excerpt */}
              <TextField
                label="Excerpt"
                value={formData.excerpt}
                onChange={handleInputChange('excerpt')}
                disabled={!editing}
                multiline
                rows={3}
                fullWidth
              />

              {/* Content Editor */}
              <TextField
                label="Content"
                value={formData.content}
                onChange={handleInputChange('content')}
                disabled={!editing}
                multiline
                rows={10}
                fullWidth
                placeholder="Write your cookie policy content here..."
              />

              {/* SEO Fields */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h6">SEO Settings</Typography>
                
                <TextField
                  label="Meta Title"
                  value={formData.metaTitle}
                  onChange={handleInputChange('metaTitle')}
                  disabled={!editing}
                  fullWidth
                  helperText="Recommended length: 50-60 characters"
                />

                <TextField
                  label="Meta Description"
                  value={formData.metaDescription}
                  onChange={handleInputChange('metaDescription')}
                  disabled={!editing}
                  multiline
                  rows={3}
                  fullWidth
                  helperText="Recommended length: 150-160 characters"
                />
              </Box>

              {/* Content Preview (when not editing) */}
              {!editing && content && (() => {
                const currentTranslation = getCurrentTranslation();
                return (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Preview ({languages.find(lang => lang.code === currentLang)?.name || currentLang})
                    </Typography>
                    <Box
                      sx={{
                        p: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        bgcolor: 'background.neutral',
                      }}
                    >
                      <Typography variant="h4" sx={{ mb: 2 }}>
                        {currentTranslation?.title || 'No title'}
                      </Typography>
                      {currentTranslation?.excerpt && (
                        <Typography variant="subtitle1" sx={{ mb: 3, color: 'text.secondary' }}>
                          {currentTranslation.excerpt}
                        </Typography>
                      )}
                      <Box
                        dangerouslySetInnerHTML={{ __html: currentTranslation?.content || '' }}
                        sx={{
                          '& p': { mb: 2 },
                          '& h1, & h2, & h3, & h4, & h5, & h6': { mb: 2, mt: 3 },
                          '& ul, & ol': { mb: 2, pl: 3 },
                          '& blockquote': { 
                            borderLeft: '4px solid',
                            borderColor: 'primary.main',
                            pl: 2,
                            ml: 0,
                            fontStyle: 'italic',
                          },
                        }}
                      />
                    </Box>
                  </Box>
                );
              })()}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
