import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './AppShell';
import Home from './pages/Home';
import Tank from './pages/Tank';
import Community from './pages/Community';
import Notes from './pages/Notes';
import Plans from './pages/Plans';
import Diagnostics from './pages/Diagnostics';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/tank" element={<Tank />} />
          <Route path="/community" element={<Community />} />
          <Route path="/notes" element={<Notes />} />
          {/* Drawer-linked routes */}
          <Route path="/plans" element={<Plans />} />
          <Route path="/diagnostics" element={<Diagnostics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

