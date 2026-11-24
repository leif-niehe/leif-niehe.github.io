/*
  script.js = everything on the page that moves or reacts to clicks.
  Each part is separate, so one can be removed without touching the others.
*/

// Visitors who turned off animations in their system settings get still versions.
var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var root = document.documentElement;
var currentLang = 'en';           // changed by the language switch at the bottom


/* ============ LIGHT / DARK SWITCH ============
   The small script in <head> already picked a theme. This button flips it and
   remembers the choice in the visitor's browser. */
var toggle = document.querySelector('.theme-toggle');

function labelToggle() {
  var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  toggle.setAttribute('aria-label', 'Switch to ' + next + ' mode');
}

toggle.addEventListener('click', function () {
  var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.classList.add('theme-switching');            // soft colour fade, see style.css
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
  labelToggle();
  setTimeout(function () { root.classList.remove('theme-switching'); }, 400);
});

// If the visitor never chose, follow their device when it switches (e.g. at sunset).
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (event) {
  var saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  if (!saved) { root.dataset.theme = event.matches ? 'dark' : 'light'; labelToggle(); }
});
labelToggle();


/* ============ ROTATING WORDS UNDER THE NAME ============ */
var typed = document.querySelector('.typed');
var words = UI_TEXT.roles.en.slice();   // the language switch swaps these

if (calm) {
  typed.textContent = words.join(' · ');
  typed.parentElement.classList.add('still');
} else {
  var wordIndex = 0;
  var typeWord = function () {
    var word = words[wordIndex];
    var shown = typed.textContent;
    if (shown.length < word.length) {               // typing
      typed.textContent = word.slice(0, shown.length + 1);
      setTimeout(typeWord, 85);
    } else {                                         // hold, then delete
      setTimeout(deleteWord, 1800);
    }
  };
  var deleteWord = function () {
    var shown = typed.textContent;
    if (shown.length > 0) {
      typed.textContent = shown.slice(0, -1);
      setTimeout(deleteWord, 40);
    } else {
      wordIndex = (wordIndex + 1) % words.length;
      setTimeout(typeWord, 350);
    }
  };
  setTimeout(deleteWord, 2200);                      // the first word is already there
}


/* ============ GREETING BY THE LANGUAGES TITLE ============
   Fades between German, English and Spanish every 2.5 seconds. */
var greeting = document.querySelector('.greeting');
var hellos = ['Hallo', 'Hello', 'Hola'];

if (calm) {
  greeting.textContent = hellos.join(' · ');
} else {
  var helloIndex = 0;
  setInterval(function () {
    greeting.classList.add('out');                  // fade out ...
    setTimeout(function () {
      helloIndex = (helloIndex + 1) % hellos.length;
      greeting.textContent = hellos[helloIndex];
      greeting.classList.remove('out');             // ... and back in with the new word
    }, 300);
  }, 2500);
}


/* ============ LOCAL TIME IN KITCHENER ============
   Uses Kitchener's time zone, so it's right wherever the visitor is. */
var localTime = document.querySelector('.local-time');
function showTime() {
  // English: "10:18 pm". German and Spanish: "22:18".
  var time = new Intl.DateTimeFormat(currentLang === 'en' ? 'en-CA' : currentLang, {
    timeZone: 'America/Toronto', hour: 'numeric', minute: '2-digit', hour12: currentLang === 'en'
  }).format(new Date()).replace(/\./g, '');
  var sentence = UI_TEXT.time[currentLang];
  // Spanish says "es la 1:05" but "son las 2:05".
  if (currentLang === 'es' && /^0?1:/.test(time)) sentence = 'En Kitchener es ahora la {time}';
  localTime.textContent = sentence.replace('{time}', time);
}
showTime();
localTime.hidden = false;
setInterval(showTime, 15000);


/* ============ CONTOUR LINES BEHIND THE HEADER ============
   The lines are level curves p(u, v) = c of a polynomial of degree 4 in two
   variables, like height lines on a hiking map. Its 15 coefficients slowly drift,
   so hills and valleys grow, merge and split. The mouse or finger adds a hill
   where it is. Drawn with "marching squares": the area is cut into small
   squares, and in each square the line is a straight piece between two edges. */
var canvas = document.querySelector('.curves');
var header = document.querySelector('header');
var ctx = canvas.getContext('2d');
var curvesVisible = true;

function sizeCanvas() {
  var ratio = window.devicePixelRatio || 1;
  var height = header.offsetTop + header.offsetHeight;
  canvas.style.height = height + 'px';
  canvas.width = canvas.clientWidth * ratio;
  canvas.height = height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

var CELL = 12;                                       // size of one square in pixels
var LEVELS = [];                                     // heights -3, -2.75, ..., 3
for (var lv = -12; lv <= 12; lv++) LEVELS.push(lv / 4);
var field = [];                                      // p at every grid corner

// The coefficients c_ij of u^i v^j (i + j <= 4), each drifting at its own speed.
// Higher powers get smaller coefficients, so the picture stays calm.
function coefficients(time) {
  var c = [];
  for (var i = 0; i <= 4; i++) {
    c.push([]);
    for (var j = 0; i + j <= 4; j++) {
      var speed = 0.00007 * (1 + 0.31 * i + 0.47 * j);
      c[i].push(1.6 * Math.sin(time * speed + i * 2.1 + j * 3.7) / (1 + i + j));
    }
  }
  return c;
}

function drawCurves(time) {
  var w = canvas.clientWidth, h = canvas.clientHeight;
  var cols = Math.ceil(w / CELL) + 1, rows = Math.ceil(h / CELL) + 1;
  var scale = 2 / Math.max(w, h);                   // longer side runs from -1 to 1
  var c = coefficients(time);
  var bump = 1.4 * pointer.strength;

  // 1. Work out p at every corner of the grid (Horner's scheme in u, then in v).
  for (var r = 0; r < rows; r++) {
    var y = r * CELL, v = (y - h / 2) * scale * 1.6;
    if (!field[r]) field[r] = [];
    for (var q = 0; q < cols; q++) {
      var x = q * CELL, u = (x - w / 2) * scale * 1.6;
      var value = 0;
      for (var i = 4; i >= 0; i--) {
        var inner = 0;
        for (var j = 4 - i; j >= 0; j--) inner = inner * v + c[i][j];
        value = value * u + inner;
      }
      if (bump > 0.01) {                            // the hill under the pointer
        var dx = (x - pointer.x) / 120, dy = (y - pointer.y) / 120;
        value += bump * Math.exp(-dx * dx - dy * dy);
      }
      field[r][q] = value;
    }
  }

  // 2. For each level, walk through the squares and draw the piece of line inside.
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = getComputedStyle(root).getPropertyValue('--curve');
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  LEVELS.forEach(function (level) {
    for (var r = 0; r < rows - 1; r++) {
      for (var q = 0; q < cols - 1; q++) {
        var a = field[r][q] - level, b = field[r][q + 1] - level;       // top-left, top-right
        var d = field[r + 1][q] - level, e = field[r + 1][q + 1] - level; // bottom-left, bottom-right
        var points = [];
        var x0 = q * CELL, y0 = r * CELL;
        // Where the line crosses an edge: the spot where the value passes zero.
        if ((a < 0) !== (b < 0)) points.push(x0 + CELL * a / (a - b), y0);
        if ((b < 0) !== (e < 0)) points.push(x0 + CELL, y0 + CELL * b / (b - e));
        if ((d < 0) !== (e < 0)) points.push(x0 + CELL * d / (d - e), y0 + CELL);
        if ((a < 0) !== (d < 0)) points.push(x0, y0 + CELL * a / (a - d));
        for (var k = 0; k + 3 < points.length; k += 4) {
          ctx.moveTo(points[k], points[k + 1]);
          ctx.lineTo(points[k + 2], points[k + 3]);
        }
      }
    }
  });
  ctx.stroke();
}

// Where the mouse or finger is over the header. "strength" eases in and out,
// so the curves bend softly instead of jumping.
var pointer = { x: 0, y: 0, targetX: 0, targetY: 0, strength: 0, inside: false };

function followPointer(event) {
  var box = canvas.getBoundingClientRect();
  pointer.targetX = event.clientX - box.left;
  pointer.targetY = event.clientY - box.top;
  pointer.inside = pointer.targetY >= 0 && pointer.targetY <= box.height;
  if (pointer.strength < 0.01) { pointer.x = pointer.targetX; pointer.y = pointer.targetY; }
}

function animateCurves(time) {
  pointer.x += (pointer.targetX - pointer.x) * 0.12;
  pointer.y += (pointer.targetY - pointer.y) * 0.12;
  pointer.strength += ((pointer.inside ? 1 : 0) - pointer.strength) * 0.06;
  if (curvesVisible && !document.hidden) drawCurves(time);
  requestAnimationFrame(animateCurves);
}

if (!calm) {
  window.addEventListener('pointermove', followPointer, { passive: true });
  window.addEventListener('pointerdown', followPointer, { passive: true });
  // Mouse left the window, or the finger was lifted: let the curves relax.
  document.addEventListener('pointerleave', function () { pointer.inside = false; });
  window.addEventListener('pointerup', function (event) {
    if (event.pointerType !== 'mouse') pointer.inside = false;
  });
  window.addEventListener('pointercancel', function () { pointer.inside = false; });
}

sizeCanvas();
window.addEventListener('resize', function () { sizeCanvas(); if (calm) drawCurves(8000); });
if (calm) {
  drawCurves(8000);                                  // one still picture
} else {
  // Only animate while the header is on screen.
  new IntersectionObserver(function (entries) {
    curvesVisible = entries[0].isIntersecting;
  }).observe(canvas);
  requestAnimationFrame(animateCurves);
}
// Theme changes need a redraw of the still picture too.
new MutationObserver(function () { if (calm) drawCurves(8000); })
  .observe(root, { attributes: true, attributeFilter: ['data-theme'] });


/* ============ TOP BAR: ACTIVE SECTION AND PROGRESS LINE ============ */
var topbar = document.querySelector('.topbar');
var linkBox = document.querySelector('.topbar-links');
var navLinks = Array.prototype.slice.call(linkBox.querySelectorAll('a'));
var bar = document.querySelector('.progress span');
var activeLink = null;
var scrollQueued = false;

function updateTopbar() {
  scrollQueued = false;
  var scrollable = document.documentElement.scrollHeight - window.innerHeight;
  var progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  bar.style.transform = 'scaleX(' + Math.min(1, progress) + ')';

  // The active section is the last one whose top has passed under the bar.
  var current = null;
  var line = topbar.offsetHeight + 80;
  navLinks.forEach(function (link) {
    var section = document.querySelector(link.getAttribute('href'));
    if (section.getBoundingClientRect().top <= line) current = link;
  });
  if (progress > 0.995) current = navLinks[navLinks.length - 1];

  if (current !== activeLink) {
    if (activeLink) { activeLink.classList.remove('active'); activeLink.removeAttribute('aria-current'); }
    activeLink = current;
    if (current) {
      current.classList.add('active');
      current.setAttribute('aria-current', 'location');
      // On phones the menu scrolls sideways: keep the active word in view.
      linkBox.scrollTo({
        left: current.offsetLeft - linkBox.clientWidth / 2 + current.offsetWidth / 2,
        behavior: calm ? 'auto' : 'smooth'
      });
    }
  }
}

window.addEventListener('scroll', function () {
  if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateTopbar); }
}, { passive: true });
window.addEventListener('resize', updateTopbar);
updateTopbar();


/* ============ COPY BUTTON ============
   Puts the email on the clipboard and shows "Copied!" for 2 seconds. */
function showCopied(button, text) {
  button.textContent = text;
  if (text === UI_TEXT.copied[currentLang]) confetti(button);   // see the end of this file
  setTimeout(function () { button.textContent = UI_TEXT.copy[currentLang]; }, 2000);
}
// Older way of copying, for browsers that block the modern one.
function copyOldWay(text) {
  var box = document.createElement('textarea');
  box.value = text;
  document.body.appendChild(box);
  box.select();
  var ok = false;
  try { ok = document.execCommand('copy'); } catch (e) {}
  box.remove();
  return ok;
}
document.querySelectorAll('.copy').forEach(function (button) {
  button.addEventListener('click', function () {
    var text = button.dataset.copy;
    var fallback = function () {
      showCopied(button, copyOldWay(text) ? UI_TEXT.copied[currentLang] : 'Copy failed');
    };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () { showCopied(button, UI_TEXT.copied[currentLang]); }, fallback);
    } else {
      fallback();
    }
  });
});


/* ============ MAP: NAMES ON TAP, AND THE ROUTE ============ */
var map = document.querySelector('.map');
var pins = Array.prototype.slice.call(map.querySelectorAll('.pin'));

// Tapping a dot shows its name; tapping it again or anywhere else hides it.
// (With a mouse, hovering already shows the name through the CSS.)
pins.forEach(function (pin) {
  pin.addEventListener('click', function (event) {
    event.stopPropagation();
    var wasOpen = pin.classList.contains('open');
    pins.forEach(function (other) { other.classList.remove('open'); });
    if (!wasOpen) pin.classList.add('open');
  });
});
document.addEventListener('click', function () {
  pins.forEach(function (pin) { pin.classList.remove('open'); });
});

// When the map scrolls into view, the dots pop in one after another,
// in the order they happened (data-step 1, 2, 3 ...).
if (!calm) {
  pins.forEach(function (pin) {
    pin.style.setProperty('--delay', ((pin.dataset.step - 1) * 0.3).toFixed(1) + 's');
  });
  map.classList.add('animate');
  var mapWatcher = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) { map.classList.add('drawn'); mapWatcher.disconnect(); }
  }, { threshold: 0.5 });
  mapWatcher.observe(map);
}


/* ============ FADE-IN ============
   Each section fades in the first time it scrolls into view. */
if ('IntersectionObserver' in window && !calm) {
  var watcher = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        watcher.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('main section').forEach(function (section) {
    // Sections already on screen when the page opens show right away.
    if (section.getBoundingClientRect().top < window.innerHeight) return;
    section.classList.add('fade');
    watcher.observe(section);
  });
}


/* ============ PHOTO SHRINKS INTO THE TOP BAR ============
   While scrolling down, the big photo shrinks and fades. Once it's gone, the small
   photo and name appear on the left of the top bar. Scrolling up reverses it. */
var photoWrap = document.querySelector('.photo-wrap');
var photoQueued = false;

function updatePhoto() {
  photoQueued = false;
  var photoBottom = header.offsetTop + photoWrap.offsetTop + photoWrap.offsetHeight;
  var end = photoBottom - topbar.offsetHeight;            // scrolled this far = photo is gone
  var p = Math.max(0, Math.min(1, window.scrollY / end));
  if (!calm) {
    photoWrap.style.transform = 'translateY(' + (p * photoWrap.offsetHeight * 0.35).toFixed(1) + 'px) scale(' + (1 - 0.55 * p).toFixed(3) + ')';
    photoWrap.style.opacity = (1 - 0.9 * p).toFixed(3);
  }
  topbar.classList.toggle('docked', p >= 0.98);
}

window.addEventListener('scroll', function () {
  if (!photoQueued) { photoQueued = true; requestAnimationFrame(updatePhoto); }
}, { passive: true });
window.addEventListener('resize', updatePhoto);
updatePhoto();


/* ============ 3D TILT ON THE PHOTO ============
   With a mouse, the photo leans towards the pointer like a card in your hand,
   and a soft shine follows the pointer across it. */
var tilt = document.querySelector('.photo-tilt');

if (!calm) {
  tilt.addEventListener('pointermove', function (event) {
    if (event.pointerType !== 'mouse') return;
    var box = photoWrap.getBoundingClientRect();
    var x = (event.clientX - box.left) / box.width;       // 0 = left edge, 1 = right edge
    var y = (event.clientY - box.top) / box.height;
    tilt.style.setProperty('--tilt-y', ((x - 0.5) * 22).toFixed(1) + 'deg');
    tilt.style.setProperty('--tilt-x', ((0.5 - y) * 22).toFixed(1) + 'deg');
    tilt.style.setProperty('--shine-x', (x * 100).toFixed(0) + '%');
    tilt.style.setProperty('--shine-y', (y * 100).toFixed(0) + '%');
    tilt.classList.add('tilting');
  });
  tilt.addEventListener('pointerleave', function () {
    tilt.classList.remove('tilting');
    tilt.style.removeProperty('--tilt-x');
    tilt.style.removeProperty('--tilt-y');
  });
}


/* ============ SPOTLIGHT ============
   A soft glow behind the content that follows the mouse. Computers only. */
var spot = document.querySelector('.spotlight');

if (!calm && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  window.addEventListener('pointermove', function (event) {
    if (event.pointerType !== 'mouse') return;
    // +16: the glow sits on the lantern's flame, a little below the pointer's tip.
    spot.style.transform = 'translate(' + event.clientX + 'px, ' + (event.clientY + 16) + 'px)';
    spot.classList.add('on');
  }, { passive: true });
  document.addEventListener('mouseleave', function () { spot.classList.remove('on'); });
}


/* ============ LANGUAGE SWITCH (EN / DE / ES) ============
   Finds every text on the page that has a translation in translations.js and
   swaps it. The choice is remembered in the visitor's browser. */
function normalize(html) { return html.replace(/\s+/g, ' ').trim(); }

var translatable = [];
document.querySelectorAll(
  '.topbar-links a, h2, h2 > span, h3, main p, main li, main li > strong, main li > .meta, .currently-text, .roles .sr-only'
).forEach(function (el) {
  var key = normalize(el.innerHTML);
  if (TRANSLATIONS[key]) translatable.push({ el: el, en: el.innerHTML, key: key });
});

var updatedLine = document.querySelector('.updated');
var updatedEnglish = updatedLine.textContent;
var langButtons = document.querySelectorAll('.lang-switch button');
var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                  'August', 'September', 'October', 'November', 'December'];

function setLanguage(lang, animate) {
  if (!UI_TEXT.copy[lang]) lang = 'en';
  currentLang = lang;
  root.lang = lang;

  translatable.forEach(function (item) {
    var next = lang === 'en' ? item.en : TRANSLATIONS[item.key][lang];
    if (animate && !calm && item.el.innerHTML !== next) flapTo(item.el, next);  // see the end of this file
    else item.el.innerHTML = next;
  });

  // Rotating words: swap the list; the typing carries on with the new words.
  words.splice.apply(words, [0, words.length].concat(UI_TEXT.roles[lang]));
  typed.textContent = calm ? words.join(' · ') : words[wordIndex || 0];

  document.querySelectorAll('.copy').forEach(function (b) { b.textContent = UI_TEXT.copy[lang]; });
  showTime();

  // "Last updated November 2026" -> the same month and year in the chosen language.
  var match = updatedEnglish.match(/Last updated (\w+) (\d{4})/);
  if (match && monthNames.indexOf(match[1]) >= 0) {
    var date = new Date(+match[2], monthNames.indexOf(match[1]), 15);
    var formatted = new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric' }).format(date);
    updatedLine.textContent = UI_TEXT.updated[lang].replace('{date}', formatted);
  }

  langButtons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === lang)); });
  sizeCanvas();                                   // the header height may have changed
  try { localStorage.setItem('lang', lang); } catch (e) {}
}

langButtons.forEach(function (button) {
  button.addEventListener('click', function () { setLanguage(button.dataset.lang, true); });
});

var savedLang = null;
try { savedLang = localStorage.getItem('lang'); } catch (e) {}
if (savedLang && savedLang !== 'en') setLanguage(savedLang);


/* ============ EASTER EGG: CRYPTIC CLUE ============
   Click the big photo 3 times quickly: a small "Today's clue" card opens next to it.
   "play" opens the game. Typing the right answer gives the visitor a surprise. */
var ANSWER = 'ANGAS';
var card = document.querySelector('.clue-card');
var game = document.querySelector('.game');
var boxesBox = game.querySelector('.game-boxes');
var message = game.querySelector('.game-message');
var letters = [];
var clicks = 0;
var clickTimer = null;
var scareImage = new Image();

card.querySelector('.clue-date').textContent =
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

// --- the card ---
function openCard() {
  card.hidden = false;
  photoWrap.classList.add('card-open');
  scareImage.src = 'jumpscare.jpg';                  // start loading the surprise early
  card.querySelector('.clue-play').focus({ preventScroll: true });
}
function closeCard() {
  card.hidden = true;
  photoWrap.classList.remove('card-open');
}

tilt.addEventListener('click', function () {
  clicks++;
  clearTimeout(clickTimer);
  clickTimer = setTimeout(function () { clicks = 0; }, 1500);
  if (clicks >= 3) { clicks = 0; card.hidden ? openCard() : closeCard(); }
});
card.querySelector('.clue-close').addEventListener('click', closeCard);
card.addEventListener('click', function (event) { event.stopPropagation(); });
document.addEventListener('click', function (event) {
  if (!card.hidden && !tilt.contains(event.target)) closeCard();
});

// --- the game ---
for (var b = 0; b < ANSWER.length; b++) {
  boxesBox.appendChild(document.createElement('span'));
}
var boxes = boxesBox.querySelectorAll('span');

// On-screen keyboard: three rows, the last one ends with a delete key.
['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].forEach(function (row, i) {
  var line = document.createElement('div');
  line.className = 'game-row';
  row.split('').forEach(function (letter) {
    var key = document.createElement('button');
    key.type = 'button';
    key.textContent = letter;
    key.addEventListener('click', function () { typeLetter(letter); });
    line.appendChild(key);
  });
  if (i === 2) {
    var del = document.createElement('button');
    del.type = 'button';
    del.className = 'wide';
    del.textContent = '\u232B';
    del.setAttribute('aria-label', 'Delete');
    del.addEventListener('click', deleteLetter);
    line.appendChild(del);
  }
  game.querySelector('.game-keys').appendChild(line);
});

function drawBoxes() {
  boxes.forEach(function (box, i) {
    box.textContent = letters[i] || '';
    box.classList.toggle('current', i === letters.length);
  });
}

function typeLetter(letter) {
  if (letters.length >= ANSWER.length) return;
  letters.push(letter);
  message.textContent = '';
  drawBoxes();
  if (letters.length === ANSWER.length) checkAnswer();
}

function deleteLetter() {
  letters.pop();
  message.textContent = '';
  drawBoxes();
}

function checkAnswer() {
  if (letters.join('') === ANSWER) {
    setTimeout(function () { closeGame(); jumpScare(); }, 350);
  } else {
    boxesBox.classList.remove('wrong');
    void boxesBox.offsetWidth;                      // restart the shake animation
    boxesBox.classList.add('wrong');
    message.textContent = 'Not quite. Try again!';
  }
}

function openGame() {
  closeCard();
  letters = [];
  message.textContent = '';
  drawBoxes();
  game.hidden = false;
  document.body.style.overflow = 'hidden';          // no page scrolling behind the game
  prepareSound();                                   // browsers only allow sound after a click
  game.querySelector('.game-close').focus({ preventScroll: true });
}

function closeGame() {
  game.hidden = true;
  document.body.style.overflow = '';
}

card.querySelector('.clue-play').addEventListener('click', openGame);
game.querySelector('.game-close').addEventListener('click', closeGame);

// A real keyboard works too: letters, Backspace, and Escape to close.
document.addEventListener('keydown', function (event) {
  if (!card.hidden && event.key === 'Escape') closeCard();
  if (game.hidden || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key === 'Escape') closeGame();
  else if (event.key === 'Backspace') { event.preventDefault(); deleteLetter(); }
  else if (/^[a-z]$/i.test(event.key)) typeLetter(event.key.toUpperCase());
});

// --- the surprise ---
function jumpScare() {
  var show = function () {
    var overlay = document.createElement('div');
    overlay.className = 'scare';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.backgroundImage = 'url("jumpscare.jpg")';
    scream();
    document.body.appendChild(overlay);
    var close = function () {
      overlay.classList.add('closing');
      setTimeout(function () { overlay.remove(); }, 250);
      document.removeEventListener('keydown', close);
    };
    // A short pause, so the last key press doesn't close it straight away.
    setTimeout(function () {
      overlay.addEventListener('click', close);
      document.addEventListener('keydown', close);
    }, 500);
  };
  if (scareImage.complete && scareImage.naturalWidth) show();
  else { scareImage.onload = show; if (!scareImage.src) scareImage.src = 'jumpscare.jpg'; }
}


/* ============ JUMP SCARE SOUND ============
   No sound file: the browser makes the sound itself (Web Audio).
   Three layers: a screeching sweep, a burst of hiss, and a deep thud. */
var audio = null;

function prepareSound() {
  var Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) return;
  if (!audio) audio = new Context();
  if (audio.state === 'suspended') audio.resume();
}

function scream() {
  if (!audio) return;
  var now = audio.currentTime;

  // Everything goes through a limiter, so it's loud but never painfully clipped.
  var limiter = audio.createDynamicsCompressor();
  limiter.threshold.value = -10;
  limiter.ratio.value = 12;
  var master = audio.createGain();
  master.gain.value = 0.55;
  limiter.connect(master);
  master.connect(audio.destination);

  // 1. Screech: two slightly out-of-tune sawtooth tones sliding down, with a fast wobble.
  [0, 13].forEach(function (detune) {
    var tone = audio.createOscillator();
    tone.type = 'sawtooth';
    tone.frequency.setValueAtTime(1150, now);
    tone.frequency.exponentialRampToValueAtTime(260, now + 1.1);
    tone.detune.value = detune * 10;
    var wobble = audio.createOscillator();
    var wobbleDepth = audio.createGain();
    wobble.frequency.value = 23;
    wobbleDepth.gain.value = 45;
    wobble.connect(wobbleDepth);
    wobbleDepth.connect(tone.frequency);
    var level = audio.createGain();
    level.gain.setValueAtTime(0, now);
    level.gain.linearRampToValueAtTime(0.5, now + 0.02);
    level.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    tone.connect(level);
    level.connect(limiter);
    tone.start(now); wobble.start(now);
    tone.stop(now + 1.25); wobble.stop(now + 1.25);
  });

  // 2. Hiss: a short burst of filtered noise.
  var length = Math.floor(audio.sampleRate * 0.8);
  var buffer = audio.createBuffer(1, length, audio.sampleRate);
  var samples = buffer.getChannelData(0);
  for (var i = 0; i < length; i++) samples[i] = Math.random() * 2 - 1;
  var noise = audio.createBufferSource();
  noise.buffer = buffer;
  var band = audio.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = 2400;
  band.Q.value = 0.8;
  var hiss = audio.createGain();
  hiss.gain.setValueAtTime(0.9, now);
  hiss.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
  noise.connect(band);
  band.connect(hiss);
  hiss.connect(limiter);
  noise.start(now);

  // 3. Thud: a deep tone that drops quickly, like a hit.
  var thud = audio.createOscillator();
  thud.type = 'sine';
  thud.frequency.setValueAtTime(110, now);
  thud.frequency.exponentialRampToValueAtTime(35, now + 0.5);
  var thudLevel = audio.createGain();
  thudLevel.gain.setValueAtTime(1, now);
  thudLevel.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
  thud.connect(thudLevel);
  thudLevel.connect(limiter);
  thud.start(now);
  thud.stop(now + 0.65);
}


/* ============ EASTER EGG: π MODE ============
   Type 3.141 (or 3,141) anywhere on the page: it turns into a LaTeX paper, with
   Computer Modern type, numbered sections and a ∎ at the end. Type it again to
   leave. The font is only downloaded the first time someone finds this. */
var typedKeys = '';
var mathFontLoaded = false;
var toast = null;
var toastTimer = null;

function showToast(text) {
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'math-toast';
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.add('shown');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { toast.classList.remove('shown'); }, 3000);
}

function toggleMathMode() {
  if (!mathFontLoaded) {
    var font = document.createElement('link');
    font.rel = 'stylesheet';
    font.href = 'https://cdn.jsdelivr.net/gh/aaaakshat/cm-web-fonts@latest/fonts.css';
    document.head.appendChild(font);
    mathFontLoaded = true;
  }
  root.classList.add('theme-switching');            // the same soft fade as light/dark
  var on = root.classList.toggle('math-mode');
  setTimeout(function () { root.classList.remove('theme-switching'); sizeCanvas(); }, 400);
  showToast(UI_TEXT.mathMode[on ? 'on' : 'off'][currentLang]);
}

document.addEventListener('keydown', function (event) {
  var target = event.target;
  if (!game.hidden || event.ctrlKey || event.metaKey || event.altKey) return;
  if (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) && target.type !== 'range') return;
  if (event.key.length !== 1) return;
  typedKeys = (typedKeys + event.key.replace(',', '.')).slice(-5);
  if (typedKeys === '3.141') { typedKeys = ''; toggleMathMode(); }
});


/* ============ JULIA SET IN THE PHOTO ============
   Rest the mouse on the photo and it slowly turns into a Julia set: all points z
   where z → z² + c stays bounded. Where the mouse is picks c: the direction from
   the centre picks a point on the edge of the Mandelbrot set's main cardioid, the
   distance moves c a little inside (connected shapes) or outside (scattered dust).
   Computers only, because it needs a mouse resting on the photo. */
var julia = document.querySelector('.julia');

if (!calm && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  var juliaCtx = julia.getContext('2d');
  var JULIA_SIZE = 160;                              // pixels computed per side
  julia.width = julia.height = JULIA_SIZE;
  var juliaImage = juliaCtx.createImageData(JULIA_SIZE, JULIA_SIZE);
  var hover = { on: false, x: 0.5, y: 0.5, since: 0, amount: 0, drawnFor: '' };
  var palette = [];

  // 64 colours from the background through the link colour to the text colour.
  var readPalette = function () {
    var probe = document.createElement('span');
    document.body.appendChild(probe);
    var rgb = function (name) {
      probe.style.color = 'var(' + name + ')';
      return getComputedStyle(probe).color.match(/\d+/g).slice(0, 3).map(Number);
    };
    var stops = [rgb('--bg'), rgb('--link'), rgb('--text')];
    probe.remove();
    palette = [];
    for (var i = 0; i < 64; i++) {
      var t = i / 63 * 2, s = Math.min(1, Math.floor(t)), f = t - s;
      var a = stops[s], b = stops[Math.min(2, s + 1)];
      palette.push([0, 1, 2].map(function (k) { return Math.round(a[k] + (b[k] - a[k]) * f); }));
    }
  };

  var drawJulia = function () {
    var angle = Math.atan2(hover.y - 0.5, hover.x - 0.5);
    var reach = Math.min(1, Math.hypot(hover.x - 0.5, hover.y - 0.5) * 2);
    var s = 0.92 + 0.16 * reach;                    // < 1 inside the cardioid, > 1 outside
    var mx = s * Math.cos(angle), my = s * Math.sin(angle);
    var cx = mx / 2 - (mx * mx - my * my) / 4;      // c = μ/2 − μ²/4
    var cy = my / 2 - (2 * mx * my) / 4;
    var key = cx.toFixed(3) + ',' + cy.toFixed(3);
    if (key === hover.drawnFor) return;
    hover.drawnFor = key;

    var data = juliaImage.data, MAX = 80, span = 2.7 / JULIA_SIZE;
    for (var py = 0; py < JULIA_SIZE; py++) {
      for (var px = 0; px < JULIA_SIZE; px++) {
        var x = -1.35 + px * span, y = -1.35 + py * span, n = 0;
        while (n < MAX && x * x + y * y < 16) {
          var nx = x * x - y * y + cx;
          y = 2 * x * y + cy;
          x = nx;
          n++;
        }
        // Points that never escape get the text colour; the rest a smooth shade.
        var shade = n === MAX ? 63
          : Math.min(62, Math.floor((n + 1 - Math.log2(Math.log2(x * x + y * y) / 2)) * 2.2));
        var colour = palette[Math.max(0, shade)];
        var i = (py * JULIA_SIZE + px) * 4;
        data[i] = colour[0]; data[i + 1] = colour[1]; data[i + 2] = colour[2]; data[i + 3] = 255;
      }
    }
    juliaCtx.putImageData(juliaImage, 0, 0);
  };

  var juliaLoop = function (time) {
    // Fade in after resting 0.8 s, fully there after about 3 s; fade out faster.
    var target = hover.on ? Math.max(0, Math.min(0.92, (time - hover.since - 800) / 2400)) : 0;
    hover.amount += (target - hover.amount) * (hover.on ? 0.08 : 0.15);
    julia.style.opacity = hover.amount.toFixed(3);
    if (hover.amount > 0.01) drawJulia();
    if (hover.on || hover.amount > 0.01) requestAnimationFrame(juliaLoop);
  };

  tilt.addEventListener('pointerenter', function (event) {
    if (event.pointerType !== 'mouse') return;
    if (!hover.on && hover.amount < 0.01) {
      hover.since = performance.now();
      requestAnimationFrame(juliaLoop);
    }
    if (!palette.length) readPalette();
    hover.on = true;
  });
  tilt.addEventListener('pointermove', function (event) {
    if (event.pointerType !== 'mouse') return;
    var box = julia.getBoundingClientRect();
    hover.x = (event.clientX - box.left) / box.width;
    hover.y = (event.clientY - box.top) / box.height;
  });
  tilt.addEventListener('pointerleave', function () { hover.on = false; });
  new MutationObserver(function () { readPalette(); hover.drawnFor = ''; })
    .observe(root, { attributes: true, attributeFilter: ['data-theme', 'class'] });
}


/* ============ ULAM'S PRIME SPIRAL IN THE FOOTER ============
   Write 1, 2, 3, ... in a square spiral and mark the primes: they line up along
   diagonals, which nobody has fully explained. One new number every second the
   page is open (paused while the tab is in the background). The view zooms out
   as the spiral grows. */
var ulam = document.querySelector('.ulam');
var ulamCanvas = document.querySelector('.ulam-canvas');
var ulamCtx = ulamCanvas.getContext('2d');
var ulamCaption = document.querySelector('.ulam-caption');
var ulamN = 1;
var spiral = [[0, 0]];                               // spiral[n − 1] = position of n
try { ulamN = Math.max(1, +sessionStorage.getItem('ulam') || 1); } catch (e) {}

function isPrime(n) {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (var d = 3; d * d <= n; d += 2) if (n % d === 0) return false;
  return true;
}

// Steps of the spiral: 1 right, 1 up, 2 left, 2 down, 3 right, 3 up, ...
function growSpiral(count) {
  var dirs = [[1, 0], [0, -1], [-1, 0], [0, 1]];
  var x = 0, y = 0, leg = 1, dir = 0, done = 0;
  spiral = [[0, 0]];
  while (spiral.length < count) {
    x += dirs[dir][0]; y += dirs[dir][1];
    spiral.push([x, y]);
    if (++done === leg) { done = 0; dir = (dir + 1) % 4; if (dir % 2 === 0) leg++; }
  }
}

function drawUlam() {
  if (spiral.length < ulamN) growSpiral(ulamN + 200);
  var ratio = window.devicePixelRatio || 1, size = ulamCanvas.clientWidth;
  if (ulamCanvas.width !== Math.round(size * ratio)) {
    ulamCanvas.width = ulamCanvas.height = Math.round(size * ratio);
  }
  ulamCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ulamCtx.clearRect(0, 0, size, size);
  var style = getComputedStyle(root);
  var reach = Math.ceil(Math.sqrt(ulamN) / 2) + 1;   // how far from the centre it goes
  var cell = Math.min(14, size / (2 * reach + 1));
  for (var n = 1; n <= ulamN; n++) {
    var p = spiral[n - 1];
    var cx = size / 2 + p[0] * cell, cy = size / 2 + p[1] * cell;
    var prime = isPrime(n);
    ulamCtx.fillStyle = n === ulamN ? style.getPropertyValue('--link')
                      : prime ? style.getPropertyValue('--text') : style.getPropertyValue('--line');
    ulamCtx.beginPath();
    ulamCtx.arc(cx, cy, cell * (prime || n === ulamN ? 0.42 : 0.16), 0, 2 * Math.PI);
    ulamCtx.fill();
  }
  var text = UI_TEXT.ulam[currentLang].replace('{n}', ulamN);
  ulamCaption.textContent = isPrime(ulamN) ? text + ' ' + UI_TEXT.ulamPrime[currentLang] : text;
}

ulam.hidden = false;
drawUlam();
setInterval(function () {
  if (document.hidden) return;
  ulamN++;
  try { sessionStorage.setItem('ulam', ulamN); } catch (e) {}
  drawUlam();
}, 1000);
new MutationObserver(drawUlam).observe(root, { attributes: true, attributeFilter: ['data-theme', 'class', 'lang'] });


/* ============ CONFETTI WHEN THE EMAIL IS COPIED ============
   A small burst of maths symbols flies out of the Copy button and falls down. */
var SYMBOLS = ['∑', '∫', 'π', '∞', '√', '∂', '∇', 'ℵ', 'e', 'i', 'φ', '∈', '≅', '∀'];

function confetti(button) {
  if (calm) return;
  var box = button.getBoundingClientRect();
  var colours = ['--link', '--text', '--dot'];
  var pieces = [];
  for (var k = 0; k < 26; k++) {
    var piece = document.createElement('span');
    piece.className = 'confetti';
    piece.setAttribute('aria-hidden', 'true');
    piece.textContent = SYMBOLS[k % SYMBOLS.length];
    piece.style.color = 'var(' + colours[k % 3] + ')';
    piece.style.fontSize = (0.8 + Math.random() * 0.7).toFixed(2) + 'rem';
    document.body.appendChild(piece);
    var angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;   // mostly upwards
    var speed = 4 + Math.random() * 5;
    pieces.push({
      el: piece, x: box.left + box.width / 2, y: box.top + box.height / 2,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      spin: (Math.random() - 0.5) * 20, turn: 0
    });
  }
  var start = performance.now();
  var fly = function (time) {
    var age = (time - start) / 1600;                 // 0 → 1 over 1.6 seconds
    pieces.forEach(function (p) {
      p.vy += 0.25; p.vx *= 0.985;                   // gravity and a little air
      p.x += p.vx; p.y += p.vy; p.turn += p.spin;
      p.el.style.transform = 'translate(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px) rotate(' + p.turn.toFixed(0) + 'deg)';
      p.el.style.opacity = Math.max(0, 1 - age * age).toFixed(2);
    });
    if (age < 1) requestAnimationFrame(fly);
    else pieces.forEach(function (p) { p.el.remove(); });
  };
  requestAnimationFrame(fly);
}


/* ============ SPLIT-FLAP LANGUAGE SWITCH ============
   Short texts (menu, titles, place lines) rattle through random letters and land
   on the new word, like an old departure board at a train station. Longer
   paragraphs flip over once. Called by setLanguage above. */
var FLAP_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzäöüñéó';

function flapTo(el, html) {
  clearInterval(el.flapTimer);
  var plain = !/[<&]/.test(html) && html.length <= 70;
  if (!plain) {                                     // long text: one quick flip
    el.innerHTML = html;
    el.classList.remove('lang-flip');
    void el.offsetWidth;                             // restart the animation
    el.classList.add('lang-flip');
    return;
  }
  var target = html.replace(/\s+/g, ' ').trim();
  var frame = 0;
  el.flapTimer = setInterval(function () {
    frame++;
    var out = '';
    for (var i = 0; i < target.length; i++) {
      var ch = target[i];
      // Each letter keeps flipping until its turn comes, left to right.
      out += ch === ' ' || frame > 4 + i * 0.5 ? ch
           : FLAP_LETTERS[Math.floor(Math.random() * FLAP_LETTERS.length)];
    }
    el.textContent = out;
    if (frame > 4 + target.length * 0.5) { clearInterval(el.flapTimer); el.innerHTML = html; }
  }, 35);
}
