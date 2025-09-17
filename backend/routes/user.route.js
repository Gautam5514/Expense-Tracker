const express = require("express");
const multer = require("multer");
const { protect } = require("../controllers/auth.controller");
const { getMe, updateMe, updateFinancialProfile } = require("../controllers/user.controller");

const router = express.Router();

// Multer configuration for profile picture storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const ext = file.mimetype.split('/')[1];
        // Create a unique filename for the user's profile picture
        cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
    }
});

const upload = multer({ storage: storage });

// All subsequent routes are protected
router.use(protect);

router.get("/me", getMe);
// For the update route, use multer middleware to handle a single file from a field named 'profilePicture'
router.put("/updateMe", upload.single('profilePicture'), updateMe);

router.put("/financial-profile", updateFinancialProfile);

module.exports = router;