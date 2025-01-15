const express = require('express');
const router = express.Router();
const upload = require('../config/multer.config'); // Multer config
const uploadToCloudinary = require('../middlewares/uploadToCloudinary'); // Cloudinary middleware
const fileModel = require('../models/files.models'); // File model
const authMiddleware = require('../middlewares/auth'); // Auth middleware

router.get('/home',authMiddleware ,async(req, res) => {
    const userFiles = await fileModel.find({user: req.user.userId});
    console.log(userFiles);

    res.render('home',{
        files: userFiles
    });
});

// Route for uploading files having same name
// router.post('/upload',authMiddleware, upload.single('file'), uploadToCloudinary, async (req, res) => {

//     const newfile = await fileModel.create({
//         path: req.file.cloudinaryUrl,
//         originalname: req.file.originalname,
//         user: req.user.userId
//     });
//     res.json(newfile);
// });

// Route for uploading files having diff name

router.post('/upload', authMiddleware, upload.single('file'), uploadToCloudinary, async (req, res) => {
    // Extract file details
    const { originalname, cloudinaryUrl } = req.file;
    const userId = req.user.userId;

    // Check for duplicate filenames in the database
    const existingFiles = await fileModel.find({ originalname: new RegExp(`^${originalname}( \\(\\d+\\))?$`), user: userId });

    let finalName = originalname;
    if (existingFiles.length > 0) {
        // Append a unique number to the filename
        const nameWithoutExtension = originalname.substring(0, originalname.lastIndexOf('.'));
        const extension = originalname.substring(originalname.lastIndexOf('.'));

        const maxNumber = existingFiles
            .map(file => {
                const match = file.originalname.match(/\((\d+)\)$/);
                return match ? parseInt(match[1], 10) : 0;
            })
            .reduce((max, curr) => Math.max(max, curr), 0);

        finalName = `${nameWithoutExtension} (${maxNumber + 1})${extension}`;
    }

    // Save the file information to the database
    const newFile = await fileModel.create({
        path: cloudinaryUrl,
        originalname: finalName,
        user: userId,
    });

    res.json(newFile);
});


// download route

router.get('/download/:id', authMiddleware, async (req, res) => {
    const loggedInUserId = req.user.userId;
    const fileId = req.params.id;

    const file = await fileModel.findOne({ 
        _id: fileId, 
        user: loggedInUserId
     });
    if (!file) {
        return res.status(404).send('File not found');
    }

    // Redirect to the file's Cloudinary URL for downloading
    res.redirect(file.path);
});


module.exports = router;