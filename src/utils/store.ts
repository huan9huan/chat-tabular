import { isObject } from "lodash";
import { v4 as uuidv4 } from 'uuid';

interface Store {
    set: (key: string, value: any) => void;
    get: (key: string) => any;
    remove: (key: string) => void;
}
export const StoreID = {
    openaiKey: () => '_openai_key',
    newTabularId : () => uuidv4(),
    tabulars: () => `_tabulars`,
    tabularDataId: (tid: string) => `_t_data_${tid}`,
    tabularChatsId: (tid: string) => `_t_chats_${tid}`,
    tabularProfile: (tid: string) => `_t_profile_${tid}`,
    chatId: (cid: string) => `_c_${cid}`,
}

export const localStore: Store = {
    set: (key: string, value: any) => {
        if(isObject(value)) {
            value = JSON.stringify(value);
        }
        localStorage.setItem(key, value);
    },
    remove: (key: string) => {
        localStorage.removeItem(key);
    },
    get: (key: string): any => {
        const value = localStorage.getItem(key);
        if(!value) return ;
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    }
};


export default localStore;