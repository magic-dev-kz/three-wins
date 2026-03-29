# Разведка: нишевые todo/notes приложения

**Дата:** 2026-03-29
**Агент:** Молот
**Статус:** RECON complete

---

## Методология

Исследованы 6 вертикалей: shopping lists, meal planners, gratitude journals, workout logs, book trackers, plant care. Критерии отбора ниши:

1. Платные конкуренты с ценой $3-50/год (есть willingness to pay)
2. Рейтинги 3.5-4.5 (не идеально -- есть место для улучшения)
3. Повторяющиеся жалобы на UX (конкретные боли)
4. Нет доминирующего бесплатного решения

---

## ТОП-3 ниши (ранжированы по потенциалу)

### 1. MEAL PLANNER (Планировщик питания)

**Вердикт: ЛУЧШАЯ НИША. Самый большой рынок, самые злые пользователи.**

**Рынок:**
- $350M - $2.5B (оценки разнятся по охвату сегмента)
- CAGR 10-13% до 2033
- AI-driven meal planning -- отдельный сегмент, CAGR 28%

**Платные конкуренты которых можно побить:**

| Приложение | Цена | Рейтинг | Главная боль |
|---|---|---|---|
| Plan to Eat | $5.95/мес | 4.4 | Нет своих рецептов -- только импорт. Сложный UI |
| MealBoard | $3.99 единоразово | 3.8 | Всё вручную: магазины, отделы, цены. Нет автоматизации |
| Mealime Pro | $5.99/мес | 4.9 | Нет недельного вида, нельзя генерировать список на всю неделю |
| Eat This Much | $5/мес | 4.0 | Список покупок неуправляемый, слишком много разнообразия |

**Повторяющиеся жалобы (1-2 звезды):**
- "Почти всё вручную" -- пользователи хотят автоматизацию
- "Нет вида на неделю" -- базовая фича за пейволлом
- "Список покупок гигантский" -- нет оптимизации/группировки
- "Не учитывает что уже есть в холодильнике"
- "Слишком много шагов чтобы добавить рецепт"

**Почему мы можем выиграть:**
- AI может генерировать меню + список покупок в 2 тапа
- Конкуренты 2018-2020 года, UI устаревший
- Пользователи ПЛАТЯТ ($5-6/мес) -- есть привычка
- Можно начать с простого weekly planner + auto grocery list

**Риски:**
- Ollie.ai -- новый AI-конкурент, уже набирает обороты
- Большой рынок = много игроков входят одновременно

---

### 2. BOOK TRACKER (Трекер чтения)

**Вердикт: ОТЛИЧНАЯ НИША. Goodreads всех бесит, альтернативы сырые.**

**Рынок:**
- Goodreads: 150M+ пользователей (данные 2024)
- Активный исход с Goodreads в 2025-2026
- BookTok/BookTube -- растущее комьюнити
- Нет точных данных по market size, но Bookly/Basmo монетизируются успешно

**Платные конкуренты которых можно побить:**

| Приложение | Цена | Рейтинг | Главная боль |
|---|---|---|---|
| Bookly Pro | $5/мес или $30/год | ~4.0 | Full-page реклама, bloated, battery drain |
| Basmo Pro | $4.99/мес или $39.99/год | ~4.2 | Дорого за базовые функции |
| Goodreads | Бесплатно | 3.6 (GP) | Устаревший UI, нет half-star, нет экспорта "date started", review bombing |

**Повторяющиеся жалобы:**
- Goodreads: "Устаревший интерфейс с 2011 года", "нет полу-звёзд", "Amazon owns my data"
- Bookly: "Annoying, bloated and unintuitive", "constant nags to buy premium"
- Basmo: "Слишком дорого для того что предлагает"
- Общее: "Нужны 2+ приложения чтобы покрыть все потребности"

**Emerging alternatives (учесть):**
- StoryGraph -- набирает юзеров, но UX спорный
- Hardcover -- indie, community-driven, пока маленький
- Margins -- эстетичный, но нишевый
- Shelvd -- privacy-first, без соцсетей

**Почему мы можем выиграть:**
- Goodreads реально всех бесит, люди активно ищут альтернативу
- Bookly/Basmo берут $5/мес за базовые функции -- можно предложить лучше за меньше
- Минимальный MVP: список книг + рейтинг + статистика чтения
- BookTok аудитория -- отличный канал дистрибуции

**Риски:**
- StoryGraph уже занял позицию "anti-Goodreads"
- Нужна база данных книг (ISBN API, Open Library)
- Соцфичи важны для ретеншена

---

### 3. PLANT CARE TRACKER (Трекер ухода за растениями)

**Вердикт: ХОРОШАЯ НИША. Платят много, жалуются громко.**

**Рынок:**
- $210M в 2024, прогноз $680-760M к 2032-2033
- CAGR 14-20%
- PictureThis: ~400K загрузок/мес, ~$3M revenue/мес (!)
- Greg: привлёк $5.4M seed в 2021

**Платные конкуренты которых можно побить:**

| Приложение | Цена | Рейтинг | Главная боль |
|---|---|---|---|
| PictureThis | $29.99/год или $2.99/мес | 4.5 iOS / 3.2 GP | Два раздельных подписки (!), агрессивный пейволл |
| Planta | $35.99/год | 4.7 | Неточные рекомендации по поливу (суккулент = полить сейчас) |
| PLNT | Freemium | ~3.5 | Кривой UX, clunky setup flow |
| Greg | $7.99/мес | 4.4 | Дорого для напоминалки о поливе |

**Повторяющиеся жалобы:**
- "Добавить все мои растения заняло 2 часа" -- 75% не распознаются
- "Приложение рекомендует поливать суккулент каждый день" -- опасные советы
- "Всё за пейволлом" -- базовые функции типа расписания полива требуют подписку
- "Два разных плана подписки и ни один не даёт всё" (PictureThis)
- "Постоянно просит включить уведомления"

**Почему мы можем выиграть:**
- Конкуренты берут $30-100/год за напоминалку о поливе
- Можно сделать простое приложение: мои растения + график полива + фото прогресса
- Не нужен AI plant ID на старте -- это отдельная проблема
- Целевая: женщины 25-40, plant moms -- активная и платящая аудитория

**Риски:**
- PictureThis и Planta -- сильные бренды с большими бюджетами
- Plant ID -- главная фича для discovery, без неё сложно конкурировать
- Сезонность (весна-лето пик)

---

## Отклонённые ниши

| Ниша | Причина отклонения |
|---|---|
| Shopping lists | Рынок перенасыщен бесплатными (Apple Reminders, Google Keep), AnyList слишком хорош |
| Gratitude journals | Рейтинги 4.7-4.9, сложно конкурировать. Рынок мал |
| Workout logs | Доминируют экосистемы (Apple Health, Strava, Nike). Сложно войти |
| Daily planners | Motion/Sunsama на верху ($19-29/мес), но это уже productivity, не notes |
| Pet care | Много бесплатных (DogCat, DogLog), нет привычки платить |

---

## Рекомендация Архитектору

**Если цель -- быстрый запуск с монетизацией:**

--> **Book Tracker**. MVP минимальный (список + рейтинг + статистика). Goodreads бесит всех. BookTok -- бесплатный канал дистрибуции. Можно запустить за 2-4 недели.

**Если цель -- большой рынок с AI:**

--> **Meal Planner**. Рынок $350M+, пользователи платят $5-6/мес, AI-генерация меню -- убийственная фича. Но MVP сложнее (нужна база рецептов).

**Если цель -- недооценённая ниша с жирной маржой:**

--> **Plant Care**. PictureThis делает $3M/мес. При этом UX конкурентов ужасен. Но нужен plant ID для конкуренции.

### Мой pick: Book Tracker

Обоснование:
1. Самый простой MVP (нет зависимости от внешних баз рецептов / AI моделей)
2. Goodreads -- очевидный анти-пример, вся аудитория знает боли
3. BookTok/BookTube -- органический трафик
4. Подписка $2-3/мес за Pro фичи (статистика, экспорт, dark mode) -- реалистично
5. Можно позиционировать как "simple, privacy-first book tracker"

---

## Источники

- [MoneyPantry: Best Grocery Shopping List Apps](https://moneypantry.com/grocery-shopping-list-apps/)
- [NerdWallet: Best Grocery List Apps](https://www.nerdwallet.com/finance/learn/best-grocery-list-apps)
- [Plan to Eat Reviews - JustUseApp](https://justuseapp.com/en/app/1215348056/plan-to-eat-meal-planner/reviews)
- [MealBoard Reviews - JustUseApp](https://justuseapp.com/en/app/333425918/mealboard-meal-planner/reviews)
- [Best Meal Planning Apps 2025 - ai-mealplan.com](https://ai-mealplan.com/blog/best-meal-planning-apps)
- [Ollie: Best Meal Planning Apps 2026](https://ollie.ai/2025/10/21/best-meal-planning-apps-in-2025/)
- [Gratitude App Reviews - JustUseApp](https://justuseapp.com/en/app/1372575227/gratitude-diary-vision-board/reviews)
- [Journey Reviews - JustUseApp](https://justuseapp.com/en/app/1300202543/journey-diary-journal/reviews)
- [Bookly Reviews - JustUseApp](https://justuseapp.com/en/app/1085047737/bookly-track-books-stats/reviews)
- [Basmo App Review - Book Riot](https://bookriot.com/basmo-app-review/)
- [Goodreads Alternatives 2026 - Creativerly](https://www.creativerly.com/there-is-still-the-need-for-a-better-goodreads-alternative/)
- [Goodreads Alternatives 2026 - CashewCrate](https://cashewcrate.com/blog/best-goodreads-alternatives-2026)
- [Leaving Goodreads 2025 - Old Town Books](https://www.blog.oldtownbooks.com/blog/making-the-switch-why-otb-staff-are-leaving-goodreads-in-2025)
- [Plant Care Apps Market - Newstrail](https://www.newstrail.com/plant-care-apps-market-hits-new-high-major-giants-planta-picturethis-greg-blossom/)
- [Plant Identification Apps Market - DataIntelo](https://dataintelo.com/report/plant-identification-apps-market)
- [Plant Care Apps Problems - PopSci](https://www.popsci.com/diy/are-plant-care-apps-good/)
- [PlantIn Review 2025 - Skywork](https://skywork.ai/blog/plantin-app-review-2025/)
- [Best Plant Care Apps 2026 - PlantIn](https://myplantin.com/blog/best-plant-care-apps)
- [Meal Planning App Market - VMR](https://www.verifiedmarketresearch.com/product/meal-planning-app-market/)
- [AI Meal Planning Market - Market.us](https://market.us/report/ai-driven-meal-planning-apps-market/)
- [SparkDay: Best Daily Planner Apps](https://sparkdayapp.com/blog/best-daily-planner-apps)
- [Greg $5.4M Seed - TechCrunch](https://techcrunch.com/2021/05/27/greg-an-app-for-plant-lovers-grows-5-4-million-in-seed-funding/)
