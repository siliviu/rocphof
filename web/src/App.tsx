import './App.css';
import './table.css';
import {
  BrowserRouter as Router,
  Route,
  Routes
} from "react-router-dom";

import { TopPanel } from './components/top-panel.tsx';
import { ContestPage } from './components/contest-page.tsx';
import { PersonPage } from './components/person-page.tsx';
import { RegionPage } from './components/region-page.tsx';
import { InstitutionPage } from './components/institution-page.tsx';
import { MainPage } from './components/main-page.tsx';
import { RankingPage } from './components/ranking-page.tsx';
import { ContestPages } from './components/contests-page.tsx';
import { RegionPages } from './components/regions-page.tsx';

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