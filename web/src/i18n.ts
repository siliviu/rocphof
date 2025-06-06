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

i18n.use(initReactI18next).init({
    resources,
    lng: localStorage.getItem("language") || 'en',
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
