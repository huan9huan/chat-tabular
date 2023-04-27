import { useEffect, useState } from 'react';
import { SendIcon } from './icons';

type ChatInputBoxProps = {
  onSendMessage: (message: string) => void;
  disabled: boolean;
  suggested: string;
};

const ChatInputBox: React.FC<ChatInputBoxProps> = ({ onSendMessage, disabled, suggested }) => {
  const [message, setMessage] = useState('');
  useEffect(() => {
    setMessage(suggested);
  }, [suggested])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };
  const onkeydown = (e: React.KeyboardEvent) => {
    if(e.code === 'Enter') {
      if(!e.altKey && !e.shiftKey && !e.ctrlKey) {
        handleSubmit(e);
      }
    }
    setTimeout(() => {
      adjustHeight();
    }, 500);
  }
  const adjustHeight = () => {
    const textarea = document.querySelector('#chat-tabular-textarea');
    if(textarea) {
      (textarea as any).style.height = 'auto';
      if((message || '').trim().split('\n').length <= 1) {
        (textarea as any).style.height = '3rem';
      } else {
        (textarea as any).style.height = textarea.scrollHeight + 'px';
      }
    }
  }

  return (
    <div className='pb-[1rem] mx-[1rem]'>
        <div className="flex items-center border border-neutral-300 bg-white rounded-2xl px-4">
          <textarea
            className="flex-1 text-xl px-4 py-2 outline-none resize-none overflow-hidden h-[3rem]"
            placeholder="Ask your tabular data..."
            value={message}
            id="chat-tabular-textarea"
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={onkeydown}
          >
        </textarea>
        <button
            disabled={disabled}
            onClick={handleSubmit}
            className="ml-2 px-4 py-2"
          >
            <SendIcon />
          </button>
        </div>
    </div>
  );
};

export default ChatInputBox;