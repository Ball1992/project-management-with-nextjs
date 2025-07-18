// utils/fontLoader.ts
export const loadThaiFont = async (): Promise<{ normal: string; bold: string }> => {
  try {
    // Load normal font
    const normalResponse = await fetch('/fonts/THSarabunNew.ttf');
    const normalBuffer = await normalResponse.arrayBuffer();
    const normalBase64 = Buffer.from(normalBuffer).toString('base64');
    
    // Load bold font
    const boldResponse = await fetch('/fonts/THSarabunNew-Bold.ttf');
    const boldBuffer = await boldResponse.arrayBuffer();
    const boldBase64 = Buffer.from(boldBuffer).toString('base64');
    
    return {
      normal: normalBase64,
      bold: boldBase64
    };
  } catch (error) {
    console.error('Error loading Thai fonts:', error);
    throw error;
  }
};