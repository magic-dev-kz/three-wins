# Three Wins — Fresh Audit (Nash)
**Date:** 2026-03-29
**Auditor:** Nash (QA, OpenClaw)
**Previous score:** 8.5/10 (House re-audit)
**Score: 8.1/10**

> Fresh audit обнаружил новые баги, не найденные предыдущими аудиторами, включая 1 P1 (потеря данных при midnight save) и несколько реальных P2 в accessibility.

---

## Summary

Продукт функционально чистый, контрасты WCAG AA все проходят, lazy feed реализован правильно. Но:

1. **P1 найден**: midnight edge case реально опасен — пользователь пишет wins в 23:59, нажимает Done, страница остаётся открытой, в 00:00 ключ меняется → при следующем взаимодействии данные "вчерашнего дня" уходят в feed, а сегодня — пустые поля. Данные не теряются, но UX сломан.
2. **Нет PWA** — нет manifest.json, нет service worker. Offline не работает (файлы не кешируются). Критично для "вечернего ритуала" — телефон в самолёте или плохой сети = не работает.
3. **Focus trap отсутствует** — форма не модалка, но: поля переходят в readonly-режим, и фокус падает в никуда после Done.
4. **prefers-reduced-motion реализован неверно** — `animation-duration: 0.01ms` вместо `animation: none`. Анимации технически продолжают работать, просто очень быстро — что для пользователей с эпилепсией может быть хуже, чем нормальная скорость.
5. **streak__count недоступен для screen readers** — `-webkit-text-fill-color: transparent` скрывает цвет, но более важная проблема: нет aria-label на streak-контейнере, число произносится без контекста ("0" или "7" без "days streak").
6. **XSS в атрибуте datetime** — значение из `todayKey()` (строка 307) вставляется в `datetime` через `setAttribute`. Само по себе не XSS (генерируется внутренне), но паттерн небезопасен если источник когда-либо изменится.
7. **Onboarding отсутствует** — пользователь первого дня видит только текст "Start your streak." без объяснения концепции.
8. **Share-момент отсутствует** — нет возможности поделиться streak или wins.

---

## P1 (Critical)

### P1-1: Midnight save — сломанный UX (потенциальная "потеря" текущего дня)

**Файл:** app.js, строки 25-34, 304-309, 332-364

**Сценарий:**
1. Пользователь открывает приложение в 23:58
2. Вводит wins, нажимает Done в 23:59 — `todayKey()` возвращает `2026-03-29`
3. Страница остаётся открытой (не перезагружается)
4. Наступает 00:00 (30 марта)
5. Пользователь нажимает Edit — `showEditState()` вызывается
6. `todayKey()` теперь возвращает `2026-03-30`
7. При повторном сохранении данные пишутся в ключ `2026-03-30`
8. Запись 29 марта остаётся в localStorage (не потеряна), но форма на экране теперь содержит тексты вчерашнего дня с ключом сегодняшнего — **данные дублируются в неверный день**

**Второй сценарий (хуже):**
1. Done нажат в 23:59 (ключ 29 марта, данные записаны)
2. Страница остаётся открытой до утра 30 марта
3. Пользователь видит заполненные поля в readonly — но это ВЧЕРАШНИЕ данные
4. `$date` отображает вчерашнюю дату (установлена при init, не обновляется)
5. Пользователь не понимает что произошло — UI заморожен на вчера

**Фикс:** Периодически (каждые 60 секунд) или при visibilitychange проверять `todayKey() !== _renderedDateKey`, и если изменился — перезапустить `init()`.

```js
var _renderedDateKey = null;

function init() {
  _renderedDateKey = todayKey();
  // ... остальной код
}

document.addEventListener('visibilitychange', function() {
  if (!document.hidden && todayKey() !== _renderedDateKey) {
    init();
    renderFeed();
  }
});
```

---

## P2 (Major)

### P2-1: prefers-reduced-motion реализован неверно

**Файл:** style.css, строки 733-739

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Проблема:** `animation-duration: 0.01ms` при `animation-iteration-count: 1` означает что flame-dance-epic (0.8s, infinite loop) выполнится 1 раз за 0.01ms — то есть мгновенный скачок состояний. Для пользователей с вестибулярными нарушениями мгновенный скачок трансформаций (scaleX, rotate, translateX) хуже чем плавная анимация.

**Правильный подход по WCAG 2.3.3:**
```css
@media (prefers-reduced-motion: reduce) {
  .flame__layer, .flame__glow,
  .flame[data-level="5"]::before,
  .flame[data-level="5"]::after {
    animation: none !important;
  }
  * {
    transition-duration: 0.01ms !important;
  }
}
```

Флейм без анимации всё ещё показывает уровень через data-level и цвета — визуальная ценность сохраняется.

---

### P2-2: Screen reader — streak читается без контекста

**Файл:** index.html, строки 23-26; app.js, строки 197-198

```html
<div class="streak" id="streak" aria-live="polite">
  <span class="streak__count" id="streak-count">0</span>
  <span class="streak__label">day streak</span>
</div>
```

**Проблемы:**

1. `aria-live="polite"` на контейнере streak обновляет только изменившийся элемент. Когда `$streakCount.textContent` меняется с "6" на "7" — screen reader объявит только "7", без "day streak". Нужно обновлять полный текст или использовать `aria-atomic="true"`.

2. При streak=0 контейнер скрыт через `display:none` (CSS `.streak[data-streak="0"]`), но `aria-live` продолжает существовать в DOM — это создаёт "мёртвый" live region.

3. Число streak произносится первым ("7"), потом "day streak" — порядок нормальный, но без `aria-label` на контейнере контекст неясен.

**Фикс:**
```html
<div class="streak" id="streak" aria-live="polite" aria-atomic="true" aria-label="Current streak">
```
И в JS при обновлении:
```js
$streak.setAttribute('aria-label', streak + ' day streak');
```

---

### P2-3: Offline не работает — нет PWA

**Файлы:** нет manifest.json, нет service worker

**Проблема:** Продукт позиционируется как "вечерний ритуал на телефоне". Без service worker:
- При плохой/отсутствующей сети страница не откроется
- "Add to Home Screen" не предлагается (нет Web App Manifest)
- Нет иконки на рабочем столе телефона

**Что нужно:**
1. `manifest.json` с name, short_name, icons, theme_color (#0A0A0A), background_color, display: standalone
2. Минимальный service worker с Cache-first для index.html, style.css, app.js
3. `<link rel="manifest" href="manifest.json">` в head

Это не "not MVP" — это базовая надёжность для single-page app без бэкенда.

---

### P2-4: Keyboard navigation — фокус теряется после Done

**Файл:** app.js, строки 161-165

```js
function showSavedState() {
  setFieldsReadonly(true);
  $btnDone.hidden = true;
  $btnEdit.hidden = false;
}
```

**Проблема:** После нажатия Done кнопка скрывается через `hidden = true`. Фокус при этом уходит в `<body>` — пользователь клавиатуры теряет позицию в интерфейсе. Screen reader не объявляет что произошло (нет aria-live для "saved" state).

**Фикс:**
```js
function showSavedState() {
  setFieldsReadonly(true);
  $btnDone.hidden = true;
  $btnEdit.hidden = false;
  $btnEdit.focus(); // Transfer focus explicitly
}
```

---

### P2-5: Форма — `<form>` с кнопкой submit, но Enter в полях вызывает submit

**Файл:** index.html строки 34-52; app.js строка 332

**Проблема:** Пользователь заполняет Win #1, нажимает Enter для перехода к Win #2 (естественное ожидание). Вместо этого форма отправляется (если Win #1 заполнен). Wins #2 и #3 остаются пустыми.

**Паттерн:** Специфичен для форм с `type="submit"` — Enter в любом `<input>` внутри `<form>` срабатывает как submit.

**Фикс вариант А:** Перехватить Enter в полях и перевести фокус на следующее поле:
```js
$inputs.forEach(function(input, i) {
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && i < $inputs.length - 1) {
      e.preventDefault();
      $inputs[i + 1].focus();
    }
  });
});
```

**Фикс вариант Б:** Изменить `type="submit"` на `type="button"` и вручную обрабатывать клик — теряется нативное submit поведение, не рекомендуется.

---

### P2-6: `wins__error` не связан с формой через aria-describedby

**Файл:** app.js, строки 318-330

```js
function showSaveError() {
  var msg = document.createElement('div');
  msg.className = 'wins__error';
  msg.id = 'wins-error';
  msg.textContent = 'Could not save. Storage may be full.';
  $form.appendChild(msg);
}
```

**Проблема:** Сообщение об ошибке появляется в DOM, но:
1. Не имеет `role="alert"` или `aria-live` — screen reader не объявит ошибку автоматически
2. Не связано с кнопкой Done через `aria-describedby`

**Фикс:**
```js
msg.setAttribute('role', 'alert');
```
Это достаточно — `role="alert"` имплицитно `aria-live="assertive"`.

---

## P3 (Minor)

### P3-1: `<time>` элемент — datetime не обновляется после полуночи

**Файл:** app.js, строки 304-309

`$date.setAttribute('datetime', today)` вызывается только в `renderDate()` при `init()`. Если страница открыта через полночь — `datetime` атрибут остаётся вчерашним, хотя визуальный текст тоже не обновляется (тот же баг что P1-1, только меньшее следствие).

---

### P3-2: streak__count — gradient text недоступен в High Contrast Mode

**Файл:** style.css, строки 487-495

```css
.streak__count {
  background: linear-gradient(180deg, #FFD700, #FF6B35);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

В Windows High Contrast Mode (forced-colors) браузер переопределяет цвета, но `-webkit-text-fill-color: transparent` при этом может оставить текст невидимым (прозрачный на принудительном фоне).

**Фикс:**
```css
@media (forced-colors: active) {
  .streak__count {
    -webkit-text-fill-color: CanvasText;
    background: none;
  }
}
```

---

### P3-3: feed__entry — staggered animation только для первых 10

**Файл:** style.css, строки 707-716

```css
.feed__entry:nth-child(1)  { animation-delay: 0ms; }
/* ... */
.feed__entry:nth-child(10) { animation-delay: 540ms; }
```

Батч 20 записей рендерится, но задержка прописана только для первых 10. Записи 11-20 появляются одновременно без задержки — визуальная несогласованность при первом рендере большого батча.

**Фикс:** Расширить до 20 записей:
```css
.feed__entry:nth-child(11) { animation-delay: 600ms; }
/* ... до :nth-child(20) */
```

---

### P3-4: Нет lang в html для конкретного языка — только `lang="en"`

**Файл:** index.html, строка 2

```html
<html lang="en">
```

Приложение UI на английском, но контент (wins) пользователи пишут на любом языке. Screen reader будет читать русский текст с английским акцентом. Это не баг — `lang="en"` корректно для UI — но стоит задокументировать.

Для multilingual wins нет механизма переключения lang на `<li>` — это edge case.

---

### P3-5: Нет onboarding — пустой экран непонятен

**Файл:** index.html, строки 28-31

```html
<div class="empty-state" id="empty-state" hidden>
  <p class="empty-state__text">Start your streak.<br>Write your first three wins.</p>
</div>
```

Empty state показывается когда нет ни одной записи, но только ВМЕСТО стрика и пламени — не как онбординг. Нет объяснения:
- Что такое "wins" в контексте этого приложения
- Что такое streak и зачем поддерживать
- Почему именно три

Для первого пользователя: форма с тремя полями, текст "Start your streak" и кнопка Done — не очевидно.

---

### P3-6: Нет share-момента

**Spec.md** явно запрещает шаринг ("Wins — личное. Без social pressure") — это дизайн-решение, не баг. Тем не менее, для milestone (например, 30-дневный streak) нет никакого reward кроме более крупного пламени.

**Предложение (не баг):** Milestone toast — "🔥 30 days! You're on fire." без кнопки "Share". Закрывается автоматически.

---

### P3-7: CSS flame — flame[data-level="1"] layer--3 и layer--4 невидимы

**Файл:** style.css

При data-level="1" заданы только стили для layer--1 и layer--2. Элементы layer--3 и layer--4 существуют в DOM (index.html, строки 17-19) но не стилизованы для level 1 — они остаются с `opacity: 0` (базовый стиль `.flame__layer`). Это нормальное поведение, не баг, но DOM содержит лишние элементы которые рендерятся хотя никогда не показываются на level 1-2.

---

### P3-8: `autocomplete="off"` на всех полях — хуже UX для возможных паттернов

**Файл:** index.html, строки 37, 41, 45

На мобильных устройствах `autocomplete="off"` отключает предиктивный ввод и историю ввода браузера. Для wins-дневника это нормально (каждый день новый контент), но `autocomplete="off"` в Chrome часто игнорируется для текстовых полей. Для консистентности лучше использовать `autocomplete="one-time-code"` или просто убрать атрибут.

---

### P3-9: `_saving` флаг не сбрасывается при unhandled exception

**Файл:** app.js, строки 316-364

```js
var _saving = false;

$form.addEventListener('submit', function (e) {
  if (_saving) return;
  _saving = true;
  // ...
  var ok = saveEntry(todayKey(), wins);
  if (!ok) {
    showSaveError();
    _saving = false; // сбрасывается
    return;
  }
  showSavedState();
  // ...
  _saving = false; // сбрасывается
});
```

Если между `_saving = true` и `_saving = false` выбросится неперехваченный exception (например, в `triggerBurst()` или `renderFeed()` при DOM ошибке) — `_saving` останется `true` и форма заблокируется навсегда до перезагрузки.

**Фикс:** try/finally:
```js
_saving = true;
try {
  // ... логика
} finally {
  _saving = false;
}
```

---

## What's good

1. **localStorage обёрнут в try/catch** — `saveEntry()` и `loadEntry()` оба обёрнуты корректно. ✅
2. **XSS защита в feed** — `li.textContent = win` вместо innerHTML. ✅
3. **WCAG AA контраст** — все пары текст/фон проходят, включая placeholder. ✅
4. **Lazy loading с IntersectionObserver** — правильная реализация с fallback, sentinel cleanup, нет утечек. ✅
5. **Double-click guard** — `_saving` флаг защищает от race condition. ✅
6. **SR-only labels** — все inputs имеют корректные labels (хоть и sr-only). ✅
7. **Семантическая разметка** — `<main>`, `<section>`, `<article>`, `<form>`, `<time>`, `<ul>/<li>`. ✅
8. **flame-container aria-hidden="true"** — декоративный элемент скрыт от AT. ✅
9. **CSS flame анимация** — технически корректна, 4 разных keyframe для разных уровней, плавная. ✅
10. **Streak calculation** — корректно обрабатывает случай "сегодня ещё не записано, вчера записано". ✅
11. **Burst animation cleanup** — `animationend` listener удаляется после срабатывания. ✅
12. **Feed фильтрует today** — сегодняшний день не дублируется в feed. ✅
13. **min-height: 48px** на интерактивных элементах — touch target соответствует WCAG 2.5.5. ✅
14. **100dvh** вместо 100vh — корректная обработка мобильного viewport с адресной строкой. ✅

---

## Roadmap to 9.0+

Минимально необходимые фиксы для 9.0+:

| # | Приоритет | Действие | Сложность |
|---|-----------|----------|-----------|
| 1 | P1 | Midnight date change: `visibilitychange` → re-init | 30 мин |
| 2 | P2 | prefers-reduced-motion: `animation: none` вместо `0.01ms` | 15 мин |
| 3 | P2 | Focus management: `$btnEdit.focus()` после Done | 5 мин |
| 4 | P2 | Enter в полях → переход к следующему полю | 20 мин |
| 5 | P2 | `role="alert"` на wins__error | 5 мин |
| 6 | P2 | `aria-atomic="true"` на streak + обновление aria-label | 10 мин |
| 7 | P3 | `forced-colors` media query для streak__count | 10 мин |
| 8 | P3 | `try/finally` вокруг _saving | 5 мин |
| 9 | бонус | manifest.json + minimal service worker | 2 часа |
| 10 | бонус | Staggered animation delay для entries 11-20 | 5 мин |

Итого обязательных фиксов: ~90 мин работы. После них — уверенные 9.0/10.

---

## Контрасты — верификация

Все расчёты по WCAG 2.1 relative luminance formula.

| Пара | FG | BG | Ratio | WCAG AA |
|------|----|----|-------|---------|
| Primary text / body bg | #F5F0EB | #0A0A0A | ~18.6:1 | PASS |
| Secondary text / body bg | #8A8078 | #0A0A0A | ~5.3:1 | PASS |
| Muted text / body bg | #999999 | #0A0A0A | ~7.2:1 | PASS |
| Muted text / bg-elevated | #999999 | #151515 | ~6.7:1 | PASS |
| Secondary text / bg-elevated | #8A8078 | #151515 | ~4.9:1 | PASS |
| Placeholder / bg-input | #999999 | #1A1410 | ~5.8:1 | PASS |
| Done btn text / orange | #0A0A0A | #FF6B35 | ~7.3:1 | PASS |
| Done btn text / gold | #0A0A0A | #FFD700 | ~14.6:1 | PASS |
| Error msg / body bg | #FF6B35 | #0A0A0A | ~7.3:1 | PASS |
| Edit btn text / bg-elevated | #F5F0EB | #151515 | ~17.3:1 | PASS |

Все текстовые пары — PASS WCAG AA. Нет ни одного fail.

---

*Nash, QA OpenClaw — Fresh Audit*
*2026-03-29*
