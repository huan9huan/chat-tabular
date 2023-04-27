import { useState } from 'react';
import NameInputDialog from './NameInputDialog';

export const Header = ({onClickOpenaiKey, openaiKey, onClickRecent, onChangeName, name, onDelete, onGoHome} : {openaiKey?: string, onClickRecent:Function, onGoHome:Function, onDelete: Function, onClickOpenaiKey:Function, onChangeName: Function, name?: string})=> {
  const [isDlgOpen, setIsModalOpen] = useState(false);
  return <div className="z-10 w-full max-w-6xl items-center justify-between font-mono text-sm lg:flex mb-4">
    <div className='flex flex-row justify-start space-x-4'>
      <h2 className='text-2xl font-mono font-bold cursor-pointer' onClick={() => onGoHome()}>
      <img src='/logo-48.png' className='h-[2rem]'/>
      </h2>
      <h2 className='text-2xl font-mono font-bold cursor-pointer' onClick={() => setIsModalOpen(true)}>
        { name || "Talking to Your Tabular Data with ChatGPT"}
      </h2>
    </div>
    <div className="fixed bottom-0 left-0 flex h-48 w-full space-x-4 items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
      {openaiKey && <span onClick={onClickOpenaiKey as any} className='cursor-pointer'>OpenAPI Key</span>}
      {!openaiKey && <span onClick={onClickOpenaiKey as any} className={`cursor-pointer text-red-500 underline`}>Setup OpenAPI Key</span>}
      <span onClick={onClickRecent as any} className='cursor-pointer'>Recent</span>
      <a href='https://github.com/huan9huan/chat-tabular' target='_blank;'>Github</a>
    </div>
    <NameInputDialog value={name || 'untitled'} isOpen={isDlgOpen}
      onClose={() => setIsModalOpen(false)}
      onDelete={() => {
        setIsModalOpen(false);
        onDelete();
      }}
      onSubmit={(value: string) => {
        setIsModalOpen(false);
        onChangeName(value);
      }}
    />
  </div>
}

export default Header;