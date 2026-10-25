/**
 * Настройки сайта. Сейчас включена демо-версия: настоящие контакты кафе убраны,
 * заказ никуда не отправляется. Для рабочей версии укажите контакты и поставьте demo: false.
 */
export const SITE = {
  demo: true,
  /** Телефон для WhatsApp в международном формате без плюса, например 79001234567. */
  phone: '',
  phoneDisplay: '+7 (000) 000-00-00',
  whatsappUrl: '#',
  maxUrl: '#',
  vkUrl: '#',
  mapUrl: 'https://yandex.ru/maps/org/plov_tsentr_khalyal/205389507410/'
} as const;
