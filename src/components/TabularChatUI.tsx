import React, { useEffect, useState } from 'react';
import Papa, { ParseResult } from 'papaparse'

import FileDropzone from './FileDropzone';
import TablePreview from './TablePreview';
import ChatInputBox from './ChatInputBox';
import { InsightRunning, Running, TabluarProfile } from '../../types';
import { Chat } from './Chat';
import { Table, OpenAI } from '@chat-tabular/chain';
import { localStore, StoreID } from '../utils/store';
import { RefreshIcon } from './icons';
import ReactLoading from "react-loading";
import ResolveCsvDialog from './ResolveCsvDialog';
import ExplainDialog from './ExplainDialog';


const TabularChatUI = ({tabularId, openaiKey, samples, onCreateTabular}: 
    { tabularId?: string, openaiKey: string,
      samples?: {name: string, url: string; suggested: string; insights: string[]}[],
      onCreateTabular: Function}) => {
  const [error, setError] = useState<string>();
  const [suggested, setSuggested] = useState<string>();
  const [tableName, setTableName] = useState<string>();
  const [tableContent, setTableContent] = useState<string>();
  const [tableData, setTableData] = useState<Table | null>(null);
  const [history, setHistory] = useState<Running[]>([]);
  const [insightRunning, setInsightRunning] = useState<InsightRunning>();
  const [insightsLoading, setInsightsLoading] = useState<boolean>(false);
  const [resolvingCsvDlg, setResolvingCsvDlg] = useState<ParseResult<any>>();
  const [explaining, setExplaining] = useState<{prompt: string; temperature: number; model: string; respContent: string}>();

  useEffect(() => {
    const setupById = async (id: string) => {
      const table: Table | undefined = localStore.get(StoreID.tabularDataId(id));
      const chatIds: string[] | undefined = localStore.get(StoreID.tabularChatsId(id));
      const tabularProfile: TabluarProfile| undefined = localStore.get(StoreID.tabularProfile(id));
      if(table) {
        setTableData(table);
        const chatObjs:Running[] = [];
        (chatIds || []).forEach(cid => {
          chatObjs.push(localStore.get(StoreID.chatId(cid)) as Running);
        })
        setHistory(chatObjs);
        if(tabularProfile) {
          setSuggested((tabularProfile.suggested || [])[0]);
          setTableName(tabularProfile.name || 'untitled');
          setInsightRunning(tabularProfile.insightRunning || {ok: true, prompt: '', insights: [], respContent: '',
            model: OpenAI.CHAT_GPT35_MODEL,
            temperature: OpenAI.DEFAULT_INSIGHT_TEMPERATURE});
        }
      }
    }
    if(tabularId) {
      setupById(tabularId);
    }
  }, [tabularId]);

  useEffect(() => {
    if(tableData && !tabularId) {
      handleStartThread(tableData, tableName || 'untitled');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableData, tabularId]);

  const handleStartThread = (table: Table, name: string) => {
    const tabularId = StoreID.newTabularId();
    localStore.set(StoreID.tabularDataId(tabularId || ''), table);
    localStore.set(StoreID.tabularChatsId(tabularId || ''), []);
    localStore.set(StoreID.tabularProfile(tabularId || ''), {suggested: [suggested], name, insightRunning} as TabluarProfile);
    onCreateTabular(tabularId, name);
    setTimeout(() => {
      (window as any).location = ('/?id=' + tabularId);
    }, 1000);
  }

  const handleFile = async (file: File) => {
    let reader = new FileReader();
    reader.readAsText(file);

    const content: string = await new Promise((r,j) => {
      reader.onload = function() {
        r(reader.result as string);
      };
      reader.onerror = function() {
        j('fail to read file');
      };
    });

    setTableContent(content || '');
    setTableName(file.name);
  };

  useEffect(() => {
    if(!tableContent) return ;
    
    Papa.parse(tableContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<any>) => {
        if (results.errors.length <= 0 && results.meta && results.data && results.data.length > 0) {
          const columns = results.meta.fields || [];
          const table = { rows: results.data, columns };
          setTableData(table);
          (window as any).table = table;
        } else {
          setResolvingCsvDlg(results);
          console.error('Error parsing CSV:', results.errors);
          setError(`Error parsing CSV: ${results.errors.map((e: any) => e?.type + ":" + e?.message).join('\n')}`);
        }
      },
    });
  }, [tableContent]);
  
  const handleImportFile = async ({url, suggested, insights} :{url: string, suggested: string, insights: string[]}) => {
    const content:string = await new Promise((r,j) => {
      fetch(url)
      .then(response => {
          if (!response.ok) {
              setError("fail to fetch url " + url);
              j("fail to fetch url " + url);
          }
          response.text().then(txt => r(txt));
      })
    });
    setTableContent(content);
    setTableName(url.split('/').pop());
    setSuggested(suggested);
    setInsightRunning({ok: true, insights, prompt: '', model: OpenAI.CHAT_GPT35_MODEL, temperature: OpenAI.DEFAULT_INSIGHT_TEMPERATURE, respContent: ''});
  };

  const handleRunningChanged = (running: Running) => {
    console.log(`running ${running.id} status ${running.status} version ${running.version}`);
    // save into local
    localStore.set(StoreID.chatId(running.id), running);
  }

  const runChat = async (question: string) => {
    if(!tableData) return;
    const id =  "" + new Date().getTime();
    const newRun: Running = {status: 'start', question, input: tableData,  id, version: 1};
    setHistory(history.concat([newRun]));
    // save into chats list for tabular
    localStore.set(StoreID.tabularChatsId(tabularId || ''), history.map(h => h.id).concat([id]));
  }
  const onShowInsightExplain = () => {
    setExplaining({
        prompt: insightRunning?.prompt || '', temperature: insightRunning?.temperature || OpenAI.DEFAULT_INSIGHT_TEMPERATURE, model: OpenAI.CHAT_GPT35_MODEL,
        respContent: insightRunning?.respContent || ''});
  }
  const handleRefreshInsights = async () => {
    try {
      const nextTemp = Math.min(0.9, (insightRunning?.temperature || OpenAI.DEFAULT_INSIGHT_TEMPERATURE) * 1.2);
      setInsightsLoading(true);
      const newInsightRunning = await OpenAI.insights(tableData!, openaiKey, nextTemp);
      setInsightRunning(newInsightRunning);
      localStore.set(StoreID.tabularProfile(tabularId || ''), {suggested: [suggested], name: tableName, insightRunning: newInsightRunning});
    }catch(err){
      setError((err as any).message || 'unknown error')
    }
    finally{
      setInsightsLoading(false);
    }
  }
  const handleDeleteChat = (id: string) => {
    const renew = history.filter(h => h.id !== id);
    setHistory(renew);
    localStore.remove(StoreID.chatId(id));
    localStore.set(StoreID.tabularChatsId(tabularId || ''), renew.map(h => h.id));
  }

  const renderRunning = (running:Running) => {
    if(!running) return ;
    return <Chat running={running} llm={{openaiKey}}
     onStartThread={(table: Table, name: string) => handleStartThread(table, name)}
     onDeleteChat={handleDeleteChat}
     onRunningChanged={handleRunningChanged}/>
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
    return (samples && samples.length > 0 && <div className='w-full space-x-2'>
      <span>Samples:</span>
      {
        samples.map((sample, index) => {
          return <span key={index} className='text-green-900 cursor-pointer' onClick={() => handleImportFile(sample)}>{sample.name}</span>
        })
      }
    </div>)
  }
  const renderInsights = () => {
    if(!tableData || !insightRunning || !insightRunning.insights || !insightRunning.insights.map ) return ;
    return <div className='bg-white px-4 py-2 mx-4 my-2 rounded-lg self-start'>
        <div className='flex flex-row justify-start space-x-4 items-center'>
          <span className='text-bold text-xl text-slate-500 '>Insights:</span>
          {insightsLoading && <ReactLoading color="black" type="spin" height={24} width={24}/>}
          {!insightsLoading && <span onClick={() => handleRefreshInsights()} title='regenerate the insights' className='cursor-pointer'>
           <RefreshIcon width='1rem' height='1rem'/>
          </span>}
          {insightRunning.prompt && <span className='badge border text-xs px-2 bg-slate-100 cursor-pointer' onClick={() => onShowInsightExplain()}>Temp. {insightRunning.temperature}</span>}
        </div>
        <ul className='w-full space-y-1 mx-4 text-sm text-slate-500 italic'>
          {(insightRunning?.insights || []).map((i,idx) => <li key={idx} className='cursor-pointer' onClick={() => {
            runChat(i)
          }}>{i}</li>)}
        </ul>
      </div>
  }
  const resolvingCsv = () =>{
    return <ResolveCsvDialog
      isOpen={!!resolvingCsvDlg}
      content={tableContent || ''}
      onClose={() => setResolvingCsvDlg(undefined)}
      onOpen={(table: Table) => {
        setResolvingCsvDlg(undefined);
        setTableData(table);
    }}/>
  }

  return (
    <div className={`h-[calc(100vh-128px)] flex flex-col chat-tabular-container overflow-auto`}>
      <div className='flex-1'>
        {!tableData  && <FileDropzone onFileDrop={handleFile} />}
        {!tableData && renderSamples()}
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>}

        {tableData && <TablePreview data={tableData.rows} columns={tableData.columns} />}
        {renderInsights()}
        {renderHistory()}
      </div>
      <ChatInputBox suggested={suggested ||'how many rows are there?'} disabled={!tableData} onSendMessage={(message) => runChat(message)} />
      {resolvingCsv()}
      {!!explaining && <ExplainDialog
        isOpen={!!explaining}
        onClose={() => setExplaining(undefined)}
        temperature={explaining.temperature!}
        prompt={explaining.prompt!}
        model={explaining.model!}
        respContent={explaining.respContent!}
        />}
    </div>
  );
};

export default TabularChatUI;