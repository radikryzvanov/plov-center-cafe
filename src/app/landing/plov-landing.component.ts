import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { SITE } from '../site.config';
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

  // Контакты и режим демо лежат в site.config.ts
  protected readonly site = SITE;
  protected readonly mapUrl = SITE.mapUrl;
  protected readonly whatsappUrl = SITE.whatsappUrl;
  protected readonly maxUrl = SITE.maxUrl;
  protected readonly vkUrl = SITE.vkUrl;

  protected readonly timePresets = ['Как можно скорее', 'Через 30 минут', 'Через 1 час'];

  // Две бегущие ленты: список повторяется, чтобы лента не обрывалась на широких экранах
  protected readonly tickerA = repeat(['Плов', 'Лагман', 'Шурпа', 'Манты', 'Шашлык', 'Лепёшки', 'Халяль'], 4);
  protected readonly tickerB = repeat(
    ['Забирайте горячим', 'Рябикова, 89', 'Плов от 300 ₽', 'Самовывоз', 'Заказ в мессенджер'],
    4
  );

  // «Ещё готовим»: блюда с фото, цены уточняются у кафе
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
  protected readonly toast = signal('');
  private toastTimer?: ReturnType<typeof setTimeout>;
  protected readonly isCustomTime = signal(false);

  private readonly heroVideo = viewChild<ElementRef<HTMLVideoElement>>('heroVideo');
  private readonly demoBar = viewChild<ElementRef<HTMLElement>>('demoBar');

  // Плашка «Демо-версия» лежит в начале страницы и уезжает вверх при прокрутке,
  // а закреплённая шапка поднимается вслед за ней: до самого верха экрана.
  protected readonly barOffset = signal(0);

  constructor() {
    afterNextRender(() => {
      const update = () => {
        const height = this.demoBar()?.nativeElement.offsetHeight ?? 0;
        this.barOffset.set(Math.max(0, height - window.scrollY));
      };
      update();
      window.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
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

  // В демо-версии контакты не работают: вместо перехода показываем подсказку
  protected onContact(event: Event): void {
    if (!SITE.demo) return;
    event.preventDefault();
    this.toast.set('Демо-версия: заказ никуда не отправляется.');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(''), 4500);
  }

  // Max и ВКонтакте не умеют подставлять текст в чат по ссылке — копируем заказ, гость вставляет его сам
  protected copyOrder(event: Event): void {
    if (SITE.demo) {
      this.onContact(event);
      return;
    }
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
