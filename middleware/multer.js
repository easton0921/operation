const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, uploadDir); 
    },
    filename: function (req, file, callback) {
        const ext = path.extname(file.originalname); 
        callback(null, file.fieldname + "-" + Date.now() + ext);
    }
});

const upload = multer({ storage }).single("image");

module.exports = { upload };
