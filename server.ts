import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const port = 3001;

// CORS 설정
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// 정적 파일 제공
app.use('/gallery', express.static(path.join(__dirname, 'public/gallery')));

// 갤러리 이미지 목록 API
app.get('/api/gallery', (req, res) => {
  try {
    const galleryDir = path.join(__dirname, 'public/gallery');
    const files = fs.readdirSync(galleryDir);
    
    // .jpeg 파일만 필터링
    const imageFiles = files.filter(file => file.endsWith('.jpeg'));
    
    res.json(imageFiles);
  } catch (error) {
    console.error('Error reading gallery directory:', error);
    res.status(500).json({ message: 'Error reading gallery directory' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
