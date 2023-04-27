import React, { useEffect, useState } from 'react';
import TabularChatUI from './components/TabularChatUI'
import 'react-data-grid/lib/styles.css';
import { Header } from './components/header';
import { localStore, StoreID } from './utils/store';
import OpenAiKeyInputDialog from './components/OpenAiKeyInputDialog';
import { Tabluars } from '../types';
import OpenRecentsDialog from './components/OpenRecentsDialog';


const samples = [
  {url: `/data/titanic.csv`,
  name: "Titanic",
  suggested: 'What is the survival rate by passenger class (Pclass)?',
  insightModel: "GPT4",
  insights: [
    "What is the survival rate by passenger class (Pclass)?",
    "How does the distribution of fares (Fare) differ between the different ports of embarkation (Embarked)?",
    "Are there any correlations between age (Age) and survival (Survived)?",
    "What is the average fare (Fare) for each passenger class (Pclass)?",
    "How do the number of siblings/spouses (SibSp) and parents/children (Parch) on board relate to survival rate (Survived)?"
  ]},
  {url: `/data/iris.csv`,
  suggested: 'Which species has the highest and lowest sepal width?',
  name: "Iris",
  insightModel: "GPT4",
  insights: [
    "Which species has the highest and lowest sepal width?",
    "What is the distribution of petal width for each species?",
    "How does the average PetalLengthCm differ between Species?",
    "What is the distribution of PetalWidthCm values for each Species?",
    "Are there any outliers in SepalLengthCm or SepalWidthCm within each Species?",
    // "Is there a relationship between sepal length and species classification?",
    // "What is the correlation between SepalLengthCm and SepalWidthCm for each Species?",
    // "Which features (SepalLengthCm, SepalWidthCm, PetalLengthCm, PetalWidthCm) are the most significant in distinguishing Species?"
  ]}
]

function App() {
  useEffect(()=> {
    (window as any).google.charts.load('current', {packages: ['corechart']});
  }, []);

  const [tabulars, setTabulars] = useState<Tabluars>();
  const [tabularId, setTabularId] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [isInputKeyDlgOpen, setIsModalOpen] = useState(false);
  const [isRecentDlgOpen, setIsRecentDlgOpen] = useState(false);

  useEffect(() => {
    let tabulars: Tabluars | undefined = localStore.get( StoreID.tabulars() );
    if(tabulars) {
      setTabulars(tabulars);
    } else {
      tabulars = {tabulars: []};
      setTabulars(tabulars);
      localStore.set(StoreID.tabulars(), tabulars);
    }
  }, []);

  useEffect(() => {
    const param = window.location.search && window.location.search.startsWith('?') ? window.location.search.substring(1) : '';
    const key = new URLSearchParams(param).get('id');
    if(key) {
      setTabularId(key);
    }
  }, []);
  
  const handleOpenaiKeyChange = (value: string) => {
    setIsModalOpen(false);
    setOpenaiKey(value);
    localStore.set(StoreID.openaiKey(), value);
  };
  const handleNameChange = (value: string) => {
    const old = (tabulars?.tabulars || []).find((t: {tid: string}) => t.tid === tabularId);
    if(old) {
      const newtabulars = (tabulars?.tabulars || []).filter(t => t.tid !== tabularId).concat([{...old, name: value}]);
      const updated = {...tabulars, tabulars: newtabulars}
      setTabulars(updated);
      localStore.set(StoreID.tabulars(), updated);
    }
  };

  const handleDeleteWorkspace = (tabularId: string) => {
    const chatIds: string[] | undefined = localStore.get(StoreID.tabularChatsId(tabularId));
    chatIds?.forEach(cid => {
      localStore.remove(StoreID.chatId(cid));
    });
    localStore.remove(StoreID.tabularDataId(tabularId || ''));
    localStore.remove(StoreID.tabularChatsId(tabularId || ''));
    localStore.remove(StoreID.tabularProfile(tabularId || ''));
    const newtabulars = (tabulars?.tabulars || []).filter(t => t.tid !== tabularId);
    const updated = {...tabulars, tabulars: newtabulars}
    setTabulars(updated);
    localStore.set(StoreID.tabulars(), updated);
    setTimeout(() => {
      (window as any).location = '/';
    }, 500)
  }

  useEffect(() => {
    const key = localStore.get(StoreID.openaiKey());
    if(key) {
      setOpenaiKey(key);
    }
  }, []);
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-2">
      <Header
        openaiKey={openaiKey}
        name={(tabulars?.tabulars || []).find(t => t.tid === tabularId)?.name}
        onChangeName={handleNameChange}
        onClickOpenaiKey={() => setIsModalOpen(true)}
        onDelete={() => handleDeleteWorkspace(tabularId)}
        onClickRecent={() => setIsRecentDlgOpen(true)}
        onGoHome={() => {
          (window as any).location = '/';
        }}
      />
 <TabularChatUI tabularId={tabularId} openaiKey={openaiKey} samples={samples} onCreateTabular={(tid: string, name: string) => {
        if(tabulars) {
          tabulars.tabulars.push({tid: tid, name, cts: new Date().getTime()});
          setTabulars(tabulars);
          localStore.set(StoreID.tabulars(), tabulars);
        }
      }}/>
      <OpenAiKeyInputDialog
        value={openaiKey}
        isOpen={isInputKeyDlgOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleOpenaiKeyChange}
      />
      <OpenRecentsDialog
        tabulars={tabulars?.tabulars || []}
        isOpen={isRecentDlgOpen}
        onClose={() => setIsRecentDlgOpen(false)}
        onOpen={(tid: string) =>  {
          setIsRecentDlgOpen(false);
          setTimeout(() => {
            (window as any).location = `/?id=${tid}`;
          }, 500);
        }}
        onDelete={async (tid: string) => {
          setIsRecentDlgOpen(false);
          await handleDeleteWorkspace(tid);
          setTimeout(() => {
            (window as any).location = `/`;
          }, 500);
        }}
      />
    </main>
  );
}

export default App;
