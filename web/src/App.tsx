import './common/styles/app.css';
import './common/styles/table.css';
import {
  BrowserRouter as Router,
  Route,
  Routes
} from "react-router-dom";

import { TopPanel } from './common/components/top-panel.tsx';
import { ContestResultsPage } from './pages/contest-results-page.tsx';
import { PersonPage } from './pages/person-page';
import { RegionPage } from './pages/region-page';
import { InstitutionPage } from './pages/institution-page';
import { MainPage } from './pages/main-page';
import { RankingPage } from './pages/ranking-page';
import { InstitutionsRankingPage } from './pages/institutions-ranking-page';
import { RegionsRankingPage } from './pages/regions-ranking-page';
import { ContestPages } from './pages/contests-page';
import { RegionPages } from './pages/regions-page';
import { ContestInfoPage } from './pages/contest-info-page.tsx';

export default function App() {
  return (
    <Router>
      <TopPanel />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/rankings/people" element={<RankingPage />} />
        <Route path="/rankings/institutions" element={<InstitutionsRankingPage />} />
        <Route path="/rankings/regions" element={<RegionsRankingPage />} />
        <Route path="/person/:id" element={<PersonPage />} />
        <Route path="/contests" element={<ContestPages />} />
        <Route path="/contest/:id/:grade" element={<ContestResultsPage />} />
        <Route path="/contest/:id" element={<ContestInfoPage />} />
        <Route path="/regions" element={<RegionPages />} />
        <Route path="/region/:region" element={<RegionPage />} />
        <Route path="/institution/:id" element={<InstitutionPage />} />
      </Routes>
    </Router>
  );
}