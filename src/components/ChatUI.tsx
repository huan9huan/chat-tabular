import React, { useEffect, useState } from 'react';
import Papa from 'papaparse'

import FileDropzone from './FileDropzone';
import TablePreview from './TablePreview';
import ChatInputBox from './ChatInputBox';
import { Running, Table } from '../types';
import { Chat } from './Chat';

const ChatUI = ({openaiKey}: {openaiKey: string}) => {
  const [error, setError] = useState<string>();
  const [tableData, setTableData] = useState<Table | null>(null);
  const [history, setHistory] = useState<Running[]>([]);

  const handleFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        if (results.errors.length === 0) {
          const columns = results.meta.fields || [];
          const table = { rows: results.data, columns };
          setTableData(table);
          (window as any).table = table;
        } else {
          console.error('Error parsing CSV:', results.errors);
          setError(`Error parsing CSV: ${results.errors.map(e => e.type + ":" + e.message).join('\n')}`);
        }
      },
    });
  };
  
  const handleImportFile = async (url: string) => {
    Papa.parse(url, {
      header: true,
      download: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        if (results.errors.length === 0) {
          const columns = results.meta.fields || [];
          const table = { rows: results.data, columns };
          setTableData(table);
          (window as any).table = table;
        } else {
          console.error('Error parsing CSV:', results.errors);
          setError(`Error parsing CSV: ${results.errors.map(e => e.type + ":" + e.message).join('\n')}`);
        }
      },
    });
  };

  const runChat = async (question: string) => {
    if(!tableData) return;
    const id =  "" + new Date().getTime();
    const newRun: Running = {status: 'start', question, input: tableData,  id};
    setHistory(history.concat([newRun]));
  }

  const renderRunning = (running:Running) => {
    if(!running) return ;
    return <Chat running={running} />
  }

  const renderHistory = () => {
      return (
        <div className="flex-1 overflow-auto divide-y-2 space-y">
          {history.map((single, index) => (
            <div
              key={index}
              className={'bg-white px-4 py-2 mx-4 my-2 rounded-lg self-start'}
            >
              {renderRunning(single)}
            </div>
          ))}
        </div>
      );
  }
  const renderSamples = () => {
    return <div className='w-full space-x-2'>
      <span>Samples:</span>
      <span className='text-green-900 cursor-pointer' onClick={() => handleImportFile(`/data/titanic.csv`)}>Titanic</span>
    </div>
  }

  return (
    <div className="h-screen flex flex-col chat-tabular-container overflow-auto">
      <div className='flex-1'>
        {!tableData  && <FileDropzone onFileDrop={handleFile} />}
        {!tableData && renderSamples()}
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>}

        {tableData && <TablePreview data={tableData.rows} columns={tableData.columns} />}
        {renderHistory()}
      </div>
      <ChatInputBox disabled={!tableData} onSendMessage={(message) => runChat(message)} />
    </div>
  );
};

export default ChatUI;