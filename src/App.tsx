import React, { useEffect } from 'react';
import ChatUI from './components/ChatUI';

function App() {
  useEffect(()=> {
    (window as any).google.charts.load('current', {packages: ['corechart']});
  }, []);
  return (
    <div className="container mx-auto">
      <ChatUI openaiKey={process.env.REACT_APP_OPENAI_KEY}/>
    </div>
  );
}

export default App;
