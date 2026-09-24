import { Injectable, computed, signal } from '@angular/core';
import { ComboMeal } from './combo.model';

@Injectable({
  providedIn: 'root'
})
export class QuickOrderStore {
  readonly selectedCombo = signal<ComboMeal | null>(null);
  readonly pickupTime = signal<string>('К 13:00');

  // Юзернейм канала или аккаунта заведения в Telegram
  readonly telegramChannelUrl = 'https://t.me/plov_center_73';
  readonly telegramManagerUsername = 'plov_center_manager';

  selectCombo(combo: ComboMeal): void {
    this.selectedCombo.set(combo);
  }

  // Ссылка для отправки готового текста заказа в Telegram
  readonly telegramOrderUrl = computed(() => {
    const combo = this.selectedCombo();
    if (!combo) return null;

    const text = encodeURIComponent(
      `Ассаламу алейкум! Хочу заказать комбо на вынос:\n` +
      `📦 Набор: ${combo.title} (${combo.price} ₽)\n` +
      `⏰ Время готовности: ${this.pickupTime()}\n` +
      `Подтвердите, пожалуйста!`
    );

    return `https://t.me/${this.telegramManagerUsername}?text=${text}`;
  });
}