import { endpoints } from 'src/lib/axios';
import axiosInstance from 'src/lib/axios';

export class CKEditorUploadAdapter {
  private loader: any;

  constructor(loader: any) {
    this.loader = loader;
  }

  upload(): Promise<{ default: string }> {
    return this.loader.file.then((file: File) => this._initRequest(file));
  }

  abort(): void {
    // Implement abort functionality if needed
  }

  private async _initRequest(file: File): Promise<{ default: string }> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Use the generic files upload endpoint
      const response = await axiosInstance.post(endpoints.files.upload, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Return the URL in the format CKEditor expects
      return {
        default: response.data.url || response.data.data?.url || response.data.filename,
      };
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  }
}

// Plugin function to register the upload adapter
export function CKEditorUploadAdapterPlugin(editor: any) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
    return new CKEditorUploadAdapter(loader);
  };
}
