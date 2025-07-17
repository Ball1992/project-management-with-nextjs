'use client';

import { useState, useEffect, forwardRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import CodeBlock from '@tiptap/extension-code-block';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Strike from '@tiptap/extension-strike';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import FormHelperText from '@mui/material/FormHelperText';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

import type { EditorProps } from './types';

// ----------------------------------------------------------------------

const StyledEditor = styled(Paper)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  '& .ProseMirror': {
    padding: theme.spacing(2),
    minHeight: 200,
    outline: 'none',
    '& p': {
      margin: '0 0 16px 0',
      '&:last-child': {
        marginBottom: 0,
      },
    },
    '& h1, & h2, & h3, & h4, & h5, & h6': {
      margin: '24px 0 16px 0',
      fontWeight: 600,
      '&:first-child': {
        marginTop: 0,
      },
    },
    '& ul, & ol': {
      paddingLeft: theme.spacing(3),
      margin: '0 0 16px 0',
    },
    '& blockquote': {
      borderLeft: `4px solid ${theme.palette.primary.main}`,
      paddingLeft: theme.spacing(2),
      margin: '0 0 16px 0',
      fontStyle: 'italic',
      color: theme.palette.text.secondary,
    },
    '& code': {
      backgroundColor: theme.palette.grey[100],
      padding: '2px 4px',
      borderRadius: 4,
      fontSize: '0.875em',
      fontFamily: 'monospace',
    },
    '& pre': {
      backgroundColor: theme.palette.grey[100],
      padding: theme.spacing(2),
      borderRadius: theme.shape.borderRadius,
      overflow: 'auto',
      margin: '0 0 16px 0',
      fontFamily: 'monospace',
    },
    '& img': {
      maxWidth: '100%',
      height: 'auto',
      cursor: 'pointer',
      border: '2px solid transparent',
      borderRadius: 4,
      transition: 'border-color 0.2s ease',
      '&:hover': {
        borderColor: theme.palette.primary.main,
      },
      '&.ProseMirror-selectednode': {
        borderColor: theme.palette.primary.main,
        outline: 'none',
      },
      '&.editor-image': {
        resize: 'both',
        overflow: 'hidden',
        minWidth: 50,
        minHeight: 50,
      },
    },
    '& a': {
      color: theme.palette.primary.main,
      textDecoration: 'underline',
    },
  },
  '&.disabled .ProseMirror': {
    backgroundColor: theme.palette.grey[50],
    color: theme.palette.text.disabled,
  },
}));

const EditorToolbar = styled(Toolbar)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  minHeight: 48,
  gap: theme.spacing(0.5),
  backgroundColor: theme.palette.grey[50],
}));

// ----------------------------------------------------------------------

export const Editor = forwardRef<HTMLDivElement, EditorProps>((props, ref) => {
  const {
    sx,
    error,
    value = '',
    onChange,
    helperText,
    className,
    editable = true,
    placeholder = 'Write something awesome...',
    slotProps,
    ...other
  } = props;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use the separate CodeBlock extension
      }),
      Underline,
      Strike,
      Subscript,
      Superscript,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      CodeBlock,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    editable,
    onUpdate: ({ editor: updatedEditor }) => {
      const html = updatedEditor.getHTML();
      onChange?.(html);
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run();
  }, [editor]);

  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run();
  }, [editor]);

  const toggleUnderline = useCallback(() => {
    editor?.chain().focus().toggleUnderline().run();
  }, [editor]);

  const toggleBulletList = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run();
  }, [editor]);

  const toggleOrderedList = useCallback(() => {
    editor?.chain().focus().toggleOrderedList().run();
  }, [editor]);

  const setHeading = useCallback((level: 1 | 2 | 3) => {
    editor?.chain().focus().toggleHeading({ level }).run();
  }, [editor]);

  const toggleBlockquote = useCallback(() => {
    editor?.chain().focus().toggleBlockquote().run();
  }, [editor]);

  const toggleStrike = useCallback(() => {
    editor?.chain().focus().toggleStrike().run();
  }, [editor]);

  const toggleSubscript = useCallback(() => {
    editor?.chain().focus().toggleSubscript().run();
  }, [editor]);

  const toggleSuperscript = useCallback(() => {
    editor?.chain().focus().toggleSuperscript().run();
  }, [editor]);

  const toggleHighlight = useCallback(() => {
    editor?.chain().focus().toggleHighlight().run();
  }, [editor]);

  const toggleCode = useCallback(() => {
    editor?.chain().focus().toggleCode().run();
  }, [editor]);

  const toggleCodeBlock = useCallback(() => {
    editor?.chain().focus().toggleCodeBlock().run();
  }, [editor]);

  const setTextAlign = useCallback((alignment: 'left' | 'center' | 'right' | 'justify') => {
    editor?.chain().focus().setTextAlign(alignment).run();
  }, [editor]);

  const insertTable = useCallback(() => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  const addColumnBefore = useCallback(() => {
    editor?.chain().focus().addColumnBefore().run();
  }, [editor]);

  const addColumnAfter = useCallback(() => {
    editor?.chain().focus().addColumnAfter().run();
  }, [editor]);

  const deleteColumn = useCallback(() => {
    editor?.chain().focus().deleteColumn().run();
  }, [editor]);

  const addRowBefore = useCallback(() => {
    editor?.chain().focus().addRowBefore().run();
  }, [editor]);

  const addRowAfter = useCallback(() => {
    editor?.chain().focus().addRowAfter().run();
  }, [editor]);

  const deleteRow = useCallback(() => {
    editor?.chain().focus().deleteRow().run();
  }, [editor]);

  const deleteTable = useCallback(() => {
    editor?.chain().focus().deleteTable().run();
  }, [editor]);

  // Image upload functionality
  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const src = e.target?.result as string;
          if (src) {
            editor?.chain().focus().setImage({ src }).run();
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [editor]);

  const insertImageFromUrl = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  // Add resize functionality to images
  useEffect(() => {
    if (!editor) return;

    const handleImageClick = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'IMG') {
        const img = target as HTMLImageElement;
        
        // Add resize handles
        const addResizeHandles = () => {
          // Remove existing handles
          document.querySelectorAll('.image-resize-handle').forEach(handle => handle.remove());
          
          const rect = img.getBoundingClientRect();
          const container = img.closest('.ProseMirror');
          if (!container) return;
          
          const containerRect = container.getBoundingClientRect();
          
          // Create resize handle
          const handle = document.createElement('div');
          handle.className = 'image-resize-handle';
          handle.style.cssText = `
            position: absolute;
            width: 10px;
            height: 10px;
            background: #007bff;
            border: 1px solid white;
            border-radius: 50%;
            cursor: se-resize;
            z-index: 1000;
            left: ${rect.right - containerRect.left - 5}px;
            top: ${rect.bottom - containerRect.top - 5}px;
          `;
          
          container.appendChild(handle);
          
          // Add drag functionality
          let isResizing = false;
          let startX = 0;
          let startY = 0;
          let startWidth = 0;
          let startHeight = 0;
          
          handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = img.offsetWidth;
            startHeight = img.offsetHeight;
            
            const handleMouseMove = (e: MouseEvent) => {
              if (!isResizing) return;
              
              const deltaX = e.clientX - startX;
              const deltaY = e.clientY - startY;
              
              const newWidth = Math.max(50, startWidth + deltaX);
              const aspectRatio = startHeight / startWidth;
              const newHeight = newWidth * aspectRatio;
              
              img.style.width = `${newWidth}px`;
              img.style.height = `${newHeight}px`;
              
              // Update handle position
              const newRect = img.getBoundingClientRect();
              handle.style.left = `${newRect.right - containerRect.left - 5}px`;
              handle.style.top = `${newRect.bottom - containerRect.top - 5}px`;
            };
            
            const handleMouseUp = () => {
              isResizing = false;
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          });
          
          // Remove handles when clicking elsewhere
          const removeHandles = (e: Event) => {
            if (!img.contains(e.target as Node) && !handle.contains(e.target as Node)) {
              handle.remove();
              document.removeEventListener('click', removeHandles);
            }
          };
          
          setTimeout(() => {
            document.addEventListener('click', removeHandles);
          }, 100);
        };
        
        addResizeHandles();
      }
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener('click', handleImageClick);

    return () => {
      editorElement.removeEventListener('click', handleImageClick);
      document.querySelectorAll('.image-resize-handle').forEach(handle => handle.remove());
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <Box sx={sx} className={className} ref={ref}>
      <StyledEditor variant="outlined" className={!editable ? 'disabled' : ''}>
        {editable && (
          <EditorToolbar sx={{ flexWrap: 'wrap' }}>
            {/* Text Formatting */}
            <IconButton
              size="small"
              onClick={toggleBold}
              color={editor.isActive('bold') ? 'primary' : 'default'}
              title="Bold"
            >
              <strong>B</strong>
            </IconButton>
            <IconButton
              size="small"
              onClick={toggleItalic}
              color={editor.isActive('italic') ? 'primary' : 'default'}
              title="Italic"
            >
              <em>I</em>
            </IconButton>
            <IconButton
              size="small"
              onClick={toggleUnderline}
              color={editor.isActive('underline') ? 'primary' : 'default'}
              title="Underline"
            >
              <u>U</u>
            </IconButton>
            <IconButton
              size="small"
              onClick={toggleStrike}
              color={editor.isActive('strike') ? 'primary' : 'default'}
              title="Strikethrough"
            >
              <s>S</s>
            </IconButton>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {/* Headings */}
            <IconButton
              size="small"
              onClick={() => setHeading(1)}
              color={editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'}
              title="Heading 1"
            >
              H1
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setHeading(2)}
              color={editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'}
              title="Heading 2"
            >
              H2
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setHeading(3)}
              color={editor.isActive('heading', { level: 3 }) ? 'primary' : 'default'}
              title="Heading 3"
            >
              H3
            </IconButton>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {/* Text Alignment */}
            <IconButton
              size="small"
              onClick={() => setTextAlign('left')}
              color={editor.isActive({ textAlign: 'left' }) ? 'primary' : 'default'}
              title="Align Left"
            >
              ⬅
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setTextAlign('center')}
              color={editor.isActive({ textAlign: 'center' }) ? 'primary' : 'default'}
              title="Align Center"
            >
              ↔
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setTextAlign('right')}
              color={editor.isActive({ textAlign: 'right' }) ? 'primary' : 'default'}
              title="Align Right"
            >
              ➡
            </IconButton>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {/* Lists */}
            <IconButton
              size="small"
              onClick={toggleBulletList}
              color={editor.isActive('bulletList') ? 'primary' : 'default'}
              title="Bullet List"
            >
              •
            </IconButton>
            <IconButton
              size="small"
              onClick={toggleOrderedList}
              color={editor.isActive('orderedList') ? 'primary' : 'default'}
              title="Numbered List"
            >
              1.
            </IconButton>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {/* Special Formatting */}
            <IconButton
              size="small"
              onClick={toggleBlockquote}
              color={editor.isActive('blockquote') ? 'primary' : 'default'}
              title="Blockquote"
            >
              "
            </IconButton>
            <IconButton
              size="small"
              onClick={toggleHighlight}
              color={editor.isActive('highlight') ? 'primary' : 'default'}
              title="Highlight"
            >
              🖍
            </IconButton>
            <IconButton
              size="small"
              onClick={toggleCode}
              color={editor.isActive('code') ? 'primary' : 'default'}
              title="Inline Code"
            >
              &lt;/&gt;
            </IconButton>
            <IconButton
              size="small"
              onClick={toggleCodeBlock}
              color={editor.isActive('codeBlock') ? 'primary' : 'default'}
              title="Code Block"
            >
              { }
            </IconButton>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {/* Subscript/Superscript */}
            <IconButton
              size="small"
              onClick={toggleSubscript}
              color={editor.isActive('subscript') ? 'primary' : 'default'}
              title="Subscript"
            >
              X₂
            </IconButton>
            <IconButton
              size="small"
              onClick={toggleSuperscript}
              color={editor.isActive('superscript') ? 'primary' : 'default'}
              title="Superscript"
            >
              X²
            </IconButton>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {/* Image */}
            <IconButton
              size="small"
              onClick={handleImageUpload}
              title="Upload Image"
            >
              📷
            </IconButton>
            <IconButton
              size="small"
              onClick={insertImageFromUrl}
              title="Insert Image from URL"
            >
              🖼️
            </IconButton>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {/* Table */}
            <IconButton
              size="small"
              onClick={insertTable}
              title="Insert Table"
            >
              ⊞
            </IconButton>
            {editor.isActive('table') && (
              <>
                <IconButton
                  size="small"
                  onClick={addColumnBefore}
                  title="Add Column Before"
                >
                  ⊞←
                </IconButton>
                <IconButton
                  size="small"
                  onClick={addColumnAfter}
                  title="Add Column After"
                >
                  ⊞→
                </IconButton>
                <IconButton
                  size="small"
                  onClick={deleteColumn}
                  title="Delete Column"
                >
                  ⊟↕
                </IconButton>
                <IconButton
                  size="small"
                  onClick={addRowBefore}
                  title="Add Row Before"
                >
                  ⊞↑
                </IconButton>
                <IconButton
                  size="small"
                  onClick={addRowAfter}
                  title="Add Row After"
                >
                  ⊞↓
                </IconButton>
                <IconButton
                  size="small"
                  onClick={deleteRow}
                  title="Delete Row"
                >
                  ⊟↔
                </IconButton>
                <IconButton
                  size="small"
                  onClick={deleteTable}
                  title="Delete Table"
                >
                  ⊟
                </IconButton>
              </>
            )}
          </EditorToolbar>
        )}
        <EditorContent editor={editor} />
      </StyledEditor>
      {helperText && (
        <FormHelperText error={!!error} sx={{ px: 2 }}>
          {helperText}
        </FormHelperText>
      )}
    </Box>
  );
});

Editor.displayName = 'Editor';
