const auth = require("../auth/auth");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const upload = multer({ storage: multer.memoryStorage() });
const UPLOADCARE_PUBLIC_KEY = "c9a6f393781a5a381658"; // Remplacez par votre clé publique Uploadcare

module.exports = (app) => {
  app.post(
    "/api/uploadOnUploadcare",
    auth,
    upload.single("file"),
    async (req, res) => {
      try {
        // Vérifier si un fichier a été fourni
        const reqFile = req.file;
        if (!reqFile) {
          return res.status(400).json({ error: "Aucun fichier fourni." });
        }

        // Préparer les données pour l'envoi vers Uploadcare
        const formData = new FormData();
        formData.append("UPLOADCARE_PUB_KEY", UPLOADCARE_PUBLIC_KEY);
        formData.append("UPLOADCARE_STORE", "auto");
        formData.append("file", reqFile.buffer, reqFile.originalname);

        // Envoyer la requête d'upload vers Uploadcare
        const response = await axios.post(
          "https://upload.uploadcare.com/base/",
          formData,
          {
            headers: formData.getHeaders(),
          }
        );

        // Construire l'URL du fichier Uploadcare à partir de l'UUID
        const fileUrl = `https://ucarecdn.com/${response.data.file}/`;

        // Renvoyer l'URL dans la réponse
        res.status(200).json({
          success: true,
          message: "Fichier uploadé avec succès.",
          url: fileUrl,
        });
      } catch (error) {
        console.error("Erreur d'upload vers Uploadcare:", error);
        res.status(500).json({
          error: "Une erreur est survenue lors de l'upload du fichier.",
        });
      }
    }
  );
};
