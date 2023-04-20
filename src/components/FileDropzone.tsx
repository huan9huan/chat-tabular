import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

type FileDropzoneProps = {
  onFileDrop: (file: File) => void;
};

const FileDropzone: React.FC<FileDropzoneProps> = ({ onFileDrop }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileDrop(acceptedFiles[0]);
      }
    },
    [onFileDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // accept: '.csv',
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed p-4  min-h-[10rem] ${
        isDragActive ? 'border-blue-500' : 'border-gray-300'
      }`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className='text-xl'>Drop the CSV file to start chat with your data...</p>
      ) : (
        <p className='text-xl'>Drag and drop a CSV file to start chat with your data, or click to select a file.</p>
      )}
    </div>
  );
};

export default FileDropzone;