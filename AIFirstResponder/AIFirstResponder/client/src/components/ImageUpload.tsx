import React, { useState, useRef } from "react";
import { Camera, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onAnalyze: (imageData: string) => void;
  isLoading: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onAnalyze, isLoading }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File is too large. Maximum size is 10MB');
      return;
    }

    // Optimize image before loading
    const optimizeImage = (dataUrl: string) => {
      return new Promise<string>((resolve) => {
        const img = new Image();
        img.onload = () => {
          // Create a canvas to resize the image
          const canvas = document.createElement('canvas');
          // Define max width and height (1024 is a good balance for quality and size)
          const maxWidth = 1024;
          const maxHeight = 1024;
          
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions
          if (width > height && width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw resized image to canvas
          const ctx = canvas.getContext('2d');
          ctx!.drawImage(img, 0, 0, width, height);
          
          // Convert to JPEG with 0.85 quality (good balance)
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(optimizedDataUrl);
        };
        img.src = dataUrl;
      });
    };

    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      // Optimize the image before setting it
      const optimizedImage = await optimizeImage(result);
      setSelectedImage(optimizedImage);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = () => {
    // For a real implementation, this would use MediaDevices API
    // For now, just use the file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyzeClick = () => {
    if (selectedImage) {
      onAnalyze(selectedImage);
    }
  };

  return (
    <section className="mb-8">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Injury Photo</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Take or upload a photo of the injury for AI analysis and first aid guidance.
          </p>

          <div className="space-y-4">
            {!selectedImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition duration-150 ${
                  isDragging
                    ? "border-secondary dark:border-secondary"
                    : "border-gray-300 dark:border-gray-600 hover:border-secondary dark:hover:border-secondary"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <div className="flex flex-col items-center">
                  <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                    Drag & drop your photo or click to browse
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    JPEG, PNG, HEIC (Max 10MB)
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <div className="relative">
                  <img
                    className="w-full h-64 object-contain bg-gray-100 dark:bg-gray-800 rounded-md"
                    src={selectedImage}
                    alt="Injury preview"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Camera Access Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleCameraCapture}
                variant="outline"
                className="flex items-center"
              >
                <Camera className="h-5 w-5 mr-2" />
                Take Photo with Camera
              </Button>
            </div>

            {/* Analyze Button */}
            <div className="flex justify-center mt-4">
              <Button
                onClick={handleAnalyzeClick}
                disabled={!selectedImage || isLoading}
                className="flex items-center px-6 py-3 bg-primary hover:bg-primary/90"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    Analyze Injury
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default ImageUpload;
