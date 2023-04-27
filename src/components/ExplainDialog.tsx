import React, { useEffect } from 'react';

const ExplainDialog = ({ isOpen, onClose, model, prompt, temperature, respContent }: {model: string, temperature: number, prompt: string, respContent: string, isOpen: boolean, onClose: Function}) => {

  useEffect(() => {
    const handleKeyDown = (event: {key: string}) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown as any);

    return () => {
      document.removeEventListener('keydown', handleKeyDown as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]);


  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ">
      <div
        className="bg-white rounded p-6 w-64 min-w-[48rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className='text-3xl mb-2 w-full text-center'>Explaination</div>
        <div className='text-xl mb-2 w-full text-center'></div>
        <div className='w-full bg-slate-100 mb-2 overflow-scroll'>
          <pre className='p-2 text-sm mb-2 w-full resize-none h-[30vh]'>{prompt}</pre>
        </div>
        <div className='text-sm mb-2 w-full text-center'>Model - {model}, Temperature - {temperature}</div>
        <div className='w-full text-sm bg-slate-100 overflow-scroll'>
          <pre className='p-2 w-full resize-none h-[30vh]'>{respContent}</pre>
        </div>
        <button
            className="mt-6 w-full px-4 py-2 bg-blue-500 text-white rounded"
            onClick={onClose as any}
          >
            OK
          </button>
      </div>
    </div>
  );
};

export default ExplainDialog;