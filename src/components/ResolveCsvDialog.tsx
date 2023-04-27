import React, { useState, useEffect } from 'react';
import Papa, { ParseResult } from 'papaparse'
import TablePreview from './TablePreview';

const ResolveCsvDialog = ({ isOpen, onClose, onOpen, content: initialContent }: { content: string, onOpen: Function, isOpen: boolean, onClose: Function}) => {
  const [content, setContent] = useState<any>();
  const [results, setResults] = useState<any>();

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  useEffect(() => {
    if(content) {
      Papa.parse(content, {
        header: true,
        skipEmptyLines: true,
        complete: (results: ParseResult<any>) => {
          setResults(results);
        }
      })
    }
  }, [content])

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

  const handleOpen = () => {
    Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<any>) => {
        onOpen({rows: results.data, columns: results.meta.fields || []});
      }
    })
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ">
      <div
        className="bg-white rounded p-6 w-64 min-w-[48rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className='text-2xl mb-6 w-full text-center'>Resolve CSV</div>
        <div>
          <textarea className='text-xl mb-6 w-full resize-none h-[10em]' value={content} onChange={(e) => {
            setContent(e.target.value);
          }}></textarea>
        </div>
        <div>
          <TablePreview data={results?.data} columns={results?.meta.fields || []} />
        </div>
        <button
          className="mt-6 w-full px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleOpen as any}
        >
          Open
        </button>
      </div>
    </div>
  );
};

export default ResolveCsvDialog;