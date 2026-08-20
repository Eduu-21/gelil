/* =========================================================
   HER WORLD — SCRIPT
   Sections: Navigation, Scroll Reveal, Hero Load Animation,
   Photo Gallery Data, Lightbox, Perfume Reveal, Shopping
   Meter, Ice Cream Interaction, Random Facts, Music Player,
   Secret Section
   ========================================================= */

/* ---------------------------------------------------
   IMAGE ERROR FALLBACK
   Used by <img onerror="handleImgError(this)"> across the
   page (gallery + carousels). Hides the broken image and
   shows its sibling placeholder frame instead, so a wrong
   filename or extension never shows a broken-image icon.
--------------------------------------------------- */
function handleImgError(img) {
  img.style.display = "none";
  const fallback = img.nextElementSibling;
  if (fallback) fallback.hidden = false;
}
function handleVideoError(video) {
  video.style.display = "none";
  const fallback = video.nextElementSibling;
  if (fallback) fallback.hidden = false;
}
document.addEventListener("DOMContentLoaded", () => {

  /* ---------------------------------------------------
     NAVIGATION (mobile hamburger + close on link click)
  --------------------------------------------------- */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  function closeNav() {
    navLinks.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  }

  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("nav-open", isOpen);
  });

  navLinks.querySelectorAll(".nav__link").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  /* ---------------------------------------------------
     HERO LOAD ANIMATION
     Staggers the hero elements in on first paint.
  --------------------------------------------------- */
  const heroItems = document.querySelectorAll(".hero .reveal-init");
  heroItems.forEach((el, i) => {
    setTimeout(() => el.classList.add("is-visible"), 200 + i * 220);
  });

  /* ---------------------------------------------------
     SCROLL ANIMATIONS
     IntersectionObserver reveals sections as they enter
     the viewport. Respects prefers-reduced-motion by
     simply showing everything immediately.
  --------------------------------------------------- */
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealEls = document.querySelectorAll(".reveal");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => observer.observe(el));
  }

  /* ---------------------------------------------------
     PHOTO GALLERY + LIGHTBOX
     Edit the `photos` array below to customize captions,
     categories and image paths. The lightbox reads photo
     data straight from each gallery item's dataset, so the
     static HTML markup is always the source of truth.
  --------------------------------------------------- */
  const galleryItems = Array.from(document.querySelectorAll(".gallery__item"));

  const photos = galleryItems.map((item) => ({
    el: item,
    src: item.querySelector(".photo-frame img")?.getAttribute("src") || "",
    tag: item.querySelector(".gallery__tag")?.textContent || "",
    caption: item.querySelector(".gallery__quote")?.textContent || "",
  }));

  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxCounter = document.getElementById("lightboxCounter");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");

  let currentPhotoIndex = 0;

  function renderLightboxPhoto(index) {
    const photo = photos[index];
    if (!photo) return;
    // Try the real photo first; if it fails to load, fall back to
    // the same elegant placeholder look used everywhere else.
    lightboxImg.innerHTML =
      `<img src="${photo.src}" alt="${photo.caption}" style="width:100%;height:100%;object-fit:cover;border-radius:calc(var(--radius-md) - 2px);" onerror="this.remove(); document.getElementById('lightboxImg').classList.add('placeholder-img');">`;
    lightboxImg.classList.remove("placeholder-img");
    if (!photo.src) {
      lightboxImg.innerHTML = `<span class="placeholder-img__label">${photo.tag}</span>`;
      lightboxImg.classList.add("placeholder-img");
    }
    lightboxCaption.textContent = photo.caption;
    lightboxCounter.textContent =
      String(index + 1).padStart(2, "0") + " / " + String(photos.length).padStart(2, "0");
  }

  function openLightbox(index) {
    currentPhotoIndex = index;
    renderLightboxPhoto(currentPhotoIndex);
    lightbox.hidden = false;
    document.body.classList.add("nav-open");
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.classList.remove("nav-open");
  }

  function showNextPhoto(direction) {
    currentPhotoIndex = (currentPhotoIndex + direction + photos.length) % photos.length;
    renderLightboxPhoto(currentPhotoIndex);
  }

  galleryItems.forEach((item, index) => {
    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");
    item.setAttribute("aria-label", "Open photo " + (index + 1));
    item.addEventListener("click", () => openLightbox(index));
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(index);
      }
    });
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", () => showNextPhoto(-1));
  lightboxNext.addEventListener("click", () => showNextPhoto(1));
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showNextPhoto(-1);
    if (e.key === "ArrowRight") showNextPhoto(1);
  });

  /* ---------------------------------------------------
     MINI CAROUSELS (perfumes / shopping / dessert)
     Builds a small auto-advancing photo carousel inside a
     feature card from a folder of numbered images. Update
     the counts below if you add or remove photos from
     images/perfumes/, images/shopping/, or images/dessert/.
     Extension assumed .jpg — change the `ext` value per
     config if yours differ.
  --------------------------------------------------- */
  const carouselConfigs = [
    { name: "perfume", folder: "images/perfumes/", prefix: "perfume", count: 13, ext: "jpg" },
    { name: "shopping", folder: "images/shopping/", prefix: "bag", count: 3, ext: "jpg" },
    { name: "dessert", folder: "images/desserts/", prefix: "ice", count: 6, ext: "jpg" },
  ];

  function buildMiniCarousel(config) {
    const root = document.querySelector(`.mini-carousel[data-carousel-name="${config.name}"]`);
    if (!root) return;
    const viewport = root.querySelector(".mini-carousel__viewport");
    const dotsWrap = root.querySelector(".mini-carousel__dots");

    const slides = [];
    for (let i = 1; i <= config.count; i++) {
      const src = `${config.folder}${config.prefix}${i}.${config.ext}`;

      const slide = document.createElement("div");
      slide.className = "mini-carousel__slide" + (i === 1 ? " is-active" : "");

      const frame = document.createElement("div");
      frame.className = "photo-frame";
      frame.innerHTML =
        `<img src="${src}" alt="${config.name} photo ${i}" loading="lazy" onerror="handleImgError(this)">` +
        `<div class="photo-frame__fallback" hidden><span class="placeholder-img__label">[${config.name.toUpperCase()} ${i}]<br><small>${src}</small></span></div>`;

      slide.appendChild(frame);
      viewport.appendChild(slide);
      slides.push(slide);

      const dot = document.createElement("button");
      dot.className = "mini-carousel__dot" + (i === 1 ? " is-active" : "");
      dot.setAttribute("aria-label", `Show ${config.name} photo ${i}`);
      dot.addEventListener("click", (e) => {
        e.stopPropagation();
        goToSlide(i - 1);
        resetAutoAdvance();
      });
      dotsWrap.appendChild(dot);
    }

    const dots = Array.from(dotsWrap.children);
    let activeIndex = 0;
    let timer = null;

    function goToSlide(index) {
      slides[activeIndex].classList.remove("is-active");
      dots[activeIndex].classList.remove("is-active");
      activeIndex = (index + slides.length) % slides.length;
      slides[activeIndex].classList.add("is-active");
      dots[activeIndex].classList.add("is-active");
    }

    function startAutoAdvance() {
      if (prefersReducedMotion || slides.length < 2) return;
      timer = setInterval(() => goToSlide(activeIndex + 1), 3800);
    }
    function resetAutoAdvance() {
      clearInterval(timer);
      startAutoAdvance();
    }

    root.addEventListener("mouseenter", () => clearInterval(timer));
    root.addEventListener("mouseleave", startAutoAdvance);

    startAutoAdvance();
  }

  carouselConfigs.forEach(buildMiniCarousel);

  /* ---------------------------------------------------
     PERFUME CARD REVEAL
  --------------------------------------------------- */
  document.querySelectorAll(".feature-card__reveal-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.revealTarget);
      if (!target) return;
      const isHidden = target.hidden;
      target.hidden = !isHidden;
      btn.textContent = isHidden ? "Hide the details" : "Reveal the details";
    });
  });

  /* ---------------------------------------------------
     SHOPPING "SELF CONTROL" METER
     Animates to a low number and cycles through playful
     status labels on each click, because her self-control
     is famously not a fixed value.
  --------------------------------------------------- */
  const meterFill = document.getElementById("meterFill");
  const meterPercent = document.getElementById("meterPercent");
  const meterStatus = document.getElementById("meterStatus");

  const shoppingStates = [
    { percent: 0, status: "Just browsing" },
    { percent: 12, status: "Added to cart" },
    { percent: 4, status: "Thinking about it" },
    { percent: 0, status: "Bought it." },
    { percent: 0, status: "Why did I buy this?" },
    { percent: 0, status: "No regrets." },
  ];
  let shoppingIndex = 0;

  function applyShoppingState(index) {
    const state = shoppingStates[index];
    meterFill.style.width = state.percent + "%";
    meterPercent.textContent = state.percent + "%";
    meterStatus.textContent = state.status;
  }

  // Animate in on first reveal
  const shoppingCard = document.querySelector(".feature-card--shopping");
  const shoppingObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        applyShoppingState(0);
        shoppingObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });
  if (shoppingCard) shoppingObserver.observe(shoppingCard);

  if (shoppingCard) {
    shoppingCard.addEventListener("click", () => {
      shoppingIndex = (shoppingIndex + 1) % shoppingStates.length;
      applyShoppingState(shoppingIndex);
    });
  }

  /* ---------------------------------------------------
     ICE CREAM INTERACTION
     Clicking the button drops a small flurry of ice
     cream emoji across the screen and shows a message.
  --------------------------------------------------- */
  const icecreamBtn = document.getElementById("icecreamBtn");
  const icecreamMessage = document.getElementById("icecreamMessage");
  const icecreamRain = document.getElementById("icecreamRain");

  const icecreamMessages = [
    "Excellent decision.",
    "She approves.",
    "You have chosen wisely.",
    "Ice cream fixes everything.",
    "This is the correct answer.",
  ];

  function dropIceCream() {
    const count = 18;
    for (let i = 0; i < count; i++) {
      const el = document.createElement("span");
      el.textContent = "🍦";
      el.style.left = Math.random() * 100 + "vw";
      el.style.animationDuration = 2.2 + Math.random() * 1.6 + "s";
      el.style.fontSize = 1.1 + Math.random() * 1.2 + "rem";
      icecreamRain.appendChild(el);
      setTimeout(() => el.remove(), 4200);
    }
  }

  if (icecreamBtn) {
    icecreamBtn.addEventListener("click", () => {
      const message = icecreamMessages[Math.floor(Math.random() * icecreamMessages.length)];
      icecreamMessage.textContent = message;
      dropIceCream();
    });
  }

  /* ---------------------------------------------------
     RANDOM FACT GENERATOR
     Add or edit facts freely — the button always pulls a
     fresh random entry (never repeating the one showing).
  --------------------------------------------------- */
  const facts = [
    "She can turn \u201cI'm just looking\u201d into a full shopping session.",
    "Ice cream isn't a dessert. It's a lifestyle.",
    "Online shopping notifications are basically love letters.",
    "She claims she doesn't need another perfume.",
    "Her browser has an alarming number of open shopping tabs.",
    "She has a system for eating ice cream. It is not a good system.",
    "\u201cTreat yourself\u201d is less a phrase and more a way of life.",
    "She once considered a perfume a personality trait. She was right.",
    "Cake is not optional in her presence.",
    "She has strong opinions about ice cream flavors, and she is correct.",
    "A package on the porch is basically a small holiday.",
    "She will say she's not hungry, then finish everyone's dessert.",
    "Her idea of self-care involves a shopping cart.",
    "There is no such thing as \u201ctoo much\u201d perfume, only \u201cnot yet.\u201d",
  ];

  const factText = document.getElementById("factText");
  const factBtn = document.getElementById("factBtn");
  let lastFactIndex = -1;

  function showRandomFact() {
    let index;
    do {
      index = Math.floor(Math.random() * facts.length);
    } while (index === lastFactIndex && facts.length > 1);
    lastFactIndex = index;

    factText.classList.add("is-changing");
    setTimeout(() => {
      factText.textContent = facts[index];
      factText.classList.remove("is-changing");
    }, 220);
  }

  if (factBtn) factBtn.addEventListener("click", showRandomFact);

  /* ---------------------------------------------------
     MUSIC PLAYER
     Simple play/pause + progress bar. Fails gracefully
     if assets/song.mp3 doesn't exist yet.
  --------------------------------------------------- */
  const audio = document.getElementById("audioPlayer");
  const playBtn = document.getElementById("playBtn");
  const playIcon = document.getElementById("playIcon");
  const barFill = document.getElementById("playerBarFill");
  const currentTimeEl = document.getElementById("playerCurrent");
  const durationEl = document.getElementById("playerDuration");
  const playerFallback = document.getElementById("playerFallback");

  function formatTime(seconds) {
    if (!isFinite(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  if (playBtn && audio) {
    playBtn.addEventListener("click", () => {
      if (audio.paused) {
        audio.play().catch(() => {
          playerFallback.hidden = false;
        });
      } else {
        audio.pause();
      }
    });

    audio.addEventListener("play", () => { playIcon.textContent = "❚❚"; });
    audio.addEventListener("pause", () => { playIcon.textContent = "▶"; });

    audio.addEventListener("loadedmetadata", () => {
      durationEl.textContent = formatTime(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
      if (audio.duration) {
        barFill.style.width = (audio.currentTime / audio.duration) * 100 + "%";
        currentTimeEl.textContent = formatTime(audio.currentTime);
      }
    });

    audio.addEventListener("error", () => {
      playerFallback.hidden = false;
    });
  }

  /* ---------------------------------------------------
     SECRET SECTION
     Two entry points (nav icon + footer icon) open the
     same gated modal. Answer check is case-insensitive
     and trims whitespace, so it stays forgiving.
  --------------------------------------------------- */
  const secretModal = document.getElementById("secretModal");
  const secretGate = document.getElementById("secretGate");
  const secretContent = document.getElementById("secretContent");
  const secretForm = document.getElementById("secretForm");
  const secretInput = document.getElementById("secretInput");
  const secretHint = document.getElementById("secretHint");
  const secretClose = document.getElementById("secretClose");
  const correctAnswer = "ice cream";

  function openSecret() {
    secretModal.hidden = false;
    document.body.classList.add("nav-open");
    secretInput.focus();
  }

  function closeSecret() {
    secretModal.hidden = true;
    document.body.classList.remove("nav-open");
  }

  document.querySelectorAll('a[href="#secret"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      openSecret();
    });
  });

  const footerSecretBtn = document.getElementById("footerSecretBtn");
  const footerFinal = document.getElementById("footerFinal");
  if (footerSecretBtn) {
    footerSecretBtn.addEventListener("click", () => {
      // If the main secret has already been unlocked once this
      // session, reveal a small closing message instead of the gate.
      footerFinal.hidden = !footerFinal.hidden;
      footerFinal.textContent = "One more secret: this website was built with a genuinely embarrassing amount of care.";
    });
  }

  secretClose.addEventListener("click", closeSecret);
  secretModal.addEventListener("click", (e) => {
    if (e.target === secretModal) closeSecret();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !secretModal.hidden) closeSecret();
  });

  secretForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = secretInput.value.trim().toLowerCase();
    if (value === correctAnswer) {
      secretGate.hidden = true;
      secretContent.hidden = false;
      secretHint.textContent = "";
    } else {
      secretHint.textContent = "Not quite. Think dessert.";
      secretInput.select();
    }
  });
});