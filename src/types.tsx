
export type Table = {
    columns: string[],
    rows: Row[];
}
export type Row = {[key: string]: string};
export type RunningStatus =  'start' | 'deciding_type' | 'decided_done' | 'asking_logic' | 'ask_logic_done' | 'rendering_chart' | 'try_render_chat_done' | 'executing_logic' | 'success_finished'  | 'error';

export interface Running {
    status: RunningStatus;
    id: string;
    question: string;
    questionType?: 'chart' | 'table' | 'number';
    input: Table;
    prompt?:string;
    code?: string;
    result?: Table;
    resultText?: string;
    error?: string;
    showingCode?: boolean;
}

export interface LLM {
    openaiKey: string;
}