// src/utils/cloudinary.js

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary using environment variables.
// This should be done once when the application starts.
// Ensure your .env file is loaded in your main app.js or index.js
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key:  process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

/**
 * Uploads a file from a local path to Cloudinary and removes the local file.
 * @param {string} localFilePath - The path to the file on the local filesystem.
 * @returns {object|null} The Cloudinary upload response object on success, or null on failure.
 */
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.error("Cloudinary upload failed: No local file path provided.");
      return null;
    }

    // Upload the file to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // File has been uploaded successfully
    // console.log("File uploaded successfully on Cloudinary: ", uploadResponse.url);
    fs.unlinkSync(localFilePath); // Remove the locally saved temporary file
    return uploadResponse;

  } catch (error) {
    // An error occurred during the upload
    console.error("Cloudinary upload failed: ", error);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath); // Ensure cleanup even if upload fails
    }
    return null;
  }
};

/**
 * Deletes a file from Cloudinary using its public ID.
 * @param {string} publicId - The public ID of the file to be deleted.
 * @param {string} resource_type - The type of resource (e.g., 'image', 'video', 'raw'). Defaults to 'auto'.
 * @returns {object|null} The Cloudinary deletion response object on success, or null on failure.
 */
const deleteFromCloudinary = async (publicId, resource_type = "auto") => {
  try {
    if (!publicId) {
      console.error("Cloudinary deletion failed: No public ID provided.");
      return null;
    }

    // Delete the file from Cloudinary
    const deletionResponse = await cloudinary.uploader.destroy(publicId, {
      resource_type: resource_type,
    });

    // console.log("File deleted successfully from Cloudinary.");
    return deletionResponse;

  } catch (error) {
    console.error("Cloudinary deletion failed: ", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };