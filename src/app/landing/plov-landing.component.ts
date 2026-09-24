import { Component, inject, signal } from '@angular/core';
import { ComboMeal } from './combo.model';
import { QuickOrderStore } from './quick-order.store';

@Component({
  selector: 'app-plov-landing',
  standalone: true,
  template: `
    <main class="plov-app">
      <section class="hero-section">
        <!-- Только чистая печать без дублирующих текстовых строк снизу -->
        <div class="halal-seal-wrapper">
          <svg class="halal-seal-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="47" stroke="#eab308" stroke-width="1.5" stroke-dasharray="2.5 2.5"/>
            <rect x="22" y="22" width="56" height="56" rx="4" fill="#064e3b" stroke="#eab308" stroke-width="2" />
            <rect x="22" y="22" width="56" height="56" rx="4" fill="#064e3b" stroke="#eab308" stroke-width="2" transform="rotate(45 50 50)" />
            <circle cx="50" cy="50" r="28" fill="#042f2e" stroke="#ca8a04" stroke-width="1.2"/>
            <text x="50" y="55" font-size="20" font-weight="bold" fill="#fef08a" text-anchor="middle" font-family="serif">حلال</text>
            <text x="50" y="66" font-size="7" font-weight="bold" fill="#86efac" text-anchor="middle" letter-spacing="1">HALAL</text>
          </svg>
        </div>

        <h1>Плов Центр</h1>
        <p class="address">Ульяновск, ул. Рябикова, 89 (2 этаж)</p>
        <p class="hero-desc">
          Сытные восточные обеды. Выберите комбо и заберите горячим без очереди за 15 минут.
        </p>
      </section>

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

              <!-- Блок оформления внутри карточки -->
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
    </main>
  `,
  styles: [`
    :host {
      --primary: #d97706;
      --bg-dark: #1c1917;
      --surface: #292524;
      --text: #f5f5f4;
      --text-muted: #a8a29e;
      --gold: #eab308;
      display: block;
      background-color: var(--bg-dark);
      color: var(--text);
      min-height: 100vh;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .hero-section {
      padding: 2.2rem 1.25rem 1rem;
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
    }

    .halal-seal-wrapper {
      display: inline-flex;
      justify-content: center;
      margin-bottom: 0.5rem;
    }

    .halal-seal-svg {
      width: 74px;
      height: 74px;
      filter: drop-shadow(0 4px 12px rgba(6, 78, 59, 0.45));
    }

    h1 {
      font-size: 2.2rem;
      margin: 0.3rem 0 0.2rem;
      letter-spacing: -0.02em;
    }

    .address {
      color: var(--primary);
      font-size: 0.9rem;
      font-weight: 500;
      margin-bottom: 0.6rem;
    }

    .hero-desc {
      color: var(--text-muted);
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .combos-section {
      padding: 1.5rem 1.25rem 4rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    .section-head {
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .section-head h2 {
      font-size: 1.4rem;
      margin-bottom: 0.3rem;
    }

    .section-head p {
      color: var(--text-muted);
      font-size: 0.85rem;
    }

    .combos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.25rem;
      align-items: start;
    }

    .combo-card {
      background: var(--surface);
      border: 2px solid #44403c;
      border-radius: 12px;
      padding: 1.25rem;
      position: relative;
      display: flex;
      flex-direction: column;
      transition: border-color 0.2s ease;
    }

    .combo-card.is-selected {
      border-color: var(--primary);
      box-shadow: 0 4px 20px rgba(217, 119, 6, 0.15);
    }

    .badge {
      position: absolute;
      top: -10px;
      right: 12px;
      background: var(--primary);
      color: #fff;
      font-size: 0.75rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-weight: bold;
    }

    .weight {
      display: inline-block;
      font-size: 0.8rem;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }

    .desc {
      font-size: 0.85rem;
      color: var(--text-muted);
      line-height: 1.4;
    }

    .combo-composition {
      list-style: none;
      padding: 0;
      margin: 1rem 0;
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .combo-composition li {
      margin-bottom: 0.35rem;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #44403c;
      padding-top: 0.8rem;
    }

    .current-price {
      font-size: 1.3rem;
      font-weight: 700;
    }

    .old-price {
      text-decoration: line-through;
      color: var(--text-muted);
      font-size: 0.85rem;
      margin-left: 0.4rem;
    }

    .btn-select {
      background: #44403c;
      color: #fff;
      border: none;
      padding: 0.45rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-select.active {
      background: var(--primary);
    }

    .inline-order-block {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px dashed #57534e;
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
      color: var(--text-muted);
    }

    .time-options {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .time-chip {
      background: #1c1917;
      color: var(--text);
      border: 1px solid #44403c;
      padding: 0.3rem 0.55rem;
      border-radius: 6px;
      font-size: 0.75rem;
      cursor: pointer;
    }

    .time-chip.active {
      border-color: var(--primary);
      background: #451a03;
      color: #fbbf24;
      font-weight: 600;
    }

    .custom-time-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 0.2rem;
    }

    .time-input {
      background: #1c1917;
      border: 1px solid #44403c;
      color: #fff;
      padding: 0.25rem 0.4rem;
      border-radius: 6px;
      font-size: 0.8rem;
    }

    .order-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .btn-order {
      flex: 1;
      text-align: center;
      text-decoration: none;
      padding: 0.6rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.85rem;
      color: #fff;
    }

    .btn-whatsapp { background: #22c55e; }
    .btn-telegram { background: #0284c7; }
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