import React, { useState, useRef } from 'react';
import { Camera, Trash2, User } from 'lucide-react';

const ProfileImageUpload = ({ currentImage, onImageSelect, onImageRemove }) => {
  const [preview, setPreview] = useState(currentImage || null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert('Only JPG, JPEG, or PNG files are allowed.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onImageSelect(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageRemove();
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <div className="w-32 h-32 rounded-full border-2 border-slate-700 overflow-hidden bg-slate-800 flex items-center justify-center">
          {preview ? (
            <img src={preview} alt="Profile Preview" className="w-full h-full object-cover" />
          ) : (
            <User className="w-16 h-16 text-slate-500" />
          )}
        </div>
        <button
          onClick={() => fileInputRef.current.click()}
          className="absolute bottom-0 right-0 p-2 bg-cyan-500 rounded-full text-slate-900 border-2 border-slate-900 hover:bg-cyan-400 transition-all shadow-lg"
          title="Upload Photo"
        >
          <Camera size={18} />
        </button>
      </div>
      
      {preview && (
        <button
          onClick={handleRemove}
          className="text-xs text-red-400 flex items-center gap-1 hover:text-red-300 transition-all font-semibold uppercase tracking-wider"
        >
          <Trash2 size={12} /> Remove Picture
        </button>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/jpg"
      />
      <p className="text-[10px] text-slate-500 text-center max-w-[150px]">
        JPG, PNG allowed. Max size 2MB.
      </p>
    </div>
  );
};

export default ProfileImageUpload;
