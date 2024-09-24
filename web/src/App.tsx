import './App.css'
import './table.css'
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link
} from "react-router-dom"

import { ContestPage } from './components/contest-page.tsx'
import { PersonPage } from './components/person-page.tsx'
import { RegionPage } from './components/region-page.tsx'
import { InstitutionPage } from './components/institution-page.tsx'
import { SearchPage } from './components/search-page.tsx'
import { RankingPage } from './components/ranking-page.tsx'

export default function App() {
  return (
    <Router>
      <div className='top-panel'>
        <p><Link className='title' to="/">ROCPHOF</Link></p>
      </div>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/person/:id" element={<PersonPage />} />
        <Route path="/contest/:id/:grade" element={<ContestPage />} />
        <Route path="/region/:region" element={<RegionPage />} />
        <Route path="/institution/:id" element={<InstitutionPage />} />
      </Routes>
    </Router>
  );
}