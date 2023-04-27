import React, { useState, useEffect } from 'react';

const NameInputDialog = ({ value, isOpen, onClose, onSubmit, onDelete }: {onDelete: Function, value: string, isOpen: boolean, onClose: Function, onSubmit: Function}) => {
  const [inputValue, setInputValue] = useState(value);
  useEffect(() => {
    setInputValue(value);
  }, [value])

  useEffect(() => {
    const handleKeyDown = (event: {key: string}) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'Enter') {
        onSubmit(inputValue);
      }
    };

    document.addEventListener('keydown', handleKeyDown as any);

    return () => {
      document.removeEventListener('keydown', handleKeyDown as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]);

  const handleSave = () => {
    onSubmit(inputValue);
  };
  const handleDelete = () => {
    onDelete();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 "
      onClick={onClose as any}
    >
      <div
        className="bg-white rounded p-6 w-64 min-w-[48rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className='text-2xl mb-6 w-full text-center'>Tabular Workspace Setting</div>
        <input
          type="text"
          placeholder='Input your openai key'
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 "
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button
          className="mt-6 w-full px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleSave}
        >
          Update Name
        </button>
        <button
            className="mt-6 w-full px-4 py-2 bg-red-500 text-white rounded"
            onClick={handleDelete}
          >
            Delete Workspace
          </button>
      </div>
    </div>
  );
};

export default NameInputDialog;