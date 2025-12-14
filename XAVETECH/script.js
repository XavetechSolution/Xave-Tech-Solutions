(() => {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const on = (el, evt, fn) => el && el.addEventListener(evt, fn);

  ["#year", "#year2", "#year3", "#year4"].forEach((id) => {
    const el = document.querySelector(id);
    if (el) el.textContent = new Date().getFullYear();
  });

  //TOGGLE THEME
  const THEME_KEY = "xave_theme";
  function applyTheme(theme) {
    document.body.classList.remove("theme-light", "theme-dark");
    document.body.classList.add(
      theme === "dark" ? "theme-dark" : "theme-light"
    );

    $$("#themeToggle, #themeToggle2, #themeToggle3, #themeToggle4").forEach(
      (btn) => {
        if (!btn) return;
        btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      }
    );
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
  }

  function toggleTheme() {
    const current =
      localStorage.getItem(THEME_KEY) ||
      (window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
  }

  $$("#themeToggle, #themeToggle2, #themeToggle3, #themeToggle4").forEach(
    (btn) => {
      if (!btn) return;
      btn.addEventListener("click", toggleTheme);
    }
  );

  const stored = localStorage.getItem(THEME_KEY);
  if (stored) applyTheme(stored);
  else
    applyTheme(
      window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    );

  //HAMBURGER MOBILE
  function setupHamburger(hamburgerId, navListId) {
    const hb = document.getElementById(hamburgerId);
    const nav = document.getElementById(navListId);
    if (!hb || !nav) return;
    hb.addEventListener("click", () => {
      const expanded = hb.getAttribute("aria-expanded") === "true";
      hb.setAttribute("aria-expanded", !expanded);
      nav.classList.toggle("show");
    });

    document.addEventListener("click", (e) => {
      if (!nav.classList.contains("show")) return;
      if (nav.contains(e.target) || hb.contains(e.target)) return;
      nav.classList.remove("show");
      hb.setAttribute("aria-expanded", "false");
    });
  }
  setupHamburger("hamburger", "navList");
  setupHamburger("hamburger2", "navList2");
  setupHamburger("hamburger3", "navList3");
  setupHamburger("hamburger4", "navList4");

  //HEADLINE TYPEWRITER
  (function typed() {
    const el = document.getElementById("typedHeadline");
    if (!el) return;
    const text = el.textContent.trim();
    el.textContent = "";
    let i = 0;
    const speed = 26;
    function step() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(step, speed + Math.random() * 18);
      }
    }
    setTimeout(step, 240);
  })();

  (function portfolioFilter() {
    const grid = document.getElementById("portfolioGrid");
    if (!grid) return;
    document.querySelectorAll(".portfolio-controls button").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll(".portfolio-controls button")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const filter = btn.dataset.filter;
        document.querySelectorAll(".portfolio-item").forEach((item) => {
          const cat = item.dataset.category;
          item.style.display = filter === "all" || filter === cat ? "" : "none";
        });
      });
    });
  })();

  function capitalize(s) {
    return s && s[0].toUpperCase() + s.slice(1);
  }
  const REVIEWS_API =
    "https://hsupntiurfkdyufxnsxh.supabase.co/functions/v1/review";

  function escapeHtml(str = "") {
    return str.replace(
      /[&<>"']/g,
      (m) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[m])
    );
  }

  function createReviewCard(review) {
    const div = document.createElement("div");
    div.className = "review-card";

    div.innerHTML = `
    <div class="review-name">${escapeHtml(review.sender_name)}</div>
    <div class="review-category">${escapeHtml(review.category)}</div>
    <div class="review-text">${escapeHtml(review.text)}</div>
  `;

    return div;
  }

  /* -------------------- LOAD REVIEWS -------------------- */
  async function loadReviews() {
    const container = document.getElementById("reviewsContainer");
    if (!container) return;

    container.innerHTML = '<p class="muted">Loading reviews...</p>';

    try {
      const res = await fetch(REVIEWS_API);
      const json = await res.json();

      if (json.status !== "success") {
        container.innerHTML = '<p class="muted">Failed to load reviews.</p>';
        return;
      }

      container.innerHTML = "";
      json.data.forEach((r) => {
        container.appendChild(createReviewCard(r));
      });
    } catch (err) {
      container.innerHTML = '<p class="muted">Error loading reviews.</p>';
    }
  }

  loadReviews();

  /* -------------------- REVIEW FORM  -------------------- */
  const reviewForm = document.getElementById("reviewForm");

  if (reviewForm) {
    reviewForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const sender_name = reviewForm.sender_name.value.trim();
      const sender_email = reviewForm.sender_email.value.trim();
      const category = reviewForm.category.value;
      const text = reviewForm.text.value.trim();
      const msg = document.getElementById("reviewFormMessage");

      if (!sender_name || !sender_email || !category || !text) {
        msg.textContent = "Please fill in all fields.";
        return;
      }

      try {
        const res = await fetch(REVIEWS_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sender_name,
            sender_email,
            category,
            text,
          }),
        });

        if (!res.ok) throw new Error();

        msg.textContent = "Thank you! Your review has been submitted.";
        reviewForm.reset();
        loadReviews();
      } catch {
        msg.textContent = "Failed to submit review. Try again later.";
      }
    });
  }

  /* -------------------- CONTACT FORM -------------------- */

  const REQUEST_API =
    "https://hsupntiurfkdyufxnsxh.supabase.co/functions/v1/request";
  const RATE_LIMIT_KEY = "xave_last_request_time";
  const RATE_LIMIT_MS = 60 * 1000 * 5; // 5 minute

  const contactForm = document.getElementById("contactForm");

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const sender_name = document.getElementById("clientName").value.trim();
      const sender_email = document.getElementById("clientEmail").value.trim();
      const description = document.getElementById("projectDesc").value.trim();
      const honeypot = document.getElementById("company").value;
      const messageBox = document.getElementById("contactMessage");
      const budget = document.getElementById("projectBudget").value.trim();
      const spinner = document.getElementById("contactSpinner");

      const category = Array.from(
        contactForm.querySelectorAll('input[name="services"]:checked')
      ).map((cb) => cb.value);

      /* -------------------- HONEYPOT CHECK -------------------- */
      if (honeypot) {
        // Silently fail
        return;
      }

      /* -------------------- RATE LIMIT CHECK -------------------- */
      const lastTime = Number(localStorage.getItem(RATE_LIMIT_KEY));
      const now = Date.now();

      if (lastTime && now - lastTime < RATE_LIMIT_MS) {
        messageBox.textContent =
          "Please wait some minute before submitting another request.";
        return;
      }

      // INPUT VALIDATION
      if (
        !sender_name ||
        !sender_email ||
        !description ||
        !Array.isArray(category) ||
        category.length === 0
      ) {
        messageBox.textContent =
          "Please fill all required fields and select at least one service.";
        return;
      }

      // SHOW SPINNER + DISABLE FORM
      spinner.classList.add("is-visible");
      messageBox.textContent = "";
      Array.from(contactForm.elements).forEach((el) => (el.disabled = true));

      try {
        const request = {
          sender_name,
          sender_email,
          category,
          description,
        };
        if (budget) request.budget = budget;
        console.log(request);
        const res = await fetch(REQUEST_API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        });

        const data = await res.json();

        if (!res.ok || data.status !== "success") {
          messageBox.textContent = data.message || "Failed to send request.";
        }

        localStorage.setItem(RATE_LIMIT_KEY, now.toString());

        // SUCCESS
        messageBox.textContent =
          data.emailResponse === "Email sent successfully"
            ? "Your request has been sent. Check your Inbox or Spam for our email"
            : "Your request has been sent successfully.";

        contactForm.reset();
      } catch (error) {
        messageBox.textContent = "Network error. Please try again later.";
      } finally {
        // HIDE SPINNER + ENABLE FORM
        spinner.classList.remove("is-visible");
        Array.from(contactForm.elements).forEach((el) => (el.disabled = false));
      }
    });
  }

  (function keyboardOutline() {
    function handleFirstTab(e) {
      if (e.key === "Tab") {
        document.documentElement.classList.add("show-focus");
        window.removeEventListener("keydown", handleFirstTab);
      }
    }
    window.addEventListener("keydown", handleFirstTab);
  })();
})();
