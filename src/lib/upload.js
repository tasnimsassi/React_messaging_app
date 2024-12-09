import axios from 'axios';

const upload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'my_upload_preset');
    formData.append('cloud_name', 'dxszche1x');
  
    try {
      const response = await axios.post('https://api.cloudinary.com/v1_1/dxszche1x/image/upload', formData);
      console.log('Cloudinary response:', response.data); // Ajoutez ce log
      if (response.data.secure_url) {
        return response.data.secure_url;
      } else {
        throw new Error('Image upload failed. No secure URL returned.');
      }
    } catch (err) {
      console.error('Upload failed:', err.message || err);
      throw new Error('Cloudinary upload failed');
    }
  };
  
export default upload;
