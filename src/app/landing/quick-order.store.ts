import { Injectable, computed, signal } from '@angular/core';
import { ComboMeal } from './combo.model';

@Injectable({
  providedIn: 'root'
})
export class QuickOrderStore {
  readonly selectedCombo = signal<ComboMeal | null>(null);

  // Время по умолчанию — ближайшие 15-20 минут
  readonly pickupTime = signal<string>('Как можно скорее (~15 мин)');

  private readonly cafePhone = '79176091988';

  selectCombo(combo: ComboMeal): void {
    this.selectedCombo.set(combo);
  }

  // Метод переключения времени
  setPickupTime(time: string): void {
    this.pickupTime.set(time);
  }

  private readonly orderMessage = computed(() => {
    const combo = this.selectedCombo();
    if (!combo) return '';

    const lines = [
      'Здравствуйте!',
      'Хочу заказать комбо на вынос:',
      `📦 Набор: ${combo.title} (${combo.price} ₽)`,
      `⏰ Время готовности: ${this.pickupTime()}`,
      'Подтвердите, пожалуйста!'
    ];

    return lines.map(line => encodeURIComponent(line)).join('%0A');
  });

  readonly whatsappOrderUrl = computed(() => {
    const msg = this.orderMessage();
    return msg ? `https://wa.me/${this.cafePhone}?text=${msg}` : null;
  });

  readonly telegramOrderUrl = computed(() => {
    const msg = this.orderMessage();
    return msg ? `https://t.me/+${this.cafePhone}?text=${msg}` : null;
  });
}