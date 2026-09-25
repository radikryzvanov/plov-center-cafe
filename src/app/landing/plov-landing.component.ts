import { Component, inject, signal } from '@angular/core';
import { ComboMeal } from './combo.model';
import { QuickOrderStore } from './quick-order.store';

@Component({
  selector: 'app-plov-landing',
  standalone: true,
  template: `
    <main class="plov-app">
      <!-- 1. Чистые фоновые фото без плашек и надписей -->
      <div class="culture-backdrop" aria-hidden="true">
        <div class="side-photo left-photo"></div>
        <div class="center-blackout"></div>
        <div class="side-photo right-photo"></div>
      </div>

      <!-- 2. Рабочий контент -->
      <div class="page-content">
        <header class="hero-section">
          <!-- Печать Халяль -->
          <div class="halal-seal-wrapper">
            <svg class="halal-seal-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="47" stroke="#ca8a04" stroke-width="1.5" stroke-dasharray="2.5 2.5"/>
              <rect x="22" y="22" width="56" height="56" rx="4" fill="#064e3b" stroke="#eab308" stroke-width="2" />
              <rect x="22" y="22" width="56" height="56" rx="4" fill="#064e3b" stroke="#eab308" stroke-width="2" transform="rotate(45 50 50)" />
              <circle cx="50" cy="50" r="28" fill="#042f2e" stroke="#ca8a04" stroke-width="1.2"/>
              <text x="50" y="55" font-size="20" font-weight="bold" fill="#fef08a" text-anchor="middle" font-family="serif">حلال</text>
              <text x="50" y="66" font-size="7" font-weight="bold" fill="#86efac" text-anchor="middle" letter-spacing="1">HALAL</text>
            </svg>
          </div>

          <h1>Плов Центр</h1>
          <p class="address">Ульяновск, ул. Рябикова, 89 (2 этаж)</p>
          <p class="tagline">Традиции Востока — на берегах Волги</p>
          <p class="hero-desc">
            Сытные восточные обеды. Выберите комбо и заберите горячим без очереди за 15 минут.
          </p>
        </header>

        <!-- Меню комбо-обедов -->
        <section class="combos-section">
          <header class="section-head">
            <h2>Комбо-обеды на вынос</h2>
            <p>Свежие порции прямо из казана и с мангала</p>
          </header>

          <div class="combos-grid">
            @for (combo of comboList(); track combo.id) {
              <article
                class="combo-card"
                [class.is-selected]="orderStore.selectedCombo()?.id === combo.id">

                @if (combo.badge) {
                  <span class="badge">{{ combo.badge }}</span>
                }

                <div class="combo-info">
                  <h3>{{ combo.title }}</h3>
                  <span class="weight">{{ combo.weightGrams }} г</span>
                  <p class="desc">{{ combo.description }}</p>

                  <ul class="combo-composition">
                    @for (item of combo.items; track item) {
                      <li>✔ {{ item }}</li>
                    }
                  </ul>
                </div>

                <!-- Цены и кнопка выбора -->
                <div class="card-footer">
                  <div class="price-box">
                    <span class="current-price">{{ combo.price }} ₽</span>
                    @if (combo.oldPrice) {
                      <span class="old-price">{{ combo.oldPrice }} ₽</span>
                    }
                  </div>

                  <button
                    type="button"
                    class="btn-select"
                    [class.active]="orderStore.selectedCombo()?.id === combo.id"
                    (click)="orderStore.selectCombo(combo)">
                    {{ orderStore.selectedCombo()?.id === combo.id ? 'Выбрано' : 'Выбрать' }}
                  </button>
                </div>

                <!-- Блок заказа внутри выбранной карточки -->
                @if (orderStore.selectedCombo()?.id === combo.id) {
                  <div class="inline-order-block">
                    <div class="time-picker-block">
                      <span class="time-label">Время готовности:</span>
                      <div class="time-options">
                        @for (preset of timePresets; track preset) {
                          <button
                            type="button"
                            class="time-chip"
                            [class.active]="orderStore.pickupTime() === preset"
                            (click)="orderStore.setPickupTime(preset)">
                            {{ preset }}
                          </button>
                        }
                      </div>

                      <div class="custom-time-row">
                        <span>Или ко времени:</span>
                        <input
                          type="time"
                          class="time-input"
                          (change)="onCustomTimeChange($event)" />
                      </div>
                    </div>

                    <div class="order-buttons">
                      <a
                        [href]="orderStore.whatsappOrderUrl()"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="btn-order btn-whatsapp">
                        В WhatsApp
                      </a>
                      <a
                        [href]="orderStore.telegramOrderUrl()"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="btn-order btn-telegram">
                        В Telegram
                      </a>
                    </div>
                  </div>
                }
              </article>
            }
          </div>
        </section>
      </div>
    </main>
  `,
  styles: [`
    :host {
      --pure-black: #0c0a09;
      --card-bg: rgba(22, 19, 18, 0.95);
      --card-border: #292524;
      --red-accent: #dc2626;
      --text-white: #fafaf9;
      --text-gray: #a8a29e;
      --gold: #f59e0b;

      display: block;
      background-color: var(--pure-black);
      color: var(--text-white);
      min-height: 100vh;
      font-family: system-ui, -apple-system, sans-serif;
      position: relative;
    }

    /* Фоновый слой на всю высоту */
    .culture-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      display: flex;
      pointer-events: none;
      z-index: 0;
    }

    .side-photo {
      flex: 1;
      height: 100%;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      opacity: 0.45;
    }

    .left-photo {
      background-image: url('/assets/pamir.jpg');
    }

    .right-photo {
      background-image: url('/assets/volga.jpg');
    }

    /* Чёрный коридор по центру для идеального чтения меню */
    .center-blackout {
      width: 760px;
      max-width: 58vw;
      height: 100%;
      background: var(--pure-black);
      box-shadow: 0 0 90px 70px var(--pure-black);
    }

    /* Рабочий контент */
    .page-content {
      position: relative;
      z-index: 1;
    }

    .hero-section {
      padding: 3rem 1.5rem 1.5rem;
      text-align: center;
      max-width: 650px;
      margin: 0 auto;
    }

    .halal-seal-wrapper {
      display: inline-flex;
      justify-content: center;
      margin-bottom: 0.5rem;
    }

    .halal-seal-svg {
      width: 72px;
      height: 72px;
      filter: drop-shadow(0 4px 12px rgba(6, 78, 59, 0.4));
    }

    h1 {
      font-size: 2.5rem;
      margin: 0.3rem 0;
      color: #ffffff;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .address {
      color: var(--red-accent);
      font-size: 1rem;
      font-weight: 700;
      margin: 0 0 0.3rem;
    }

    .tagline {
      color: var(--gold);
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 0.6rem;
    }

    .hero-desc {
      color: var(--text-gray);
      font-size: 0.95rem;
      line-height: 1.5;
    }

    /* Меню комбо */
    .combos-section {
      padding: 1.5rem 1.5rem 5rem;
      max-width: 1060px;
      margin: 0 auto;
    }

    .section-head {
      margin-bottom: 2rem;
      text-align: center;
    }

    .section-head h2 {
      font-size: 1.55rem;
      margin-bottom: 0.4rem;
      color: #ffffff;
    }

    .section-head p {
      color: var(--text-gray);
      font-size: 0.9rem;
    }

    .combos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
      gap: 1.5rem;
      align-items: start;
    }

    .combo-card {
      background: var(--card-bg);
      backdrop-filter: blur(8px);
      border: 1.5px solid var(--card-border);
      border-radius: 14px;
      padding: 1.4rem;
      position: relative;
      display: flex;
      flex-direction: column;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
      transition: border-color 0.2s ease;
    }

    .combo-card.is-selected {
      border-color: var(--red-accent);
      box-shadow: 0 0 20px rgba(220, 38, 38, 0.25);
    }

    .badge {
      position: absolute;
      top: -11px;
      right: 14px;
      background: var(--red-accent);
      color: #ffffff;
      font-size: 0.75rem;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      font-weight: 700;
    }

    .combo-info h3 {
      font-size: 1.25rem;
      color: #ffffff;
      margin-top: 0.2rem;
    }

    .weight {
      display: inline-block;
      font-size: 0.8rem;
      color: var(--gold);
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .desc {
      font-size: 0.85rem;
      color: var(--text-gray);
      line-height: 1.4;
    }

    .combo-composition {
      list-style: none;
      padding: 0;
      margin: 1rem 0;
      font-size: 0.85rem;
      color: #e5e5e5;
    }

    .combo-composition li {
      margin-bottom: 0.4rem;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--card-border);
      padding-top: 1rem;
    }

    .current-price {
      font-size: 1.45rem;
      font-weight: 800;
      color: #ffffff;
    }

    .old-price {
      text-decoration: line-through;
      color: #737373;
      font-size: 0.85rem;
      margin-left: 0.4rem;
    }

    .btn-select {
      background: #262626;
      color: #ffffff;
      border: 1px solid #404040;
      padding: 0.5rem 1.15rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }

    .btn-select.active {
      background: var(--red-accent);
      border-color: var(--red-accent);
      color: #ffffff;
    }

    .inline-order-block {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px dashed #404040;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      animation: fadeIn 0.2s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .time-picker-block {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .time-label {
      font-size: 0.8rem;
      color: var(--text-gray);
    }

    .time-options {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .time-chip {
      background: #1a1a1a;
      color: #e5e5e5;
      border: 1px solid #333333;
      padding: 0.35rem 0.6rem;
      border-radius: 6px;
      font-size: 0.75rem;
      cursor: pointer;
    }

    .time-chip.active {
      border-color: var(--red-accent);
      background: #450a0a;
      color: #fca5a5;
      font-weight: 700;
    }

    .custom-time-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.8rem;
      color: var(--text-gray);
      margin-top: 0.2rem;
    }

    .time-input {
      background: #1a1a1a;
      border: 1px solid #333333;
      color: #ffffff;
      padding: 0.25rem 0.4rem;
      border-radius: 6px;
      font-size: 0.8rem;
    }

    .order-buttons {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.2rem;
    }

    .btn-order {
      flex: 1;
      text-align: center;
      text-decoration: none;
      padding: 0.65rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.85rem;
      color: #fff;
    }

    .btn-whatsapp { background: #16a34a; }
    .btn-telegram { background: #0284c7; }

    @media (max-width: 900px) {
      .culture-backdrop { opacity: 0.2; }
    }
  `]
})
export class PlovLandingComponent {
  readonly orderStore = inject(QuickOrderStore);

  readonly timePresets = [
    'Как можно скорее (~15 мин)',
    'Через 30 мин',
    'Через 1 час'
  ];

  onCustomTimeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.orderStore.setPickupTime(`К ${input.value}`);
    }
  }

  readonly comboList = signal<ComboMeal[]>([
    {
      id: 'lunch-express',
      title: 'Обед «Ташкентский экспресс»',
      badge: 'Хит',
      description: 'Сытный обед для перекуса на смене или в дороге.',
      weightGrams: 620,
      items: [
        'Плов Чайханский с говядиной (350г)',
        'Салат Ачичук',
        'Горячая тандырная лепешка',
        'Чай зеленый №95'
      ],
      price: 390,
      oldPrice: 460
    },
    {
      id: 'lunch-meat',
      title: 'Обед «Богатырь»',
      badge: 'Сытный',
      description: 'Большая порция для тех, кто сильно проголодался.',
      weightGrams: 780,
      items: [
        'Наваристый Уйгурский лагман (400г)',
        'Манты с рубленым мясом (2 шт)',
        'Томатный соус Лазджан',
        'Тандырная лепешка'
      ],
      price: 480,
      oldPrice: 550
    },
    {
      id: 'lunch-grill',
      title: 'Обед «С мангала»',
      description: 'Ароматный люля-кебаб на углях с гарниром.',
      weightGrams: 550,
      items: [
        'Люля-кебаб из говядины (2 шпажки)',
        'Маринованный лук с сумахом',
        'Печеный картофель',
        'Лепешка и соус'
      ],
      price: 430,
      oldPrice: 490
    }
  ]);
}