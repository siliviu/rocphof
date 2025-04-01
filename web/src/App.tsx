import './App.css';
import './table.css';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link
} from "react-router-dom";
import { useEffect, useState } from 'react';
import { useMediaQuery } from "react-responsive";

import lightIcon from './assets/light.png';
import darkIcon from './assets/dark.png';

import { ContestPage } from './components/contest-page.tsx';
import { PersonPage } from './components/person-page.tsx';
import { RegionPage } from './components/region-page.tsx';
import { InstitutionPage } from './components/institution-page.tsx';
import { MainPage } from './components/main-page.tsx';
import { RankingPage } from './components/ranking-page.tsx';
import { ContestPages } from './components/contests-page.tsx';
import { RegionPages } from './components/regions-page.tsx';

export default function App() {
  const [isDark, setIsDark] = useState(
    useMediaQuery(
      { query: "(prefers-color-scheme: dark)" }, undefined, dark => setIsDark(dark)
    )
  );

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <Router>
      <div className='top-panel'>
        <p><Link className='title' to="/">ROCPHOF</Link></p>
        <img
          src={isDark ? darkIcon : lightIcon}
          alt="Toggle theme"
          onClick={() => setIsDark(!isDark)}
          className="theme-icon"
        />
      </div>
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