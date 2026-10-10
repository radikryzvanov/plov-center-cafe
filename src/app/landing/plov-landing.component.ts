import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { QuickOrderStore } from './quick-order.store';

interface MoreDish {
  title: string;
  photo: string;
  alt: string;
}

const repeat = (words: string[], times: number): string[] =>
  Array.from({ length: times }, () => words).flat();

@Component({
  selector: 'app-plov-landing',
  templateUrl: './plov-landing.component.html',
  styleUrl: './plov-landing.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlovLandingComponent {
  protected readonly store = inject(QuickOrderStore);

  // Ссылки кафе. Max: ссылка-приглашение с карточки на Яндекс Картах — перед запуском проверить, что открывается.
  protected readonly mapUrl = 'https://yandex.ru/maps/org/plov_tsentr_khalyal/205389507410/';
  protected readonly whatsappUrl = 'https://wa.me/79176091988';
  protected readonly maxUrl = 'https://max.ru/join/TuvIpjuyexcxEON9Uwz5BG3IOzQO3PGf3tpKLYM9JGE';
  protected readonly vkUrl = 'https://vk.ru/id881658891';

  protected readonly timePresets = ['Как можно скорее', 'Через 30 минут', 'Через 1 час'];

  // Две бегущие ленты: список повторяется, чтобы лента не обрывалась на широких экранах
  protected readonly tickerA = repeat(['Плов', 'Лагман', 'Шурпа', 'Манты', 'Шашлык', 'Лепёшки', 'Халяль'], 4);
  protected readonly tickerB = repeat(
    ['Забирайте горячим', 'Рябикова, 89', 'Плов от 300 ₽', 'Самовывоз', 'Заказ в мессенджер'],
    4
  );

  // «Ещё готовим»: блюда с фото, цены уточняются по телефону
  protected readonly moreDishes: MoreDish[] = [
    { title: 'Лагман', photo: '/assets/photos/lagman.jpg', alt: 'Лагман в белой пиале на синей тарелке с узором' },
    { title: 'Жареный лагман', photo: '/assets/photos/lagman_fried.jpg', alt: 'Жареный лагман с мясом и зеленью' },
    { title: 'Куртоб', photo: '/assets/photos/kurtob.jpg', alt: 'Куртоб: мясо с овощами и зеленью в деревянной тарелке' },
    { title: 'Шашлык', photo: '/assets/photos/shashlik.jpg', alt: 'Шашлык с луком на тарелке' }
  ];
  protected readonly otherDishes = ['Шурпа', 'Манты', 'Люля-кебаб', 'Казан-кебаб', 'Лепёшки'];

  // Лёгкий наклон видео за курсором (только на устройствах с мышью)
  protected readonly tilt = signal('');
  protected readonly copied = signal(false);
  protected readonly isCustomTime = signal(false);

  private readonly heroVideo = viewChild<ElementRef<HTMLVideoElement>>('heroVideo');

  constructor() {
    afterNextRender(() => {
      const video = this.heroVideo()?.nativeElement;
      if (video) {
        video.muted = true;
        video.play().catch(() => {});
      }
    });
  }

  protected onTilt(event: MouseEvent): void {
    if (typeof window === 'undefined' || !window.matchMedia('(hover: hover)').matches) return;
    const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    this.tilt.set(`rotateY(${x * 18}deg) rotateX(${-y * 12}deg)`);
  }

  protected pickTime(time: string): void {
    this.isCustomTime.set(false);
    this.store.setPickupTime(time);
  }

  protected onCustomTime(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (!value) return;
    this.isCustomTime.set(true);
    this.store.setPickupTime(`к ${value}`);
  }

  // Max и ВКонтакте не умеют подставлять текст в чат по ссылке — копируем заказ, гость вставляет его сам
  protected copyOrder(): void {
    const text = this.store.orderText();
    const done = () => this.copied.set(true);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done, () => this.fallbackCopy(text, done));
    } else {
      this.fallbackCopy(text, done);
    }
  }

  private fallbackCopy(text: string, done: () => void): void {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand('copy');
      done();
    } finally {
      document.body.removeChild(area);
    }
  }
}
