import React, { useState } from 'react';
import { Rnd } from 'react-rnd';

const ImageHandler = ({ onImageAdd }) => {
  const [image, setImage] = useState(null);
  const [imagePosition, setImagePosition] = useState({ x: 100, y: 100 });

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
        onImageAdd(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ marginBottom: '1rem' }}
      />
      {image && (
        <Rnd
          bounds="parent"
          position={imagePosition}
          onDragStop={(e, d) => setImagePosition({ x: d.x, y: d.y })}
        >
          <img
            src={image}
            alt="Uploaded"
            style={{ maxWidth: '200px', maxHeight: '200px' }}
          />
        </Rnd>
      )}
    </div>
  );
};

export default ImageHandler;