import './App.css'
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom"

import { ContestPage } from './components/contest-page.tsx'
import { PersonPage } from './components/person-page.tsx'
import { RegionPage } from './components/region-page.tsx'
import { InstitutionPage } from './components/institution-page.tsx'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/person/:id" element={<PersonPage />} />
        <Route path="/contest/:id/:grade" element={<ContestPage />} />
        <Route path="/region/:region" element={<RegionPage />} />
        <Route path="/institution/:id" element={<InstitutionPage />} />
      </Routes>
    </Router>
  );
}