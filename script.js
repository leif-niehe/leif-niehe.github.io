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


/* ============ MATH CURVES BEHIND THE HEADER ============
   Each curve is a sum of Chebyshev polynomials T1..T5 whose coefficients slowly
   drift, so the curves bend and unbend over time. */
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

function drawCurves(time) {
  var w = canvas.clientWidth, h = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = getComputedStyle(root).getPropertyValue('--curve');
  ctx.lineWidth = 1.2;
  for (var i = 0; i < 5; i++) {
    ctx.beginPath();
    for (var x = 0; x <= w + 6; x += 6) {
      var u = Math.min(1, x / w) * 2 - 1;            // -1 .. 1
      var y = 0;
      for (var k = 1; k <= 5; k++) {
        var coefficient = Math.sin(time * 0.00011 * (1 + 0.37 * k + 0.21 * i) + i * 1.7 + k * 2.3) / k;
        y += coefficient * Math.cos(k * Math.acos(u));   // T_k(u)
      }
      var py = h * (0.14 + 0.17 * i) + y * h * 0.11;
      // Near the mouse or finger, pull the curve part of the way towards it.
      if (pointer.strength > 0.01) {
        var across = (x - pointer.x) / 110, up = (pointer.y - py) / 170;
        py += (pointer.y - py) * 0.45 * pointer.strength * Math.exp(-across * across - up * up);
      }
      if (x === 0) ctx.moveTo(x, py); else ctx.lineTo(x, py);
    }
    ctx.stroke();
  }
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

function setLanguage(lang) {
  if (!UI_TEXT.copy[lang]) lang = 'en';
  currentLang = lang;
  root.lang = lang;

  translatable.forEach(function (item) {
    item.el.innerHTML = lang === 'en' ? item.en : TRANSLATIONS[item.key][lang];
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
  button.addEventListener('click', function () { setLanguage(button.dataset.lang); });
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
