const https = require('https');
const fs = require('fs');
const path = require('path');

const images = {
  'hero-food.jpg': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
  'placeholder-food.jpg': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'
};

const imagesDir = path.join(process.cwd(), 'public', 'images');

// Create images directory if it doesn't exist
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

Object.entries(images).forEach(([filename, url]) => {
  const filepath = path.join(imagesDir, filename);
  const file = fs.createWriteStream(filepath);

  https.get(url, response => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${filename}`);
    });
  }).on('error', err => {
    fs.unlink(filepath);
    console.error(`Error downloading ${filename}:`, err.message);
  });
});
