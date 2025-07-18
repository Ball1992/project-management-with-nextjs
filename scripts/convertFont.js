const fs = require('fs');
const path = require('path');

function convertFontToBase64() {
  const fontPath = path.join(process.cwd(), 'public/fonts/THSarabunNew.ttf');
  const boldFontPath = path.join(process.cwd(), 'public/fonts/THSarabunNew-Bold.ttf');
  
  const fontBuffer = fs.readFileSync(fontPath);
  const boldFontBuffer = fs.readFileSync(boldFontPath);
  
  const base64String = fontBuffer.toString('base64');
  const boldBase64String = boldFontBuffer.toString('base64');
  
  const fontModule = `
export const THSarabunNewNormal = '${base64String}';
export const THSarabunNewBold = '${boldBase64String}';
`;

  // Create directory if it doesn't exist
  const dir = path.join(process.cwd(), 'utils/fonts');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(process.cwd(), 'utils/fonts/THSarabunNew.ts'),
    fontModule
  );
  
  console.log('Font conversion completed!');
}

convertFontToBase64();