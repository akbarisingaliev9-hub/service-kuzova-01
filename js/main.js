/* =========================================================
   service kuzova 01 — интерактивность сайта
   1. Шапка и меню        6. Слайдер «до / после»
   2. Анимации появления  7. Вкладки цен
   3. Счётчики            8. Форма записи
   4. Модальные окна      9. Прочее
   5. Калькулятор
   ========================================================= */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const formatPrice = (n) => Math.round(n).toLocaleString("ru-RU").replace(/,/g, " ") + " ₸";

  /* ---------- 1. Шапка и мобильное меню ---------- */
  const header = $("#header");
  const nav = $("#nav");
  const burger = $("#burger");
  const toTop = $("#toTop");

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 20);
    toTop.classList.toggle("is-visible", y > 700);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function toggleMenu(open) {
    nav.classList.toggle("is-open", open);
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("no-scroll", open);
  }
  burger.addEventListener("click", () => toggleMenu(!nav.classList.contains("is-open")));
  $$("a", nav).forEach((a) => a.addEventListener("click", () => toggleMenu(false)));
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // Подсветка активного пункта меню
  const navLinks = $$("a", nav);
  const sections = navLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => navObserver.observe(s));

  /* ---------- 2. Анимации появления ---------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  $$(".reveal").forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 80 + "ms";
    revealObserver.observe(el);
  });

  /* ---------- 3. Счётчики на главном экране ---------- */
  function animateCount(el) {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const duration = 1600;
    const start = performance.now();
    function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("ru-RU") + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        animateCount(e.target);
        countObserver.unobserve(e.target);
      }
    });
  });
  $$("[data-count]").forEach((el) => countObserver.observe(el));

  /* ---------- 4. Модальное окно ---------- */
  const modal = $("#modal");
  const modalContent = $("#modalContent");
  let lastFocus = null;

  function openModal(html) {
    lastFocus = document.activeElement;
    modalContent.innerHTML = html;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    $(".modal__close", modal).focus();
  }
  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    if (lastFocus) lastFocus.focus();
  }
  modal.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  // Подробные описания услуг
  const SERVICES = {
    body: {
      title: "Кузовной ремонт",
      text: "Восстанавливаем повреждённые элементы кузова после ДТП, ударов и коррозии. Если деталь можно отремонтировать — ремонтируем, а не меняем: это дешевле и сохраняет заводские соединения.",
      price: "от 25 000 ₸", time: "1–5 дней", warranty: "3 года",
      includes: ["Дефектовка и замер толщины ЛКП", "Рихтовка и вытяжка споттером", "Сварка (полуавтомат, точечная сварка)", "Замена порогов, арок, крыльев", "Антикоррозийная обработка швов"],
    },
    paint: {
      title: "Покраска автомобиля",
      text: "Красим отдельные элементы и кузов целиком в профессиональной покрасочно-сушильной камере. Используем двухкомпонентные материалы премиум-класса.",
      price: "от 45 000 ₸", time: "2–7 дней", warranty: "3 года",
      includes: ["Компьютерный подбор цвета спектрофотометром", "Тестовый выкрас и сверка цвета", "Шпатлёвка, грунт, матирование", "Покраска базой и лаком в камере", "Сушка при +60 °C и финишная полировка"],
    },
    frame: {
      title: "Стапельные работы (геометрия)",
      text: "После серьёзного ДТП нарушается геометрия кузова — авто «уводит», неравномерно стирается резина, не закрываются двери. Восстанавливаем геометрию на стапеле по заводским контрольным точкам.",
      price: "от 100 000 ₸", time: "2–4 дня", warranty: "3 года",
      includes: ["Электронный замер геометрии", "Распечатка карты замеров до и после", "Вытяжка лонжеронов, стоек, проёмов", "Замена силовых элементов", "Проверка зазоров и развал-схождение"],
    },
    polish: {
      title: "Полировка и керамика",
      text: "Убираем мелкие царапины, голограммы и потёртости, возвращаем глубину цвета и блеск. Для долговременной защиты наносим керамическое покрытие или полиуретановую плёнку.",
      price: "от 60 000 ₸", time: "1–3 дня", warranty: "до 2 лет (керамика)",
      includes: ["Детейлинг-мойка и очистка глиной", "Многоэтапная абразивная полировка", "Нанесение керамики в 1–3 слоя", "Оклейка зон риска плёнкой", "Инструкция по уходу"],
    },
    anticor: {
      title: "Антикоррозийная обработка",
      text: "Защищаем кузов от ржавчины, реагентов и соли — особенно важно для казахстанских зим. Используем материалы на восковой и битумной основе.",
      price: "от 40 000 ₸", time: "1 день", warranty: "2 года",
      includes: ["Мойка днища и снятие подкрылков", "Удаление очагов коррозии, преобразователь ржавчины", "Обработка скрытых полостей", "Покрытие днища и арок", "Шумоизоляция арок по желанию"],
    },
    plastic: {
      title: "Ремонт бамперов и пластика",
      text: "Восстанавливаем бамперы, накладки, решётки и подкрылки. В большинстве случаев ремонт в 2–3 раза дешевле покупки новой детали.",
      price: "от 15 000 ₸", time: "1–2 дня", warranty: "1 год",
      includes: ["Пайка трещин и разрывов", "Восстановление креплений и «ушек»", "Выравнивание вмятин нагревом", "Грунт для пластика и покраска", "Установка датчиков парковки"],
    },
  };

  $$(".service").forEach((card) => {
    card.addEventListener("click", () => {
      const s = SERVICES[card.dataset.service];
      if (!s) return;
      openModal(`
        <h3>${s.title}</h3>
        <p>${s.text}</p>
        <div class="modal__meta">
          <div><span>Стоимость</span><b>${s.price}</b></div>
          <div><span>Срок</span><b>${s.time}</b></div>
          <div><span>Гарантия</span><b>${s.warranty}</b></div>
        </div>
        <h4>Что входит в работу</h4>
        <ul>${s.includes.map((i) => `<li>${i}</li>`).join("")}</ul>
        <a href="#booking" class="btn btn--primary btn--block" style="margin-top:24px" data-close data-service-name="${s.title}">Записаться на эту услугу</a>
      `);
      const btn = $("[data-service-name]", modalContent);
      btn.addEventListener("click", () => selectService(s.title));
    });
  });

  /* ---------- 5. Калькулятор стоимости ---------- */
  const PARTS = {
    bumperF: { name: "Передний бампер", k: 0.9 },
    hood: { name: "Капот", k: 1.2 },
    roof: { name: "Крыша", k: 1.3 },
    trunk: { name: "Крышка багажника", k: 1.05 },
    bumperR: { name: "Задний бампер", k: 0.9 },
    fenderFL: { name: "Переднее левое крыло", k: 0.95 },
    doorFL: { name: "Передняя левая дверь", k: 1 },
    doorRL: { name: "Задняя левая дверь", k: 1 },
    fenderRL: { name: "Заднее левое крыло", k: 1.1 },
    fenderFR: { name: "Переднее правое крыло", k: 0.95 },
    doorFR: { name: "Передняя правая дверь", k: 1 },
    doorRR: { name: "Задняя правая дверь", k: 1 },
    fenderRR: { name: "Заднее правое крыло", k: 1.1 },
  };
  // Базовая цена одного элемента (малый класс) и срок в днях
  const WORKS = {
    paint: { price: 45000, days: 1, paint: true, label: "Только покраска" },
    repair: { price: 75000, days: 1.5, paint: true, label: "Ремонт + покраска" },
    replace: { price: 105000, days: 2, paint: true, label: "Замена + покраска" },
  };

  const state = { carClass: 1, work: "paint", paint: 1, parts: new Set() };
  const carTop = $("#carTop");
  const selectedList = $("#selectedParts");

  $$(".chips").forEach((group) => {
    group.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      $$(".chip", group).forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      const key = group.dataset.group;
      state[key] = key === "work" ? chip.dataset.value : Number(chip.dataset.value);
      updateCalc();
    });
  });

  function togglePart(id) {
    if (state.parts.has(id)) state.parts.delete(id);
    else state.parts.add(id);
    updateCalc();
  }

  $$(".part", carTop).forEach((p) => {
    const id = p.dataset.part;
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = PARTS[id].name;
    p.appendChild(title);
    p.setAttribute("tabindex", "0");
    p.setAttribute("role", "checkbox");
    p.addEventListener("click", () => togglePart(id));
    p.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        togglePart(id);
      }
    });
  });

  selectedList.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-remove]");
    if (btn) togglePart(btn.dataset.remove);
  });

  function updateCalc() {
    // Подсветка деталей на схеме
    $$(".part", carTop).forEach((p) => {
      const on = state.parts.has(p.dataset.part);
      p.classList.toggle("is-selected", on);
      p.setAttribute("aria-checked", String(on));
    });

    // Список выбранных деталей
    $("#partsCount").textContent = `(${state.parts.size})`;
    selectedList.innerHTML = state.parts.size
      ? [...state.parts].map((id) => `<li>${PARTS[id].name}<button type="button" data-remove="${id}" aria-label="Убрать">×</button></li>`).join("")
      : '<li class="muted">Пока ничего не выбрано</li>';

    // Расчёт
    const work = WORKS[state.work];
    const paintK = work.paint ? state.paint : 1;
    let sum = 0;
    state.parts.forEach((id) => {
      sum += work.price * PARTS[id].k * state.carClass * paintK;
    });
    // Скидка за комплексный ремонт: от 3 деталей −5%, от 6 деталей −10%
    const n = state.parts.size;
    const discount = n >= 6 ? 0.1 : n >= 3 ? 0.05 : 0;
    sum *= 1 - discount;

    const priceEl = $("#calcPrice");
    const daysEl = $("#calcDays");
    if (!n) {
      priceEl.textContent = "0 ₸";
      daysEl.textContent = "Срок: выберите детали на схеме";
      return;
    }
    const min = Math.round((sum * 0.9) / 1000) * 1000;
    const max = Math.round((sum * 1.1) / 1000) * 1000;
    priceEl.textContent = `${formatPrice(min)} – ${formatPrice(max)}`;

    let days = Math.ceil(work.days + (n - 1) * work.days * 0.6);
    const daysText = `${days}–${days + 1} ${plural(days + 1, ["день", "дня", "дней"])}`;
    daysEl.textContent = `Срок: ${daysText}` + (discount ? ` · скидка ${discount * 100}% за комплекс` : "");
  }

  function plural(n, forms) {
    const n10 = n % 10, n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return forms[0];
    if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1];
    return forms[2];
  }

  // Текст с выбором клиента в калькуляторе (для сообщения в WhatsApp)
  function calcSummary() {
    if (!state.parts.size) return "";
    const chipText = (group) => $(`[data-group="${group}"] .chip.is-active`).textContent.trim();
    const lines = [
      "🚗 Расчёт на сайте:",
      `• Класс авто: ${chipText("carClass")}`,
      `• Вид работ: ${chipText("work")}`,
    ];
    if (WORKS[state.work].paint) lines.push(`• Краска: ${chipText("paint")}`);
    lines.push(`• Повреждённые детали: ${[...state.parts].map((id) => PARTS[id].name.toLowerCase()).join(", ")}`);
    lines.push(`• Стоимость: ${$("#calcPrice").textContent}`);
    lines.push(`• ${$("#calcDays").textContent}`);
    return lines.join("\n");
  }

  // Кнопка калькулятора: сразу открывает WhatsApp с расчётом
  $("#calcBook").addEventListener("click", () => {
    if (!state.parts.size) {
      const hint = $(".calc__hint");
      hint.textContent = "Сначала выберите повреждённые детали на схеме ↑";
      hint.style.color = "var(--accent)";
      carTop.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    openWhatsApp(`Здравствуйте! Хочу записаться на ремонт.\n\n${calcSummary()}\n\nПодскажите, когда можно приехать на осмотр?`);
  });

  updateCalc();

  /* ---------- 6. Слайдер «до / после» ---------- */
  const CAR_PATH = "M30 170 L40 128 Q50 112 82 107 L175 98 Q215 64 265 50 Q305 40 365 43 Q418 46 456 82 L486 102 Q548 108 572 122 Q588 133 585 158 L582 172 Q578 180 566 180 L526 180 A48 48 0 0 0 430 180 L205 180 A48 48 0 0 0 109 180 L46 180 Q30 180 30 170 Z";

  const CASES = [
    {
      color: ["#4a7dff", "#1d3fa8"],
      damage: `
        <ellipse cx="370" cy="145" rx="42" ry="22" fill="#000" opacity=".45"/>
        <ellipse cx="362" cy="140" rx="26" ry="12" fill="#000" opacity=".35"/>
        <path d="M335 128 Q370 150 408 132" stroke="#fff" stroke-opacity=".35" stroke-width="2" fill="none"/>
        <path d="M330 160 L410 152" stroke="#c9d6ff" stroke-width="1.5" opacity=".6"/>`,
      info: [["Автомобиль", "Toyota Camry"], ["Работы", "Рихтовка и покраска двери"], ["Срок", "1 день"], ["Стоимость", "45 000 ₸"]],
    },
    {
      color: ["#e8e8ec", "#9a9ca6"],
      damage: `
        <path d="M120 130 L260 150 M130 140 L250 158 M150 125 L230 140" stroke="#5b5f6b" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M330 120 L470 140 M350 132 L450 150" stroke="#5b5f6b" stroke-width="2" stroke-linecap="round"/>
        <circle cx="520" cy="130" r="4" fill="#5b5f6b"/><circle cx="535" cy="140" r="3" fill="#5b5f6b"/><circle cx="545" cy="126" r="2.5" fill="#5b5f6b"/>
        <circle cx="300" cy="80" r="3" fill="#5b5f6b"/><circle cx="420" cy="70" r="2.5" fill="#5b5f6b"/>
        <rect x="40" y="105" width="560" height="80" fill="#3d3a2a" opacity=".18"/>`,
      info: [["Автомобиль", "Hyundai Tucson"], ["Работы", "Полировка + локальный ремонт"], ["Срок", "2 дня"], ["Стоимость", "95 000 ₸"]],
    },
    {
      color: ["#d6252f", "#7a0d13"],
      damage: `
        <path d="M486 102 Q520 112 540 140 L520 150 L560 160 L540 178 L500 170 Z" fill="#2a0508" opacity=".85"/>
        <path d="M470 105 L520 130 L490 150 L530 170" stroke="#e8e8e8" stroke-width="2" fill="none" opacity=".6"/>
        <path d="M556 140 L575 132" stroke="#111" stroke-width="5"/>
        <path d="M448 88 L470 100 L452 112" stroke="#fff" stroke-width="1.5" fill="none" opacity=".5"/>
        <rect x="548" y="122" width="34" height="22" fill="#2b2b2b" opacity=".9"/>`,
      info: [["Автомобиль", "Kia Sportage"], ["Работы", "Стапель, замена крыла, покраска"], ["Срок", "6 дней"], ["Стоимость", "420 000 ₸"]],
    },
  ];

  function carSVG(c, broken, idx) {
    const id = `g${idx}${broken ? "b" : "a"}`;
    const shine = broken ? "" : `<path d="M90 116 Q300 100 560 118" stroke="#fff" stroke-opacity=".55" stroke-width="3" fill="none"/>
      <path d="M200 60 L240 52" stroke="#fff" stroke-opacity=".8" stroke-width="3" stroke-linecap="round"/>`;
    const bg = broken ? "#1a1416" : "#101a1e";
    return `
      <svg viewBox="0 0 620 300" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="${c.color[0]}" stop-opacity="${broken ? 0.8 : 1}"/>
            <stop offset="1" stop-color="${c.color[1]}"/>
          </linearGradient>
          <radialGradient id="${id}l" cx=".5" cy=".3" r=".8">
            <stop offset="0" stop-color="${broken ? "#3a2a2a" : "#1f4a55"}"/>
            <stop offset="1" stop-color="${bg}"/>
          </radialGradient>
        </defs>
        <rect width="620" height="300" fill="url(#${id}l)"/>
        <path d="M0 240 H620" stroke="#fff" stroke-opacity=".06"/>
        <g transform="translate(0 30)">
          <ellipse cx="310" cy="212" rx="285" ry="14" fill="#000" opacity=".5"/>
          <path d="${CAR_PATH}" fill="url(#${id})"/>
          <path d="M190 102 Q228 70 270 58 L305 53 L305 102 Z" fill="#1c2a3a" opacity=".9"/>
          <path d="M320 52 L366 51 Q408 54 438 86 L448 102 L320 102 Z" fill="#1c2a3a" opacity=".9"/>
          <path d="M312 104 L312 176 M445 106 L452 176" stroke="#000" stroke-opacity=".35" stroke-width="2"/>
          ${broken ? c.damage : shine}
          <circle cx="157" cy="180" r="36" fill="#111"/><circle cx="157" cy="180" r="20" fill="#454b55"/>
          <circle cx="478" cy="180" r="36" fill="#111"/><circle cx="478" cy="180" r="20" fill="#454b55"/>
        </g>
        ${broken ? "" : '<g fill="#fff" opacity=".9"><path d="M80 60l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"/><path d="M540 90l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></g>'}
      </svg>`;
  }

  const baBefore = $("#baBefore");
  const baAfter = $("#baAfter");
  const baRange = $("#baRange");
  const baHandle = $("#baHandle");

  function showCase(i) {
    const c = CASES[i];
    baBefore.innerHTML = carSVG(c, true, i);
    baAfter.innerHTML = carSVG(c, false, i);
    $("#worksInfo").innerHTML = c.info.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join("");
    $$(".works__tab").forEach((t) => t.classList.toggle("is-active", Number(t.dataset.case) === i));
  }
  function setSplit(v) {
    baBefore.style.clipPath = `inset(0 ${100 - v}% 0 0)`;
    baHandle.style.left = v + "%";
  }
  baRange.addEventListener("input", () => setSplit(baRange.value));
  $$(".works__tab").forEach((t) => t.addEventListener("click", () => showCase(Number(t.dataset.case))));
  showCase(0);
  setSplit(50);

  /* ---------- 7. Вкладки прайс-листа ---------- */
  $$(".prices__tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".prices__tab").forEach((t) => t.classList.toggle("is-active", t === tab));
      $$(".prices__panel").forEach((p) => p.classList.toggle("is-active", p.id === tab.dataset.tab));
    });
  });

  /* ---------- 8. Форма записи ---------- */
  const form = $("#bookingForm");
  const phone = $("#fPhone");
  const dateInput = $("#fDate");
  const timeSelect = $("#fTime");

  function selectService(name) {
    const select = $("#fService");
    const opt = [...select.options].find((o) => name.startsWith(o.text) || o.text.startsWith(name.split(" ")[0]));
    if (opt) select.value = opt.text;
  }

  // Маска телефона +7 (XXX) XXX-XX-XX
  phone.addEventListener("input", () => {
    let d = phone.value.replace(/\D/g, "");
    if (d.startsWith("8")) d = "7" + d.slice(1);
    if (!d.startsWith("7")) d = "7" + d;
    d = d.slice(0, 11);
    let r = "+7";
    if (d.length > 1) r += " (" + d.slice(1, 4);
    if (d.length >= 4) r += ")";
    if (d.length > 4) r += " " + d.slice(4, 7);
    if (d.length > 7) r += "-" + d.slice(7, 9);
    if (d.length > 9) r += "-" + d.slice(9, 11);
    phone.value = r;
  });
  phone.addEventListener("focus", () => {
    if (!phone.value) phone.value = "+7 (";
  });

  // Дата: не раньше сегодняшнего дня, не позже чем через 60 дней
  const toISO = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const today = new Date();
  dateInput.min = toISO(today);
  dateInput.max = toISO(new Date(today.getTime() + 60 * 864e5));

  // Время с шагом 30 минут, рабочие часы 9:00–20:00
  for (let h = 9; h <= 20; h++) {
    ["00", "30"].forEach((m) => {
      if (h === 20 && m === "30") return;
      const o = document.createElement("option");
      o.textContent = `${String(h).padStart(2, "0")}:${m}`;
      timeSelect.appendChild(o);
    });
  }

  // Предпросмотр фото
  $("#fPhotos").addEventListener("change", (e) => {
    const preview = $("#photoPreview");
    preview.innerHTML = "";
    [...e.target.files].slice(0, 6).forEach((file) => {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.alt = file.name;
      preview.appendChild(img);
    });
  });

  function setError(input, msg) {
    const err = input.parentElement.querySelector(".form__error");
    input.classList.toggle("is-invalid", Boolean(msg));
    if (err) err.textContent = msg || "";
    return !msg;
  }

  function validate() {
    let ok = true;
    const name = $("#fName");
    ok = setError(name, name.value.trim().length < 2 ? "Введите имя (минимум 2 буквы)" : "") && ok;
    ok = setError(phone, phone.value.replace(/\D/g, "").length !== 11 ? "Введите номер полностью" : "") && ok;
    const car = $("#fCar");
    ok = setError(car, car.value.trim().length < 2 ? "Укажите марку и модель" : "") && ok;
    ok = setError(dateInput, !dateInput.value ? "Выберите дату" : dateInput.value < dateInput.min ? "Дата не может быть в прошлом" : "") && ok;
    const agree = $("#fAgree");
    $("#agreeError").textContent = agree.checked ? "" : "Необходимо согласие на обработку данных";
    ok = agree.checked && ok;
    return ok;
  }

  $$("input, textarea", form).forEach((el) =>
    el.addEventListener("input", () => {
      if (el.classList.contains("is-invalid")) setError(el, "");
    })
  );

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) {
      const firstErr = $(".is-invalid", form);
      if (firstErr) firstErr.focus();
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries());
    data.created = new Date().toISOString();
    const photosCount = $("#fPhotos").files.length;

    // Копия заявки сохраняется в localStorage браузера (история заявок клиента)
    try {
      const list = JSON.parse(localStorage.getItem("kuzov_bookings") || "[]");
      list.push(data);
      localStorage.setItem("kuzov_bookings", JSON.stringify(list));
    } catch (err) {
      /* хранилище недоступно — не критично */
    }

    const dateText = new Date(data.date + "T00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long", weekday: "long" });

    // Сообщение для WhatsApp: данные формы + выбор в калькуляторе (если был)
    const lines = [
      "Здравствуйте! Заявка на ремонт с сайта service kuzova 01.",
      "",
      `👤 Имя: ${data.name}`,
      `📞 Телефон: ${data.phone}`,
      `🚘 Автомобиль: ${data.car}`,
      `🔧 Услуга: ${data.service}`,
      `📅 Дата: ${dateText}, ${data.time}`,
    ];
    if (data.comment.trim()) lines.push(`📝 Повреждения: ${data.comment.trim()}`);
    const calc = calcSummary();
    if (calc) lines.push("", calc);
    if (photosCount) lines.push("", `📎 Фото повреждений (${photosCount} шт.) отправлю в этом чате.`);
    openWhatsApp(lines.join("\n"));

    openModal(`
      <div class="modal__success">
        <div class="icon">✓</div>
        <h3>Заявка готова!</h3>
        <p>${escapeHTML(data.name)}, мы открыли WhatsApp с вашей заявкой. Нажмите <b>«Отправить»</b> в чате — менеджер ответит в течение 15 минут.</p>
        ${photosCount ? "<p>Не забудьте прикрепить фото повреждений в чате WhatsApp 📎</p>" : ""}
        <div class="modal__meta">
          <div><span>Услуга</span><b>${escapeHTML(data.service)}</b></div>
          <div><span>Дата</span><b>${dateText}</b></div>
          <div><span>Время</span><b>${escapeHTML(data.time)}</b></div>
        </div>
        <button class="btn btn--primary btn--block" data-close>Понятно</button>
      </div>
    `);
    form.reset();
    $("#photoPreview").innerHTML = "";
  });

  // Открывает чат WhatsApp с готовым текстом сообщения
  const WA_NUMBER = "77785663630";
  function openWhatsApp(text) {
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
    // Открываем через обычную ссылку: так браузеры не блокируют переход
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  /* ---------- 9. Прочее ---------- */
  $("#year").textContent = new Date().getFullYear();
})();
