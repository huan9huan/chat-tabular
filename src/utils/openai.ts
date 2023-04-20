import { LLM, Table } from '../types';
const { Configuration, OpenAIApi } = require("openai");

export const exportedFuncName = 'window.run';

export const DECISION_PROMPT = `You are acting as decision maker, you should choose which actions should be token based on my question.
Question Context: Give a csv file, columns is \`{HEADERS}\`

Candidate actions list:
1. Chart Function to show chart
2. Table Function to show the result table
3. Unknown & Not Sure

You should not to explain, just show the action number and name.

My Question: {QUESTION}
`;

export const TABLE_PROMPT = `You are working with javascript program, I will give you a \`table: {column: string[], rows: Row[]}\`, where Rows is {[column key]: value}.
I will ask you question, you should return a javascript function to resolve my question.
- function name should be \`${exportedFuncName}\`
- input parameter as \`table\`, output should also return a table type

You should not to explain the logic, just write the code.

My \`table.columns\` is \`{HEADERS}\`
My table head rows are """
{ROWS}
"""

Question: {QUESTION} `

export const CHART_PROMPT = `You are working with javascript program to show me the chart by google chart library,  I will give you a \`table: {column: string[], rows: Row[]}\`, where Rows is {[column key]: value}.
I will ask you question, you should return a javascript function to show chart, powered by google chart libarary
- chart container DOM element id is {CHART_CONTAINER_ID}
- function name should be \`${exportedFuncName}\`
- input parameter as \`table\`
- the second partameter is the chart container dom element id

You should not to explain the logic, not show sample notes or usages, just write the code.

My \`table.columns\` is \`{HEADERS}\`
My table head rows are """
{ROWS}
"""

Question: {QUESTION} `

export const CHAT_GPT35_MODEL = "gpt-3.5-turbo";
interface GptChatChoice {
    message: {
      role: string;
      content: string;
    }
};
export interface OpenaiResult {
    choices: GptChatChoice [];
    created: number;
    id: string;
    model: string;
    usage: {
      completion_tokens: number,
      prompt_tokens: number,
      total_tokens: number
    }
    finish_reason: string;
    index: number;
}
export interface OpenaiErrorResult {
    status: number;
    statusText: string;
}
export function toPrompt(type: 'table' | 'chart', table: Table, question: string, id: string): string {
    const temp = type === 'chart' ? CHART_PROMPT : TABLE_PROMPT;
    return temp.replace('{HEADERS}', table.columns.join(','))
        .replace('{ROWS}', table.rows.slice(0, 5).map(r => table.columns.map(c => r[c] || '').join(',')).join('\n'))
        .replace('{QUESTION}', question)
        .replace('{CHART_CONTAINER_ID}', id)
        ;
}

export async function decide(columns: string[], question: string, llm: LLM): Promise<'chart' | 'table' | 'number' | 'unknown'>{
    const configuration = new Configuration({
        apiKey: llm.openaiKey,
    });
    
    const openai = new OpenAIApi(configuration);
    
    const p = DECISION_PROMPT.replace('{HEADERS}', columns.join(','))
        .replace('{QUESTION}', question);
    const res = await chat(p, llm);
    if((res as OpenaiErrorResult).status) {
        return 'unknown';
    } else {
        try{
            const rough = (res as OpenaiResult).choices[0].message.content.toLowerCase();
            return ['chart', 'table', 'number'].find(t => rough.split('\n')[0].indexOf(t) >= 0) || 'unknown' as any;
        }catch(err){
            return 'unknown';
        }
    }
    return 'unknown';
}
export async function chat(prompt: string, llm: LLM): Promise<OpenaiResult | OpenaiErrorResult>{
    const configuration = new Configuration({
        apiKey: llm.openaiKey,
    });
    
    const openai = new OpenAIApi(configuration);
    const result = await openai.createChatCompletion({
        model: CHAT_GPT35_MODEL,
        messages: [ {"role": "user", "content": prompt } ],
        temperature: 0,
        max_tokens: 1024,
        });
        if(result.status === 200) {
        return result.data;
        } else {
        return {
            status: result.status,
            statusText: result.statusText
        }
    }
}
export function parseCode(content?: string, magic?: string) {
    if(!content) {
        return;
    }
    if(magic && content.startsWith(magic)) {
        return content;
    }
    const lines = content.split('\n');
    const startLine = lines.findIndex(l => l.trim().startsWith('```'));
    if(startLine < 0) return ;
    const endLine = lines.slice(startLine + 1).findIndex(l => l.trim().startsWith('```')) + startLine;
    return lines.slice(startLine + 1, endLine).join('\n');
}