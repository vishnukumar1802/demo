// GreenInk CCE Website, Cinematic 3D Scroll Canvas & Conversational AI Chatbot Engine
import { 
  createIcons, 
  Trophy, 
  Check, 
  Phone, 
  Tv, 
  Eye, 
  Target, 
  Scale, 
  BookOpen, 
  Clock, 
  Users, 
  BarChart2, 
  BarChart3, 
  Calendar, 
  Sparkles, 
  Star, 
  MapPin, 
  Award, 
  ArrowRight, 
  ShieldCheck, 
  GraduationCap, 
  Laptop, 
  Headphones, 
  Video, 
  Mic,
  Search,
  MessageCircle,
  ChevronDown
} from 'lucide';

// Initialize Lucide Vector Icons Engine
function initLucideIcons() {
  createIcons({
    icons: {
      Trophy,
      Check,
      Phone,
      Tv,
      Eye,
      Target,
      Scale,
      BookOpen,
      Clock,
      Users,
      BarChart2,
      BarChart3,
      Calendar,
      Sparkles,
      Star,
      MapPin,
      Award,
      ArrowRight,
      ShieldCheck,
      GraduationCap,
      Laptop,
      Headphones,
      Video,
      Mic,
      Search,
      MessageCircle,
      ChevronDown
    }
  });
}

const TOTAL_FRAMES = 240;
const canvas = document.getElementById('scroll-canvas');
const ctx = canvas.getContext('2d');

const loaderOverlay = document.getElementById('loader');
const loaderPercent = document.getElementById('loader-percent');
const spinnerProgress = document.getElementById('spinner-progress');
const progressBar = document.getElementById('progress-bar');
const frameCounter = document.getElementById('frame-counter');
const scrollBadge = document.getElementById('scroll-badge');
const navbar = document.getElementById('navbar');
const cinematicSection = document.getElementById('cinematic-book');

// Image preloader state
const images = new Array(TOTAL_FRAMES);
let loadedCount = 0;
let targetFrameIndex = 0;
let currentFrameIndex = 0;
let lastRenderedIndex = -1;
let isFirstBatchReady = false;

// Path helper for 240 Fimages (served from public/Fimages)
function getFramePath(index) {
  const frameNum = String(index).padStart(3, '0');
  return `/Fimages/ezgif-frame-${frameNum}.jpg`;
}

// Preload 240 frame images
function preloadImages() {
  const circleRadius = 42;
  const circumference = 2 * Math.PI * circleRadius;

  return new Promise((resolve) => {
    const INITIAL_BATCH = 20;

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);

      img.onload = () => {
        loadedCount++;
        const percent = Math.min(100, Math.floor((loadedCount / TOTAL_FRAMES) * 100));

        if (loaderPercent) loaderPercent.textContent = `${percent}%`;
        if (spinnerProgress) {
          const offset = circumference - (percent / 100) * circumference;
          spinnerProgress.style.strokeDashoffset = offset;
        }

        if (i === 1) renderCanvas(0, true);

        if (loadedCount >= INITIAL_BATCH && !isFirstBatchReady) {
          isFirstBatchReady = true;
          if (loaderOverlay) loaderOverlay.classList.add('hidden');
        }

        if (loadedCount === TOTAL_FRAMES) resolve();
      };

      img.onerror = () => {
        loadedCount++;
        if (loadedCount >= INITIAL_BATCH && !isFirstBatchReady) {
          isFirstBatchReady = true;
          if (loaderOverlay) loaderOverlay.classList.add('hidden');
        }
        if (loadedCount === TOTAL_FRAMES) resolve();
      };

      images[i - 1] = img;
    }
  });
}

// High DPI Canvas Sizing
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  renderCanvas(Math.round(currentFrameIndex), true);
}

// Render image frame with watermark-free center-crop & high-pass color filter
function renderCanvas(frameIdx, force = false) {
  const clampedIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, frameIdx));

  if (!force && clampedIndex === lastRenderedIndex) return;
  lastRenderedIndex = clampedIndex;

  const img = images[clampedIndex];
  if (!img || !img.complete || img.naturalWidth === 0) return;

  const cWidth = canvas.width;
  const cHeight = canvas.height;

  // Clear canvas background
  ctx.fillStyle = '#07090e';
  ctx.fillRect(0, 0, cWidth, cHeight);

  // Center-crop to zoom 3D book and cut off all watermarks
  const imgWidth = img.naturalWidth;
  const imgHeight = img.naturalHeight;

  const srcX = Math.floor(imgWidth * 0.04);
  const srcY = Math.floor(imgHeight * 0.04);
  const srcWidth = Math.floor(imgWidth * 0.84);
  const srcHeight = Math.floor(imgHeight * 0.80);

  // Contain scaling
  const scale = Math.min(cWidth / srcWidth, cHeight / srcHeight);

  const drawWidth = srcWidth * scale;
  const drawHeight = srcHeight * scale;
  const drawX = (cWidth - drawWidth) / 2;
  const drawY = (cHeight - drawHeight) / 2;

  // High quality smoothing & contrast enhancement
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.filter = 'contrast(1.08) saturate(1.10) brightness(1.02)';

  ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, drawX, drawY, drawWidth, drawHeight);
  ctx.filter = 'none';

  // Update Frame Badge
  const displayNum = String(clampedIndex + 1).padStart(3, '0');
  if (frameCounter) {
    frameCounter.textContent = `Frame ${displayNum} / ${TOTAL_FRAMES}`;
  }
}

// Scroll position & Scene Transition Manager
function onScroll() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const maxDocScroll = document.documentElement.scrollHeight - window.innerHeight;

  // Update top progress bar
  if (progressBar && maxDocScroll > 0) {
    const totalFraction = Math.max(0, Math.min(1, scrollTop / maxDocScroll));
    progressBar.style.width = `${(totalFraction * 100).toFixed(2)}%`;
  }

  // Calculate progress relative to Cinematic Book Section
  if (cinematicSection) {
    const sectionHeight = cinematicSection.offsetHeight - window.innerHeight;
    if (sectionHeight > 0) {
      const scrollFraction = Math.max(0, Math.min(1, scrollTop / sectionHeight));

      // SCENE 01 - 03: 0.00 to 0.85 maps 240 book frames
      if (scrollFraction <= 0.85) {
        const bookFraction = scrollFraction / 0.85;
        targetFrameIndex = bookFraction * (TOTAL_FRAMES - 1);

        canvas.style.opacity = '1';
        if (scrollBadge) scrollBadge.style.opacity = '1';
      } 
      // SCENE 04 - 05: 0.85 to 1.00 Cinematic Transition (Canvas & Pill Fade Out)
      else {
        targetFrameIndex = TOTAL_FRAMES - 1;
        const fadeProgress = (scrollFraction - 0.85) / 0.15;
        const opacity = Math.max(0, 1 - fadeProgress);

        canvas.style.opacity = String(opacity);
        if (scrollBadge) scrollBadge.style.opacity = String(opacity);
      }
    }
  }

  // Sticky Navbar glassmorphic background toggle
  if (navbar) {
    if (scrollTop > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
}

// Lerp loop for silky 60FPS animation
function animationLoop() {
  const diff = targetFrameIndex - currentFrameIndex;

  if (Math.abs(diff) > 0.001) {
    currentFrameIndex += diff * 0.1;
    renderCanvas(Math.round(currentFrameIndex));
  }

  requestAnimationFrame(animationLoop);
}

// Scroll Reveal Animation Engine (IntersectionObserver)
function setupScrollReveal() {
  const revealElements = document.querySelectorAll('[data-reveal="true"]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

// Real-time Scroll-Spy Navigation
function setupScrollSpy() {
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navLinks = document.querySelectorAll('.nav-pill-container .nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('data-nav-section') === id) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, {
    threshold: 0.25,
    rootMargin: '-80px 0px -50% 0px'
  });

  sections.forEach(section => observer.observe(section));
}

// Interactive Category Filters
function setupTabsAndFilters() {
  const filterChips = document.querySelectorAll('.filter-chip');
  const examCards = document.querySelectorAll('.exam-cards-grid .exam-card');

  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const filterVal = chip.getAttribute('data-filter');

      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      examCards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (filterVal === 'all' || cardCat === filterVal) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// Course Data Registry for view-course Sub-Page View Drawer
const courseDatabase = {
  'tet-2026': {
    badge: 'TN TET',
    title: 'TET 2026 BATCH-1',
    ideal: '• Government and Government-aided school teachers • Private school teachers preparing for TET qualification • D.T.Ed / B.Ed completed candidates • Final year students',
    overview: 'Complete syllabus coverage with special focus on Child Psychology & Pedagogy. Regular tests with detailed discussion for continuous improvement.',
    overviewBullets: [
      'Daily live online classes (Zoom)',
      'Daily doubt-clearing session at a fixed standard time',
      'Dedicated WhatsApp / Telegram community support',
      'Weekly tests & 500+ Daily Micro Tests – Free'
    ],
    learnBullets: [
      'Understand TET exam pattern through Previous Year Questions',
      'Practice most-expected board-standard questions with clarity',
      'Develop strong conceptual foundation in Child Psychology & Pedagogy',
      'Gain confidence, accuracy, and complete exam readiness'
    ],
    accessBullets: [
      'Immediate access to live class links and schedule',
      'Direct entry to WhatsApp / Telegram support community',
      'Access to recorded sessions on GreenInk Mobile App',
      'Downloadable study materials and one-liner notes'
    ],
    price: '₹7,080.00'
  },
  'tnpsc-focused': {
    badge: 'TNPSC GROUP 1 & 2',
    title: 'TNPSC Focused Program',
    ideal: '• Serious aspirants targeting Group 1 & Group 2 prelims & mains top ranks.',
    overview: 'Crafted by Ilayaraja Kannan sir (TNPSC Author & APJ Abdul Kalam Awardee). Comprehensive Samacheer Kalvi 6th to 12th line-by-line coverage.',
    overviewBullets: [
      'Complete Prelims & Mains integrated strategy',
      'Line-by-line Samacheer Kalvi subject coverage',
      'Weekly subjective answer writing evaluation & feedback',
      'Daily Tamil Aptitude & Current Affairs digests'
    ],
    learnBullets: [
      'Master Tamil Nadu history, culture, and administration',
      'Develop high speed in Mental Ability & General Studies',
      'Gain structural precision in Mains essay writing'
    ],
    accessBullets: [
      'Live Zoom interactive sessions with Ilayaraja Kannan sir',
      'Full Soft Copy PDF question bank access',
      'Mobile App offline lecture downloads'
    ],
    price: '₹12,500.00'
  },
  'central-focused': {
    badge: 'CENTRAL GOVT EXAMS',
    title: 'Banking, SSC & Railways Focused Program',
    ideal: '• Aspirants preparing for IBPS, SBI PO/Clerk, SSC CGL/CHSL & RRB NTPC.',
    overview: 'Designed by Mohan Kumar sir (Ex-Banker & Finance Ministry Awardee). Focused speed math shortcuts, logical reasoning blueprints, and computer-based test practice.',
    overviewBullets: [
      '1500+ quantitative aptitude & reasoning tricks',
      'Daily speed & accuracy drill test series',
      'Mock interview preparation with ex-bankers'
    ],
    learnBullets: [
      'Solve 35 quant questions in 20 minutes',
      'Master financial, banking & general awareness',
      'Excel in Tier-I, Tier-II & CBT-2 computer test formats'
    ],
    accessBullets: [
      'Real exam portal interface simulations',
      'Unlimited retakes on mock speed tests',
      '24/7 mentor Telegram support'
    ],
    price: '₹9,999.00'
  },
  'polity-admin': {
    badge: 'SPECIAL SUBJECT',
    title: 'Indian Polity & Indian Administration',
    ideal: '• Aspirants needing 100% conceptual clarity in Constitutional Articles & TN Governance.',
    overview: 'Comprehensive coverage of Constitutional articles, amendments, governance & Tamil Nadu administration key notes.',
    overviewBullets: [
      'Topic-wise tests after each unit',
      'Weekly revision classes & doubt solving',
      'Free study materials & PYQ analysis'
    ],
    learnBullets: [
      'Master Preamble, Fundamental Rights, & Parliament',
      'Understand State Executive & TN Administration schemes',
      'Score 100% accuracy in Polity MCQs'
    ],
    accessBullets: [
      'Downloadable Polity mind maps & charts',
      'Unit-wise PYQ solved PDFs'
    ],
    price: '₹2,999.00'
  },
  'tnpsc-testbatch': {
    badge: 'TNPSC TEST BATCH',
    title: 'TNPSC TEST BATCH-1',
    ideal: '• Candidates who completed syllabus once and need structured test practice.',
    overview: '50+ full-length model tests aligning with TNPSC official board standards.',
    overviewBullets: [
      '5000+ expected objective questions',
      'State-wide rank comparison & performance analytics',
      'Detailed video solutions after every test'
    ],
    learnBullets: [
      'Eliminate negative marks & guesswork',
      'Build time management discipline'
    ],
    accessBullets: [
      'Instant test results & analytics on GreenInk App',
      'PDF answer key downloads'
    ],
    price: '₹3,499.00'
  },
  'flexi-crash': {
    badge: 'FLEXI CRASH BATCH',
    title: 'FLEXI Fast-Track Crash Program',
    ideal: '• Working professionals and homemakers needing flexible class timings.',
    overview: 'Rapid revision blueprints designed for upcoming exam notifications with evening live classes.',
    overviewBullets: [
      '8:00 PM evening live classes + recorded HD backup',
      'High-yield expected question series',
      'WhatsApp mentor group support'
    ],
    learnBullets: [
      'Revise complete syllabus in 45 days',
      'Focus on 20% high-yield topics yielding 80% marks'
    ],
    accessBullets: [
      '24/7 Mobile App access',
      'Soft copy revision notes'
    ],
    price: '₹4,999.00'
  }
};

// Course Detail Sub-Page View Drawer Handler
function setupCourseDrawer() {
  const drawer = document.getElementById('course-detail-drawer');
  const closeBtn = document.getElementById('close-course-drawer');
  const openBtns = document.querySelectorAll('.open-course-view');

  const elBadge = document.getElementById('cd-badge');
  const elTitle = document.getElementById('cd-title');
  const elIdeal = document.getElementById('cd-ideal');
  const elOverview = document.getElementById('cd-overview');
  const elOverviewBullets = document.getElementById('cd-overview-bullets');
  const elLearnBullets = document.getElementById('cd-learn-bullets');
  const elAccessBullets = document.getElementById('cd-access-bullets');
  const elPrice = document.getElementById('cd-price');
  const elEnrollBtn = document.getElementById('cd-enroll-btn');

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const courseId = btn.getAttribute('data-course-id') || 'tet-2026';
      const data = courseDatabase[courseId] || courseDatabase['tet-2026'];

      if (elBadge) elBadge.textContent = data.badge;
      if (elTitle) elTitle.textContent = data.title;
      if (elIdeal) elIdeal.textContent = data.ideal;
      if (elOverview) elOverview.textContent = data.overview;
      if (elPrice) elPrice.textContent = data.price;

      if (elOverviewBullets) {
        elOverviewBullets.innerHTML = data.overviewBullets.map(b => `<li><i data-lucide="check" class="icon-check"></i> ${b}</li>`).join('');
      }
      if (elLearnBullets) {
        elLearnBullets.innerHTML = data.learnBullets.map(b => `<li><i data-lucide="check" class="icon-check"></i> ${b}</li>`).join('');
      }
      if (elAccessBullets) {
        elAccessBullets.innerHTML = data.accessBullets.map(b => `<li><i data-lucide="check" class="icon-check"></i> ${b}</li>`).join('');
      }

      if (elEnrollBtn) {
        elEnrollBtn.setAttribute('data-course', data.title);
      }

      initLucideIcons();
      if (drawer) drawer.classList.add('active');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (drawer) drawer.classList.remove('active');
    });
  }

  if (drawer) {
    drawer.addEventListener('click', (e) => {
      if (e.target === drawer) drawer.classList.remove('active');
    });
  }
}

// Interactive Enrollment Modal Handler
function setupModal() {
  const modal = document.getElementById('enroll-modal');
  const closeBtn = document.getElementById('close-modal-btn');
  const openBtns = document.querySelectorAll('.open-modal, #open-modal-btn');
  const form = document.getElementById('enroll-form');
  const successMsg = document.getElementById('modal-success');
  const targetExamSelect = document.getElementById('target-exam');

  openBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const preSelectedCourse = btn.getAttribute('data-course');
      if (preSelectedCourse && targetExamSelect) {
        for (let opt of targetExamSelect.options) {
          if (opt.text.includes(preSelectedCourse) || opt.value.includes(preSelectedCourse)) {
            opt.selected = true;
            break;
          }
        }
      }
      if (modal) modal.classList.add('active');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (modal) modal.classList.remove('active');
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const phoneInput = document.getElementById('student-phone');
      const savedPhone = document.getElementById('saved-phone');

      if (savedPhone && phoneInput) savedPhone.textContent = phoneInput.value;
      if (form) form.classList.add('hidden');
      if (successMsg) successMsg.classList.remove('hidden');

      setTimeout(() => {
        if (modal) modal.classList.remove('active');
        setTimeout(() => {
          if (form) form.classList.remove('hidden');
          if (successMsg) successMsg.classList.add('hidden');
          form.reset();
        }, 400);
      }, 3500);
    });
  }
}

// Animated Stat Counters
function setupCounterObserver() {
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        statNumbers.forEach(el => {
          const target = parseInt(el.getAttribute('data-target'), 10);
          let current = 0;
          const step = Math.ceil(target / 40);

          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              el.textContent = `${target.toLocaleString()}+`;
              clearInterval(timer);
            } else {
              el.textContent = `${current.toLocaleString()}+`;
            }
          }, 30);
        });
      }
    });
  }, { threshold: 0.5 });

  const statsSection = document.querySelector('.stats-section');
  if (statsSection) observer.observe(statsSection);
}

// =========================================================================
// 60-QUESTION KNOWLEDGE BASE DATASET
// =========================================================================
const chatbotKnowledgeBase = [
  // Category 1: Academy & Trust (Q1 - Q8)
  {
    id: 1,
    cat: 'academy',
    q: 'What is GreenInk Academy / GreenInk CCE?',
    a: 'GreenInk Academy (Center for Creative Excellence - CCE) is Tamil Nadu’s premier technology-driven institute for government exam coaching. We provide structured coaching for TNPSC, Banking, SSC, Railways, and TET with 1-on-1 mentorship.',
    tags: ['about', 'origin', 'cce', 'academy', 'institute', 'trust']
  },
  {
    id: 2,
    cat: 'academy',
    q: 'When was GreenInk Academy founded?',
    a: 'Founded in 2019 in collaboration with Mahendras, GreenInk Academy evolved from a high-performing hybrid coaching institute into a technology-driven online academy with 7,500+ trained students.',
    tags: ['founded', 'history', '2019', 'mahendras', 'start']
  },
  {
    id: 3,
    cat: 'academy',
    q: 'Who is the founder of GreenInk Academy?',
    a: 'Mrs. Ponchitra Sathyanarayanan is the founder. She is an Educationalist, Industrialist, Certified Career Counselor, and Motivational Speaker with 15+ years of academic leadership inspired by Dr. A.P.J. Abdul Kalam’s vision.',
    tags: ['founder', 'ponchitra', 'leadership', 'kalam', 'director']
  },
  {
    id: 4,
    cat: 'academy',
    q: 'Who is the Brand Ambassador of GreenInk Academy?',
    a: 'Renowned Tamil orator, motivational speaker, and writer Bharathi Baskar is our Brand Ambassador. She is a recipient of the prestigious Rajeev-Mooppanar Award and Tamil Sundar Award.',
    tags: ['ambassador', 'bharathi', 'baskar', 'awards', 'speaker']
  },
  {
    id: 5,
    cat: 'academy',
    q: 'What TV channels has GreenInk been featured on?',
    a: 'GreenInk Academy was featured on Vijay Super Channel and News 7 Channel for its innovative research-driven approach to competitive exam coaching.',
    tags: ['tv', 'vijay super', 'news 7', 'television', 'featured', 'media']
  },
  {
    id: 6,
    cat: 'academy',
    q: 'Is GreenInk an online, offline, or hybrid coaching institute?',
    a: 'GreenInk provides a flexible model: daily live online classes via Zoom, 24/7 LMS & Mobile App recorded backups, and hybrid seminars across Tamil Nadu colleges.',
    tags: ['online', 'offline', 'hybrid', 'zoom', 'classes', 'mode']
  },
  {
    id: 7,
    cat: 'academy',
    q: 'What awards has GreenInk Academy received?',
    a: 'GreenInk was awarded the title of "Best Coaching Institute for Research & Innovation" for its Personalised Mentorship System (PMS) and student success.',
    tags: ['awards', 'best coaching', 'innovation', 'research', 'recognition']
  },
  {
    id: 8,
    cat: 'academy',
    q: 'Where is GreenInk Academy located?',
    a: 'GreenInk Academy operates across Tamil Nadu, India, with head administrative offices and digital studios delivering live online coaching to aspirants across all districts. Phone: +91 84287 75012.',
    tags: ['location', 'address', 'office', 'phone', 'contact', 'city']
  },

  // Category 2: TNPSC Exam Prep (Q9 - Q16)
  {
    id: 9,
    cat: 'tnpsc',
    q: 'What TNPSC exams does GreenInk coach for?',
    a: 'We coach for TNPSC Group 1, Group 2, Group 2A, Group 4 & VAO, as well as department-specific exams such as Sub-Inspector (TNUSRB) and Civil Supplies posts.',
    tags: ['tnpsc', 'group 1', 'group 2', 'group 4', 'vao', 'tnusrb', 'exams']
  },
  {
    id: 10,
    cat: 'tnpsc',
    q: 'Who designed the TNPSC curriculum at GreenInk?',
    a: 'Our TNPSC programs are crafted by Mr. Ilayaraja Kannan sir, renowned author for The Hindu and recipient of the Dr. A.P.J. Abdul Kalam Award, who has mentored 200+ government officers.',
    tags: ['ilayaraja kannan', 'tnpsc author', 'curriculum', 'mentor', 'kannan']
  },
  {
    id: 11,
    cat: 'tnpsc',
    q: 'Do you cover Samacheer Kalvi school books?',
    a: 'Yes. Our curriculum provides line-by-line coverage of Tamil Nadu State Board (Samacheer Kalvi) textbooks from 6th to 12th standard across General Studies and Tamil Aptitude.',
    tags: ['samacheer kalvi', 'school books', '6th to 12th', 'tamil', 'syllabus']
  },
  {
    id: 12,
    cat: 'tnpsc',
    q: 'Is Tamil Eligibility Test coaching included in TNPSC batches?',
    a: 'Yes, complete General Tamil / Mandatory Tamil Eligibility Test preparation, grammar shortcuts, and literature notes are fully integrated into all TNPSC batches.',
    tags: ['tamil eligibility', 'general tamil', 'grammar', 'literature', 'tamil test']
  },
  {
    id: 13,
    cat: 'tnpsc',
    q: 'What is the duration of the TNPSC Focused Program?',
    a: 'The TNPSC Focused Program runs for 6 to 12 months with comprehensive Prelims + Mains coverage, daily live sessions, weekly test series, and revision blueprints.',
    tags: ['duration', 'tnpsc focused', 'months', 'batch time', 'length']
  },
  {
    id: 14,
    cat: 'tnpsc',
    q: 'Do you provide Mains answer writing evaluation for Group 1 and 2?',
    a: 'Yes. Our Mains module includes weekly descriptive answer writing worksheets evaluated by cleared mentors with structural feedback and keyword guidance.',
    tags: ['mains', 'answer writing', 'evaluation', 'group 1', 'group 2', 'paper evaluation']
  },
  {
    id: 15,
    cat: 'tnpsc',
    q: 'What is the TNPSC Test Batch-1 and how many tests are included?',
    a: 'TNPSC Test Batch-1 contains 50+ full-length model tests, unit-wise tests, state-wide rank lists, and detailed video solution discussions. Fee: ₹3,499.',
    tags: ['test batch', '50 tests', 'model exam', 'tnpsc test', 'test series']
  },
  {
    id: 16,
    cat: 'tnpsc',
    q: 'Can Tamil medium students join GreenInk TNPSC coaching?',
    a: 'Absolutely! All our live lectures, study materials, test series, and mentor discussions are 100% bilingual (Tamil and English).',
    tags: ['tamil medium', 'bilingual', 'language', 'english', 'medium']
  },

  // Category 3: Banking, SSC & Railways (Q17 - Q24)
  {
    id: 17,
    cat: 'banking',
    q: 'Which banking exams are covered at GreenInk?',
    a: 'We provide comprehensive coaching for IBPS PO, IBPS Clerk, SBI PO, SBI Clerk, IBPS RRB (Scale 1 & Office Assistant), and RBI Grade B / Assistant exams.',
    tags: ['banking', 'ibps', 'sbi', 'rrb', 'rbi', 'clerk', 'po', 'bank']
  },
  {
    id: 18,
    cat: 'banking',
    q: 'Who leads the Central Government Exams curriculum?',
    a: 'Mr. Mohan Kumar sir, Ex-Banker (BOI, IPPB, BOM), SEBI Certified SMART Trainer, and Finance Ministry Awardee, designed our Banking & Central Govt curriculum.',
    tags: ['mohan kumar', 'ex-banker', 'sebi', 'finance ministry', 'mohan']
  },
  {
    id: 19,
    cat: 'banking',
    q: 'How does GreenInk help students improve speed math in Quantitative Aptitude?',
    a: 'Through 1,500+ speed math shortcuts, Vedic math techniques, approximation tricks, daily 15-minute drill tests, and computer-based timed simulators.',
    tags: ['speed math', 'quantitative aptitude', 'shortcuts', 'math tricks', 'calculations']
  },
  {
    id: 20,
    cat: 'banking',
    q: 'Do you prepare students for SSC CGL, CHSL, and MTS exams?',
    a: 'Yes. Complete Tier-I and Tier-II syllabus coverage including Advanced Math (Geometry, Trigonometry, Algebra), English, Reasoning, and General Awareness.',
    tags: ['ssc', 'cgl', 'chsl', 'mts', 'tier 1', 'tier 2', 'central']
  },
  {
    id: 21,
    cat: 'banking',
    q: 'Are Railway RRB NTPC, ALP, and Group D exams covered?',
    a: 'Yes, CBT-1 and CBT-2 preparation aligning with Railway Recruitment Board patterns, Technical Science modules, and previous 10 years question analysis.',
    tags: ['railways', 'rrb', 'ntpc', 'alp', 'group d', 'cbt', 'train']
  },
  {
    id: 22,
    cat: 'banking',
    q: 'Do you conduct mock interviews for Bank PO candidates?',
    a: 'Yes. We conduct 1-on-1 personalized mock interview panels led by retired Senior Bank Managers and SEBI certified trainers with personalized feedback.',
    tags: ['interview', 'mock interview', 'bank po', 'panel', 'personality test']
  },
  {
    id: 23,
    cat: 'banking',
    q: 'Is computer-based test (CBT) portal access provided for practice?',
    a: 'Yes, our LMS interface simulates the exact IBPS, TCS-iON, and SSC exam screens with countdown timers, question palettes, and negative marking analytics.',
    tags: ['cbt', 'portal', 'online test', 'mock exam', 'tcs ion', 'screen']
  },
  {
    id: 24,
    cat: 'banking',
    q: 'Can students without a mathematics background crack banking exams with GreenInk?',
    a: 'Yes. Our Foundation module begins from absolute school-level arithmetic (fractions, percentages, tables) before advancing to competitive exam shortcuts.',
    tags: ['non-math', 'basics', 'foundation', 'math weak', 'arts student']
  },

  // Category 4: TN TET & Teacher Exams (Q25 - Q30)
  {
    id: 25,
    cat: 'tet',
    q: 'What is the TET 2026 BATCH-1 program?',
    a: 'TET 2026 BATCH-1 is a dedicated teacher eligibility coaching batch covering Paper-I and Paper-II with daily live online classes, doubt clearing, and 500+ daily micro tests.',
    tags: ['tet', 'tet 2026', 'paper 1', 'paper 2', 'teacher', 'trb', 'fees', 'fee', 'price']
  },
  {
    id: 26,
    cat: 'tet',
    q: 'Who is eligible for the TET 2026 coaching batch?',
    a: 'Government and private school teachers seeking qualification, B.Ed / D.T.Ed graduates, and final-year teacher training college students preparing in advance.',
    tags: ['tet eligibility', 'bed', 'dted', 'teachers', 'qualification']
  },
  {
    id: 27,
    cat: 'tet',
    q: 'Do you offer special coaching for Child Psychology & Pedagogy?',
    a: 'Yes, specialized pedagogy lectures, child development case studies, and topic-wise one-liner notes are provided to maximize scoring in the pedagogy section.',
    tags: ['child psychology', 'pedagogy', 'tet notes', 'psychology']
  },
  {
    id: 28,
    cat: 'tet',
    q: 'What is the fee structure for TET 2026 Batch-1?',
    a: 'The complete TET 2026 Batch-1 fee is ₹7,080.00 all-inclusive (live classes, LMS access, test series, and downloadable soft-copy notes).',
    tags: ['tet fee', '7080', 'cost', 'price', 'fee', 'fees', 'payment']
  },
  {
    id: 29,
    cat: 'tet',
    q: 'Are daily micro tests included in the TET batch?',
    a: 'Yes, students get access to over 500+ Daily Micro Tests for continuous daily practice from day one.',
    tags: ['micro tests', '500 tests', 'daily practice', 'test']
  },
  {
    id: 30,
    cat: 'tet',
    q: 'Do you provide soft-copy one-liner revision notes for TET?',
    a: 'Yes, downloadable and printable unit-wise soft-copy one-liner revision PDFs are provided inside the student portal.',
    tags: ['one-liner', 'notes', 'pdf', 'download', 'material']
  },

  // Category 5: PMS Mentorship (Q31 - Q36)
  {
    id: 31,
    cat: 'pms',
    q: 'What is the Personalised Mentorship System (PMS)?',
    a: 'PMS is our award-winning methodology combining 1-to-1 cleared faculty mentors, AI daily weakness analytics, custom study timetables, and 24/7 doubt resolution.',
    tags: ['pms', 'mentorship', 'analytics', '1-to-1', 'system']
  },
  {
    id: 32,
    cat: 'pms',
    q: 'Who are the 1-on-1 mentors assigned to students?',
    a: 'Mentors are subject matter experts and candidates who have personally cleared competitive exams and understand modern exam pressure and time management.',
    tags: ['cleared mentors', 'faculty', 'mentors', 'guide', 'coach']
  },
  {
    id: 33,
    cat: 'pms',
    q: 'How does GreenInk track daily weakness and accuracy bottlenecks?',
    a: 'Our AI LMS tracks your time-per-question, accuracy drops by topic, repeated mistakes, and cognitive recall retention, generating a weekly Weakness Report.',
    tags: ['weakness report', 'analytics', 'accuracy', 'ai tracking', 'bottlenecks']
  },
  {
    id: 34,
    cat: 'pms',
    q: 'How are doubts resolved outside live class hours?',
    a: 'Students have direct access to dedicated Telegram and WhatsApp mentor channels for instant doubt clearing within minutes.',
    tags: ['doubts', 'doubt resolution', 'whatsapp mentor', 'telegram', 'ask doubt']
  },
  {
    id: 35,
    cat: 'pms',
    q: 'Who is Dr. Sylendra Babu IPS and how does he mentor GreenInk students?',
    a: 'Dr. Sylendra Babu IPS (Ex-DGP Tamil Nadu) is our Leadership Mentor who conducts exclusive motivational masterclasses and discipline strategy webinars.',
    tags: ['sylendra babu', 'ips', 'dgp', 'leadership mentor', 'sylendra']
  },
  {
    id: 36,
    cat: 'pms',
    q: 'Can I book a free 1-on-1 mentor counseling session before enrolling?',
    a: 'Yes! You can click "Enroll Now" or "Book Free Counseling" on our website, or WhatsApp us at +91 84287 75012 to schedule a free 15-minute guidance call.',
    tags: ['free counseling', 'book mentor', 'consultation', 'trial', 'free session']
  },

  // Category 6: Class Timings & Working Professionals (Q37 - Q42)
  {
    id: 37,
    cat: 'timings',
    q: 'Can I prepare for government exams while working a full-time job?',
    a: 'Absolutely. Our core philosophy is that 3–4 focused hours a day of structured coaching are sufficient to crack any government exam without quitting your job.',
    tags: ['working professional', 'job', '3-4 hours', 'part-time', 'employee']
  },
  {
    id: 38,
    cat: 'timings',
    q: 'What are the live class timings for working professionals?',
    a: 'We conduct evening live batches (8:00 PM to 9:30 PM) and early morning revision sessions tailored specifically for employed aspirants and homemakers.',
    tags: ['class timings', 'evening batch', '8 pm', 'schedule', 'timings', 'time']
  },
  {
    id: 39,
    cat: 'timings',
    q: 'What happens if I miss a live class?',
    a: 'Every live lecture is recorded in high definition and uploaded to your GreenInk LMS account within 2 hours with unlimited replay access.',
    tags: ['missed class', 'recording', 'backup', 'replay', 'video']
  },
  {
    id: 40,
    cat: 'timings',
    q: 'Are weekend-only batches available?',
    a: 'Yes, our FLEXI Weekend batches provide intensive Saturday-Sunday lectures combined with weekly self-paced practice drills.',
    tags: ['weekend batch', 'saturday sunday', 'flexi', 'weekend']
  },
  {
    id: 41,
    cat: 'timings',
    q: 'What is the GreenInk College Career Track?',
    a: 'Aligned with UGC guidelines, it trains college students from 1st year to final year so they are fully prepared to crack exams right after graduation.',
    tags: ['college track', 'ugc', 'graduation', 'students', 'college']
  },
  {
    id: 42,
    cat: 'timings',
    q: 'What is the GreenInk School Skill Enrichment program?',
    a: 'Aligned with NEP guidelines, it prepares 8th to 12th standard students with aptitude, reasoning, CUET, CLAT, and civil services awareness.',
    tags: ['school track', 'nep', 'cuet', 'clat', '8th to 12th', 'school']
  },

  // Category 7: LMS & Mobile App (Q43 - Q48)
  {
    id: 43,
    cat: 'lms',
    q: 'Is there a GreenInk Mobile App?',
    a: 'Yes, the GreenInk Mobile App is available for Android and iOS devices, providing complete access to live classes, recorded videos, and tests.',
    tags: ['app', 'mobile app', 'android', 'ios', 'download', 'play store']
  },
  {
    id: 44,
    cat: 'lms',
    q: 'Can I watch recorded lectures offline?',
    a: 'Yes, the GreenInk Mobile App allows students to download lecture videos in-app for offline viewing without data connection.',
    tags: ['offline video', 'download lectures', 'no internet', 'offline']
  },
  {
    id: 45,
    cat: 'lms',
    q: 'What is the "Audible Notes" feature in the LMS?',
    a: 'Audible Notes are curated high-yield audio revision podcasts that allow you to revise key facts and current affairs while commuting or exercising.',
    tags: ['audible notes', 'audio podcasts', 'revision audio', 'audio']
  },
  {
    id: 46,
    cat: 'lms',
    q: 'How does the Active Recall test system work?',
    a: 'The LMS automatically re-tests you on questions you previously got wrong after 3, 7, and 14 days to lock concepts into long-term memory.',
    tags: ['active recall', 'spaced repetition', 'memory test', 'revision engine']
  },
  {
    id: 47,
    cat: 'lms',
    q: 'When do I receive my LMS student credentials after enrolling?',
    a: 'Your LMS and Mobile App login credentials are automatically generated and sent via SMS/WhatsApp within 10 minutes of enrollment.',
    tags: ['credentials', 'login', 'password', 'sms', 'access']
  },
  {
    id: 48,
    cat: 'lms',
    q: 'Can I access the test series on a laptop as well as a smartphone?',
    a: 'Yes, GreenInk LMS is 100% cloud-based and accessible seamlessly across laptops, desktops, tablets, and smartphones.',
    tags: ['laptop access', 'desktop', 'tablet', 'browser test', 'device']
  },

  // Category 8: Book Store & Materials (Q49 - Q54)
  {
    id: 49,
    cat: 'store',
    q: 'What books are available in the GreenInk Publications Store?',
    a: 'We publish the TNPSC General Studies Solved Bank (by Ilayaraja Kannan sir), Banking Formula Blueprint (by Mohan Kumar sir), and Yearly Current Affairs Digests.',
    tags: ['store', 'books', 'publications', 'materials', 'book', 'fees', 'cost']
  },
  {
    id: 50,
    cat: 'store',
    q: 'How can I order the TNPSC General Studies Solved Bank?',
    a: 'You can click "Order Book Online" in our Store section or WhatsApp +91 84287 75012. Special price: ₹599 (Regular ₹899).',
    tags: ['tnpsc book', '599', 'order book', 'general studies', 'buy book']
  },
  {
    id: 51,
    cat: 'store',
    q: 'What is included in the Banking Formula Blueprint book?',
    a: '1,500+ quantitative aptitude shortcuts, reasoning cheat sheets, banking awareness formulas, and solved bank prelims papers (₹449).',
    tags: ['banking book', '449', 'formula blueprint', 'math shortcuts', 'reasoning book']
  },
  {
    id: 52,
    cat: 'store',
    q: 'How long does hardcopy book delivery take in Tamil Nadu?',
    a: 'Books are dispatched via Speed Post / DTDC Courier and delivered within 3 to 5 business days across all Tamil Nadu pin codes.',
    tags: ['delivery time', 'courier', 'speed post', '3-5 days', 'shipping']
  },
  {
    id: 53,
    cat: 'store',
    q: 'Do enrolled coaching students get free study materials?',
    a: 'Yes! Full course enrollment includes complete soft-copy PDFs, one-liner revision notes, and digital question banks for free.',
    tags: ['free materials', 'pdfs', 'enrolled students', 'soft copy']
  },
  {
    id: 54,
    cat: 'store',
    q: 'How do I track my book courier shipment?',
    a: 'Once dispatched, a tracking ID and courier tracking link are sent directly to your registered WhatsApp number.',
    tags: ['tracking', 'tracking id', 'courier status', 'order status']
  },

  // Category 9: Admission, Fees & Support (Q55 - Q60)
  {
    id: 55,
    cat: 'fees',
    q: 'How do I enroll in a course online?',
    a: 'Click "Enroll Now" on the website, select your exam category, enter your name and phone number, and our counselor will guide your batch onboarding.',
    tags: ['enroll', 'admission', 'register', 'how to join', 'join', 'fees']
  },
  {
    id: 56,
    cat: 'fees',
    q: 'What payment methods are supported?',
    a: 'We accept all major payment methods including Google Pay, PhonePe, Paytm, UPI, Net Banking, and Debit/Credit Cards.',
    tags: ['payment', 'gpay', 'phonepe', 'upi', 'cards', 'fees', 'pay']
  },
  {
    id: 57,
    cat: 'fees',
    q: 'Are installment or EMI payment options available?',
    a: 'Yes, flexible 2-part and 3-part installment options as well as zero-cost EMI are available for long-term batches upon counselor approval.',
    tags: ['installment', 'emi', 'split fee', 'monthly', 'fees', 'fee']
  },
  {
    id: 58,
    cat: 'fees',
    q: 'Are fee concessions available for deserving or financially needy students?',
    a: 'Yes, GreenInk offers merit scholarships and economic support discounts based on academic performance and verification.',
    tags: ['scholarship', 'discount', 'fee concession', 'concession', 'fees', 'fee']
  },
  {
    id: 59,
    cat: 'fees',
    q: 'What is the refund and cancellation policy?',
    a: 'We maintain a transparent policy with a 3-day trial evaluation window. Details are available in our Terms & Conditions.',
    tags: ['refund', 'cancellation', 'policy', 'money back', 'cancel']
  },
  {
    id: 60,
    cat: 'fees',
    q: 'How can I speak directly with an admissions counselor right now?',
    a: 'You can call or WhatsApp our official helpline at +91 84287 75012 (available 9:00 AM to 8:00 PM daily).',
    tags: ['helpline', 'counselor', 'call now', 'speak human', 'phone', 'support', 'fees']
  }
];

// Helper: stem search terms
function normalizeTerm(str) {
  return str.toLowerCase().trim()
    .replace(/fees$/, 'fee')
    .replace(/timings$/, 'timing')
    .replace(/classes$/, 'class')
    .replace(/courses$/, 'course')
    .replace(/books$/, 'book');
}

// Find matching knowledge base item
function findKnowledgeMatch(queryText) {
  const rawQuery = queryText.toLowerCase().trim();
  const normQuery = normalizeTerm(rawQuery);

  return chatbotKnowledgeBase.find(item => {
    const itemQ = item.q.toLowerCase();
    const itemA = item.a.toLowerCase();
    const itemTags = item.tags.map(t => t.toLowerCase());

    return itemQ.includes(rawQuery) || 
           itemA.includes(rawQuery) || 
           itemTags.some(t => rawQuery.includes(t) || t.includes(rawQuery)) ||
           itemQ.includes(normQuery) || 
           itemA.includes(normQuery);
  });
}

// Conversational Chatbot Engine Setup
function setupChatbot() {
  const chatbotDrawer = document.getElementById('chatbot-drawer');
  const chatbotBtn = document.getElementById('chatbot-float-btn');
  const closeBtn = document.getElementById('close-chatbot-btn');
  const restartBtn = document.getElementById('restart-chat-btn');
  const categoryChips = document.querySelectorAll('.chat-chip');
  const chatForm = document.getElementById('chat-input-form');
  const chatUserInput = document.getElementById('chat-user-input');
  const convoArea = document.getElementById('chat-conversation-area');
  const typingIndicator = document.getElementById('chat-typing-indicator');

  let currentCategory = 'all';

  // Toggle Drawer
  if (chatbotBtn) {
    chatbotBtn.addEventListener('click', () => {
      chatbotDrawer.classList.toggle('active');
      if (chatbotDrawer.classList.contains('active')) {
        if (convoArea && convoArea.children.length === 0) {
          startNewConversation('all');
        }
        if (chatUserInput) chatUserInput.focus();
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      chatbotDrawer.classList.remove('active');
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      startNewConversation('all');
    });
  }

  // Category Selector Chips
  categoryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      categoryChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentCategory = chip.getAttribute('data-chat-cat') || 'all';

      // Bot introduces questions for that category
      presentCategoryQuestions(currentCategory);
    });
  });

  // Start fresh conversation stream
  function startNewConversation(category = 'all') {
    if (!convoArea) return;
    convoArea.innerHTML = '';

    // Initial greeting
    const welcomeHtml = `
      <div class="chat-msg-row bot-msg-row">
        <div class="msg-bot-avatar">
          <i data-lucide="sparkles" class="icon-inline"></i>
        </div>
        <div class="chat-bubble bot-bubble">
          <p>👋 <strong>Welcome to GreenInk Academy!</strong></p>
          <p>I am your AI Admissions & Mentorship Counselor. Tap any question below or type your query to get instant authentic answers!</p>
          
          <div class="prompt-chips-container">
            <button class="prompt-chip" data-ask="What is the fee structure for TET 2026 Batch-1?">
              <span>🎓 What is the fee for TET 2026 Batch-1?</span>
              <span class="prompt-chip-icon">➔</span>
            </button>
            <button class="prompt-chip" data-ask="What TNPSC exams does GreenInk coach for?">
              <span>🎯 What TNPSC exams does GreenInk coach for?</span>
              <span class="prompt-chip-icon">➔</span>
            </button>
            <button class="prompt-chip" data-ask="Can I prepare for government exams while working a full-time job?">
              <span>⏱️ Can I prepare while working a full-time job?</span>
              <span class="prompt-chip-icon">➔</span>
            </button>
            <button class="prompt-chip" data-ask="How does GreenInk help students improve speed math in Quantitative Aptitude?">
              <span>🏦 How does GreenInk teach Banking Speed Math?</span>
              <span class="prompt-chip-icon">➔</span>
            </button>
          </div>
        </div>
      </div>
    `;

    convoArea.innerHTML = welcomeHtml;
    bindPromptChips();
    initLucideIcons();
    convoArea.scrollTop = convoArea.scrollHeight;
  }

  // Present questions for selected category
  function presentCategoryQuestions(cat) {
    const catItems = chatbotKnowledgeBase.filter(i => cat === 'all' || i.cat === cat).slice(0, 4);

    const catName = cat.toUpperCase();
    const promptButtons = catItems.map(item => `
      <button class="prompt-chip" data-ask="${item.q}">
        <span>${item.q}</span>
        <span class="prompt-chip-icon">➔</span>
      </button>
    `).join('');

    const botMsgHtml = `
      <div class="chat-msg-row bot-msg-row">
        <div class="msg-bot-avatar">
          <i data-lucide="sparkles" class="icon-inline"></i>
        </div>
        <div class="chat-bubble bot-bubble">
          <p>Here are popular questions about <strong>${catName}</strong>. Tap one to get the answer:</p>
          <div class="prompt-chips-container">
            ${promptButtons}
          </div>
        </div>
      </div>
    `;

    convoArea.insertAdjacentHTML('beforeend', botMsgHtml);
    bindPromptChips();
    initLucideIcons();
    convoArea.scrollTop = convoArea.scrollHeight;
  }

  // Handle user asking a question (by typing or clicking a chip)
  function handleUserQuestion(questionText) {
    if (!questionText || !questionText.trim()) return;
    const cleanQuestion = questionText.trim();

    // 1. Render User Message on the Right
    const userMsgHtml = `
      <div class="chat-msg-row user-msg-row">
        <div class="chat-bubble user-bubble">
          ${cleanQuestion}
        </div>
      </div>
    `;
    convoArea.insertAdjacentHTML('beforeend', userMsgHtml);
    convoArea.scrollTop = convoArea.scrollHeight;

    // 2. Show Typing Indicator
    if (typingIndicator) typingIndicator.classList.remove('hidden');

    // 3. Search Knowledge Base
    const match = findKnowledgeMatch(cleanQuestion);

    setTimeout(() => {
      if (typingIndicator) typingIndicator.classList.add('hidden');

      let botResponseHtml = '';

      if (match) {
        // Pick 2 other related questions
        const related = chatbotKnowledgeBase
          .filter(i => i.id !== match.id && (i.cat === match.cat || Math.random() > 0.6))
          .slice(0, 2);

        const relatedChips = related.map(r => `
          <button class="prompt-chip" data-ask="${r.q}">
            <span>${r.q}</span>
            <span class="prompt-chip-icon">➔</span>
          </button>
        `).join('');

        botResponseHtml = `
          <div class="chat-msg-row bot-msg-row">
            <div class="msg-bot-avatar">
              <i data-lucide="sparkles" class="icon-inline"></i>
            </div>
            <div class="chat-bubble bot-bubble">
              <p><strong>${match.q}</strong></p>
              <p style="margin-top: 6px;">${match.a}</p>

              <div class="bot-card-actions">
                <button class="bot-action-btn bot-action-primary open-modal" data-course="${match.q}">
                  Enroll / Inquire Now
                </button>
                <a href="https://wa.me/918428775012?text=Hello%20GreenInk%2C%20I%20want%20to%20know%20more%20about%3A%20${encodeURIComponent(match.q)}" 
                   target="_blank" 
                   class="bot-action-btn bot-action-wa">
                  Ask Mentor on WhatsApp
                </a>
              </div>

              ${relatedChips ? `
                <div style="margin-top: 14px; font-size: 0.78rem; font-weight: 700; color: var(--secondary);">
                  Related Questions You May Ask:
                </div>
                <div class="prompt-chips-container">
                  ${relatedChips}
                </div>
              ` : ''}
            </div>
          </div>
        `;
      } else {
        botResponseHtml = `
          <div class="chat-msg-row bot-msg-row">
            <div class="msg-bot-avatar">
              <i data-lucide="sparkles" class="icon-inline"></i>
            </div>
            <div class="chat-bubble bot-bubble">
              <p>Thank you for asking about <strong>"${cleanQuestion}"</strong>!</p>
              <p>Our senior admissions counselors can give you the most up-to-date batch schedule, fee discounts, and syllabus guidance directly.</p>

              <div class="bot-card-actions">
                <a href="https://wa.me/918428775012?text=Hello%20GreenInk%2C%20I%20am%20asking%20about%3A%20${encodeURIComponent(cleanQuestion)}" 
                   target="_blank" 
                   class="bot-action-btn bot-action-wa">
                  Connect on WhatsApp
                </a>
                <button class="bot-action-btn bot-action-primary open-modal">
                  Request Free Callback
                </button>
              </div>
            </div>
          </div>
        `;
      }

      convoArea.insertAdjacentHTML('beforeend', botResponseHtml);
      bindPromptChips();
      initLucideIcons();
      convoArea.scrollTop = convoArea.scrollHeight;
    }, 400);
  }

  // Bind click events on all prompt chips and CTA buttons
  function bindPromptChips() {
    convoArea.querySelectorAll('.prompt-chip').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const askText = btn.getAttribute('data-ask');
        handleUserQuestion(askText);
      };
    });

    convoArea.querySelectorAll('.open-modal').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const modal = document.getElementById('enroll-modal');
        if (modal) modal.classList.add('active');
      };
    });
  }

  // User message submit form
  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const userText = chatUserInput.value;
      if (!userText.trim()) return;

      chatUserInput.value = '';
      handleUserQuestion(userText);
    });
  }

  // Initial setup
  startNewConversation('all');
}

// Initialize Application
async function init() {
  resizeCanvas();
  preloadImages();

  initLucideIcons();
  setupScrollReveal();
  setupScrollSpy();
  setupTabsAndFilters();
  setupCourseDrawer();
  setupModal();
  setupCounterObserver();
  setupChatbot();

  window.addEventListener('resize', resizeCanvas, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });

  requestAnimationFrame(animationLoop);
}

init();
