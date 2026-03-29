# Three Wins -- Audit v2 (Nash)
**Date:** 2026-03-29
**Auditor:** Nash (QA, OpenClaw)
**Previous score:** 8.1/10 (audit_fresh.md)
**Score: 9.2/10**

> Марио закрыл ВСЕ P1 и большинство P2 из прошлого аудита. Код чистый, аккуратный, без регрессий. Ниже -- построчная верификация каждого фикса + новые находки.

---

## I. Верификация фиксов Марио

### FIX-1: prefers-reduced-motion -- VERIFIED OK

**Файл:** style.css, строки 743-749

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Вердикт:** Марио оставил `animation-duration: 0.01ms + iteration-count: 1` вместо `animation: none`. В прошлом аудите я указал что это P2 -- "мгновенный скачок состояний хуже плавной анимации". Однако пересмотрев стандарт и реальные реализации:

- MDN и CSS Tricks рекомендуют именно `animation-duration: 0.01ms !important; animation-iteration-count: 1 !important;` как best practice, потому что `animation: none` ломает JS-обработчики `animationend` (в данном случае `triggerBurst()` использует `animationend` -- строка 185 app.js). С `animation: none` событие `animationend` никогда не сработает, и класс `flame--burst` никогда не снимется.
- `0.01ms + iteration-count: 1` = анимация технически "проигрывается" за незаметное время, один раз, и `animationend` срабатывает. Это корректно.
- `transition-duration: 0.01ms` для переходов -- тоже правильно (мгновенные переходы без мерцания).

**Статус: P2-1 CLOSED. Реализация корректна.**

---

### FIX-2: Onboarding overlay -- VERIFIED OK (с замечаниями)

**Файл:** index.html, строки 15-26; app.js, строки 396-416

**HTML:**
```html
<div class="onboarding" id="onboarding" role="dialog" aria-modal="true" aria-label="Welcome" hidden>
  <div class="onboarding__card">
    <div class="onboarding__flame" aria-hidden="true">&#x1F525;</div>
    <h1 class="onboarding__title">Three Wins</h1>
    <p class="onboarding__text">...</p>
    <button class="onboarding__cta" id="onboarding-start" autofocus>Start</button>
  </div>
</div>
```

**JS:**
```js
function showOnboarding() {
  if (localStorage.getItem(ONBOARDING_KEY)) return false;
  $onboarding.hidden = false;
  $onboardingStart.focus();
  return true;
}

$onboardingStart.addEventListener('click', dismissOnboarding);
$onboarding.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') { dismissOnboarding(); }
  if (e.key === 'Tab') { e.preventDefault(); $onboardingStart.focus(); }
});
```

**Проверка по пунктам:**

| Критерий | Статус |
|----------|--------|
| `role="dialog"` | OK |
| `aria-modal="true"` | OK |
| `aria-label="Welcome"` | OK |
| Escape закрывает | OK -- `e.key === 'Escape'` |
| Focus trap (Tab) | OK -- `e.preventDefault(); $onboardingStart.focus()` |
| Focus trap (Shift+Tab) | OK -- e.key === 'Tab' ловит оба направления |
| autofocus на кнопке | OK |
| JS focus() при показе | OK -- `$onboardingStart.focus()` |
| hidden атрибут по умолчанию | OK |
| localStorage.getItem try/catch | **P3-NEW-1** -- нет try/catch, см. ниже |
| Онбординг скрывает основной контент | **ЧАСТИЧНО** -- overlay position:fixed inset:0 с bg:var(--bg), НО main контент не имеет aria-hidden="true"/inert когда overlay открыт |

**Статус: P2-7 (onboarding) CLOSED. Два мелких замечания добавлены как P3.**

---

### FIX-3: Share moment -- VERIFIED OK

**Файл:** app.js, строки 419-505; index.html, строки 70-72

**Canvas рендеринг (generateShareCard):**
- 600x400 canvas -- OK
- Фон #0A0A0A, border #3D2B1F -- соответствует палитре
- Flame emoji 64px -- OK
- Streak number с gradient #FFD700 -> #FF6B35 -- OK, не сломает если streak=999 (3 символа вписываются в 120px gradient)
- Branding text внизу -- OK
- `canvas.toBlob` с fallback через `toDataURL` + `atob` + `Uint8Array` -- **ОТЛИЧНЫЙ fallback**, покрывает старые браузеры

**Web Share API:**
```js
if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
  navigator.share({ files: [file], title: '...', text: '...' })
    .catch(function () { /* user cancelled */ });
} else {
  // Fallback: download
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'three-wins-streak.png';
  // ...
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}
```

**Проверка:**

| Критерий | Статус |
|----------|--------|
| navigator.share проверка | OK |
| navigator.canShare проверка | OK -- критично, без этого Chrome Desktop кидает TypeError |
| canShare({ files }) | OK -- проверяет поддержку именно file sharing |
| catch на share() | OK -- пустой catch для user cancel |
| Download fallback | OK |
| URL.revokeObjectURL | OK -- через setTimeout(1000) |
| a элемент удаляется из DOM | OK -- removeChild(a) |
| Share button hidden при streak=0 | OK -- `updateShareButton(streak)` проверяет `streak <= 0` |
| Share после save | OK -- `updateShareButton` вызывается в submit handler |

**Статус: Share CLOSED. Реализация полная.**

---

### FIX-4 (ранее): Midnight save via visibilitychange -- VERIFIED OK

**Файл:** app.js, строки 509-547

```js
var _renderedDateKey = null;

function init() {
  _renderedDateKey = todayKey();
  // ...
}

document.addEventListener('visibilitychange', function () {
  if (!document.hidden && todayKey() !== _renderedDateKey) {
    init();
  }
});
```

**Анализ:**
- `init()` вызывает `renderFeed()` внутри -- нет двойного вызова. OK.
- `_renderedDateKey` обновляется при каждом `init()`. OK.
- visibilitychange срабатывает при переключении вкладок, wake from sleep, разблокировке телефона. OK.
- Не срабатывает если страница в фокусе в момент полуночи (пользователь активно пишет). Это edge case -- но `todayKey()` вызывается при submit, так что данные сохранятся в правильный день. OK.
- При re-init старые readonly-поля корректно перезаписываются (строки 518-533). OK.

**Статус: P1-1 CLOSED.**

---

### FIX-5 (ранее): PWA -- VERIFIED OK

**manifest.json:**
```json
{
  "name": "Three Wins",
  "short_name": "3 Wins",
  "description": "Three things. Every day. That's it.",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#0A0A0A",
  "theme_color": "#0A0A0A",
  "icons": [{ "src": "favicon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any maskable" }]
}
```

**Замечания к manifest:**
- `"purpose": "any maskable"` -- **P3-NEW-2**: по спецификации PWA, один иконка НЕ ДОЛЖНА быть одновременно "any" и "maskable". Рекомендация: два отдельных entries, или убрать "maskable" (SVG плохо подходит для maskable -- нет safe zone гарантий).
- Нет PNG иконок (192x192, 512x512) -- некоторые старые Android/Samsung Internet могут не принять SVG-only иконку для Add to Home Screen. **P3-NEW-3**.
- `start_url: "./index.html"` -- OK.

**sw.js:**
```js
var CACHE_NAME = 'three-wins-v2';
var APP_SHELL = ['./', './index.html', './style.css', './app.js', './manifest.json', './favicon.svg'];
```

| Критерий | Статус |
|----------|--------|
| Cache name versioned | OK -- 'three-wins-v2' |
| APP_SHELL includes all files | OK -- все 6 файлов |
| install: cache.addAll | OK |
| skipWaiting() | OK -- немедленная активация |
| activate: old cache cleanup | OK |
| clients.claim() | OK -- контроль открытых вкладок |
| fetch: cache-first | OK |
| Только GET | OK -- `e.request.method !== 'GET'` |
| Только same-origin | OK -- `response.type === 'basic'` |
| Clone response before caching | OK -- `response.clone()` |

**Offline работает:** Cache-first стратегия = после первого посещения все файлы в кеше. localStorage не зависит от SW.

**Статус: P2-3 (PWA) CLOSED.**

---

### FIX-6 (ранее): Focus management -- VERIFIED OK

**app.js строки 165-171:**
```js
function showSavedState() {
  setFieldsReadonly(true);
  $btnDone.hidden = true;
  $btnEdit.hidden = false;
  $btnEdit.focus(); // <-- фикс
}
```

Фокус переходит на Edit после Done. OK.

**Статус: P2-4 CLOSED.**

---

### FIX-7 (ранее): Streak accessibility -- VERIFIED OK

**index.html строка 39:**
```html
<div class="streak" id="streak" aria-live="polite" aria-atomic="true" aria-label="Current streak">
```

**app.js строки 203-206:**
```js
$streakCount.textContent = String(streak);
$streak.setAttribute('data-streak', String(streak));
$streak.setAttribute('aria-label', streak + ' day streak');
```

- `aria-atomic="true"` -- screen reader объявит весь контейнер при изменении. OK.
- `aria-label` обновляется с полной фразой "7 day streak". OK.

**Статус: P2-2 CLOSED.**

---

### FIX-8 (ранее): Enter navigation + error role -- VERIFIED OK

**app.js строки 325-333:**
```js
$inputs.forEach(function (input, i) {
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && i < $inputs.length - 1) {
      e.preventDefault();
      $inputs[i + 1].focus();
    }
  });
});
```
Enter в Win #1 -> фокус на Win #2. Enter в Win #2 -> Win #3. Enter в Win #3 -> submit (default behaviour). OK.

**app.js строки 339-347:**
```js
msg.setAttribute('role', 'alert');
msg.textContent = 'Could not save. Storage may be full.';
```
role="alert" = assertive live region. OK.

**Статус: P2-5 + P2-6 CLOSED.**

---

### FIX-9 (ранее): try/finally -- VERIFIED OK

**app.js строки 353-387:**
```js
$form.addEventListener('submit', function (e) {
  e.preventDefault();
  clearSaveError();
  if (_saving) return;
  _saving = true;
  try {
    // ... вся логика
  } finally {
    _saving = false;
  }
});
```

**Статус: P3-9 CLOSED.**

---

### FIX-10 (ранее): Staggered animation for 20 entries -- VERIFIED OK

**style.css строки 707-727:** 20 nth-child entries с задержками 0-1140ms. OK.

**Статус: P3-3 CLOSED.**

---

### FIX-11 (ранее): forced-colors -- VERIFIED OK

**style.css строки 754-758:**
```css
@media (forced-colors: active) {
  .streak__count {
    -webkit-text-fill-color: CanvasText;
    background: none;
  }
}
```

**Статус: P3-2 CLOSED.**

---

## II. Чеклист (7 пунктов)

### 1. localStorage/sessionStorage -- try/catch?

| Вызов | try/catch | Строка |
|-------|-----------|--------|
| saveEntry() | YES | app.js:73-78 |
| loadEntry() | YES | app.js:82-88 |
| getAllEntries() -- итерация | loadEntry() внутри | OK, транзитивно |
| showOnboarding() -- getItem | **NO** | app.js:399 |
| dismissOnboarding() -- setItem | YES | app.js:406 |

**Проблема P3-NEW-1:** `localStorage.getItem(ONBOARDING_KEY)` в `showOnboarding()` (строка 399) не обёрнут в try/catch. В Safari Private Mode `getItem` может выбросить исключение. Если exception -- onboarding не покажется, но и не сломает приложение (функция вернётся по exception, init() продолжит). Однако для консистентности надо обернуть.

**Вердикт: 95% покрыто. Один getItem без try/catch -- P3.**

### 2. WCAG AA контраст -- все тексты проходят?

Пересчитал все пары:

| Пара | FG | BG | Ratio | WCAG AA |
|------|----|----|-------|---------|
| Primary / body | #F5F0EB | #0A0A0A | 18.6:1 | PASS |
| Secondary / body | #8A8078 | #0A0A0A | 5.3:1 | PASS |
| Muted / body | #999999 | #0A0A0A | 7.2:1 | PASS |
| Muted / elevated | #999999 | #151515 | 6.7:1 | PASS |
| Secondary / elevated | #8A8078 | #151515 | 4.9:1 | PASS |
| Placeholder / input | #999999 | #1A1410 | 5.8:1 | PASS (placeholder не обязан, но проходит) |
| Done btn / gradient | #0A0A0A | #FF6B35-#FFD700 | 7.3-14.6:1 | PASS |
| Error / body | #FF6B35 | #0A0A0A | 7.3:1 | PASS |
| Edit btn / elevated | #F5F0EB | #151515 | 17.3:1 | PASS |
| Share btn text / elevated | #8A8078 | #151515 | 4.9:1 | PASS |
| Onboarding text / body | #8A8078 | #0A0A0A | 5.3:1 | PASS |
| Onboarding CTA / gradient | #0A0A0A | #FF6B35-#FFD700 | 7.3-14.6:1 | PASS |
| Branding (share card) | #5A5048 on #0A0A0A | -- | canvas only, not interactive | N/A |

**Вердикт: ALL PASS.**

### 3. Focus trap в модалках/overlay?

Onboarding: Tab preventDefault + Escape = OK.
Других модалок нет.

**Замечание P3-NEW-4:** Когда onboarding показан, `main` контент НЕ получает `aria-hidden="true"` или `inert`. Пользователь screen reader может Tab out of dialog через виртуальный буфер (не обычный Tab, а стрелки). С `aria-modal="true"` современные screen readers ДОЛЖНЫ ограничивать виртуальный буфер, но старые (NVDA < 2020) могут проигнорировать. `inert` на `main` решает это полностью.

**Вердикт: Работает для 95% пользователей. P3 для полной совместимости.**

### 4. prefers-reduced-motion учтён?

Да -- `@media (prefers-reduced-motion: reduce)` на строках 743-749. Все анимации и transitions подавлены.

**Вердикт: PASS.**

### 5. Keyboard navigation работает?

| Сценарий | Результат |
|----------|-----------|
| Tab через поля | OK -- 3 inputs + Done |
| Enter в Win #1 | OK -- фокус на Win #2 |
| Enter в Win #3 | OK -- submit |
| После Done | OK -- фокус на Edit |
| Edit click | OK -- фокус на Win #1 |
| Onboarding Tab | OK -- trapped на Start |
| Onboarding Escape | OK -- закрывает |
| Share button | OK -- Tab reachable |
| focus-visible outline | OK -- 2px solid orange, offset 2px |
| inputs focus-visible | OK -- orange border + glow (no outline double-up) |

**Вердикт: PASS.**

### 6. Offline работает?

SW cache-first с APP_SHELL. После первого посещения: HTML, CSS, JS, manifest, favicon -- все в кеше. localStorage доступен offline.

**Вердикт: PASS.**

### 7. Мобильный viewport корректен?

- `<meta name="viewport" content="width=device-width, initial-scale=1.0">` -- OK
- `min-height: 100dvh` -- OK (dvh учитывает мобильную адресную строку)
- `padding: 24px 16px` -- OK для мобильных
- `max-width: 480px` -- OK
- Input `min-height: 48px` -- WCAG 2.5.5 touch target OK
- Done/Edit `min-height: 48px` -- OK
- Share button `min-height: 44px` -- borderline (WCAG 2.5.8 рекомендует 44px minimum, 48px preferred), но 44px = проходит
- Responsive breakpoint `@media (max-width: 360px)` -- OK
- Desktop breakpoint `@media (min-width: 600px)` -- OK

**Вердикт: PASS.**

---

## III. Edge Cases

### Midnight crossing
- visibilitychange detection -- OK
- Если страница В ФОКУСЕ при полуночи (пользователь активно пишет) -- `todayKey()` вызывается при submit, данные сохранятся в новый день. Если пользователь начал писать в 23:59 и нажал Done в 00:01 -- данные сохранятся в 00:01 (новый день). Вчерашний день останется без записи -- streak НЕ сломается (calculateStreak проверяет вчера). **Acceptable.**
- Если пользователь нажал Done в 23:59 и не трогает до 00:01 -- visibilitychange не сработает (страница не hidden). Но при любом следующем взаимодействии (клик Edit, scroll) страница НЕ обновится автоматически. **P3-NEW-5**: нет setInterval/requestAnimationFrame для проверки даты при активной вкладке. visibilitychange ловит только фон->передний план.

### Empty state
- Нет записей: empty-state показан, streak hidden, flame hidden. OK.
- Одна запись сегодня: streak=1, flame level 1, empty-state hidden. OK.
- Записи есть, но streak=0 (пропущен вчера): streak hidden через CSS `[data-streak="0"]`, flame hidden через `data-level="0"`. OK.

### 999 day streak
- `getFlameLevel(999)` -> return 5 (> 30). OK.
- `$streakCount.textContent = "999"` -- три символа. Визуально: `font-size: 48px` = ~100px ширина, `max-width: 480px` -- вписывается. OK.
- aria-label: "999 day streak" -- грамматически "999 day" а не "999 days". **P3-NEW-6**: для streak > 1 должно быть "days" (множественное число).
- Canvas share card: `font: bold 72px`, text "999" -- `textAlign: center` -- вписывается в 600px canvas. OK.
- `calculateStreak()` при 999 днях: цикл 999 итераций `loadEntry(checkDate)`, каждый вызов = localStorage.getItem. На 999 записях это медленно (~10-30ms), но выполняется однократно при init/save. **Acceptable.**

### XSS через ввод
- Feed рендеринг: `li.textContent = win` -- safe, textContent не парсит HTML. OK.
- Input значения: `input.value` -- не вставляется в innerHTML нигде. OK.
- Date display: `dateEl.textContent = formatDateDisplay(entry.date)` -- safe. OK.
- Canvas: `ctx.fillText(String(streak))` -- canvas не парсит HTML. OK.
- datetime атрибут: `setAttribute('datetime', today)` -- today генерируется из `new Date()`, не из пользовательского ввода. OK.

**XSS вектор отсутствует.** Все пользовательские данные вставляются через textContent или value. Самый чистый подход.

---

## IV. Новые находки

### P3-NEW-1: localStorage.getItem без try/catch в showOnboarding()

**Файл:** app.js, строка 399

```js
function showOnboarding() {
  if (localStorage.getItem(ONBOARDING_KEY)) return false;  // no try/catch
```

Safari Private Mode, quota exceeded, или storage disabled = exception. Onboarding не покажется (exception прерывает функцию), но init() продолжит работать -- приложение не сломается, просто onboarding будет показываться каждый раз.

**Severity: P3** -- cosmetic annoyance, не data loss.

### P3-NEW-2: manifest.json "purpose": "any maskable" в одной иконке

**Файл:** manifest.json, строка 12

По W3C Web App Manifest spec, если иконка указана как "maskable", она БУДЕТ обрезана по safe zone (внутренние 80% от центра). SVG файл может не иметь padding для safe zone, что приведёт к обрезке.

**Fix:** Разделить на два entry или убрать "maskable".

### P3-NEW-3: Нет PNG иконок для старых Android

Manifest имеет только SVG иконку. Samsung Internet, UC Browser, старые WebView могут не поддержать SVG для Add to Home Screen.

### P3-NEW-4: Нет inert на main при onboarding

Когда onboarding открыт, screen reader через виртуальный буфер (не Tab) может "выйти" из dialog в main content. `aria-modal="true"` решает это для современных AT, но `inert` на `<main>` -- гарантия.

### P3-NEW-5: Midnight miss при активной вкладке

visibilitychange не срабатывает если вкладка остаётся в foreground. Пользователь может писать wins в 23:59, потом отвлечься на чтение feed (не переключая вкладку), и в 00:05 нажать Edit -- увидит вчерашние данные под вчерашней датой. Для полного решения нужен setInterval(60000) или проверка в submit handler.

**Partial mitigation:** submit handler вызывает `todayKey()` при каждом save -- данные сохранятся в ПРАВИЛЬНЫЙ день. Проблема только визуальная (дата в header не обновится).

### P3-NEW-6: "day streak" vs "days streak" (грамматика)

```js
$streak.setAttribute('aria-label', streak + ' day streak');
```

Для streak=1 "1 day streak" -- OK. Для streak=7 "7 day streak" -- должно быть "7-day streak" или "7 days". Minor cosmetic для screen reader пользователей.

### P3-NEW-7: Share button не заблокирован во время генерации

```js
function shareStreak() {
  var streak = calculateStreak();
  if (streak <= 0) return;
  generateShareCard(streak, function (blob) { ... });
}
```

`generateShareCard` синхронно рисует на canvas, но toBlob -- async callback. Между кликом и callback пользователь может кликнуть повторно, создав второй blob/download. Не критично, но неаккуратно.

---

## V. Scoring

### P1 (Critical): 0
Нет критических багов. Все P1 из прошлого аудита закрыты.

### P2 (Major): 0
Все P2 закрыты. Новых P2 не обнаружено.

### P3 (Minor): 7
1. localStorage.getItem без try/catch в showOnboarding
2. manifest "purpose" any maskable в одной иконке
3. Нет PNG иконок для старых Android
4. Нет inert на main при onboarding
5. Midnight miss при активной вкладке (only visual)
6. "day" vs "days" грамматика в aria-label
7. Share button не disabled во время генерации

### Score breakdown

| Категория | Баллы | Комментарий |
|-----------|-------|-------------|
| Функционал | 10/10 | Все фичи работают: save, edit, streak, feed, share, onboarding, midnight, PWA |
| Accessibility | 9/10 | aria-live, aria-atomic, aria-label, focus management, reduced-motion, forced-colors. -1 за inert + grammar |
| Security | 10/10 | textContent everywhere, no innerHTML, no eval, no XSS vectors |
| PWA/Offline | 9/10 | SW cache-first, manifest OK. -1 за SVG-only icons + maskable |
| Edge cases | 9/10 | Midnight, empty state, 999 streak -- all handled. -1 за active-tab midnight |
| Code quality | 9.5/10 | IIFE, try/finally, double-save guard, lazy loading, clean DOM. -0.5 за один getItem без try/catch |

**FINAL SCORE: 9.2/10**

---

## VI. What's Excellent

1. **XSS-proof rendering** -- textContent everywhere, zero innerHTML. Gold standard.
2. **Focus management** -- Done->Edit->Win#1 chain is perfect keyboard UX.
3. **Canvas share card** -- toBlob + toDataURL fallback, Web Share API + download fallback. Complete chain.
4. **Onboarding** -- role=dialog, aria-modal, focus trap, Escape, Tab trap, autofocus. Proper implementation.
5. **visibilitychange midnight detection** -- elegant solution, no polling.
6. **Lazy feed with IntersectionObserver** -- sentinel cleanup, fallback for no-IO browsers. Production-ready.
7. **Double-save guard with try/finally** -- bulletproof pattern.
8. **prefers-reduced-motion** -- correct 0.01ms approach that preserves animationend events.
9. **forced-colors media query** -- rare to see, shows attention to a11y.
10. **Cache-first SW with versioned cache name** -- proper offline support.

---

## VII. Roadmap to 9.5+

| # | Severity | Fix | Effort |
|---|----------|-----|--------|
| 1 | P3 | try/catch around getItem in showOnboarding | 2 min |
| 2 | P3 | Split manifest icons (any + maskable separately), add PNG fallbacks | 30 min |
| 3 | P3 | Add inert to main when onboarding is shown | 5 min |
| 4 | P3 | Pluralize "day"/"days" in aria-label | 5 min |
| 5 | P3 | Disable share button during generation | 5 min |
| 6 | P3 | setInterval(60000) for midnight check OR check in submit handler | 10 min |

Total: ~1 hour. After these fixes, confident 9.5/10. Ship-ready NOW at 9.2.

---

*Nash, QA OpenClaw -- Audit v2*
*2026-03-29*
