const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("main section[id]");
const revealItems = document.querySelectorAll(".reveal");
const particleCanvas = document.querySelector(".particle-canvas");
const heroArt = document.querySelector(".hero-art");
const interactiveCube = document.querySelector(".cube-interactive");

if (heroArt && interactiveCube && window.matchMedia("(pointer: fine)").matches) {
  let cubeFrame;
  let targetX = 0;
  let targetY = 0;
  let targetRotate = 0;
  let currentX = 0;
  let currentY = 0;
  let currentRotate = 0;

  const renderCube = () => {
    currentX += (targetX - currentX) * .14;
    currentY += (targetY - currentY) * .14;
    currentRotate += (targetRotate - currentRotate) * .14;
    interactiveCube.style.setProperty("--cube-x", `${currentX.toFixed(2)}px`);
    interactiveCube.style.setProperty("--cube-y", `${currentY.toFixed(2)}px`);
    interactiveCube.style.setProperty("--cube-rotate", `${currentRotate.toFixed(2)}deg`);
    cubeFrame = window.requestAnimationFrame(renderCube);
  };

  heroArt.addEventListener("pointermove", (event) => {
    const bounds = heroArt.getBoundingClientRect();
    const cubeCenterX = bounds.left + bounds.width * .54;
    const cubeCenterY = bounds.top + bounds.height * .5;
    const distanceX = event.clientX - cubeCenterX;
    const distanceY = event.clientY - cubeCenterY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    const interactionRadius = 270;

    if (distance > interactionRadius) {
      targetX = 0;
      targetY = 0;
      targetRotate = 0;
      interactiveCube.classList.remove("is-following");
      return;
    }

    const intensity = 1 - distance / interactionRadius;
    targetX = Math.max(-16, Math.min(16, distanceX * .08 * intensity));
    targetY = Math.max(-16, Math.min(16, distanceY * .08 * intensity));
    targetRotate = Math.max(-4, Math.min(4, distanceX * .018 * intensity));
    interactiveCube.classList.add("is-following");
  });

  heroArt.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;
    targetRotate = 0;
    interactiveCube.classList.remove("is-following");
  });

  renderCube();
  window.addEventListener("pagehide", () => window.cancelAnimationFrame(cubeFrame));
}

if (particleCanvas) {
  const context = particleCanvas.getContext("2d");
  const particles = [];
  const particleCount = Math.min(90, Math.max(38, Math.floor(window.innerWidth / 15)));
  let animationFrame;

  const resizeCanvas = () => {
    const scale = window.devicePixelRatio || 1;
    particleCanvas.width = window.innerWidth * scale;
    particleCanvas.height = window.innerHeight * scale;
    context.setTransform(scale, 0, 0, scale, 0, 0);
  };

  const createParticles = () => {
    particles.length = 0;
    for (let index = 0; index < particleCount; index += 1) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 1.7 + .6,
        speedX: (Math.random() - .5) * .22,
        speedY: (Math.random() - .5) * .22,
      });
    }
  };

  const animateParticles = () => {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles.forEach((particle) => {
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      if (particle.x < -10) particle.x = window.innerWidth + 10;
      if (particle.x > window.innerWidth + 10) particle.x = -10;
      if (particle.y < -10) particle.y = window.innerHeight + 10;
      if (particle.y > window.innerHeight + 10) particle.y = -10;
      context.beginPath();
      context.fillStyle = "rgba(200, 184, 232, .62)";
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();
    });
    for (let first = 0; first < particles.length; first += 1) {
      for (let second = first + 1; second < particles.length; second += 1) {
        const dx = particles[first].x - particles[second].x;
        const dy = particles[first].y - particles[second].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 125) {
          context.beginPath();
          context.strokeStyle = `rgba(200, 184, 232, ${.15 * (1 - distance / 125)})`;
          context.lineWidth = 1;
          context.moveTo(particles[first].x, particles[first].y);
          context.lineTo(particles[second].x, particles[second].y);
          context.stroke();
        }
      }
    }
    animationFrame = window.requestAnimationFrame(animateParticles);
  };

  resizeCanvas();
  createParticles();
  animateParticles();
  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(animationFrame);
    resizeCanvas();
    createParticles();
    animateParticles();
  });
}

menuToggle?.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    entry.target.classList.toggle("is-visible", entry.isIntersecting);
  });
}, { threshold: 0.12 });

revealItems.forEach((item) => observer.observe(item));

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`));
  });
}, { rootMargin: "-35% 0px -55% 0px" });

sections.forEach((section) => sectionObserver.observe(section));
