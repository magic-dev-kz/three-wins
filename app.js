(function () {
  'use strict';

  // === Constants ===
  var STORAGE_PREFIX = 'threeWins_';
  var CATEGORIES = ['Work', 'Health', 'Relationships', 'Learning', 'Creative', 'Personal'];
  var CATEGORY_COLORS = {
    Work: '#4A9EFF',
    Health: '#34D399',
    Relationships: '#F472B6',
    Learning: '#A78BFA',
    Creative: '#FBBF24',
    Personal: '#FB923C'
  };

  // === DOM refs ===
  var $flameContainer = document.getElementById('flame-container');
  var $flame = document.getElementById('flame');
  var $streak = document.getElementById('streak');
  var $streakCount = document.getElementById('streak-count');
  var $streakBadge = document.getElementById('streak-badge');
  var $emptyState = document.getElementById('empty-state');
  var $date = document.getElementById('date');
  var $form = document.getElementById('wins-form');
  var $inputs = [
    document.getElementById('win-1'),
    document.getElementById('win-2'),
    document.getElementById('win-3')
  ];
  var $btnDone = document.getElementById('btn-done');
  var $btnEdit = document.getElementById('btn-edit');
  var $feed = document.getElementById('feed');
  var $onboarding = document.getElementById('onboarding');
  var $onboardingStart = document.getElementById('onboarding-start');
  var $shareWrap = document.getElementById('share-wrap');
  var $btnShare = document.getElementById('btn-share');
  var $btnExport = document.getElementById('btn-export');

  // Reflection prompt refs
  var $reflectionWrap = document.getElementById('reflection-wrap');
  var $reflectionInput = document.getElementById('reflection-input');
  var $reflectionCounter = document.getElementById('reflection-counter');
  var $btnReflectionSave = document.getElementById('btn-reflection-save');
  var $btnReflectionSkip = document.getElementById('btn-reflection-skip');

  // Monthly summary refs
  var $monthlySummary = document.getElementById('monthly-summary');
  var $monthlyTitle = document.getElementById('monthly-title');
  var $monthlyStats = document.getElementById('monthly-stats');
  var $btnMonthlyDismiss = document.getElementById('btn-monthly-dismiss');

  // Milestone overlay refs
  var $milestoneOverlay = document.getElementById('milestone-overlay');
  var $milestoneEmoji = document.getElementById('milestone-emoji');
  var $milestoneTitle = document.getElementById('milestone-title');
  var $milestoneSubtitle = document.getElementById('milestone-subtitle');
  var $milestoneContinue = document.getElementById('milestone-continue');
  var $confettiContainer = document.getElementById('confetti-container');

  // Weekly digest overlay refs
  var $digestOverlay = document.getElementById('digest-overlay');
  var $digestTitle = document.getElementById('digest-title');
  var $digestStats = document.getElementById('digest-stats');
  var $digestDays = document.getElementById('digest-days');
  var $digestShare = document.getElementById('digest-share');
  var $digestDone = document.getElementById('digest-done');

  // Category pill containers
  var $catPillContainers = document.querySelectorAll('.category-pills');

  // Track selected categories for each win input
  var _selectedCategories = [null, null, null];

  // === Utilities ===
  function todayKey() {
    return formatKey(new Date());
  }

  function formatKey(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function formatDateDisplay(dateStr) {
    var parts = dateStr.split('-');
    var date = new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10)
    );
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return days[date.getDay()] + ', ' + months[date.getMonth()] + ' ' + date.getDate();
  }

  function prevDay(dateStr) {
    var parts = dateStr.split('-');
    var d = new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10)
    );
    d.setDate(d.getDate() - 1);
    return formatKey(d);
  }

  // === Storage ===
  function saveEntry(dateKey, wins, categories, reflection) {
    var data = {
      wins: wins,
      categories: categories || [null, null, null],
      savedAt: new Date().toISOString()
    };
    if (reflection) data.reflection = reflection;
    try {
      localStorage.setItem(STORAGE_PREFIX + dateKey, JSON.stringify(data));
      return true;
    } catch (e) {
      return false;
    }
  }

  function saveReflection(dateKey, reflection) {
    var entry = loadEntry(dateKey);
    if (!entry) return false;
    entry.reflection = reflection || '';
    try {
      localStorage.setItem(STORAGE_PREFIX + dateKey, JSON.stringify(entry));
      return true;
    } catch (e) {
      return false;
    }
  }

  function loadEntry(dateKey) {
    try {
      var raw = localStorage.getItem(STORAGE_PREFIX + dateKey);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      // Ensure categories array exists for backward compat
      if (!parsed.categories) {
        parsed.categories = [null, null, null];
      }
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function getAllEntries() {
    var entries = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key && key.indexOf(STORAGE_PREFIX) === 0) {
          var dateKey = key.slice(STORAGE_PREFIX.length);
          // Skip non-date keys (milestone_, weeklyShown_, onboarded, etc.)
          if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) continue;
          var entry = loadEntry(dateKey);
          if (entry) {
            entries.push({ date: dateKey, wins: entry.wins, categories: entry.categories, reflection: entry.reflection || '' });
          }
        }
      }
    } catch (e) {
      // localStorage access may throw in some environments
    }
    entries.sort(function (a, b) {
      return b.date.localeCompare(a.date);
    });
    return entries;
  }

  // === Streak Calculation ===
  function calculateStreak() {
    var today = todayKey();
    var checkDate = today;

    if (!loadEntry(today)) {
      checkDate = prevDay(today);
      if (!loadEntry(checkDate)) {
        return 0;
      }
    }

    var streak = 0;
    while (loadEntry(checkDate)) {
      streak++;
      checkDate = prevDay(checkDate);
    }
    return streak;
  }

  // === Flame Level ===
  function getFlameLevel(streak) {
    if (streak <= 0) return 0;
    if (streak <= 3) return 1;
    if (streak <= 7) return 2;
    if (streak <= 14) return 3;
    if (streak <= 30) return 4;
    return 5;
  }

  // === Category Pills ===
  function initCategoryPills() {
    $catPillContainers.forEach(function (container, containerIndex) {
      var pills = container.querySelectorAll('.cat-pill');
      pills.forEach(function (pill) {
        pill.addEventListener('click', function () {
          var cat = pill.getAttribute('data-cat');
          // Toggle: if already selected, deselect
          if (_selectedCategories[containerIndex] === cat) {
            _selectedCategories[containerIndex] = null;
            pill.classList.remove('cat-pill--active');
            pill.style.removeProperty('--pill-color');
          } else {
            // Deselect any previously selected in this container
            var prev = container.querySelector('.cat-pill--active');
            if (prev) {
              prev.classList.remove('cat-pill--active');
              prev.style.removeProperty('--pill-color');
            }
            _selectedCategories[containerIndex] = cat;
            pill.classList.add('cat-pill--active');
            pill.style.setProperty('--pill-color', CATEGORY_COLORS[cat]);
          }
        });
      });
    });
  }

  function setCategoryPillsReadonly(readonly) {
    $catPillContainers.forEach(function (container) {
      var pills = container.querySelectorAll('.cat-pill');
      pills.forEach(function (pill) {
        pill.disabled = readonly;
      });
      if (readonly) {
        container.classList.add('category-pills--readonly');
      } else {
        container.classList.remove('category-pills--readonly');
      }
    });
  }

  function restoreCategoryPills(categories) {
    _selectedCategories = categories ? categories.slice() : [null, null, null];
    $catPillContainers.forEach(function (container, idx) {
      var pills = container.querySelectorAll('.cat-pill');
      pills.forEach(function (pill) {
        pill.classList.remove('cat-pill--active');
        pill.style.removeProperty('--pill-color');
        var cat = pill.getAttribute('data-cat');
        if (_selectedCategories[idx] === cat) {
          pill.classList.add('cat-pill--active');
          pill.style.setProperty('--pill-color', CATEGORY_COLORS[cat]);
        }
      });
    });
  }

  // === UI State ===
  function hasAnyEntry() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key && key.indexOf(STORAGE_PREFIX) === 0) {
          var dateKey = key.slice(STORAGE_PREFIX.length);
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return true;
        }
      }
    } catch (e) {
      // localStorage access may throw
    }
    return false;
  }

  function updateDoneButton() {
    var anyFilled = $inputs.some(function (input) {
      return input.value.trim().length > 0;
    });
    $btnDone.disabled = !anyFilled;
  }

  function setFieldsReadonly(readonly) {
    $inputs.forEach(function (input) {
      input.readOnly = readonly;
    });
  }

  function showSavedState() {
    setFieldsReadonly(true);
    setCategoryPillsReadonly(true);
    $btnDone.hidden = true;
    $btnEdit.hidden = false;
    $btnEdit.focus();
  }

  function showEditState() {
    setFieldsReadonly(false);
    setCategoryPillsReadonly(false);
    $btnDone.hidden = false;
    $btnEdit.hidden = true;
    updateDoneButton();
  }

  function triggerBurst() {
    $flame.classList.remove('flame--burst');
    void $flame.offsetWidth;
    $flame.classList.add('flame--burst');
    $flame.addEventListener('animationend', function handler() {
      $flame.removeEventListener('animationend', handler);
      $flame.classList.remove('flame--burst');
    });
  }

  function clearFlameParticles() {
    var particles = $flame.querySelectorAll('.flame__particle');
    for (var i = 0; i < particles.length; i++) {
      particles[i].remove();
    }
  }

  function createFlameParticles() {
    clearFlameParticles();
    for (var i = 0; i < 6; i++) {
      var span = document.createElement('span');
      span.className = 'flame__particle';
      var delay = (Math.random() * 2).toFixed(2);
      var left = Math.round(Math.random() * 40 - 20);
      var drift = Math.round(Math.random() * 20 - 10);
      span.style.animationDelay = delay + 's';
      span.style.left = 'calc(50% + ' + left + 'px)';
      span.style.bottom = Math.round(40 + Math.random() * 40) + '%';
      span.style.setProperty('--drift', drift + 'px');
      $flame.appendChild(span);
    }
  }

  function updateFlame(streak) {
    var level = getFlameLevel(streak);
    $flame.setAttribute('data-level', String(level));

    if (level === 5) {
      createFlameParticles();
    } else {
      clearFlameParticles();
    }

    if (level === 0) {
      $flameContainer.style.display = hasAnyEntry() ? 'flex' : 'none';
    } else {
      $flameContainer.style.display = 'flex';
    }

    $streakCount.textContent = String(streak);
    $streak.setAttribute('data-streak', String(streak));
    $streak.setAttribute('aria-label', streak + (streak === 1 ? ' day' : ' days') + ' streak');

    if (!hasAnyEntry()) {
      $emptyState.hidden = false;
      $streak.style.display = 'none';
      $flameContainer.style.display = 'none';
    } else {
      $emptyState.hidden = true;
      $streak.style.display = '';
    }

    // Update milestone badge
    updateStreakBadge(streak);
  }

  // === Milestone Badge ===
  function updateStreakBadge(streak) {
    var badge = getHighestMilestone(streak);
    if (badge) {
      $streakBadge.textContent = badge.emoji;
      $streakBadge.setAttribute('aria-label', badge.days + ' day milestone');
      $streakBadge.hidden = false;
    } else {
      $streakBadge.hidden = true;
    }
  }

  function getHighestMilestone(streak) {
    var hit = null;
    for (var i = 0; i < MILESTONES.length; i++) {
      if (streak >= MILESTONES[i]) {
        hit = { days: MILESTONES[i], emoji: MILESTONE_EMOJIS[MILESTONES[i]] };
      }
    }
    return hit;
  }

  // === Feed (lazy rendering for 100+ entries) ===
  var FEED_BATCH = 20;
  var _feedEntries = [];
  var _feedRendered = 0;
  var _feedObserver = null;
  var _feedSentinel = null;

  function createEntryElement(entry) {
    var div = document.createElement('article');
    div.className = 'feed__entry';

    var dateEl = document.createElement('div');
    dateEl.className = 'feed__date';
    dateEl.textContent = formatDateDisplay(entry.date);
    div.appendChild(dateEl);

    var ul = document.createElement('ul');
    ul.className = 'feed__wins';

    entry.wins.forEach(function (win, idx) {
      if (win.trim()) {
        var li = document.createElement('li');
        li.className = 'feed__win';

        // Category tag
        var cat = entry.categories && entry.categories[idx];
        if (cat && CATEGORY_COLORS[cat]) {
          var tag = document.createElement('span');
          tag.className = 'feed__cat-tag';
          tag.textContent = cat;
          tag.style.setProperty('--cat-color', CATEGORY_COLORS[cat]);
          li.appendChild(tag);
        }

        var textSpan = document.createElement('span');
        textSpan.textContent = win;
        li.appendChild(textSpan);
        ul.appendChild(li);
      }
    });

    div.appendChild(ul);

    // Show reflection if present
    if (entry.reflection && entry.reflection.trim()) {
      var reflDiv = document.createElement('div');
      reflDiv.className = 'feed__reflection';
      reflDiv.textContent = '\u201C' + entry.reflection + '\u201D';
      div.appendChild(reflDiv);
    }

    return div;
  }

  function renderFeedBatch() {
    var end = Math.min(_feedRendered + FEED_BATCH, _feedEntries.length);
    for (var i = _feedRendered; i < end; i++) {
      $feed.insertBefore(createEntryElement(_feedEntries[i]), _feedSentinel);
    }
    _feedRendered = end;

    if (_feedRendered >= _feedEntries.length) {
      if (_feedObserver) _feedObserver.disconnect();
      if (_feedSentinel) _feedSentinel.remove();
      _feedSentinel = null;
    }
  }

  function renderFeed() {
    if (_feedObserver) { _feedObserver.disconnect(); _feedObserver = null; }
    if (_feedSentinel) { _feedSentinel.remove(); _feedSentinel = null; }

    var h2 = $feed.querySelector('h2');
    $feed.innerHTML = '';
    if (h2) $feed.appendChild(h2);

    var entries = getAllEntries();
    var today = todayKey();

    _feedEntries = entries.filter(function (e) {
      return e.date !== today;
    });
    _feedRendered = 0;

    if (_feedEntries.length === 0) return;

    _feedSentinel = document.createElement('div');
    _feedSentinel.style.height = '1px';
    $feed.appendChild(_feedSentinel);

    renderFeedBatch();

    if (_feedRendered < _feedEntries.length && 'IntersectionObserver' in window) {
      _feedObserver = new IntersectionObserver(function (observerEntries) {
        if (observerEntries[0].isIntersecting) {
          renderFeedBatch();
        }
      }, { rootMargin: '200px' });
      _feedObserver.observe(_feedSentinel);
    } else if (_feedRendered < _feedEntries.length) {
      while (_feedRendered < _feedEntries.length) {
        renderFeedBatch();
      }
    }
  }

  // === Date display ===
  function renderDate() {
    var today = todayKey();
    var display = formatDateDisplay(today);
    $date.textContent = display;
    $date.setAttribute('datetime', today);
  }

  // === Events ===
  function updateHasText(input) {
    if (input.value.trim().length > 0) {
      input.classList.add('has-text');
    } else {
      input.classList.remove('has-text');
    }
  }

  $inputs.forEach(function (input) {
    input.addEventListener('input', function () {
      updateDoneButton();
      updateHasText(input);
    });
  });

  $inputs.forEach(function (input, i) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (i < $inputs.length - 1) {
          $inputs[i + 1].focus();
        } else {
          // v7: Enter on last win input = save all wins
          if (!$btnDone.disabled && !$btnDone.hidden) {
            $form.requestSubmit ? $form.requestSubmit() : $btnDone.click();
          }
        }
      }
    });
  });

  var _saving = false;

  function showSaveError() {
    clearSaveError();
    var msg = document.createElement('div');
    msg.className = 'wins__error';
    msg.id = 'wins-error';
    msg.setAttribute('role', 'alert');
    msg.textContent = 'Could not save. Storage may be full.';
    $form.appendChild(msg);
  }

  function clearSaveError() {
    var existing = document.getElementById('wins-error');
    if (existing) existing.remove();
  }

  // v6: Save toast
  var $saveToast = document.getElementById('save-toast');
  var _saveToastTimer = null;

  function showSaveToast() {
    if (_saveToastTimer) { clearTimeout(_saveToastTimer); }
    $saveToast.classList.add('show');
    _saveToastTimer = setTimeout(function () {
      $saveToast.classList.remove('show');
      _saveToastTimer = null;
    }, 2000);
  }

  // v6: Card pulse animation on save
  function triggerCardPulse() {
    $form.classList.remove('wins--saved');
    void $form.offsetWidth;
    $form.classList.add('wins--saved');
    $form.addEventListener('animationend', function handler() {
      $form.removeEventListener('animationend', handler);
      $form.classList.remove('wins--saved');
    });
  }

  $form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearSaveError();

    if (_saving) return;
    _saving = true;

    try {
      var wins = $inputs.map(function (input) {
        return input.value.trim();
      });

      if (!wins.some(function (w) { return w.length > 0; })) {
        return;
      }

      var ok = saveEntry(todayKey(), wins, _selectedCategories.slice());
      if (!ok) {
        showSaveError();
        return;
      }

      showSavedState();

      var streak = calculateStreak();
      updateFlame(streak);
      updateShareButton(streak);
      updateExportButton();
      triggerBurst();
      triggerCardPulse();
      showSaveToast();
      renderFeed();
      showMilestone(streak);

      // Show reflection prompt if all 3 wins are filled
      var allFilled = wins.every(function (w) { return w.length > 0; });
      if (allFilled) {
        showReflectionPrompt();
      }
    } finally {
      _saving = false;
    }
  });

  $btnEdit.addEventListener('click', function () {
    showEditState();
    $inputs[0].focus();
  });

  // === Reflection Prompt ===
  function showReflectionPrompt() {
    var entry = loadEntry(todayKey());
    if (entry && entry.reflection) return; // already reflected
    $reflectionWrap.hidden = false;
    $reflectionInput.value = '';
    $reflectionCounter.textContent = '0/200';
    $reflectionInput.focus();
  }

  function hideReflectionPrompt() {
    $reflectionWrap.hidden = true;
  }

  $reflectionInput.addEventListener('input', function () {
    var len = $reflectionInput.value.length;
    $reflectionCounter.textContent = len + '/200';
  });

  $btnReflectionSave.addEventListener('click', function () {
    var text = $reflectionInput.value.trim();
    if (text) {
      saveReflection(todayKey(), text);
      renderFeed();
    }
    hideReflectionPrompt();
  });

  $btnReflectionSkip.addEventListener('click', function () {
    hideReflectionPrompt();
  });

  // === Monthly Summary ===
  var MONTHLY_SHOWN_PREFIX = 'monthlyShown_';

  function getMonthKey(date) {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
  }

  function isMonthlyShown(monthKey) {
    try {
      return localStorage.getItem(STORAGE_PREFIX + MONTHLY_SHOWN_PREFIX + monthKey) === '1';
    } catch (e) {
      return false;
    }
  }

  function markMonthlyShown(monthKey) {
    try {
      localStorage.setItem(STORAGE_PREFIX + MONTHLY_SHOWN_PREFIX + monthKey, '1');
    } catch (e) { /* quota */ }
  }

  function getEntriesForMonth(year, month) {
    // month is 0-based
    var entries = getAllEntries();
    return entries.filter(function (e) {
      var parts = e.date.split('-');
      return parseInt(parts[0], 10) === year && parseInt(parts[1], 10) - 1 === month;
    });
  }

  function calculateLongestStreakInEntries(entries) {
    if (entries.length === 0) return 0;
    var dates = entries.map(function (e) { return e.date; }).sort();
    var longest = 1;
    var current = 1;
    for (var i = 1; i < dates.length; i++) {
      var prev = new Date(dates[i - 1]);
      var curr = new Date(dates[i]);
      var diff = (curr - prev) / 86400000;
      if (diff === 1) {
        current++;
        if (current > longest) longest = current;
      } else {
        current = 1;
      }
    }
    return longest;
  }

  function showMonthlySummary() {
    var now = new Date();
    // Only show on the 1st day of the month
    if (now.getDate() !== 1) return;

    var currentMonthKey = getMonthKey(now);
    if (isMonthlyShown(currentMonthKey)) return;

    // Get previous month
    var prevMonth = now.getMonth() - 1;
    var prevYear = now.getFullYear();
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear--;
    }

    var prevEntries = getEntriesForMonth(prevYear, prevMonth);
    if (prevEntries.length === 0) return;

    // Calculate stats
    var totalWins = 0;
    prevEntries.forEach(function (e) {
      e.wins.forEach(function (w) {
        if (w && w.trim()) totalWins++;
      });
    });

    var longestStreak = calculateLongestStreakInEntries(prevEntries);
    var topCategory = getMostPopularCategory(prevEntries);

    var monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    $monthlyTitle.textContent = monthNames[prevMonth] + ' Recap';

    var statsHtml = '';
    statsHtml += '<div class="monthly-stat"><div class="monthly-stat__label">Total Wins</div><div class="monthly-stat__value">' + totalWins + '</div></div>';
    statsHtml += '<div class="monthly-stat"><div class="monthly-stat__label">Longest Streak</div><div class="monthly-stat__value">' + longestStreak + ' day' + (longestStreak !== 1 ? 's' : '') + '</div></div>';
    if (topCategory) {
      statsHtml += '<div class="monthly-stat" style="grid-column: 1 / -1;"><div class="monthly-stat__label">Top Category</div><div class="monthly-stat__value" style="color:' + (CATEGORY_COLORS[topCategory] || 'inherit') + '">' + topCategory + '</div></div>';
    }
    $monthlyStats.innerHTML = statsHtml;

    markMonthlyShown(currentMonthKey);
    $monthlySummary.hidden = false;
  }

  $btnMonthlyDismiss.addEventListener('click', function () {
    $monthlySummary.hidden = true;
  });

  // === Win Sharing (Canvas Card with 3 Wins) ===
  function generateWinShareCard(wins, streak, categories, callback) {
    var W = 600;
    var H = 400;
    var canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, W, H);

    // Border
    ctx.strokeStyle = '#3D2B1F';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);

    // Subtle gradient accent at top
    var topGrad = ctx.createLinearGradient(0, 0, W, 0);
    topGrad.addColorStop(0, 'rgba(255, 107, 53, 0.15)');
    topGrad.addColorStop(0.5, 'rgba(255, 215, 0, 0.1)');
    topGrad.addColorStop(1, 'rgba(255, 107, 53, 0.15)');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, W, 4);

    // Title: "Three Wins"
    var titleGrad = ctx.createLinearGradient(W / 2 - 80, 30, W / 2 + 80, 60);
    titleGrad.addColorStop(0, '#FFD700');
    titleGrad.addColorStop(1, '#FF6B35');
    ctx.fillStyle = titleGrad;
    ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Three Wins', W / 2, 48);

    // Date
    ctx.fillStyle = '#8A8078';
    ctx.font = '500 14px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(formatDateDisplay(todayKey()), W / 2, 72);

    // Wins list
    ctx.textAlign = 'left';
    var y = 120;
    wins.forEach(function (win, idx) {
      if (!win || !win.trim()) return;

      // Category tag
      var cat = categories && categories[idx];
      var xStart = 60;
      if (cat && CATEGORY_COLORS[cat]) {
        ctx.fillStyle = CATEGORY_COLORS[cat];
        ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, sans-serif';
        var tagWidth = ctx.measureText(cat.toUpperCase()).width + 12;
        // Tag background
        ctx.globalAlpha = 0.15;
        ctx.fillRect(xStart, y - 12, tagWidth, 16);
        ctx.globalAlpha = 1;
        ctx.fillText(cat.toUpperCase(), xStart + 6, y);
        xStart += tagWidth + 8;
      }

      // Bullet dot
      ctx.fillStyle = '#FF6B35';
      ctx.beginPath();
      ctx.arc(46, y + 8, 4, 0, Math.PI * 2);
      ctx.fill();

      // Win text
      ctx.fillStyle = '#F5F0EB';
      ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
      var text = win.length > 55 ? win.slice(0, 52) + '...' : win;
      ctx.fillText(text, 60, y + 13);
      y += 50;
    });

    // Streak badge (bottom area)
    if (streak > 0) {
      var streakGrad = ctx.createLinearGradient(W / 2 - 30, H - 90, W / 2 + 30, H - 70);
      streakGrad.addColorStop(0, '#FFD700');
      streakGrad.addColorStop(1, '#FF6B35');
      ctx.fillStyle = streakGrad;
      ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(streak), W / 2, H - 72);
      ctx.fillStyle = '#8A8078';
      ctx.font = '500 13px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('day streak', W / 2, H - 54);
    }

    // Branding footer
    ctx.fillStyle = '#5A5048';
    ctx.font = '13px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Three Wins \u2014 daily wins journal', W / 2, H - 20);

    if (canvas.toBlob) {
      canvas.toBlob(function (blob) { callback(blob); }, 'image/png');
    } else {
      var dataUrl = canvas.toDataURL('image/png');
      var byteString = atob(dataUrl.split(',')[1]);
      var ab = new ArrayBuffer(byteString.length);
      var ia = new Uint8Array(ab);
      for (var i = 0; i < byteString.length; i++) { ia[i] = byteString.charCodeAt(i); }
      callback(new Blob([ab], { type: 'image/png' }));
    }
  }

  function shareWins() {
    var entry = loadEntry(todayKey());
    if (!entry) return;
    var streak = calculateStreak();

    generateWinShareCard(entry.wins, streak, entry.categories, function (blob) {
      var file = new File([blob], 'three-wins-today.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          files: [file],
          title: 'My Three Wins',
          text: 'Today\'s wins on Three Wins!'
        }).catch(function () { /* user cancelled */ });
      } else {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'three-wins-today.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      }
    });
  }

  // === Onboarding ===
  var ONBOARDING_KEY = 'threeWins_onboarded';

  function showOnboarding() {
    try {
      if (localStorage.getItem(ONBOARDING_KEY)) return false;
    } catch (e) {
      return false;
    }
    $onboarding.hidden = false;
    $onboardingStart.focus();
    return true;
  }

  function dismissOnboarding() {
    try { localStorage.setItem(ONBOARDING_KEY, '1'); } catch (e) { /* quota */ }
    $onboarding.hidden = true;
    $inputs[0].focus();
  }

  $onboardingStart.addEventListener('click', dismissOnboarding);
  $onboarding.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { dismissOnboarding(); }
    if (e.key === 'Tab') { e.preventDefault(); $onboardingStart.focus(); }
  });

  // === Share Card ===
  function generateShareCard(streak, callback) {
    var W = 600;
    var H = 400;
    var canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = '#3D2B1F';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);

    ctx.font = '64px serif';
    ctx.textAlign = 'center';
    ctx.fillText('\uD83D\uDD25', W / 2, 120);

    var grad = ctx.createLinearGradient(W / 2 - 60, 140, W / 2 + 60, 220);
    grad.addColorStop(0, '#FFD700');
    grad.addColorStop(1, '#FF6B35');
    ctx.fillStyle = grad;
    ctx.font = 'bold 72px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(String(streak), W / 2, 210);

    ctx.fillStyle = '#8A8078';
    ctx.font = '500 22px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('day streak', W / 2, 250);

    ctx.fillStyle = '#5A5048';
    ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('Three Wins \u2014 daily wins journal', W / 2, H - 40);

    if (canvas.toBlob) {
      canvas.toBlob(function (blob) { callback(blob); }, 'image/png');
    } else {
      var dataUrl = canvas.toDataURL('image/png');
      var byteString = atob(dataUrl.split(',')[1]);
      var ab = new ArrayBuffer(byteString.length);
      var ia = new Uint8Array(ab);
      for (var i = 0; i < byteString.length; i++) { ia[i] = byteString.charCodeAt(i); }
      callback(new Blob([ab], { type: 'image/png' }));
    }
  }

  function shareStreak() {
    var streak = calculateStreak();
    if (streak <= 0) return;

    generateShareCard(streak, function (blob) {
      var file = new File([blob], 'three-wins-streak.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          files: [file],
          title: 'My Three Wins streak',
          text: streak + ' day streak on Three Wins!'
        }).catch(function () { /* user cancelled */ });
      } else {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'three-wins-streak.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      }
    });
  }

  $btnShare.addEventListener('click', shareWins);

  function updateShareButton(streak) {
    var todayEntry = loadEntry(todayKey());
    $shareWrap.hidden = !todayEntry;
  }

  // === Export Wins ===
  function exportWins() {
    var entries = getAllEntries();
    if (entries.length === 0) return;

    var lines = ['Date | Win 1 | Win 2 | Win 3'];
    entries.forEach(function (entry) {
      var w1 = entry.wins[0] || '';
      var w2 = entry.wins[1] || '';
      var w3 = entry.wins[2] || '';
      var cats = entry.categories || [null, null, null];
      // Append category in brackets if present
      if (cats[0]) w1 += ' [' + cats[0] + ']';
      if (cats[1]) w2 += ' [' + cats[1] + ']';
      if (cats[2]) w3 += ' [' + cats[2] + ']';
      lines.push(entry.date + ' | ' + w1 + ' | ' + w2 + ' | ' + w3);
    });

    var text = lines.join('\n');
    var blob = new Blob([text], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'three-wins-export.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  $btnExport.addEventListener('click', exportWins);

  function updateExportButton() {
    var $exportWrap = document.getElementById('export-wrap');
    $exportWrap.hidden = !hasAnyEntry();
  }

  // === Milestones ===
  var MILESTONES = [7, 14, 21, 30, 60, 90, 100, 365];
  var MILESTONE_EMOJIS = {
    7: '\uD83D\uDD25',         // fire
    14: '\uD83C\uDFD4\uFE0F',  // mountain
    21: '\uD83D\uDCAA',        // muscle
    30: '\u2B50',               // star
    60: '\u2600\uFE0F',         // sun
    90: '\uD83D\uDE80',        // rocket
    100: '\uD83C\uDF1F',        // glowing star
    365: '\uD83D\uDC51'         // crown
  };
  var MILESTONE_SUBTITLES = {
    7: 'One week strong!',
    14: 'Two weeks of fire!',
    21: 'Three weeks — habit formed!',
    30: 'A full month. Incredible.',
    60: 'Two months of wins!',
    90: 'Ninety days. Unstoppable.',
    100: 'Legendary dedication',
    365: 'One full year. Incredible.'
  };

  function isMilestoneShown(milestone) {
    try {
      return localStorage.getItem(STORAGE_PREFIX + 'milestone_' + milestone) === '1';
    } catch (e) {
      return false;
    }
  }

  function markMilestoneShown(milestone) {
    try {
      localStorage.setItem(STORAGE_PREFIX + 'milestone_' + milestone, '1');
    } catch (e) { /* quota */ }
  }

  var _milestoneTimer = null;

  // === Confetti CSS Animation ===
  function createConfetti() {
    $confettiContainer.innerHTML = '';
    var colors = ['#FFD700', '#FF6B35', '#FF4500', '#34D399', '#4A9EFF', '#F472B6', '#A78BFA', '#FBBF24'];
    for (var i = 0; i < 50; i++) {
      var piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.setProperty('--fall-delay', (Math.random() * 1.5).toFixed(2) + 's');
      piece.style.setProperty('--fall-duration', (2 + Math.random() * 2).toFixed(2) + 's');
      piece.style.setProperty('--drift', (Math.random() * 100 - 50) + 'px');
      piece.style.setProperty('--spin', (Math.random() * 720 - 360) + 'deg');
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.width = (4 + Math.random() * 6) + 'px';
      piece.style.height = (4 + Math.random() * 6) + 'px';
      if (Math.random() > 0.5) {
        piece.style.borderRadius = '50%';
      }
      $confettiContainer.appendChild(piece);
    }
  }

  function showMilestone(streak) {
    var milestone = null;
    for (var i = 0; i < MILESTONES.length; i++) {
      if (streak === MILESTONES[i] && !isMilestoneShown(MILESTONES[i])) {
        milestone = MILESTONES[i];
        break;
      }
    }
    if (!milestone) return;

    markMilestoneShown(milestone);

    $milestoneEmoji.textContent = MILESTONE_EMOJIS[milestone] || '\uD83D\uDD25';
    $milestoneTitle.textContent = milestone + ' Day Streak!';
    $milestoneSubtitle.textContent = MILESTONE_SUBTITLES[milestone] || 'Keep the fire burning';
    $milestoneOverlay.removeAttribute('hidden');
    $milestoneContinue.focus();

    // Launch confetti
    createConfetti();

    _milestoneTimer = setTimeout(dismissMilestone, 5000);
  }

  function dismissMilestone() {
    if (_milestoneTimer) { clearTimeout(_milestoneTimer); _milestoneTimer = null; }
    $milestoneOverlay.hidden = true;
    $confettiContainer.innerHTML = '';
    if ($btnEdit && !$btnEdit.hidden) {
      $btnEdit.focus();
    } else {
      $inputs[0].focus();
    }
  }

  $milestoneContinue.addEventListener('click', dismissMilestone);
  $milestoneOverlay.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { dismissMilestone(); }
    if (e.key === 'Tab') { e.preventDefault(); $milestoneContinue.focus(); }
  });

  // === Weekly Wins Digest ===
  function getISOWeekKey() {
    var now = new Date();
    var jan1 = new Date(now.getFullYear(), 0, 1);
    var dayOfYear = Math.floor((now - jan1) / 86400000) + 1;
    var weekNum = Math.ceil(dayOfYear / 7);
    return now.getFullYear() + '-W' + String(weekNum).padStart(2, '0');
  }

  function isDigestShown() {
    try {
      return localStorage.getItem(STORAGE_PREFIX + 'weeklyShown_' + getISOWeekKey()) === '1';
    } catch (e) {
      return false;
    }
  }

  function markDigestShown() {
    try {
      localStorage.setItem(STORAGE_PREFIX + 'weeklyShown_' + getISOWeekKey(), '1');
    } catch (e) { /* quota */ }
  }

  function getLastSevenDaysEntries() {
    var entries = [];
    var d = new Date();
    for (var i = 0; i < 7; i++) {
      var key = formatKey(d);
      var entry = loadEntry(key);
      if (entry) {
        entries.push({ date: key, wins: entry.wins, categories: entry.categories });
      }
      d.setDate(d.getDate() - 1);
    }
    return entries;
  }

  function getMostPopularCategory(entries) {
    var counts = {};
    entries.forEach(function (e) {
      var cats = e.categories || [null, null, null];
      cats.forEach(function (cat) {
        if (cat) {
          counts[cat] = (counts[cat] || 0) + 1;
        }
      });
    });

    var best = null;
    var bestCount = 0;
    for (var cat in counts) {
      if (counts[cat] > bestCount) {
        bestCount = counts[cat];
        best = cat;
      }
    }
    return best;
  }

  function showWeeklyDigest() {
    if (new Date().getDay() !== 0) return;
    if (isDigestShown()) return;

    var entries = getLastSevenDaysEntries();
    if (entries.length === 0) return;

    var totalWins = 0;
    entries.forEach(function (e) {
      e.wins.forEach(function (w) {
        if (w.trim()) totalWins++;
      });
    });

    var streak = calculateStreak();
    var topCategory = getMostPopularCategory(entries);

    $digestTitle.textContent = 'Your Week: ' + totalWins + ' Wins';

    // Stats summary
    $digestStats.innerHTML = '';
    var statsHtml = '<div class="digest-overlay__stat">';
    statsHtml += '<span class="digest-overlay__stat-label">Streak</span>';
    statsHtml += '<span class="digest-overlay__stat-value">' + streak + ' day' + (streak !== 1 ? 's' : '') + '</span>';
    statsHtml += '</div>';
    if (topCategory) {
      statsHtml += '<div class="digest-overlay__stat">';
      statsHtml += '<span class="digest-overlay__stat-label">Top Category</span>';
      statsHtml += '<span class="digest-overlay__stat-value" style="color:' + (CATEGORY_COLORS[topCategory] || 'inherit') + '">' + topCategory + '</span>';
      statsHtml += '</div>';
    }
    $digestStats.innerHTML = statsHtml;

    $digestDays.innerHTML = '';

    entries.forEach(function (entry) {
      var dayDiv = document.createElement('div');
      dayDiv.className = 'digest-overlay__day';

      var dateEl = document.createElement('div');
      dateEl.className = 'digest-overlay__day-date';
      dateEl.textContent = formatDateDisplay(entry.date);
      dayDiv.appendChild(dateEl);

      var ul = document.createElement('ul');
      ul.className = 'digest-overlay__day-wins';

      entry.wins.forEach(function (win, idx) {
        if (win.trim()) {
          var li = document.createElement('li');
          li.className = 'digest-overlay__day-win';
          var cat = entry.categories && entry.categories[idx];
          if (cat && CATEGORY_COLORS[cat]) {
            var tag = document.createElement('span');
            tag.className = 'feed__cat-tag';
            tag.textContent = cat;
            tag.style.setProperty('--cat-color', CATEGORY_COLORS[cat]);
            li.appendChild(tag);
          }
          var textNode = document.createTextNode(win);
          li.appendChild(textNode);
          ul.appendChild(li);
        }
      });

      dayDiv.appendChild(ul);
      $digestDays.appendChild(dayDiv);
    });

    markDigestShown();
    $digestOverlay.removeAttribute('hidden');
    $digestDone.focus();
  }

  function dismissDigest() {
    $digestOverlay.hidden = true;
    $inputs[0].focus();
  }

  function generateWeeklyCard(entries, totalWins, callback) {
    var W = 600;
    var H = 800;
    var canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = '#3D2B1F';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);

    var grad = ctx.createLinearGradient(W / 2 - 80, 40, W / 2 + 80, 80);
    grad.addColorStop(0, '#FFD700');
    grad.addColorStop(1, '#FF6B35');
    ctx.fillStyle = grad;
    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Weekly Wins', W / 2, 60);

    ctx.fillStyle = '#F5F0EB';
    ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(totalWins + ' Wins', W / 2, 120);

    var y = 170;
    ctx.textAlign = 'left';
    entries.forEach(function (entry) {
      if (y > H - 80) return;
      ctx.fillStyle = '#A89080';
      ctx.font = '500 14px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(formatDateDisplay(entry.date).toUpperCase(), 40, y);
      y += 22;

      entry.wins.forEach(function (win) {
        if (win.trim() && y < H - 80) {
          ctx.fillStyle = '#F5F0EB';
          ctx.font = '15px -apple-system, BlinkMacSystemFont, sans-serif';
          var text = win.length > 50 ? win.slice(0, 47) + '...' : win;
          ctx.fillText('\u2022 ' + text, 52, y);
          y += 22;
        }
      });
      y += 12;
    });

    ctx.fillStyle = '#5A5048';
    ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Three Wins \u2014 daily wins journal', W / 2, H - 30);

    if (canvas.toBlob) {
      canvas.toBlob(function (blob) { callback(blob); }, 'image/png');
    } else {
      var dataUrl = canvas.toDataURL('image/png');
      var byteString = atob(dataUrl.split(',')[1]);
      var ab = new ArrayBuffer(byteString.length);
      var ia = new Uint8Array(ab);
      for (var i = 0; i < byteString.length; i++) { ia[i] = byteString.charCodeAt(i); }
      callback(new Blob([ab], { type: 'image/png' }));
    }
  }

  function shareWeeklyCard() {
    var entries = getLastSevenDaysEntries();
    var totalWins = 0;
    entries.forEach(function (e) {
      e.wins.forEach(function (w) {
        if (w.trim()) totalWins++;
      });
    });

    generateWeeklyCard(entries, totalWins, function (blob) {
      var file = new File([blob], 'three-wins-weekly.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          files: [file],
          title: 'My Three Wins Week',
          text: totalWins + ' wins this week on Three Wins!'
        }).catch(function () { /* user cancelled */ });
      } else {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'three-wins-weekly.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      }
    });
  }

  $digestDone.addEventListener('click', dismissDigest);
  $digestShare.addEventListener('click', shareWeeklyCard);
  $digestOverlay.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { dismissDigest(); }
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === $digestShare) {
        e.preventDefault();
        $digestDone.focus();
      } else if (!e.shiftKey && document.activeElement === $digestDone) {
        e.preventDefault();
        $digestShare.focus();
      }
    }
  });

  // === v7: Auto-focus first empty win input ===
  function focusFirstEmptyWin() {
    for (var i = 0; i < $inputs.length; i++) {
      if (!$inputs[i].value.trim()) {
        $inputs[i].focus();
        return;
      }
    }
    // All filled — focus first input as fallback
    $inputs[0].focus();
  }

  // === v7: PWA Install Prompt (after 3+ visits) ===
  (function initPWAInstall() {
    var VISIT_KEY = 'threeWins_visit_count';
    var DISMISSED_KEY = 'threeWins_pwa_dismissed';
    var deferredPrompt = null;

    try {
      var visits = parseInt(localStorage.getItem(VISIT_KEY) || '0', 10) + 1;
      localStorage.setItem(VISIT_KEY, String(visits));

      window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();
        deferredPrompt = e;
        if (visits >= 3 && !localStorage.getItem(DISMISSED_KEY)) {
          var banner = document.getElementById('pwaInstallBanner');
          if (banner) banner.classList.add('visible');
        }
      });

      var installBtn = document.getElementById('pwaInstallBtn');
      var dismissBtn = document.getElementById('pwaInstallDismiss');

      if (installBtn) {
        installBtn.addEventListener('click', function () {
          if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(function () { deferredPrompt = null; });
          }
          var banner = document.getElementById('pwaInstallBanner');
          if (banner) banner.classList.remove('visible');
        });
      }

      if (dismissBtn) {
        dismissBtn.addEventListener('click', function () {
          var banner = document.getElementById('pwaInstallBanner');
          if (banner) banner.classList.remove('visible');
          try { localStorage.setItem(DISMISSED_KEY, '1'); } catch (e) {}
        });
      }
    } catch (e) {}
  })();

  // === Init ===

  var _renderedDateKey = null;

  function init() {
    _renderedDateKey = todayKey();
    renderDate();

    var today = todayKey();
    var todayEntry = loadEntry(today);

    if (todayEntry) {
      todayEntry.wins.forEach(function (win, i) {
        if ($inputs[i]) {
          $inputs[i].value = win;
          updateHasText($inputs[i]);
        }
      });
      restoreCategoryPills(todayEntry.categories);
      showSavedState();
    } else {
      $inputs.forEach(function (input) {
        input.value = '';
        updateHasText(input);
      });
      restoreCategoryPills([null, null, null]);
      showEditState();
      // v7: Auto-focus first empty win input
      focusFirstEmptyWin();
    }

    var streak = calculateStreak();
    updateFlame(streak);
    updateShareButton(streak);
    updateExportButton();
    renderFeed();
    showWeeklyDigest();
    showMonthlySummary();
  }

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && todayKey() !== _renderedDateKey) {
      init();
    }
  });

  // === v8: Win Template Chips ===
  (function initWinTemplates() {
    var $templates = document.getElementById('win-templates');
    if (!$templates) return;
    var chips = $templates.querySelectorAll('.win-template-chip');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var prompt = chip.getAttribute('data-prompt');
        if (!prompt) return;
        // Find first empty input and fill it
        for (var i = 0; i < $inputs.length; i++) {
          if (!$inputs[i].value.trim() && !$inputs[i].readOnly) {
            $inputs[i].value = prompt;
            $inputs[i].classList.add('has-text');
            $inputs[i].focus();
            updateDoneButton();
            return;
          }
        }
      });
    });

    // Hide chips when all inputs are saved (readonly)
    var origShowSaved = showSavedState;
    showSavedState = function () {
      origShowSaved();
      $templates.hidden = true;
    };
    var origShowEdit = showEditState;
    showEditState = function () {
      origShowEdit();
      $templates.hidden = false;
    };
  })();

  // === v8: Streak Calendar ===
  var _calYear, _calMonth;
  (function initStreakCalendar() {
    var $wrap = document.getElementById('streak-calendar-wrap');
    var $grid = document.getElementById('streak-calendar-grid');
    var $title = document.getElementById('streak-cal-title');
    var $prev = document.getElementById('streak-cal-prev');
    var $next = document.getElementById('streak-cal-next');
    if (!$wrap || !$grid) return;

    var now = new Date();
    _calYear = now.getFullYear();
    _calMonth = now.getMonth();

    function renderCalendar() {
      var monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      $title.textContent = monthNames[_calMonth] + ' ' + _calYear;
      $grid.innerHTML = '';

      // Day labels
      var dayLabels = ['Su','Mo','Tu','We','Th','Fr','Sa'];
      dayLabels.forEach(function (label) {
        var el = document.createElement('div');
        el.className = 'streak-cal-day-label';
        el.textContent = label;
        $grid.appendChild(el);
      });

      var firstDay = new Date(_calYear, _calMonth, 1).getDay();
      var daysInMonth = new Date(_calYear, _calMonth + 1, 0).getDate();
      var today = todayKey();

      // Empty cells before first day
      for (var e = 0; e < firstDay; e++) {
        var empty = document.createElement('div');
        empty.className = 'streak-cal-cell streak-cal-cell--empty';
        $grid.appendChild(empty);
      }

      // Day cells
      for (var d = 1; d <= daysInMonth; d++) {
        var cell = document.createElement('div');
        cell.className = 'streak-cal-cell';
        cell.textContent = String(d);

        var dateKey = _calYear + '-' + String(_calMonth + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
        var entry = loadEntry(dateKey);

        if (entry) {
          cell.classList.add('streak-cal-cell--has-entry');
        }

        if (dateKey === today) {
          cell.classList.add('streak-cal-cell--today');
        }

        // Future dates
        var cellDate = new Date(_calYear, _calMonth, d);
        if (cellDate > new Date()) {
          cell.classList.add('streak-cal-cell--future');
        }

        $grid.appendChild(cell);
      }

      // Disable next if showing current month
      var nowDate = new Date();
      $next.disabled = (_calYear === nowDate.getFullYear() && _calMonth === nowDate.getMonth());
      $next.style.opacity = $next.disabled ? '0.3' : '1';
    }

    $prev.addEventListener('click', function () {
      _calMonth--;
      if (_calMonth < 0) { _calMonth = 11; _calYear--; }
      renderCalendar();
    });

    $next.addEventListener('click', function () {
      if ($next.disabled) return;
      _calMonth++;
      if (_calMonth > 11) { _calMonth = 0; _calYear++; }
      renderCalendar();
    });

    // Expose for re-render after save
    window._renderStreakCalendar = renderCalendar;
    renderCalendar();
  })();

  // Hook calendar re-render into save
  var _origFormSubmit = $form.onsubmit;
  $form.addEventListener('submit', function () {
    setTimeout(function () {
      if (window._renderStreakCalendar) window._renderStreakCalendar();
    }, 100);
  });

  // === v8: Dark Mode Toggle ===
  (function initDarkMode() {
    var THEME_KEY = 'threeWins_theme';
    var $toggle = document.getElementById('dark-mode-toggle');
    var $icon = document.getElementById('dark-mode-icon');
    if (!$toggle) return;

    function applyTheme(theme) {
      if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        $icon.textContent = '\uD83C\uDF19'; // moon
        document.querySelector('meta[name="theme-color"]').setAttribute('content', '#FBF8F4');
      } else {
        document.documentElement.removeAttribute('data-theme');
        $icon.textContent = '\u2600\uFE0F'; // sun
        document.querySelector('meta[name="theme-color"]').setAttribute('content', '#0A0A0A');
      }
    }

    // Load saved theme
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}

    if (saved) {
      applyTheme(saved);
    }
    // else: stays dark (default)

    $toggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    });
  })();

  initCategoryPills();
  showOnboarding();
  init();
})();
