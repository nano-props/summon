import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { defaultLanguage, i18nResources } from '#/src/i18n-resources.ts'

i18n.use(initReactI18next).init({
  lng: defaultLanguage,
  fallbackLng: defaultLanguage,
  interpolation: { escapeValue: false },
  resources: i18nResources,
})

export { i18n }
