const nav = document.getElementById('nav');
const menu = document.querySelector('.menu');
const navLinks = document.getElementById('primary-nav');
const soundToggle = document.getElementById('sound-toggle');
const soundLabel = soundToggle?.querySelector('.sound-label');

const updateNav = () => nav?.classList.toggle('scrolled', window.scrollY > 24);
window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

// 1. LIVE STUDIO EAT CLOCK
const studioClock = document.getElementById('studio-clock');
function updateClock() {
  if (!studioClock) return;
  const now = new Date();
  // East Africa Time is UTC+3
  const eatTime = new Date(now.getTime() + (now.getTimezoneOffset() + 180) * 60000);
  const hours = String(eatTime.getHours()).padStart(2, '0');
  const minutes = String(eatTime.getMinutes()).padStart(2, '0');
  const seconds = String(eatTime.getSeconds()).padStart(2, '0');
  studioClock.textContent = `${hours}:${minutes}:${seconds} EAT`;
}
setInterval(updateClock, 1000);
updateClock();

// 2. SCROLL SPY FOR NAV-LINK ACTIVE STATE
const sections = document.querySelectorAll('section[id]');
const linkEls = document.querySelectorAll('.nav-link');

function highlightNavOnScroll() {
  const scrollY = window.scrollY;
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 140;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');
    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      linkEls.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
      });
    }
  });
}
window.addEventListener('scroll', highlightNavOnScroll, { passive: true });

// 3. REVEAL ANIMATIONS
const io = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// 4. PORTFOLIO CATEGORY FILTERING
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('#portfolio-grid .project');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;
    
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    portfolioItems.forEach(item => {
      const category = item.dataset.category;
      if (filter === 'all' || category === filter) {
        item.style.display = 'block';
        requestAnimationFrame(() => {
          item.classList.add('visible');
          item.style.opacity = '1';
          item.style.transform = 'translateY(0) scale(1)';
        });
      } else {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px) scale(0.95)';
        setTimeout(() => {
          if (!btn.classList.contains('active') || btn.dataset.filter !== filter) return;
          item.style.display = 'none';
        }, 300);
      }
    });
  });
});

// 5. INTERACTIVE PROJECT PLANNER FORM
const plannerForm = document.getElementById('project-planner');
const pillBtns = document.querySelectorAll('.pill-btn');
let selectedService = 'Branding & Identity';

pillBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    pillBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedService = btn.dataset.value || btn.textContent.trim();
  });
});

if (plannerForm) {
  plannerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('planner-name')?.value || 'Inquirer';
    const details = document.getElementById('planner-details')?.value || 'No additional details provided.';
    
    const subject = encodeURIComponent(`Project Brief Inquiry from ${name} [${selectedService}]`);
    const body = encodeURIComponent(`Hello Axis Media Solutions,\n\nName / Company: ${name}\nService Required: ${selectedService}\n\nProject Details:\n${details}\n\nSent via axismedia.co.ke Project Brief Planner.`);
    
    window.location.href = `mailto:hello@axismedia.co.ke?subject=${subject}&body=${body}`;
  });
}

// 6. CASE STUDY ROUTING
const caseViews = [...document.querySelectorAll('.case-view')];
const cases = new Set(caseViews.map(v => v.id));

function openCase(id) {
  caseViews.forEach(v => {
    const active = v.id === id;
    v.classList.toggle('is-open', active);
    v.setAttribute('aria-hidden', String(!active));
  });
  document.body.style.overflow = cases.has(id) ? 'hidden' : '';
  if (cases.has(id)) {
    const view = document.getElementById(id);
    requestAnimationFrame(() => view?.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
  }
}

function route() {
  const id = location.hash.replace(/^#/, '');
  openCase(id);
  if (cases.has(id)) window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

document.querySelectorAll('[data-case]').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  navLinks?.classList.remove('open');
  menu?.setAttribute('aria-expanded', 'false');
  location.hash = a.dataset.case;
}));

document.querySelectorAll('[data-close-case]').forEach(b => b.addEventListener('click', e => {
  e.preventDefault();
  history.pushState('', document.title, window.location.pathname + window.location.search);
  openCase('');
  document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
}));

window.addEventListener('hashchange', route);
route();

// 7. MOBILE MENU
menu?.addEventListener('click', () => {
  const open = navLinks?.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(!!open));
});

navLinks?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menu?.setAttribute('aria-expanded', 'false');
}));

// 8. AMBIENT AUDIO SYNTH TOGGLE
let audioCtx = null;
let isAudioPlaying = false;
let osc1, osc2, gainNode;

function toggleAmbientAudio() {
  if (!isAudioPlaying) {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      
      osc1 = audioCtx.createOscillator();
      osc2 = audioCtx.createOscillator();
      gainNode = audioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(110, audioCtx.currentTime); // A2
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(164.81, audioCtx.currentTime); // E3

      gainNode.gain.setValueAtTime(0.01, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 1.5);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc1.start();
      osc2.start();

      isAudioPlaying = true;
      soundToggle?.classList.add('is-playing');
      if (soundLabel) soundLabel.textContent = 'AUDIO ON';
    } catch (e) {
      console.log('Audio playback prevented', e);
    }
  } else {
    if (gainNode && audioCtx) {
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
      setTimeout(() => {
        osc1?.stop();
        osc2?.stop();
        osc1?.disconnect();
        osc2?.disconnect();
      }, 500);
    }
    isAudioPlaying = false;
    soundToggle?.classList.remove('is-playing');
    if (soundLabel) soundLabel.textContent = 'AUDIO OFF';
  }
}

soundToggle?.addEventListener('click', toggleAmbientAudio);

