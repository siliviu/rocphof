import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";

import lightIcon from "../assets/light.png";
import darkIcon from "../assets/dark.png";
import gbFlag from "../assets/gb.png";
import roFlag from "../assets/ro.png";

export const TopPanel = () => {
  const { t, i18n } = useTranslation();

  const cachedDarkMode = localStorage.getItem("darkMode");
  const cachedLanguage = localStorage.getItem("language");
  const prefersDarkMode = useMediaQuery({ query: "(prefers-color-scheme: dark)" });
  const [isDark, setIsDark] = useState(
    cachedDarkMode !== null ? cachedDarkMode === "true" : prefersDarkMode
  );

  useEffect(() => {
    if (cachedLanguage) {
      i18n.changeLanguage(cachedLanguage);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language !== "ro" ? "ro" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("language", newLang);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
  };

  useEffect(() => {
    if (isDark) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <div className="top-panel">
      <img
        src={i18n.language !== "ro" ? gbFlag : roFlag}
        alt={t("Toggle language")}
        title={t("Toggle language")}
        onClick={toggleLanguage}
        className="language-icon"
      />
      <p>
        <Link className="title" to="/">
          {t("ROCPHOF")}
        </Link>
      </p>
      <img
        src={isDark ? darkIcon : lightIcon}
        alt={t("Toggle theme")}
        title={t("Toggle theme")}
        onClick={toggleDarkMode}
        className="theme-icon"
      />
    </div>
  );
};
