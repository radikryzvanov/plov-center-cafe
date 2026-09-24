import { Component, inject, signal } from '@angular/core';
import { ComboMeal } from './combo.model';
import { QuickOrderStore } from './quick-order.store';

@Component({
  selector: 'app-plov-landing',
  standalone: true,
  template: `
    <main class="plov-app">
      <!-- 1. Верхняя плашка со статусом казана -->
      <aside class="status-banner">
        <span class="status-pulse"></span>
        <p>Казан открыт: <strong>Свежий ташкентский плов готов!</strong> (Ул. Рябикова, 89, 2 этаж)</p>
      </aside>

      <!-- 2. Hero-блок -->
      <section class="hero-section">
        <span class="halal-tag">100% Халяль Мясо</span>
        <h1>Горячий плов и восточная кухня в Ульяновске</h1>
        <p class="hero-desc">
          Сытные комбо-обеды для водителей, мастеров и офисов. Заберите без очереди горячим за 15 минут.
        </p>

        <div class="hero-actions">
          <a href="#combos" class="btn btn-primary">Выбрать обед</a>

          <!-- Кнопка перехода в Telegram-канал -->
          <a
            [href]="orderStore.telegramChannelUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-telegram">
            Наш Telegram-канал
          </a>
        </div>
      </section>

      <!-- 3. Секция Комбо-обедов -->
      <section id="combos" class="combos-section">
        <header class="section-head">
          <h2>Сытные комбо-обеды на вынос</h2>
          <p>Полноценный обед в одном наборе — дешевле и быстрее</p>
        </header>

        <div class="combos-grid">
          @for (combo of comboList(); track combo.id) {
            <article
              class="combo-card"
              [class.is-selected]="orderStore.selectedCombo()?.id === combo.id"
              (click)="orderStore.selectCombo(combo)">

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
                    [class.active]="orderStore.selectedCombo()?.id === combo.id">
                    {{ orderStore.selectedCombo()?.id === combo.id ? 'Выбрано' : 'Выбрать' }}
                  </button>
                </div>
              </div>
            </article>
          }
        </div>

        <!-- Нижняя плашка быстрого заказа в Telegram -->
        @if (orderStore.selectedCombo(); as activeCombo) {
          <div class="order-dock">
            <div class="dock-summary">
              <strong>{{ activeCombo.title }}</strong>
              <span>Итого: {{ activeCombo.price }} ₽</span>
            </div>

            <a
              [href]="orderStore.telegramOrderUrl()"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-tg-order">
              Заказать в Telegram
            </a>
          </div>
        }
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
      --tg-color: #229ed9;
      display: block;
      background-color: var(--bg-dark);
      color: var(--text);
      min-height: 100vh;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .status-banner {
      background: #451a03;
      border-bottom: 1px solid #78350f;
      padding: 0.6rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.85rem;
    }
    .status-pulse {
      width: 10px;
      height: 10px;
      background: #22c55e;
      border-radius: 50%;
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
      animation: pulse 1.8s infinite;
    }
    @keyframes pulse {
      70% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
      100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
    }
    .hero-section {
      padding: 3rem 1.25rem 2rem;
      text-align: center;
      max-width: 680px;
      margin: 0 auto;
    }
    .halal-tag {
      background: #14532d;
      color: #86efac;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 999px;
    }
    h1 {
      font-size: 1.9rem;
      line-height: 1.2;
      margin: 1rem 0 0.8rem;
    }
    .hero-desc {
      color: var(--text-muted);
      font-size: 0.95rem;
      margin-bottom: 1.5rem;
    }
    .hero-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    .btn {
      padding: 0.7rem 1.25rem;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      font-size: 0.9rem;
    }
    .btn-primary { background: var(--primary); color: #fff; }
    .btn-telegram {
      background: #1e293b;
      color: #38bdf8;
      border: 1px solid #0284c7;
    }
    .combos-section {
      padding: 2rem 1.25rem 6rem;
      max-width: 900px;
      margin: 0 auto;
    }
    .section-head {
      margin-bottom: 1.5rem;
      text-align: center;
    }
    .combos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.25rem;
    }
    .combo-card {
      background: var(--surface);
      border: 2px solid #44403c;
      border-radius: 12px;
      padding: 1.25rem;
      position: relative;
      cursor: pointer;
    }
    .combo-card.is-selected { border-color: var(--primary); }
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
    }
    .combo-composition {
      list-style: none;
      padding: 0;
      margin: 1rem 0;
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .combo-composition li { margin-bottom: 0.25rem; }
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #44403c;
      padding-top: 0.8rem;
    }
    .current-price { font-size: 1.25rem; font-weight: 700; }
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
      padding: 0.4rem 0.9rem;
      border-radius: 6px;
      cursor: pointer;
    }
    .btn-select.active { background: var(--primary); }
    .order-dock {
      position: fixed;
      bottom: 1rem;
      left: 1rem;
      right: 1rem;
      max-width: 480px;
      margin: 0 auto;
      background: #0c0a09;
      border: 1px solid var(--primary);
      border-radius: 10px;
      padding: 0.8rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    .dock-summary {
      display: flex;
      flex-direction: column;
      font-size: 0.85rem;
    }
    .btn-tg-order {
      background: var(--tg-color);
      color: #fff;
      text-decoration: none;
      padding: 0.55rem 1rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.85rem;
    }
  `]
})
export class PlovLandingComponent {
  readonly orderStore = inject(QuickOrderStore);

  readonly comboList = signal<ComboMeal[]>([
    {
      id: 'lunch-express',
      title: 'Обед «Ташкентский экспресс»',
      badge: 'Хит обеда',
      description: 'Идеально для плотного перекуса на смене.',
      weightGrams: 620,
      items: [
        'Плов Чайханский с говядиной (350г)',
        'Салат Ачичук со сладким луком',
        'Горячая тандырная лепешка',
        'Чай зеленый №95'
      ],
      price: 390,
      oldPrice: 460
    },
    {
      id: 'lunch-meat',
      title: 'Обед «Богатырь»',
      badge: 'Максимум сытности',
      description: 'Для тех, кто сильно проголодался.',
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
      description: 'Ароматный люля-кебаб на углях.',
      weightGrams: 550,
      items: [
        'Люля-кебаб из говядины (2 шпажки)',
        'Маринованный лук с сумахом',
        'Печеный картофель с курдюком',
        'Лепешка и соус'
      ],
      price: 430,
      oldPrice: 490
    }
  ]);
}