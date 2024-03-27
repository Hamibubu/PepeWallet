const multer = require('multer');

const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {        
        const extension = file.originalname.split('.').pop();
        const time = new Date().getTime();
        let name;
        if (req.user) {
            // Filtrar y permitir solo caracteres de la A a la Z (mayúsculas y minúsculas)
            const filteredUsername = req.user.username.replace(/[^a-zA-Z]/g, '');
            // Verificar si el nombre filtrado tiene al menos un carácter
            if (filteredUsername.length > 0) {
                name = `${filteredUsername}_${time}.${extension}`;
            } else {
                // Si no quedan caracteres válidos, usa un nombre predeterminado
                name = `default_${time}.${extension}`;
            }
        } else {
            // Si no hay req.body.username ni req.user.username, usa un nombre predeterminado
            name = `default_${time}.${extension}`;
        }

        cb(null, name);
    }
});

const fileFilter = (req, file, cb) => {
    if (req.user.userType !== "Buyer") {
        cb(new Error("Unauthorized: User is not a Buyer"), false);
    } else {
        const extension = file.originalname.split('.').pop();
        const isValid = validExtensions.includes(extension);
        cb(null, isValid);
    }
}

const upload = multer({ storage, fileFilter });

module.exports = upload;