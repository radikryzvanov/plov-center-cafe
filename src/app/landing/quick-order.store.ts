import { computed, Injectable, signal } from '@angular/core';
import { ComboMeal } from './combo.model';

@Injectable({
  providedIn: 'root'
})
export class QuickOrderStore {
  // Реальный номер телефона кафе "Плов Центр" на Рябикова 89
  readonly cafePhone = '79176091988';
  // Имя менеджера/бота в Telegram (или контакт для связи)
  readonly cafeTelegram = 'plovcenter73';

  readonly selectedCombo = signal<ComboMeal | null>(null);
  readonly pickupTime = signal<string>('Как можно скорее (~15 мин)');

  selectCombo(combo: ComboMeal): void {
    if (this.selectedCombo()?.id === combo.id) {
      this.selectedCombo.set(null);
    } else {
      this.selectedCombo.set(combo);
    }
  }

  setPickupTime(time: string): void {
    this.pickupTime.set(time);
  }

  readonly orderText = computed(() => {
    const combo = this.selectedCombo();
    if (!combo) return '';

    return (
      `Здравствуйте! Хочу сделать предзаказ в «Плов Центр» (Рябикова, 89):\n\n` +
      `🍲 ${combo.title} (${combo.price} ₽)\n` +
      `⏱ Время готовности: ${this.pickupTime()}\n\n` +
      `Подтвердите, пожалуйста, заказ!`
    );
  });

  readonly whatsappOrderUrl = computed(() => {
    const text = encodeURIComponent(this.orderText());
    return `https://wa.me/${this.cafePhone}?text=${text}`;
  });

  readonly telegramOrderUrl = computed(() => {
    const text = encodeURIComponent(this.orderText());
    return `https://t.me/share/url?url=https://t.me/${this.cafeTelegram}&text=${text}`;
  });
}