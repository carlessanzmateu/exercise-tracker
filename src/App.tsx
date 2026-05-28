import { Route, Routes } from 'react-router-dom';

import '@/styles/main.css';

import { TabBar } from '@/components/TabBar';
import { Feed } from '@/features/feed/Feed';
import { Progress } from '@/features/progress/Progress';
import { NewSession } from '@/features/session-new/NewSession';
import { SessionDetail } from '@/features/session-detail/SessionDetail';
import { Settings } from '@/features/settings/Settings';
import { Weight } from '@/features/weight/Weight';

function App() {
  return (
    <>
      <h1 className="sr-only">Exercise Tracker</h1>
      <main className="app-shell">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/new" element={<NewSession />} />
          <Route path="/session/:id" element={<SessionDetail />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/weight" element={<Weight />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <TabBar />
    </>
  );
}

export default App;
