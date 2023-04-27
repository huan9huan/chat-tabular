import { Row, Table } from '@chat-tabular/chain';
export type RunningStatus =  'start' | 'deciding_type' | 'decided_done' | 'asking_logic' | 'ask_logic_done' | 'rendering_chart' | 'try_render_chat_done' | 'executing_logic' | 'success_finished'  | 'error';

export interface Running {
    status: RunningStatus;
    id: string;
    question: string;
    questionType?: 'chart' | 'table' | 'number';
    version: number;
    input: Table;
    temperature?: number;
    model?: string;
    prompt?:string;
    code?: string;
    respContent?: string;
    result?: Table;
    resultText?: string;
    error?: string;
}

export interface LLM {
    openaiKey: string;
}
export interface SingleTabular {
    tid: string;
    name: string;
    cts: number;
}
export interface Tabluars {
    tabulars: SingleTabular[];
}
export interface TabluarProfile {
    name: string;
    suggested: string[];
    insightRunning: InsightRunning;
}

export interface InsightRunning{
    ok: boolean;
    insights: string[];
    model: string;
    prompt: string;
    temperature: number;
    respContent?: string;
}

export interface ReadedCsv {
    meta: {fields: string[]};
    data: any[];
    errors: any[];
}