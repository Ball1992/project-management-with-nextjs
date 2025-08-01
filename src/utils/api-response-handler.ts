import { toast } from 'src/components/snackbar';

// API Response interface
export interface ApiResponse<T = any> {
  responseStatus: number;
  responseMessage: string;
  data: T;
}

// Toast notification handler based on response status
export const handleApiResponse = <T = any>(
  response: ApiResponse<T>,
  options?: {
    showSuccessToast?: boolean;
    successMessage?: string;
    customErrorHandler?: (response: ApiResponse<T>) => void;
  }
): T => {
  const { responseStatus, responseMessage, data } = response;
  const { 
    showSuccessToast = true, 
    successMessage,
    customErrorHandler 
  } = options || {};

  // Success responses (2xx)
  if (responseStatus >= 200 && responseStatus < 300) {
    if (showSuccessToast) {
      const message = successMessage || responseMessage || 'ดำเนินการสำเร็จ';
      toast.success(message);
    }
    return data;
  }

  // Error responses (non-2xx)
  if (customErrorHandler) {
    customErrorHandler(response);
  } else {
    handleErrorResponse(response);
  }

  // Throw error to be caught by calling code
  throw new Error(responseMessage || 'เกิดข้อผิดพลาด');
};

// Handle different types of error responses
export const handleErrorResponse = <T = any>(response: ApiResponse<T>) => {
  const { responseStatus, responseMessage } = response;
  
  // Get appropriate error message
  const errorMessage = responseMessage || getDefaultErrorMessage(responseStatus);
  
  // Show appropriate toast based on status code
  switch (true) {
    case responseStatus === 400:
      toast.error(`ข้อมูลไม่ถูกต้อง: ${errorMessage}`);
      break;
    case responseStatus === 401:
      toast.error(`ไม่ได้รับอนุญาต: ${errorMessage}`);
      break;
    case responseStatus === 403:
      toast.error(`ไม่มีสิทธิ์เข้าถึง: ${errorMessage}`);
      break;
    case responseStatus === 404:
      toast.error(`ไม่พบข้อมูล: ${errorMessage}`);
      break;
    case responseStatus === 409:
      toast.error(`ข้อมูลซ้ำ: ${errorMessage}`);
      break;
    case responseStatus === 422:
      toast.error(`ข้อมูลไม่ถูกต้อง: ${errorMessage}`);
      break;
    case responseStatus >= 500:
      toast.error(`เกิดข้อผิดพลาดของระบบ: ${errorMessage}`);
      break;
    default:
      toast.error(errorMessage);
  }
};

// Get default error message based on status code
const getDefaultErrorMessage = (statusCode: number): string => {
  switch (statusCode) {
    case 400:
      return 'ข้อมูลที่ส่งมาไม่ถูกต้อง';
    case 401:
      return 'ไม่ได้รับอนุญาตให้เข้าใช้งาน';
    case 403:
      return 'ไม่มีสิทธิ์ในการเข้าถึงข้อมูลนี้';
    case 404:
      return 'ไม่พบข้อมูลที่ต้องการ';
    case 409:
      return 'ข้อมูลมีอยู่แล้วในระบบ';
    case 422:
      return 'ข้อมูลไม่ถูกต้องตามรูปแบบที่กำหนด';
    case 500:
      return 'เกิดข้อผิดพลาดภายในระบบ';
    case 502:
      return 'เซิร์ฟเวอร์ไม่สามารถเชื่อมต่อได้';
    case 503:
      return 'บริการไม่พร้อมใช้งานในขณะนี้';
    case 504:
      return 'การเชื่อมต่อหมดเวลา';
    default:
      return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
  }
};

// Handle save/update operations specifically
export const handleSaveResponse = <T = any>(
  response: ApiResponse<T>,
  operation: 'create' | 'update' | 'delete' = 'create'
): T => {
  const successMessages = {
    create: 'สร้างข้อมูลสำเร็จ',
    update: 'อัปเดตข้อมูลสำเร็จ',
    delete: 'ลบข้อมูลสำเร็จ'
  };

  return handleApiResponse(response, {
    successMessage: successMessages[operation]
  });
};

// Promise wrapper for API calls with automatic error handling
export const apiCall = async <T = any>(
  apiPromise: Promise<{ data: ApiResponse<T> }>,
  options?: {
    showSuccessToast?: boolean;
    successMessage?: string;
    customErrorHandler?: (response: ApiResponse<T>) => void;
  }
): Promise<T> => {
  try {
    const response = await apiPromise;
    return handleApiResponse(response.data, options);
  } catch (error: any) {
    // Handle network errors or other non-API errors
    if (error.response?.data) {
      // API error with response
      handleApiResponse(error.response.data, options);
    } else {
      // Network error or other error
      const errorMessage = error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
      toast.error(errorMessage);
    }
    throw error;
  }
};
