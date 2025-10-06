import './common/styles/app.css';
import './common/styles/table.css';
import {
  BrowserRouter as Router,
  Route,
  Routes
} from "react-router-dom";

import { TopPanel } from './common/components/top-panel.tsx';
import { ContestPage } from './pages/contest-page';
import { PersonPage } from './pages/person-page';
import { RegionPage } from './pages/region-page';
import { InstitutionPage } from './pages/institution-page';
import { MainPage } from './pages/main-page';
import { RankingPage } from './pages/ranking-page';
import { ContestPages } from './pages/contests-page';
import { RegionPages } from './pages/regions-page';

export default function App() {
  return (
    <Router>
      <TopPanel />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/person/:id" element={<PersonPage />} />
        <Route path="/contests" element={<ContestPages />} />
        <Route path="/contest/:id/:grade" element={<ContestPage />} />
        <Route path="/regions" element={<RegionPages />} />
        <Route path="/region/:region" element={<RegionPage />} />
        <Route path="/institution/:id" element={<InstitutionPage />} />
      </Routes>
    </Router>
  );
}