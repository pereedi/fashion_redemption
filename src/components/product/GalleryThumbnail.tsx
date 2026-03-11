import React from 'react';

interface GalleryThumbnailProps {
  image: string;
  index: number;
  isSelected: boolean;
  onClick: (index: number) => void;
}

const GalleryThumbnail: React.FC<GalleryThumbnailProps> = ({ image, index, isSelected, onClick }) => {
  return (
    <button
      onClick={() => onClick(index)}
      className={`aspect-square overflow-hidden bg-white border-2 transition-all ${
        isSelected 
          ? 'border-luxury-red scale-[1.02] shadow-md' 
          : 'border-transparent opacity-60 hover:opacity-100'
      }`}
    >
      <img 
        src={image} 
        alt={`Thumbnail ${index + 1}`} 
        className="w-full h-full object-cover" 
      />
    </button>
  );
};

export default GalleryThumbnail;
