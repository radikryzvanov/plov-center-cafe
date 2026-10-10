import { computed, Injectable, signal } from '@angular/core';

export type MenuTone = 'saffron' | 'emerald' | 'night' | 'ivory' | 'lime';

export interface MenuItem {
  id: string;
  title: string;
  description: string;
  price: number;
  volume?: string;
  kind: 'plov' | 'drink' | 'salad';
  // Цвет плитки блюда на сайте
  tone: MenuTone;
  // Фото блюда (круг в углу плитки). Файл лежит в public/assets/photos
  photo?: string;
  // true — блюдо предлагается в окне заказа как «К заказу подойдёт» (чай, салат)
  suggest?: boolean;
}

export interface OrderLine {
  item: MenuItem;
  qty: number;
}

@Injectable({
  providedIn: 'root'
})
export class QuickOrderStore {
  // Телефон и WhatsApp кафе «Плов центр халяль» (Рябикова, 89) — из карточки на Яндекс Картах
  readonly cafePhone = '79176091988';

  // ВАЖНО: цены и описания взяты из карточки на Яндекс Картах (меню там давно не обновлялось).
  // Перед запуском сайта сверить с владельцем и при необходимости поправить здесь.
  readonly menu: MenuItem[] = [
    {
      id: 'plov-chaihana',
      title: 'Плов чайхана',
      description:
        'Рассыпчатый рис с обжаренной говяжьей ногой, морковью, луком, чесноком и традиционными специями.',
      price: 300,
      kind: 'plov',
      tone: 'saffron',
      photo: '/assets/photos/chaihana.jpg'
    },
    {
      id: 'plov-mix-manty',
      title: 'Плов микс с мантами',
      description: 'Плов с телятиной и двумя мантами. Сытный обед в одной тарелке.',
      price: 300,
      kind: 'plov',
      tone: 'emerald',
      photo: '/assets/photos/mix.jpg'
    },
    {
      id: 'plov-chef',
      title: 'Плов от шефа',
      description: 'Рис, нежная телятина, острый перец, лук, лимон и перепелиное яйцо.',
      price: 350,
      kind: 'plov',
      tone: 'night',
      photo: '/assets/photos/chef.jpg'
    },
    {
      id: 'tea-fruit',
      title: 'Чай фруктовый',
      description: 'Большой чайник на компанию.',
      price: 150,
      volume: '900 мл',
      kind: 'drink',
      tone: 'ivory',
      photo: '/assets/photos/tea.jpg',
      suggest: true
    },
    {
      id: 'salad-vitamin',
      title: 'Салат «Витаминный»',
      description: 'Лёгкий салат из свежих овощей к плову.',
      price: 150,
      kind: 'salad',
      tone: 'lime',
      suggest: true
    }
  ];

  readonly quantities = signal<Record<string, number>>({});
  readonly pickupTime = signal<string>('Как можно скорее');

  readonly lines = computed<OrderLine[]>(() => {
    const q = this.quantities();
    return this.menu
      .filter((item) => (q[item.id] ?? 0) > 0)
      .map((item) => ({ item, qty: q[item.id] }));
  });

  readonly totalCount = computed(() =>
    this.lines().reduce((sum, line) => sum + line.qty, 0)
  );

  readonly totalPrice = computed(() =>
    this.lines().reduce((sum, line) => sum + line.qty * line.item.price, 0)
  );

  // Мягкая подсказка «К заказу подойдёт»: чай и салат, пока их нет в заказе.
  // Показываем только когда в заказе уже есть основное блюдо.
  readonly suggestions = computed<MenuItem[]>(() => {
    const hasMain = this.lines().some((l) => !l.item.suggest);
    if (!hasMain) return [];
    return this.menu.filter((m) => m.suggest && this.qty(m.id) === 0);
  });

  qty(id: string): number {
    return this.quantities()[id] ?? 0;
  }

  add(id: string): void {
    this.quantities.update((q) => ({ ...q, [id]: (q[id] ?? 0) + 1 }));
  }

  remove(id: string): void {
    this.quantities.update((q) => {
      const next = { ...q };
      const current = next[id] ?? 0;
      if (current <= 1) {
        delete next[id];
      } else {
        next[id] = current - 1;
      }
      return next;
    });
  }

  clear(): void {
    this.quantities.set({});
  }

  setPickupTime(time: string): void {
    this.pickupTime.set(time);
  }

  readonly orderText = computed(() => {
    const lines = this.lines();
    if (lines.length === 0) return '';

    const rows = lines
      .map((l) => `• ${l.item.title} × ${l.qty} — ${l.item.price * l.qty} ₽`)
      .join('\n');

    return (
      `Здравствуйте! Хочу сделать предзаказ на самовывоз в «Плов Центр» (Рябикова, 89):\n\n` +
      `${rows}\n\n` +
      `Итого: ${this.totalPrice()} ₽\n` +
      `Время: ${this.pickupTime()}\n\n` +
      `Подтвердите, пожалуйста, заказ!`
    );
  });

  readonly whatsappOrderUrl = computed(() => {
    const text = encodeURIComponent(this.orderText());
    return `https://wa.me/${this.cafePhone}?text=${text}`;
  });
}
