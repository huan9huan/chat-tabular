import React from 'react';
import { SingleTabular } from '../../types';

const OpenRecentsDialog = ({ tabulars, isOpen, onClose, onOpen, onDelete }: {onDelete: Function, onClose:Function, tabulars: SingleTabular[], isOpen: boolean, onOpen: Function}) => {

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
        <div className='text-2xl mb-6 w-full text-center border_t'>Recent Tabular Workspaces</div>
        <div className='flex flex-col justify-start space-y-2'>
          {tabulars.map(t => <div key={t.tid} className='w-full flex justify-start mt-2'>
            <span className='mx-4 flex-1'>{t.name}</span>
            <button
              className="mx-4  px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => onOpen(t.tid)}
            >
              Open
            </button>
            <button
                className="mx-4 px-4 py-2 bg-red-500 text-white rounded"
                onClick={() => onDelete(t.tid)}
              >
              Delete
            </button>
          </div>)}
        </div>
      </div>
    </div>
  );
};

export default OpenRecentsDialog;