# Three Wins — Design Specification

**Автор**: Скай, креативный директор OpenClaw
**Дата**: 2026-03-29
**Версия**: 1.0

---

## 1. Вайб-борд

> Поздний вечер. Ты сидишь у костра где-то в горах.
> Вокруг тишина, только потрескивание дров.
> Ты достаёшь блокнот, пламя бросает тёплый свет на страницу.
> Записываешь три вещи, которые сегодня получились.
> Закрываешь блокнот. Пламя танцует. Всё хорошо.

**Ключевые ощущения**: тепло, покой, ритуал, награда без давления.

**Визуальные референсы**: костёр в темноте, тёплый свет на тёмной бумаге, янтарь, раскалённые угли. Никакого неона, никакого корпоративного минимализма — это живое, дышащее тепло.

---

## 2. Цветовая палитра (Dark Only)

### Фоновые тона

| Токен | Hex | Назначение |
|-------|-----|------------|
| `--bg-deep` | `#060606` | Основной фон body |
| `--bg-surface` | `#0F0F0F` | Карточки прошлых дней |
| `--bg-input` | `#1A1410` | Поля ввода (чуть теплее чёрного) |
| `--bg-input-focus` | `#1F1812` | Поле при фокусе |

### Тона пламени (5 уровней)

| Уровень | Название | Дни | Основной цвет | Средний | Яркий | Описание |
|---------|----------|-----|---------------|---------|-------|----------|
| 1 | Ember | 1-3 | `#8B2500` | `#CC4400` | `#E85D26` | Тлеющий уголёк. Едва живой, глубокий тёмно-красный |
| 2 | Flame | 4-7 | `#CC4400` | `#E8720A` | `#FF8C42` | Растущее пламя. Насыщенный оранжевый |
| 3 | Fire | 8-14 | `#E8720A` | `#FF9F1C` | `#FFB347` | Яркий костёр. Горячий оранж с золотыми переливами |
| 4 | Torch | 15-30 | `#FF9F1C` | `#FFD700` | `#FFE566` | Факел. Золото, сияющий жёлтый |
| 5 | Epic | 30+ | `#FFD700` | `#FFF1A8` | `#FFFFFF` | Epic flame. Золотой → белый, ослепительный |

### Текст

| Токен | Hex | Назначение |
|-------|-----|------------|
| `--text-primary` | `#F5F0EB` | Основной текст (тёплый белый) |
| `--text-secondary` | `#8A8078` | Дата, подписи |
| `--text-placeholder` | `#4A4440` | Placeholder в полях |
| `--text-streak` | наследует цвет текущего уровня | Число дней серии |

### Акценты

| Токен | Hex | Назначение |
|-------|-----|------------|
| `--accent-glow` | `#FF6B3520` | Тёплое свечение (20% opacity) |
| `--accent-border` | `#3D2B1F` | Границы полей ввода |
| `--accent-border-focus` | `#CC4400` | Граница при фокусе |
| `--btn-gradient-start` | `#E8720A` | Градиент кнопки — начало |
| `--btn-gradient-end` | `#FFD700` | Градиент кнопки — конец |

---

## 3. Типографика

Шрифт: системный стек.

```css
--font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

| Элемент | Размер | Вес | Line-height | Letter-spacing |
|---------|--------|-----|-------------|----------------|
| Streak counter ("Day 7") | 32px | 700 | 1.2 | -0.02em |
| Дата | 14px | 400 | 1.4 | 0.04em |
| Поле ввода | 18px | 400 | 1.5 | 0 |
| Placeholder | 18px | 400 | 1.5 | 0 |
| Кнопка "Done" | 16px | 600 | 1 | 0.05em |
| Заголовок прошлого дня | 13px | 500 | 1.4 | 0.03em |
| Текст прошлого win | 15px | 400 | 1.5 | 0 |
| Empty state текст | 16px | 400 | 1.6 | 0.01em |

Все размеры в `rem` (base 16px): 32px = 2rem, 18px = 1.125rem и т.д.

---

## 4. CSS-пламя — детальная реализация

### Архитектура

Пламя строится из нескольких вложенных слоёв `<div>`, каждый с `border-radius`, `filter: blur()`, и `mix-blend-mode: screen` для аддитивного наложения цвета.

```
.flame-container        — позиционирование, perspective
  .flame-core           — внутреннее яркое ядро
  .flame-body           — основное тело пламени
  .flame-outer          — внешнее свечение
  .flame-glow           — размытый ореол на фоне
  .flame-particles      — контейнер для частиц (level 5)
```

### Базовые формы

```css
/* Форма "капля" — основа для каждого слоя */
.flame-body {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  filter: blur(4px);
  mix-blend-mode: screen;
}

/* Ядро — уже, ярче */
.flame-core {
  position: absolute;
  bottom: 5%;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 50% 50% 50% 50% / 65% 65% 35% 35%;
  filter: blur(2px);
  mix-blend-mode: screen;
}

/* Внешнее свечение */
.flame-outer {
  position: absolute;
  bottom: -10%;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 50% 50% 50% 50% / 55% 55% 45% 45%;
  filter: blur(12px);
  mix-blend-mode: screen;
  opacity: 0.5;
}

/* Фоновый ореол */
.flame-glow {
  position: absolute;
  bottom: -30%;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.15;
}
```

### 5 уровней — параметры

#### Level 1: Ember (1-3 дня)

```css
.flame-container[data-level="1"] {
  --flame-height: 40px;
  --flame-width: 30px;
  --color-core: #E85D26;
  --color-body: #CC4400;
  --color-outer: #8B2500;
  --color-glow: #8B250040;
  --anim-speed: 3s;
  --blur-core: 2px;
  --blur-body: 5px;
  --blur-outer: 10px;
  --blur-glow: 30px;
}
```

Размер: маленький, 40px высота. Движение медленное, едва заметное. 3 слоя (core + body + glow). Преобладает тёмно-красный. Как тлеющий уголёк, который вот-вот погаснет.

#### Level 2: Flame (4-7 дней)

```css
.flame-container[data-level="2"] {
  --flame-height: 70px;
  --flame-width: 45px;
  --color-core: #FF8C42;
  --color-body: #E8720A;
  --color-outer: #CC4400;
  --color-glow: #CC440030;
  --anim-speed: 2.2s;
  --blur-core: 2px;
  --blur-body: 4px;
  --blur-outer: 10px;
  --blur-glow: 35px;
}
```

Размер: средний, 70px. Движение быстрее. 4 слоя (core + body + outer + glow). Оранжевый доминирует. Огонь "пришёл в себя".

#### Level 3: Fire (8-14 дней)

```css
.flame-container[data-level="3"] {
  --flame-height: 100px;
  --flame-width: 60px;
  --color-core: #FFB347;
  --color-body: #FF9F1C;
  --color-outer: #E8720A;
  --color-glow: #E8720A25;
  --anim-speed: 1.8s;
  --blur-core: 3px;
  --blur-body: 5px;
  --blur-outer: 12px;
  --blur-glow: 45px;
}
```

Размер: крупный, 100px. Живой костёр. 4 слоя. Золотисто-оранжевый. Добавляется лёгкое покачивание (`sway` анимация).

#### Level 4: Torch (15-30 дней)

```css
.flame-container[data-level="4"] {
  --flame-height: 130px;
  --flame-width: 70px;
  --color-core: #FFE566;
  --color-body: #FFD700;
  --color-outer: #FF9F1C;
  --color-glow: #FFD70020;
  --anim-speed: 1.4s;
  --blur-core: 3px;
  --blur-body: 6px;
  --blur-outer: 14px;
  --blur-glow: 55px;
}
```

Размер: большой, 130px. Факел. 4 слоя + ореол значительно шире. Золотой с яркими вспышками. Анимация более "агрессивная" (sway + flicker).

#### Level 5: Epic (30+ дней)

```css
.flame-container[data-level="5"] {
  --flame-height: 160px;
  --flame-width: 80px;
  --color-core: #FFFFFF;
  --color-body: #FFF1A8;
  --color-outer: #FFD700;
  --color-glow: #FFD70030;
  --anim-speed: 1s;
  --blur-core: 4px;
  --blur-body: 7px;
  --blur-outer: 16px;
  --blur-glow: 70px;
}
```

Размер: максимальный, 160px. Ядро — белое. Сияние захватывает треть экрана. 4 слоя + частицы. Быстрое мерцание. Ощущение "эпичности".

### Ключевые анимации

```css
/* Дыхание — основная пульсация */
@keyframes flame-breathe {
  0%, 100% {
    transform: translateX(-50%) scaleY(1) scaleX(1);
    opacity: 1;
  }
  25% {
    transform: translateX(-50%) scaleY(1.06) scaleX(0.96);
    opacity: 0.95;
  }
  50% {
    transform: translateX(-50%) scaleY(0.94) scaleX(1.04);
    opacity: 1;
  }
  75% {
    transform: translateX(-50%) scaleY(1.03) scaleX(0.98);
    opacity: 0.97;
  }
}

/* Покачивание — для level 3+ */
@keyframes flame-sway {
  0%, 100% { transform: translateX(-50%) rotate(0deg); }
  33% { transform: translateX(-48%) rotate(-2deg); }
  66% { transform: translateX(-52%) rotate(2deg); }
}

/* Мерцание — быстрые изменения яркости */
@keyframes flame-flicker {
  0%, 100% { opacity: 1; }
  10% { opacity: 0.92; }
  30% { opacity: 1; }
  50% { opacity: 0.88; }
  70% { opacity: 0.96; }
  90% { opacity: 0.94; }
}

/* Применение к слоям */
.flame-core {
  animation:
    flame-breathe var(--anim-speed) ease-in-out infinite,
    flame-flicker calc(var(--anim-speed) * 0.7) ease-in-out infinite;
}

.flame-body {
  animation:
    flame-breathe var(--anim-speed) ease-in-out infinite reverse,
    flame-sway calc(var(--anim-speed) * 1.3) ease-in-out infinite;
}

.flame-outer {
  animation: flame-breathe calc(var(--anim-speed) * 1.5) ease-in-out infinite;
}

.flame-glow {
  animation: flame-breathe calc(var(--anim-speed) * 2) ease-in-out infinite;
}
```

### Pulse-эффект при сохранении

При нажатии "Done" пламя вспыхивает — резко увеличивается, становится ярче, затем возвращается.

```css
@keyframes flame-pulse {
  0% {
    transform: scale(1);
    filter: brightness(1);
  }
  30% {
    transform: scale(1.4);
    filter: brightness(1.6);
  }
  100% {
    transform: scale(1);
    filter: brightness(1);
  }
}

.flame-container.pulse {
  animation: flame-pulse 800ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
```

Класс `.pulse` добавляется через JS при сохранении, удаляется по `animationend`.

### Частицы для Level 5

Частицы — маленькие точки, поднимающиеся вверх и исчезающие. Реализация через CSS pseudo-elements на нескольких дополнительных `<div>`.

```css
.flame-particle {
  position: absolute;
  bottom: 70%;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--color-core);
  opacity: 0;
  pointer-events: none;
}

@keyframes particle-rise {
  0% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0.9;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-80px) translateX(var(--drift-x)) scale(0.2);
    opacity: 0;
  }
}

/* 6 частиц с разными задержками и направлениями */
.flame-particle:nth-child(1) { left: 40%; --drift-x: -12px; animation: particle-rise 2.0s ease-out infinite 0.0s; }
.flame-particle:nth-child(2) { left: 55%; --drift-x: 8px;   animation: particle-rise 2.4s ease-out infinite 0.3s; }
.flame-particle:nth-child(3) { left: 45%; --drift-x: -6px;  animation: particle-rise 1.8s ease-out infinite 0.7s; }
.flame-particle:nth-child(4) { left: 60%; --drift-x: 15px;  animation: particle-rise 2.2s ease-out infinite 1.1s; }
.flame-particle:nth-child(5) { left: 35%; --drift-x: -18px; animation: particle-rise 2.6s ease-out infinite 1.5s; }
.flame-particle:nth-child(6) { left: 50%; --drift-x: 4px;   animation: particle-rise 2.0s ease-out infinite 1.9s; }
```

Частицы отображаются только при `data-level="5"`:

```css
.flame-container:not([data-level="5"]) .flame-particles {
  display: none;
}
```

---

## 5. Layout

Один экран, вертикальный поток. Mobile-first, контент по центру.

```
┌──────────────────────────────┐
│                              │
│         [  FLAME  ]          │  flame-container: 160px max
│                              │
│         Day 7  (fire emoji)  │  streak counter: 32px bold
│     Saturday, March 29       │  date: 14px, secondary color
│                              │
│  ┌────────────────────────┐  │
│  │  Win #1                │  │  input field
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │  Win #2                │  │  input field
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │  Win #3                │  │  input field
│  └────────────────────────┘  │
│                              │
│      [     Done     ]        │  button: gradient
│                              │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │  divider (subtle)
│                              │
│     Friday, March 28         │  past day header
│     - Fixed the login bug    │
│     - Shipped v2 design      │  past day entries
│     - Had a great call       │
│                              │
│     Thursday, March 27       │  ... scroll continues
│     - ...                    │
│                              │
└──────────────────────────────┘
```

### Отступы и размеры

| Элемент | Значение |
|---------|----------|
| Контейнер max-width | 480px |
| Padding body horizontal | 24px |
| Пламя → streak counter gap | 16px |
| Streak counter → date gap | 4px |
| Date → первое поле gap | 32px |
| Между полями ввода | 12px |
| Последнее поле → кнопка gap | 24px |
| Кнопка → divider gap | 48px |
| Между прошлыми днями | 32px |
| Padding top (от верха экрана до пламени) | 60px |
| Padding bottom | 80px |

### Поля ввода

```css
.win-input {
  width: 100%;
  padding: 16px 20px;
  background: var(--bg-input);
  border: 1px solid var(--accent-border);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 1.125rem; /* 18px */
  outline: none;
  transition:
    border-color 300ms ease-out,
    box-shadow 300ms ease-out,
    transform 200ms ease-out;
}

.win-input:focus {
  background: var(--bg-input-focus);
  border-color: var(--accent-border-focus);
  box-shadow: 0 0 0 4px var(--accent-glow), 0 0 20px var(--accent-glow);
}

.win-input::placeholder {
  color: var(--text-placeholder);
}
```

### Кнопка "Done"

```css
.btn-done {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--btn-gradient-start), var(--btn-gradient-end));
  color: #0A0A0A;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition:
    opacity 200ms ease-out,
    transform 150ms ease-out;
}

.btn-done:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-done:active {
  transform: translateY(0) scale(0.98);
}

.btn-done:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: none;
}
```

---

## 6. Микроанимации

### 6.1 Focus на поле ввода

При фокусе — тёплое свечение вокруг, плавное 300ms.

```css
.win-input:focus {
  border-color: var(--accent-border-focus);
  box-shadow: 0 0 0 4px var(--accent-glow), 0 0 20px var(--accent-glow);
}
```

### 6.2 Ввод текста — поле немного "раскрывается"

Когда поле непустое, оно чуть увеличивается (`scale`), создавая ощущение "заполненности".

```css
.win-input.has-text {
  transform: scale(1.015);
  border-color: #3D3025;
}
```

JS: класс `has-text` добавляется/убирается на `input` event, если `value.length > 0`.

### 6.3 Нажатие "Done"

Последовательность:
1. Кнопка "сжимается" (`:active` — `scale(0.98)`)
2. Пламя получает класс `.pulse` — вспыхивает (800ms)
3. Поля ввода плавно "схлопываются" в readonly-вид (300ms)
4. Кнопка "Done" исчезает (fade out 200ms), появляется кнопка "Edit" (fade in 200ms с задержкой 200ms)

```css
/* Поля закрываются */
.win-input.saved {
  background: transparent;
  border-color: transparent;
  padding-left: 0;
  transform: scale(1);
  transition: all 400ms ease-out;
}

/* Кнопка исчезает */
.btn-done.hidden {
  opacity: 0;
  transform: translateY(-10px);
  pointer-events: none;
  transition: all 200ms ease-out;
}
```

### 6.4 Лента прошлых дней — fade-in по одному

Каждый день появляется с задержкой, создавая эффект "проявления из темноты".

```css
.past-day {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 500ms ease-out, transform 500ms ease-out;
}

.past-day.visible {
  opacity: 1;
  transform: translateY(0);
}
```

JS: используется `IntersectionObserver`. Когда `.past-day` входит во viewport, добавляется класс `.visible`. Задержка для каждого следующего элемента: `transition-delay: calc(var(--i) * 100ms)` (через CSS custom property `--i`, задаётся через JS).

### 6.5 Empty state

Вместо пламени показывается текст, который плавно появляется при загрузке.

```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-state {
  animation: fade-in-up 600ms ease-out;
  color: var(--text-secondary);
  text-align: center;
  font-size: 1rem;
  line-height: 1.6;
}
```

---

## 7. HTML-каркас

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Three Wins</title>
  <link rel="stylesheet" href="style.css">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
</head>
<body>
  <main class="app">
    <div class="container">

      <!-- Flame -->
      <section class="flame-section">
        <!-- Empty state (shown when no entries exist) -->
        <div class="empty-state" hidden>
          <p>Start your streak.<br>Write your first three wins.</p>
        </div>

        <!-- Flame visualization -->
        <div class="flame-container" data-level="1">
          <div class="flame-glow"></div>
          <div class="flame-outer"></div>
          <div class="flame-body"></div>
          <div class="flame-core"></div>
          <div class="flame-particles">
            <div class="flame-particle"></div>
            <div class="flame-particle"></div>
            <div class="flame-particle"></div>
            <div class="flame-particle"></div>
            <div class="flame-particle"></div>
            <div class="flame-particle"></div>
          </div>
        </div>
      </section>

      <!-- Streak counter -->
      <section class="streak-section">
        <h1 class="streak-counter">
          <span class="streak-text">Day <span class="streak-number">7</span></span>
          <span class="streak-emoji">&#x1F525;</span>
        </h1>
        <p class="current-date">Saturday, March 29</p>
      </section>

      <!-- Today's wins input -->
      <section class="today-section">
        <form class="wins-form" id="winsForm">
          <input
            type="text"
            class="win-input"
            id="win1"
            placeholder="Win #1"
            maxlength="200"
            autocomplete="off"
          >
          <input
            type="text"
            class="win-input"
            id="win2"
            placeholder="Win #2"
            maxlength="200"
            autocomplete="off"
          >
          <input
            type="text"
            class="win-input"
            id="win3"
            placeholder="Win #3"
            maxlength="200"
            autocomplete="off"
          >
          <button type="submit" class="btn-done" id="btnDone" disabled>Done</button>
        </form>

        <!-- Edit button (shown after saving) -->
        <button class="btn-edit" id="btnEdit" hidden>Edit</button>
      </section>

      <!-- Past days feed -->
      <section class="feed-section" id="feed">
        <!-- Dynamically generated -->
        <!--
        <article class="past-day" style="--i: 0">
          <h2 class="past-day-date">Friday, March 28</h2>
          <ul class="past-day-wins">
            <li class="past-day-win">Fixed the login bug</li>
            <li class="past-day-win">Shipped v2 design</li>
            <li class="past-day-win">Had a great call with the team</li>
          </ul>
        </article>
        -->
      </section>

    </div>
  </main>

  <script src="app.js"></script>
</body>
</html>
```

### Справочник CSS-классов

| Класс | Элемент | Назначение |
|-------|---------|------------|
| `.app` | `<main>` | Корневой контейнер, min-height: 100vh |
| `.container` | `<div>` | Центрирование, max-width: 480px, padding |
| `.flame-section` | `<section>` | Обёртка пламени, flexbox center |
| `.flame-container` | `<div>` | Relative контейнер пламени, `data-level="1..5"` |
| `.flame-core` | `<div>` | Яркое ядро пламени |
| `.flame-body` | `<div>` | Основное тело |
| `.flame-outer` | `<div>` | Внешний слой |
| `.flame-glow` | `<div>` | Фоновый ореол |
| `.flame-particles` | `<div>` | Контейнер частиц (level 5) |
| `.flame-particle` | `<div>` | Одна частица |
| `.flame-container.pulse` | модификатор | Вспышка при сохранении |
| `.empty-state` | `<div>` | Текст первого запуска |
| `.streak-section` | `<section>` | Счётчик + дата |
| `.streak-counter` | `<h1>` | "Day 7" + emoji |
| `.streak-number` | `<span>` | Число (для JS-обновления) |
| `.current-date` | `<p>` | Текущая дата |
| `.today-section` | `<section>` | Форма ввода |
| `.wins-form` | `<form>` | Форма с тремя полями |
| `.win-input` | `<input>` | Поле ввода win |
| `.win-input.has-text` | модификатор | Поле непустое (scale up) |
| `.win-input.saved` | модификатор | Поле сохранено (readonly вид) |
| `.btn-done` | `<button>` | Кнопка сохранения |
| `.btn-done.hidden` | модификатор | Скрыта после сохранения |
| `.btn-edit` | `<button>` | Кнопка редактирования |
| `.feed-section` | `<section>` | Лента прошлых дней |
| `.past-day` | `<article>` | Один прошлый день |
| `.past-day.visible` | модификатор | Появился во viewport |
| `.past-day-date` | `<h2>` | Дата прошлого дня |
| `.past-day-wins` | `<ul>` | Список wins |
| `.past-day-win` | `<li>` | Один win |

---

## 8. Адаптивность

Mobile-first. Единственный breakpoint:

```css
/* Base: 375px+ (mobile) */
.container {
  max-width: 480px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Desktop: контент остаётся по центру, фон — чёрная пустота по бокам */
/* Никаких дополнительных breakpoints не нужно: max-width + auto margin делают всё */
```

На больших экранах пламя и контент остаются в узкой колонке по центру. Чёрный фон `--bg-deep` по бокам создаёт ощущение "фокуса" — как будто смотришь на костёр в темноте.

---

*Для Сани — бери эту спеку и реализуй. Все CSS custom properties, классы и анимации описаны с точностью до значений. Вайб: тёплый вечер у костра.*
