const uploadOnCloudinary = async (localFilePath) => {
  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // If a path is provided, simulate a successful upload
  if (localFilePath) {
    return {
      url: `http://res.cloudinary.com/demo/image/upload/sample.jpg`,
      public_id: `sample`,
    };
  }
  // If no path, simulate a failure
  return null;
};

const deleteFromCloudinary = async (publicId) => {
  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Simulate a successful deletion response from Cloudinary
  if (publicId) {
    return { result: 'ok' };
  }
  // Simulate a case where the resource is not found
  return { result: 'not found' };
};

export { uploadOnCloudinary, deleteFromCloudinary };