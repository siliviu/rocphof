import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEn from './assets/locales/en.json';
import translationRo from './assets/locales/ro.json';

const resources = {
    en: {
        translation: translationEn,
    },
    ro: {
        translation: translationRo,
    },
};

const getBrowserLanguage = () => {
    const full = navigator.language;
    const base = full.split('-')[0];
    console.log(base);
    return base === 'ro' ? 'ro' : 'en';
};

i18n.use(initReactI18next).init({
    resources,
    lng: localStorage.getItem("language") || getBrowserLanguage(),
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
