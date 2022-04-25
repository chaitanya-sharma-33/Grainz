import i18n from 'i18n-js';
import memoize from 'lodash.memoize';
import {I18nManager} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const translationGetters = {
  fr: () => require('../translations/fr.json'),
  en: () => require('../translations/en.json'),
};

export const translate = memoize(
  (key, config) => i18n.t(key, config),
  (key, config) => (config ? key + JSON.stringify(config) : key),
);

export const setI18nConfig = async () => {
  const lang = await AsyncStorage.getItem('Language');
  if (lang !== null && lang !== undefined) {
    const fallback = {languageTag: lang, isRTL: false};
    const {languageTag, isRTL} =
      // RNLocalize.findBestAvailableLanguage(Object.keys(translationGetters)) ||
      // fallback;
      fallback;
    // clear translation cache
    translate.cache.clear();
    // update layout direction
    I18nManager.forceRTL(isRTL);
    // set i18n-js config
    i18n.translations = {[languageTag]: translationGetters[languageTag]()};
    i18n.locale = languageTag;
  } else {
    alert('yes');
  }
};
