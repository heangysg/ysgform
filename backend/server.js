// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configure Cloudinary with your credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

// Use middleware for CORS and JSON body parsing
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// A more explicit way to serve the main HTML file to avoid the previous error
// The path has been corrected to point to the separate 'frontend' folder
const frontendPath = path.join(__dirname, '..', 'frontend');
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// This is still needed to serve other static assets like CSS, JS, etc.
app.use(express.static(frontendPath));

// Endpoint to handle image uploads to Cloudinary
app.post('/upload-form-image', async (req, res) => {
    const { imageData, filename } = req.body;

    if (!imageData) {
        return res.status(400).json({ message: 'Missing imageData.' });
    }

    try {
        // Upload the image with a transformation to reduce size
        const uploadResult = await cloudinary.uploader.upload(imageData, {
            folder: 'form_submissions',
            public_id: filename || `form_submission_${Date.now()}`,
            transformation: [
                { width: 1024, crop: "limit", quality: "auto" }
            ]
        });

        const imageUrl = uploadResult.secure_url;
        console.log(`Image uploaded to Cloudinary: ${imageUrl}`);
        res.status(200).json({ message: 'Image uploaded successfully!', url: imageUrl });
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        res.status(500).json({ message: 'Failed to upload image to Cloudinary.', error: error.message });
    }
});

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Node.js server running on port ${port}`);
    console.log(`Image upload endpoint: /upload-form-image`);
});
