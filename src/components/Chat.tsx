import { useEffect, useState } from "react";
import ReactLoading from "react-loading";
import { LLM, Running } from "../types";
import TablePreview from "./TablePreview";
import { OpenAI } from '@chat-tabular/chain';
import { isArray, isNumber, isString } from 'lodash';
import { CheckedIcon, ErrorIcon } from "./icons";

const toContainerId = (id: string) => `chart-container-${id}`;

export const Chat = ({running: initial, llm}: {running: Running, llm: LLM}) => {
    const [running, setRunning] = useState<Running>(initial);
    const [copied, setCopied] = useState<number>(0);

    useEffect(() => {
        switch(running.status) {
            case 'start':
                _decide(running);
                break;
            case 'decided_done':
                _askLogic(running);
                break;
            case 'ask_logic_done':
                _executeLogic(running);
                break;
            case 'try_render_chat_done':
                _checkChartRenderDone(running);
                break;
        }
    }, [running]);
    useEffect(() => {
        if(copied > 0) {
            const timer = setTimeout(() => {
                setCopied(0);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [copied]);

    const _decide = async (running: Running) => {
        try{
            setRunning({...running, status: 'deciding_type'});
            const type = await OpenAI.decide(running.input.columns, running.question, llm.openaiKey);
            if(type === 'unknown') {
                setRunning({...running, status: 'error', error: `can't understand the question goal`});
            } else {
                const containerId = toContainerId(running.id);
                const prompt = OpenAI.toPrompt(type as any, running.input, running.question, containerId);
                setRunning({...running, status: 'decided_done', questionType: type, prompt});
            }
        }catch(err){
            setRunning({...running, status: 'error', error: `can't decide which question type - ` + err.message});
        }
    }
    const _askLogic = async (running: Running) => {
        try{
            setRunning({...running, status: 'asking_logic'});
            console.log('INFO: sending prompt ....\n', running.prompt);
            const openaiResult = await OpenAI.chat(running.prompt, llm.openaiKey);
            console.log('DEBUG: openai return\n', openaiResult);
            const code = OpenAI.parseCode(((openaiResult as OpenAI.OpenaiResult).choices || [])[0]?.message?.content, OpenAI.exportedFuncName);
            console.log('INFO: openai generate the code as \n', code);
            if(code?.startsWith(OpenAI.exportedFuncName)) {
                setRunning({...running, status: 'ask_logic_done', code});
            } else {
                setRunning({...running, status: 'error', error: `fail to generate the code, openai return as ${code}`});  
            }
        }
        catch(err) {
            setRunning({...running, question: running?.question, status: 'error', error: err.message || 'unknown error'});  
        }
    }
    const _checkChartRenderDone = async (running: Running) => {
        const containerId = toContainerId(running.id);
        const container = document.getElementById(containerId);
        if(container && container.childElementCount > 0) {
            setRunning({...running, status: 'success_finished'});
        } else {
            setRunning({...running, status: 'ask_logic_done'}); // later will render again
        }
    }
    const toText = (data: any): string => {
        if(isNumber(data) || isString(data)) return '' + data;
        return JSON.stringify(data);
    }
    const execChartLogic = (running: Running) => {
        const containerId = toContainerId(running.id);
        if(running.questionType === 'chart') {
            try{
                eval(running.code);
                (window as any).run(running.input, containerId);
                setRunning({...running, status: 'rendering_chart'});
                setTimeout( () => {
                    setRunning((r) => ({...r, status: 'try_render_chat_done'}))
                }, 2000);
            }catch(err){
                setRunning({...running, status: 'error', error: "fail to run code - " + err.message});
            }
            return ;  
        }
    }
    const execTableLogic = (running: Running) => {
        const containerId = toContainerId(running.id);
        eval(running.code); // inject the code into runtime, then window.run is be referenced
        const outputTableData = (window as any).run(running.input, containerId);
        if(outputTableData?.columns && isArray(outputTableData?.rows)) {
            setRunning({...running, status: 'success_finished', result: outputTableData});
        } else {
            setRunning({...running, status: 'success_finished', resultText: toText(outputTableData)});  
        }
    }
    const _executeLogic = async (running: Running) => {
        (window as any).running = running; // for debug
        try {
            if(running.questionType === 'chart') {
                execChartLogic(running);
                return;
            } else {
                execTableLogic(running);
                return;
            }
        }
        catch(err){
            setRunning({...running, status: 'error', error: `unexpected code and fail to run`});   
        }
    }
    const renderQuestion = (running: Running) => {
        return (<div className='w-full p-2 text-xl' style={{color: '#1f1f1f'}}>
        {running.question}
        </div>)
    }
    const renderChart = (running: Running) => {
        if(running.questionType !== 'chart') return;
        return <div className='w-full mt-2 pt-2 h-min-[512px]' style={{}}  id={`chart-container-${running.id}`}>
        </div>
    }

    const renderTable = (running: Running) => {
        if(running.questionType !== 'table' || running.status !== 'success_finished') return;
        return <div className='w-full mt-2 pt-2'>
            {running.result?.columns && <TablePreview data={running.result.rows} columns={running.result.columns}/>}
            {running.resultText && <div className='text-sm'>
                <p className='text-2xl'>{running.resultText}</p>
            </div>}
        </div>
    }
    
    const renderCheckedIcon = () => {
        return <CheckedIcon height={'1rem'} width={'1rem'}/>
    }
    const renderReactLoading = () => {
        return <ReactLoading color="black" type="spin" height={24} width={24}/>
    }
    const renderButton = (name: string, icon: 'checked' | 'loading' | 'error', handle?: Function) => {
        return <div className="flex items-center space-x-2 cursor-pointer hover:bg-slate-100" onClick={handle as any}> <span>{name}</span> 
        {icon === 'checked' && renderCheckedIcon()}
        {icon === 'loading' && renderReactLoading()}
        {icon === 'error' && <ErrorIcon height={'1rem'} width={'1rem'}/>}
        </div>
    }
    const toCsv = () => {
        if (!running.result) {
          return running.resultText + '';
        }
        const headers = running.result.columns.join(',');
        const rows = running.result.rows.map((r) => running.result.columns.map((c) => r[c]).join(','));
        return headers + '\n' + rows.join('\n');
    }
    const onClickButton = (type: 'logic' | 'prompt' | 'result' | 'error') => {
        switch(type) {
            case 'prompt':
                navigator.clipboard.writeText(running.prompt);
                break;
            case 'logic':
                navigator.clipboard.writeText(running.code);
                break;
            case 'result':
                navigator.clipboard.writeText(toCsv());
                break;
            case 'error':
                alert(running.error);
                break;
        }
        setCopied(new Date().getTime());
    }
    const renderStatus = (running: Running) => {
        return <div className="flex flex-row space-x-2 items-center mx-2 text-slate-500">
           {running.status === 'deciding_type' && renderButton('prompt', 'loading')}
           {running.prompt && renderButton('prompt', 'checked', () => onClickButton('prompt'))}
           {running.status === 'asking_logic' && renderButton('logic', 'loading')}
           {running.code && renderButton('logic', 'checked', () => onClickButton('logic'))}
           {(running.status === 'rendering_chart' || running.status === 'executing_logic') && renderButton('result','loading')}
           {running.status === 'success_finished' && renderButton('result','checked', () => onClickButton('result'))}
           {running.status === 'error' && renderButton('error','error', () => onClickButton('error'))}
        </div>
    }

    return <div className='w-full space-y-2 chat-container mt-[1rem]'>
    {renderQuestion(running)}
    {renderStatus(running)}
    <hr />
    {renderChart(running)}
    {renderTable(running)}
    {running.status === 'error' && <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative'>{running.error}</div> }
    {copied > 0 && (
                <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center">
                  <div className="bg-green-500 text-white py-2 px-4 rounded-md">
                    Copied to clipboard!
                  </div>
                </div>)}
  </div>
}