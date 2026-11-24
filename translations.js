/*
  translations.js = the German and Spanish versions of the page.

  How it works: each entry starts with the English text exactly as it is in index.html
  (spaces and line breaks don't matter). When a visitor picks DE or ES, script.js
  swaps that text for the translation.

  If you change an English text in index.html, change it here too, otherwise that
  text simply stays English in the other languages.
*/
var TRANSLATIONS = {

  /* ---------- Top bar ---------- */
  "About":        { de: "Über mich",  es: "Sobre mí" },
  "Projects":     { de: "Projekte",   es: "Proyectos" },
  "Education":    { de: "Studium",    es: "Formación" },
  "Languages":    { de: "Sprachen",   es: "Idiomas" },
  "Map":          { de: "Karte",      es: "Mapa" },
  "Experience":   { de: "Erfahrung",  es: "Experiencia" },
  "Volunteering": { de: "Ehrenamt",   es: "Voluntariado" },

  /* ---------- Header ---------- */
  "Mathematician, tutor, volunteer and event organizer": {
    de: "Mathematiker, Tutor, Ehrenamtlicher und Eventorganisator",
    es: "Matemático, tutor, voluntario y organizador de eventos"
  },
  "Currently volunteering at The Working Centre and looking for work in Kitchener-Waterloo.": {
    de: "Zurzeit ehrenamtlich bei The Working Centre und auf Jobsuche in Kitchener-Waterloo.",
    es: "Actualmente voluntario en The Working Centre y buscando trabajo en Kitchener-Waterloo."
  },

  /* ---------- Pólya demo ---------- */
  "Pólya's Theorem, Live": { de: "Der Satz von Pólya, live", es: "El teorema de Pólya, en vivo" },
  "My bachelor's thesis was about Pólya's theorem: if a polynomial is positive on the triangle where x, y, z ≥ 0, then multiplying it by (x + y + z) often enough makes every coefficient positive. The question is how often is enough.": {
    de: "In meiner Bachelorarbeit ging es um den Satz von Pólya: Ist ein Polynom auf dem Dreieck mit x, y, z ≥ 0 positiv, dann werden alle Koeffizienten positiv, wenn man es nur oft genug mit (x + y + z) multipliziert. Die Frage ist, wie oft genug ist.",
    es: "Mi tesis de grado trató sobre el teorema de Pólya: si un polinomio es positivo en el triángulo donde x, y, z ≥ 0, al multiplicarlo suficientes veces por (x + y + z) todos sus coeficientes se vuelven positivos. La pregunta es cuántas veces son suficientes."
  },
  "p = x² + y² + z² − <var>c</var>·(xy + yz + zx), multiplied by (x + y + z)<sup><var>N</var></sup>": {
    de: "p = x² + y² + z² − <var>c</var>·(xy + yz + zx), multipliziert mit (x + y + z)<sup><var>N</var></sup>",
    es: "p = x² + y² + z² − <var>c</var>·(xy + yz + zx), multiplicado por (x + y + z)<sup><var>N</var></sup>"
  },
  "Each dot is one coefficient. The closer c gets to 1, the closer p comes to zero in the middle of the triangle, and the more multiplications it needs.": {
    de: "Jeder Punkt ist ein Koeffizient. Je näher c an 1 kommt, desto näher kommt p in der Mitte des Dreiecks an null, und desto mehr Multiplikationen braucht es.",
    es: "Cada punto es un coeficiente. Cuanto más se acerca c a 1, más se acerca p a cero en el centro del triángulo, y más multiplicaciones hacen falta."
  },

  /* ---------- About ---------- */
  "Mathematics graduate (M.Sc., TU Braunschweig) with a minor in computer science. I have taught university algebra, used Julia for research and my thesis, and build small tools that automate my own work.": {
    de: "Mathematikabsolvent (M.Sc., TU Braunschweig) mit Nebenfach Informatik. Ich habe an der Universität Übungen zur Algebra geleitet, Julia für die Forschung und meine Masterarbeit genutzt und baue kleine Tools, die meine eigene Arbeit automatisieren.",
    es: "Graduado en Matemáticas (M.Sc., TU Braunschweig) con informática como asignatura secundaria. He dado clases de álgebra en la universidad, he usado Julia en la investigación y en mi tesis, y creo pequeñas herramientas que automatizan mi propio trabajo."
  },
  "I also enjoy working with people and in teams: leading exercise sessions, organizing events for exchange students, and now welcoming visitors at the front desk of The Working Centre in Kitchener.": {
    de: "Ich arbeite auch gern mit Menschen und im Team: Übungsgruppen leiten, Veranstaltungen für Austauschstudierende organisieren und jetzt Besucher am Empfang von The Working Centre in Kitchener begrüßen.",
    es: "También disfruto trabajando con personas y en equipo: dirigiendo clases prácticas, organizando eventos para estudiantes de intercambio y ahora recibiendo a los visitantes en la recepción de The Working Centre en Kitchener."
  },

  /* ---------- Projects ---------- */
  "A Python tool that turns scanned handwritten notes (PDFs and photos) into searchable Markdown, using Claude's vision through the Claude Code CLI. It splits multi-page scans into separate notes, works out dates, tags notes, and resumes cleanly after an interrupted run.": {
    de: "Ein Python-Tool, das eingescannte handschriftliche Notizen (PDFs und Fotos) mit Claudes Bilderkennung über die Claude Code CLI in durchsuchbares Markdown umwandelt. Es teilt mehrseitige Scans in einzelne Notizen auf, ermittelt Datumsangaben, verschlagwortet die Notizen und macht nach einem abgebrochenen Lauf sauber weiter.",
    es: "Una herramienta en Python que convierte notas manuscritas escaneadas (PDF y fotos) en Markdown con búsqueda, usando la visión de Claude a través de la CLI de Claude Code. Divide los escaneos de varias páginas en notas separadas, deduce las fechas, etiqueta las notas y continúa sin problemas tras una ejecución interrumpida."
  },
  "A spaced-repetition system for advanced English (collocation, register, near-synonyms). Claude runs the tutoring sessions from a written grading rubric, and a small scheduler written with only the Python standard library decides when each card comes back.": {
    de: "Ein Spaced-Repetition-System für fortgeschrittenes Englisch (Kollokationen, Register, Beinahe-Synonyme). Claude leitet die Lerneinheiten nach einem schriftlichen Bewertungsschema, und ein kleiner Scheduler, nur mit der Python-Standardbibliothek geschrieben, entscheidet, wann jede Karte wiederkommt.",
    es: "Un sistema de repetición espaciada para inglés avanzado (colocaciones, registro, cuasisinónimos). Claude dirige las sesiones de tutoría a partir de una rúbrica de evaluación escrita, y un pequeño planificador escrito solo con la biblioteca estándar de Python decide cuándo vuelve cada tarjeta."
  },

  /* ---------- Education ---------- */
  "M.Sc. Mathematics, TU Braunschweig": { de: "M.Sc. Mathematik, TU Braunschweig", es: "M.Sc. en Matemáticas, TU Braunschweig" },
  "B.Sc. Mathematics, TU Braunschweig": { de: "B.Sc. Mathematik, TU Braunschweig", es: "B.Sc. en Matemáticas, TU Braunschweig" },
  "Germany · 2023 – 2026 · Minor: Computer Science": {
    de: "Deutschland · 2023 – 2026 · Nebenfach: Informatik",
    es: "Alemania · 2023 – 2026 · Asignatura secundaria: Informática"
  },
  "Germany · 2019 – 2023 · Minor: Physics": {
    de: "Deutschland · 2019 – 2023 · Nebenfach: Physik",
    es: "Alemania · 2019 – 2023 · Asignatura secundaria: Física"
  },
  // The thesis titles stay in English: those are their official titles.
  "Thesis: <em>Solution Recovery in Sparse Polynomial Optimization</em>": {
    de: "Masterarbeit: <em>Solution Recovery in Sparse Polynomial Optimization</em>",
    es: "Tesis de máster: <em>Solution Recovery in Sparse Polynomial Optimization</em>"
  },
  "Thesis: <em>Effective Bounds on Pólya's Theorem</em>": {
    de: "Bachelorarbeit: <em>Effective Bounds on Pólya's Theorem</em>",
    es: "Trabajo de fin de grado: <em>Effective Bounds on Pólya's Theorem</em>"
  },
  "Exchange terms": { de: "Auslandssemester", es: "Semestres de intercambio" },
  "University of Waterloo, Canada (Fall 2025)": {
    de: "University of Waterloo, Kanada (Herbst 2025)",
    es: "University of Waterloo, Canadá (otoño de 2025)"
  },
  "Universidad de La Rioja, Spain (Fall 2024)": {
    de: "Universidad de La Rioja, Spanien (Herbst 2024)",
    es: "Universidad de La Rioja, España (otoño de 2024)"
  },
  "National Tsing Hua University, Taiwan (Fall 2021)": {
    de: "National Tsing Hua University, Taiwan (Herbst 2021)",
    es: "National Tsing Hua University, Taiwán (otoño de 2021)"
  },

  /* ---------- Languages ---------- */
  "German":           { de: "Deutsch",               es: "Alemán" },
  "English":          { de: "Englisch",              es: "Inglés" },
  "Spanish":          { de: "Spanisch",              es: "Español" },
  "Native":           { de: "Muttersprache",         es: "Lengua materna" },
  "Fluent (C1–C2)":   { de: "Fließend (C1–C2)",      es: "Fluido (C1–C2)" },
  "Upper intermediate (B2)": { de: "Gute Kenntnisse (B2)", es: "Intermedio alto (B2)" },

  /* ---------- Map ---------- */
  "Where I've Studied and Worked": { de: "Wo ich studiert und gearbeitet habe", es: "Dónde he estudiado y trabajado" },
  "Kitchener-Waterloo, Canada": { de: "Kitchener-Waterloo, Kanada", es: "Kitchener-Waterloo, Canadá" },
  "Manchester, UK":             { de: "Manchester, Großbritannien", es: "Manchester, Reino Unido" },
  "Braunschweig, Germany":      { de: "Braunschweig, Deutschland",  es: "Braunschweig, Alemania" },
  "Logroño, Spain":             { de: "Logroño, Spanien",           es: "Logroño, España" },
  "Haputale, Sri Lanka":        { de: "Haputale, Sri Lanka",        es: "Haputale, Sri Lanka" },
  "Hsinchu, Taiwan":            { de: "Hsinchu, Taiwan",            es: "Hsinchu, Taiwán" },
  "Exchange, volunteering · 2025 – now": { de: "Austausch, Ehrenamt · 2025 – heute", es: "Intercambio, voluntariado · 2025 – hoy" },
  "Gardening · 2025 – 2026":    { de: "Gartenarbeit · 2025 – 2026", es: "Jardinería · 2025 – 2026" },
  "Studies, ESN · 2019 – 2026": { de: "Studium, ESN · 2019 – 2026", es: "Estudios, ESN · 2019 – 2026" },
  "Exchange · 2024":            { de: "Austausch · 2024",           es: "Intercambio · 2024" },
  "Guesthouse · 2022":          { de: "Gästehaus · 2022",           es: "Casa de huéspedes · 2022" },
  "Exchange · 2021":            { de: "Austausch · 2021",           es: "Intercambio · 2021" },

  /* ---------- Experience ---------- */
  "Student Research Assistant, Institute of Applied Algebra": {
    de: "Studentische Hilfskraft, Institut für Angewandte Algebra",
    es: "Asistente de investigación, Instituto de Álgebra Aplicada"
  },
  "TU Braunschweig, Germany · 2025": { de: "TU Braunschweig, Deutschland · 2025", es: "TU Braunschweig, Alemania · 2025" },
  "Developed polynomial optimization software in Julia, wrote tests that caught bugs for the other developers to fix, and worked in a multi-branch Git workflow with code reviews.": {
    de: "Software zur polynomiellen Optimierung in Julia entwickelt, Tests geschrieben, die Fehler für die anderen Entwickler aufgedeckt haben, und in einem Git-Workflow mit mehreren Branches und Code-Reviews gearbeitet.",
    es: "Desarrollé software de optimización polinomial en Julia, escribí pruebas que detectaron errores para que los demás desarrolladores los corrigieran y trabajé con un flujo de Git de varias ramas con revisiones de código."
  },
  "Teaching Assistant, Abstract Algebra": { de: "Übungsgruppenleiter, Abstrakte Algebra", es: "Profesor asistente, Álgebra Abstracta" },
  "TU Braunschweig, Germany · 2023 and 2024": { de: "TU Braunschweig, Deutschland · 2023 und 2024", es: "TU Braunschweig, Alemania · 2023 y 2024" },
  "Led weekly exercise sessions for computer science and mathematics students and graded their homework.": {
    de: "Wöchentliche Übungsgruppen für Informatik- und Mathematikstudierende geleitet und ihre Hausaufgaben korrigiert.",
    es: "Dirigí clases prácticas semanales para estudiantes de informática y matemáticas y corregí sus tareas."
  },

  /* ---------- Volunteering ---------- */
  "Front Office, Computer Support, Bike Repair and Food Service": {
    de: "Empfang, Computerhilfe, Fahrradreparatur und Essensausgabe",
    es: "Recepción, soporte informático, reparación de bicicletas y servicio de comidas"
  },
  "The Working Centre, Kitchener, Canada · Oct 2026 – present": {
    de: "The Working Centre, Kitchener, Kanada · Okt. 2026 – heute",
    es: "The Working Centre, Kitchener, Canadá · oct. 2026 – actualidad"
  },
  "Welcome visitors at the front desk, help people with documents and online applications, and fix up donated bikes at Recycle Cycles. In the soup kitchen I prepare and hand out food, and in the café I also make drinks and handle cash.": {
    de: "Ich begrüße Besucher am Empfang, helfe Menschen mit Dokumenten und Online-Anträgen und mache gespendete Fahrräder bei Recycle Cycles wieder fit. In der Suppenküche bereite ich Essen vor und gebe es aus, und im Café mache ich außerdem Getränke und kassiere.",
    es: "Recibo a los visitantes en la recepción, ayudo a las personas con documentos y solicitudes en línea, y arreglo bicicletas donadas en Recycle Cycles. En el comedor social preparo y reparto comida, y en el café también preparo bebidas y cobro."
  },
  "Kitchen Aid and Food Distributor": { de: "Küchenhilfe und Essensausgabe", es: "Ayudante de cocina y reparto de comida" },
  "Tiny Home Takeout, Kitchener, Canada · Oct – Dec 2025 and Nov 2026 – present": {
    de: "Tiny Home Takeout, Kitchener, Kanada · Okt. – Dez. 2025 und Nov. 2026 – heute",
    es: "Tiny Home Takeout, Kitchener, Canadá · oct. – dic. 2025 y nov. 2026 – actualidad"
  },
  "Prepare meals and hand out food and coffee to people in need.": {
    de: "Ich bereite Mahlzeiten zu und gebe Essen und Kaffee an Menschen in Not aus.",
    es: "Preparo comidas y reparto comida y café a personas necesitadas."
  },
  "Gardening Volunteer": { de: "Ehrenamtliche Gartenarbeit", es: "Voluntario de jardinería" },
  "Manchester, UK · May 2025 and Feb – May 2026": {
    de: "Manchester, Großbritannien · Mai 2025 und Feb. – Mai 2026",
    es: "Manchester, Reino Unido · mayo 2025 y feb. – mayo 2026"
  },
  "Planted, weeded and cleared garden paths.": {
    de: "Gepflanzt, Unkraut gejätet und Gartenwege freigeräumt.",
    es: "Planté, quité malas hierbas y despejé los caminos del jardín."
  },
  "Event Organizer, Erasmus Student Network": {
    de: "Eventorganisator, Erasmus Student Network",
    es: "Organizador de eventos, Erasmus Student Network"
  },
  "Braunschweig, Germany · 2023 – 2026": { de: "Braunschweig, Deutschland · 2023 – 2026", es: "Braunschweig, Alemania · 2023 – 2026" },
  "Organized more than 25 sports and social events for international exchange students, with 10 to 50 attendees each, planning every event within its budget.": {
    de: "Mehr als 25 Sport- und Freizeitveranstaltungen für internationale Austauschstudierende mit jeweils 10 bis 50 Teilnehmenden organisiert und jede Veranstaltung im Rahmen ihres Budgets geplant.",
    es: "Organicé más de 25 eventos deportivos y sociales para estudiantes de intercambio internacionales, con entre 10 y 50 asistentes cada uno, planificando cada evento dentro de su presupuesto."
  },
  "Workaway Volunteer": { de: "Workaway-Freiwilliger", es: "Voluntario de Workaway" },
  "Spain · Sep 2024 – Jan 2025": { de: "Spanien · Sept. 2024 – Jan. 2025", es: "España · sept. 2024 – ene. 2025" },
  "Garden and animal care, private math tutoring and childcare.": {
    de: "Garten- und Tierpflege, Mathe-Nachhilfe und Kinderbetreuung.",
    es: "Cuidado del jardín y de los animales, clases particulares de matemáticas y cuidado de niños."
  },
  "Guesthouse Volunteer": { de: "Freiwilliger im Gästehaus", es: "Voluntario en una casa de huéspedes" },
  "White Monkey Dias Rest, Sri Lanka · Feb – Apr 2022": {
    de: "White Monkey Dias Rest, Sri Lanka · Feb. – Apr. 2022",
    es: "White Monkey Dias Rest, Sri Lanka · feb. – abr. 2022"
  },
  "Welcomed guests, handled check-in and check-out, and helped with daily operations.": {
    de: "Gäste empfangen, Check-in und Check-out erledigt und im täglichen Betrieb mitgeholfen.",
    es: "Recibí a los huéspedes, gestioné el check-in y el check-out, y ayudé en las tareas diarias."
  }
};

/* Words and phrases that script.js builds itself. */
var UI_TEXT = {
  roles: {
    en: ['Mathematician', 'Tutor', 'Volunteer', 'Event organizer'],
    de: ['Mathematiker', 'Tutor', 'Ehrenamtlicher', 'Eventorganisator'],
    es: ['Matemático', 'Tutor', 'Voluntario', 'Organizador de eventos']
  },
  copy:    { en: 'Copy',    de: 'Kopieren', es: 'Copiar' },
  copied:  { en: 'Copied!', de: 'Kopiert!', es: '¡Copiado!' },
  // {time} is replaced by the time in Kitchener.
  time:    { en: 'It’s {time} in Kitchener right now', de: 'In Kitchener ist es gerade {time} Uhr', es: 'En Kitchener son ahora las {time}' },
  // {date} is replaced by the month and year from the English "Last updated" line.
  updated: { en: 'Last updated {date}', de: 'Zuletzt aktualisiert: {date}', es: 'Última actualización: {date}' },
  // Pólya demo. {bad}, {total}, {N}, {c} and {limit} are filled in by script.js.
  polya: {
    play:     { en: 'Play',  de: 'Abspielen', es: 'Reproducir' },
    pause:    { en: 'Pause', de: 'Pause',     es: 'Pausa' },
    negative: { en: '{bad} of {total} coefficients are still negative.',
                de: '{bad} von {total} Koeffizienten sind noch negativ.',
                es: '{bad} de {total} coeficientes siguen siendo negativos.' },
    positive: { en: 'All {total} coefficients are positive.',
                de: 'Alle {total} Koeffizienten sind positiv.',
                es: 'Los {total} coeficientes son positivos.' },
    needed:   { en: 'For c = {c}, N = {N} is enough.',
                de: 'Für c = {c} reicht N = {N}.',
                es: 'Para c = {c}, basta con N = {N}.' },
    tooMany:  { en: 'For c = {c}, it takes more than {limit}.',
                de: 'Für c = {c} braucht es mehr als {limit}.',
                es: 'Para c = {c}, hacen falta más de {limit}.' }
  },
  // Ulam spiral in the footer. {n} is the newest number.
  ulam:      { en: 'Ulam’s prime spiral, one number for every second you’ve been here: {n}',
               de: 'Ulams Primzahlspirale, eine Zahl für jede Sekunde, die du hier bist: {n}',
               es: 'La espiral de primos de Ulam, un número por cada segundo que llevas aquí: {n}' },
  ulamPrime: { en: '(a prime!)', de: '(eine Primzahl!)', es: '(¡un primo!)' },
  // Math mode (type 3.141 anywhere on the page).
  mathMode: {
    on:  { en: 'π mode. Type 3.141 again to leave.',
           de: 'π-Modus. Tippe noch mal 3.141 zum Verlassen.',
           es: 'Modo π. Escribe 3.141 otra vez para salir.' },
    off: { en: 'Back to normal.', de: 'Zurück zum Normalmodus.', es: 'De vuelta a la normalidad.' }
  }
};
