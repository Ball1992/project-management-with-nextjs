export function CKEditorSourceEditingPlugin(editor: any) {
  // This plugin enables source editing mode in CKEditor
  // The SourceEditing feature is already included in the Classic Editor build
  // We just need to add it to the toolbar configuration
  
  // You can add custom source editing behavior here if needed
  editor.model.document.on('change:data', () => {
    // Custom logic when data changes
  });
}
