'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { useEffect, useState } from 'react';

import FormHelperText from '@mui/material/FormHelperText';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import { Iconify } from 'src/components/iconify';
import beautify from 'js-beautify';

// ----------------------------------------------------------------------

const StyledEditorWrapper = styled(Box)(({ theme }) => ({
  '& .ck-editor': {
    '& .ck-toolbar': {
      borderRadius: '8px 8px 0 0',
      border: `1px solid ${theme.palette.divider}`,
      borderBottom: 'none',
      backgroundColor: theme.palette.background.neutral,
    },
    '& .ck-content': {
      borderRadius: '0 0 8px 8px',
      border: `1px solid ${theme.palette.divider}`,
      minHeight: 200,
      padding: theme.spacing(2),
      fontSize: theme.typography.body1.fontSize,
      fontFamily: theme.typography.fontFamily,
      backgroundColor: theme.palette.background.paper,
      '&:focus': {
        borderColor: theme.palette.primary.main,
        boxShadow: `0 0 0 2px ${theme.palette.primary.main}40`,
      },
    },
  },
  '&.error': {
    '& .ck-toolbar': {
      borderColor: theme.palette.error.main,
    },
    '& .ck-content': {
      borderColor: theme.palette.error.main,
    },
  },
}));

// ----------------------------------------------------------------------

type Props = {
  name: string;
  helperText?: React.ReactNode;
  placeholder?: string;
};

export function RHFCKEditor({ name, helperText, placeholder }: Props) {
  const { control } = useFormContext();
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [CKEditor, setCKEditor] = useState<any>(null);
  const [ClassicEditor, setClassicEditor] = useState<any>(null);
  const [plugins, setPlugins] = useState<any[]>([]);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [editorInstance, setEditorInstance] = useState<any>(null);

  const formatHtml = (html: string) => {
    return beautify.html(html, {
      indent_size: 2,
      indent_char: ' ',
      max_preserve_newlines: 1,
      preserve_newlines: true,
      indent_scripts: 'normal',
      unescape_strings: false,
      end_with_newline: true,
      wrap_line_length: 0,
      indent_inner_html: true,
      indent_empty_lines: false
    } as any);
  };

  useEffect(() => {
    const loadEditor = async () => {
      try {
        const { CKEditor: CKEditorComponent } = await import('@ckeditor/ckeditor5-react');
        const ClassicEditorBuild = (await import('@ckeditor/ckeditor5-build-classic')).default;
        
        // Load custom plugins
        const { CKEditorUploadAdapterPlugin } = await import('./ckeditor-upload-adapter');
        const { CKEditorSourceEditingPlugin } = await import('./ckeditor-source-editing-plugin');
        
        setCKEditor(() => CKEditorComponent);
        setClassicEditor(() => ClassicEditorBuild);
        setPlugins([CKEditorUploadAdapterPlugin, CKEditorSourceEditingPlugin]);
        setEditorLoaded(true);
      } catch (error) {
        console.error('Failed to load CKEditor:', error);
      }
    };

    loadEditor();
  }, []);

  if (!editorLoaded || !CKEditor || !ClassicEditor) {
    return (
      <Box
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          p: 2,
          minHeight: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary',
        }}
      >
        Loading editor...
      </Box>
    );
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <>
          <Box sx={{ position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: 5, right: 8, zIndex: 1 }}>
              <Stack direction="row" spacing={1}>
                {isSourceMode && (
                  <Tooltip title="Format HTML">
                    <IconButton
                      size="small"
                      onClick={() => {
                        const formattedHtml = formatHtml(field.value || '');
                        field.onChange(formattedHtml);
                      }}
                      sx={{
                        bgcolor: 'background.paper',
                        border: 1,
                        borderColor: 'divider',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <Iconify icon="mdi:code-braces" width={20} height={20} />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title={isSourceMode ? 'Visual Editor' : 'Source Code'}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (isSourceMode && editorInstance) {
                        // When switching from source to visual, update the editor data
                        editorInstance.setData(field.value || '');
                      }
                      setIsSourceMode(!isSourceMode);
                    }}
                    sx={{
                      bgcolor: 'background.paper',
                      border: 1,
                      borderColor: 'divider',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <Iconify icon={isSourceMode ? 'mdi:eye' : 'mdi:code-tags'} width={20} height={20} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
            
            {isSourceMode ? (
                <TextField
                  fullWidth
                  multiline
                  rows={15}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder={placeholder || 'Enter HTML code...'}
                  error={!!error}
                  sx={{
                    '& .MuiInputBase-root': {
                      fontFamily: 'monospace',
                      fontSize: 14,
                      lineHeight: 1.6,
                    },
                    '& textarea': {
                      whiteSpace: 'pre',
                    },
                  }}
                />
              ) : (
                <StyledEditorWrapper className={error ? 'error' : ''}>
            <CKEditor
              editor={ClassicEditor}
              data={field.value || ''}
              config={{
                placeholder: placeholder || 'Start typing...',
                extraPlugins: plugins,
                toolbar: {
                  items: [
                    'heading',
                    '|',
                    'fontSize',
                    'fontColor',
                    'fontBackgroundColor',
                    '|',
                    'bold',
                    'italic',
                    'underline',
                    'strikethrough',
                    'subscript',
                    'superscript',
                    '|',
                    'link',
                    'bulletedList',
                    'numberedList',
                    'todoList',
                    '|',
                    'alignment',
                    'outdent',
                    'indent',
                    '|',
                    'blockQuote',
                    'code',
                    'codeBlock',
                    '|',
                    'insertTable',
                    'imageUpload',
                    'mediaEmbed',
                    '|',
                    'findAndReplace',
                    'removeFormat',
                    '|',
                    'undo',
                    'redo',
                  ],
                  shouldNotGroupWhenFull: true,
                },
                fontSize: {
                  options: [
                    9,
                    11,
                    13,
                    'default',
                    17,
                    19,
                    21,
                    24,
                    28,
                    32,
                    36,
                    48,
                  ],
                },
                fontColor: {
                  colors: [
                    {
                      color: 'hsl(0, 0%, 0%)',
                      label: 'Black'
                    },
                    {
                      color: 'hsl(0, 0%, 30%)',
                      label: 'Dim grey'
                    },
                    {
                      color: 'hsl(0, 0%, 60%)',
                      label: 'Grey'
                    },
                    {
                      color: 'hsl(0, 0%, 90%)',
                      label: 'Light grey'
                    },
                    {
                      color: 'hsl(0, 0%, 100%)',
                      label: 'White',
                      hasBorder: true
                    },
                    {
                      color: 'hsl(0, 75%, 60%)',
                      label: 'Red'
                    },
                    {
                      color: 'hsl(30, 75%, 60%)',
                      label: 'Orange'
                    },
                    {
                      color: 'hsl(60, 75%, 60%)',
                      label: 'Yellow'
                    },
                    {
                      color: 'hsl(90, 75%, 60%)',
                      label: 'Light green'
                    },
                    {
                      color: 'hsl(120, 75%, 60%)',
                      label: 'Green'
                    },
                    {
                      color: 'hsl(150, 75%, 60%)',
                      label: 'Aquamarine'
                    },
                    {
                      color: 'hsl(180, 75%, 60%)',
                      label: 'Turquoise'
                    },
                    {
                      color: 'hsl(210, 75%, 60%)',
                      label: 'Light blue'
                    },
                    {
                      color: 'hsl(240, 75%, 60%)',
                      label: 'Blue'
                    },
                    {
                      color: 'hsl(270, 75%, 60%)',
                      label: 'Purple'
                    },
                  ]
                },
                fontBackgroundColor: {
                  colors: [
                    {
                      color: 'hsl(0, 0%, 0%)',
                      label: 'Black'
                    },
                    {
                      color: 'hsl(0, 0%, 30%)',
                      label: 'Dim grey'
                    },
                    {
                      color: 'hsl(0, 0%, 60%)',
                      label: 'Grey'
                    },
                    {
                      color: 'hsl(0, 0%, 90%)',
                      label: 'Light grey'
                    },
                    {
                      color: 'hsl(0, 0%, 100%)',
                      label: 'White',
                      hasBorder: true
                    },
                    {
                      color: 'hsl(0, 75%, 60%)',
                      label: 'Red'
                    },
                    {
                      color: 'hsl(30, 75%, 60%)',
                      label: 'Orange'
                    },
                    {
                      color: 'hsl(60, 75%, 60%)',
                      label: 'Yellow'
                    },
                    {
                      color: 'hsl(90, 75%, 60%)',
                      label: 'Light green'
                    },
                    {
                      color: 'hsl(120, 75%, 60%)',
                      label: 'Green'
                    },
                    {
                      color: 'hsl(150, 75%, 60%)',
                      label: 'Aquamarine'
                    },
                    {
                      color: 'hsl(180, 75%, 60%)',
                      label: 'Turquoise'
                    },
                    {
                      color: 'hsl(210, 75%, 60%)',
                      label: 'Light blue'
                    },
                    {
                      color: 'hsl(240, 75%, 60%)',
                      label: 'Blue'
                    },
                    {
                      color: 'hsl(270, 75%, 60%)',
                      label: 'Purple'
                    },
                  ]
                },
                alignment: {
                  options: ['left', 'center', 'right', 'justify']
                },
                table: {
                  contentToolbar: [
                    'tableColumn',
                    'tableRow',
                    'mergeTableCells',
                    'tableCellProperties',
                    'tableProperties'
                  ]
                },
                image: {
                  toolbar: [
                    'imageTextAlternative',
                    'toggleImageCaption',
                    'imageStyle:inline',
                    'imageStyle:block',
                    'imageStyle:side'
                  ]
                },
                heading: {
                  options: [
                    { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                    { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                    { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                    { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
                    { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
                    { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
                    { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
                  ]
                },
                link: {
                  decorators: {
                    openInNewTab: {
                      mode: 'manual',
                      label: 'Open in a new tab',
                      attributes: {
                        target: '_blank',
                        rel: 'noopener noreferrer'
                      }
                    }
                  }
                },
                mediaEmbed: {
                  previewsInData: true
                }
              }}
              onChange={(event: any, editor: any) => {
                const data = editor.getData();
                field.onChange(data);
              }}
              onReady={(editor: any) => {
                setEditorInstance(editor);
              }}
            />
              </StyledEditorWrapper>
            )}
          </Box>

          {(!!error || helperText) && (
            <FormHelperText error={!!error} sx={{ px: 2 }}>
              {error ? error?.message : helperText}
            </FormHelperText>
          )}
        </>
      )}
    />
  );
}
