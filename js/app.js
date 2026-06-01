/**
 * Alex Carter - Academic Portfolio JS Logic
 * High-Performance Vanilla implementation with zero dependencies.
 */

document.addEventListener('DOMContentLoaded', () => {
  initBackgroundCanvas();
  initRouter();
  initTypewriter();
  initContactForm();
});

/* ==========================================================================
   1. Interactive Cyber-Grid Particles Background
   ========================================================================== */
function initBackgroundCanvas() {
  const canvas = document.getElementById('cyber-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let particles = [];
  let mouse = { x: null, y: null, radius: 150 };
  
  // High-performance scaling based on viewport
  const isMobile = window.innerWidth < 768;
  const particleCount = isMobile ? 35 : 85;
  const connectionDistance = 110;
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  
  // Track mouse coordinates in real-time
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  
  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });
  
  // Particle Blueprint
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 2 + 1;
      this.color = 'rgba(0, 255, 255, 0.4)';
    }
    
    update() {
      // Ambient movement
      this.x += this.vx;
      this.y += this.vy;
      
      // Boundary collisions
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      
      // Hover interaction (slight attraction/repulsion to mouse)
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 0.5;
          this.y -= (dy / dist) * force * 0.5;
        }
      }
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }
  
  // Populate particle vector list
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  
  // Connection line engine
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist < connectionDistance) {
          // Line opacity scales based on proximity
          const alpha = (connectionDistance - dist) / connectionDistance * 0.15;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
      
      // Draw line to user cursor
      if (mouse.x !== null && mouse.y !== null) {
        const p = particles[i];
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist < mouse.radius) {
          const alpha = (mouse.radius - dist) / mouse.radius * 0.25;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`; // purple link to cursor
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }
  
  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Ambient radial backdrop gradient
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 10,
      canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
    );
    gradient.addColorStop(0, '#0a0d18');
    gradient.addColorStop(1, '#05060b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    
    drawConnections();
    requestAnimationFrame(animate);
  }
  
  animate();
}

/* ==========================================================================
   2. Single Page Application (SPA) Tab Routing
   ========================================================================== */
function initRouter() {
  const links = document.querySelectorAll('.nav-link');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSectionId = link.getAttribute('data-target');
      navigateToSection(targetSectionId);
    });
  });
  
  // Handle page refresh or direct link with URL Hash
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    if (hash) navigateToSection(hash);
  });
  
  const currentHash = window.location.hash.substring(1);
  if (currentHash) {
    navigateToSection(currentHash);
  }
}

function navigateToSection(sectionId) {
  const targetSection = document.getElementById(sectionId);
  if (!targetSection) return;
  
  // Deactivate all active elements
  document.querySelectorAll('.page-section').forEach(section => {
    section.classList.remove('active');
  });
  
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  // Activate target
  targetSection.classList.add('active');
  const matchingLink = document.querySelector(`.nav-link[data-target="${sectionId}"]`);
  if (matchingLink) {
    matchingLink.classList.add('active');
  }
  
  // Smooth scroll back to top of new section view
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Update URL hash without breaking history back-stack
  history.pushState(null, null, `#${sectionId}`);
}

/* ==========================================================================
   3. Typewriter Effect
   ========================================================================== */
function initTypewriter() {
  const target = document.getElementById('typewriter-text');
  if (!target) return;
  
  const words = [
    "Software Engineering Scholar",
    "Web Technology Specialist",
    "System Architect in Training",
    "Responsive Interface Designer"
  ];
  
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  
  function type() {
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
      target.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
    } else {
      target.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
    }
    
    let typeSpeed = isDeleting ? 40 : 80;
    
    if (!isDeleting && charIndex === currentWord.length) {
      typeSpeed = 1500; // Pause at full word
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typeSpeed = 400; // Pause before typing next word
    }
    
    setTimeout(type, typeSpeed);
  }
  
  type();
}

/* ==========================================================================
   4. About Timeline Expanding Engine
   ========================================================================== */
function toggleTimeline(clickedElement) {
  const timelineItems = document.querySelectorAll('.timeline-item');
  
  // Collapse others, open clicked
  timelineItems.forEach(item => {
    if (item === clickedElement) {
      item.classList.toggle('active');
    } else {
      item.classList.remove('active');
    }
  });
}

/* ==========================================================================
   5. Subject Learnings Dynamic Database & Modal System
   ========================================================================== */
function switchSubject(subject) {
  const btnSe = document.getElementById('btn-se');
  const btnWeb = document.getElementById('btn-web');
  const containerSe = document.getElementById('subject-se');
  const containerWeb = document.getElementById('subject-web');
  
  if (subject === 'se') {
    btnSe.classList.add('active');
    btnWeb.classList.remove('active');
    containerSe.classList.add('active');
    containerWeb.classList.remove('active');
  } else {
    btnWeb.classList.add('active');
    btnSe.classList.remove('active');
    containerWeb.classList.add('active');
    containerSe.classList.remove('active');
  }
}

// Learning modules database - loaded dynamically into reusable modal popup
const learningData = {
  'se-sdlc': {
    title: 'Software Development Life Cycle (SDLC)',
    subject: 'Software Engineering',
    category: 'Process Models',
    reflections: 'Implementing Agile pipelines showed me that code writing is just one component. Establishing solid automated cycles is what ensures quality at scale.',
    details: [
      'Agile Sprint Frameworks: Participated in mock Scrum iterations, designing backlogs, estimating story points, and holding sprint retrospectives.',
      'Version Control Protocols: Implemented strict Git branch architectures (main, development, feature/*), solving merge conflicts, and conducting code reviews.',
      'CI/CD Workflows: Configured automated build checkpoints to lint and test packages prior to staging.'
    ],
    code: `// Example CI/CD Test Pipeline Execution Logic
<span class="code-keyword">const</span> pipeline = {
  stages: [<span class="code-highlight">'Lint'</span>, <span class="code-highlight">'Test'</span>, <span class="code-highlight">'Build'</span>],
  run(stage) {
    console.log(\`[Pipeline] Running \${stage}...\`);
    <span class="code-keyword">return</span> Math.random() > 0.05; // 95% pass rate
  }
};
pipeline.stages.forEach(stage => pipeline.run(stage));`
  },
  'se-architecture': {
    title: 'System Design & Design Patterns',
    subject: 'Software Engineering',
    category: 'Architecture Design',
    reflections: 'Moving from raw spaghetti scripts to patterns like Factory and Strategy felt like gaining developer vision. Code readability and extensions became organic.',
    details: [
      'Creational Patterns: Used Factory and Builder methodologies to modularize object instantiations without exposing design-specific setup logic.',
      'Behavioral Patterns: Implemented the Observer system to coordinate state adjustments across UI widgets, and Strategy patterns for flexible algorithm switching.',
      'UML Blueprints: Designed detailed Class and Sequence charts modeling cross-class interactions prior to coding.'
    ],
    code: `// strategy pattern simulation for dynamic pricing
<span class="code-keyword">class</span> BillingContext {
  setStrategy(strategy) { <span class="code-keyword">this</span>.strategy = strategy; }
  calculate(price) { <span class="code-keyword">return</span> <span class="code-keyword">this</span>.strategy(price); }
}
<span class="code-keyword">const</span> studentDiscount = (p) => p * 0.8; // 20% off
<span class="code-keyword">const</span> standardPrice = (p) => p;`
  },
  'se-oop': {
    title: 'Object-Oriented Programming (OOP)',
    subject: 'Software Engineering',
    category: 'Paradigm Core',
    reflections: 'SOLID is not just academic; it is a shield against architectural decay. Decoupling dependencies keeps large systems clean and agile.',
    details: [
      'The 4 Pillars: Mastered Encapsulation, Abstraction, Inheritance, and Polymorphism in complex class structures.',
      'SOLID Strictness: Focused on Single Responsibility and Dependency Inversion to guarantee class designs are decoupled and fully unit-testable.',
      'Abstract Interfaces: Designed complex base interface structures allowing interchangeable modules.'
    ],
    code: `// Polymorphic rendering & dependency inversion
<span class="code-keyword">interface</span> Logger { log(msg: string): void; }
<span class="code-keyword">class</span> ConsoleLogger <span class="code-keyword">implements</span> Logger {
  log(msg) { console.log(\`[Console]: \${msg}\`); }
}
<span class="code-keyword">class</span> AppController {
  constructor(private logger: Logger) {} // Decoupled!
}`
  },
  'se-testing': {
    title: 'Software Testing & Quality Assurance',
    subject: 'Software Engineering',
    category: 'Quality Control',
    reflections: 'TDD requires initial discipline, but debugging complex programs with instant-feedback test frameworks feels infinitely safer and faster.',
    details: [
      'Unit Verification: Wrote unit assertions covering algorithm extremes, error handling blocks, and boundary thresholds.',
      'Integration Frameworks: Tested end-to-end multi-module coordination, isolating network inputs using mock doubles.',
      'Test-Driven Design (TDD): Engineered routines by drafting red failures, compiling green passes, and refactoring clean logic.'
    ],
    code: `// standard unit assertion test mockup
<span class="code-keyword">function</span> assertEqual(actual, expected, testName) {
  <span class="code-keyword">if</span> (actual === expected) {
    console.log(\`✔ PASS: \${testName}\`);
  } <span class="code-keyword">else</span> {
    console.error(\`✘ FAIL: \${testName}. Expected \${expected}, got \${actual}\`);
  }
}`
  },
  'web-markup': {
    title: 'Modern HTML5 & CSS3 Architecture',
    subject: 'Web Technology',
    category: 'Markup & Style',
    reflections: 'Beautiful CSS is a product of absolute structure control. Semantic tags ensure layout predictability, accessibility (A11y), and clean SEO indices.',
    details: [
      'Semantic Structures: Wrote standardized documents utilizing header, main, section, nav, and article elements.',
      'CSS Layouts: Applied complex CSS Grid and Flexbox mechanics to coordinate modular, multi-axis layouts.',
      'Styling Architectures: Managed standard stylesheets using clean HSL variables, fluid layout values, and CSS custom variables.'
    ],
    code: `/* Responsive fluid layout using CSS Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  background: var(--card-bg);
  backdrop-filter: blur(10px);
}`
  },
  'web-js': {
    title: 'Advanced Vanilla JavaScript (ES6+)',
    subject: 'Web Technology',
    category: 'Execution Engine',
    reflections: 'Understanding closures and the JavaScript Event Loop changes how you approach rendering efficiency and resource management in web browsers.',
    details: [
      'Asynchronous Paradigms: Utilized Promises, async/await handlers, and the browser Event Loop to structure non-blocking interface updates.',
      'Execution Scopes: Optimized script execution blocks using closures, modular ES6 imports/exports, and lexical hoisting controls.',
      'DOM Operations: Coded high-speed DOM updates using fragment nodes and passive layout listeners.'
    ],
    code: `// Async Fetch pattern with error protection
<span class="code-keyword">async function</span> fetchTelemetry(url) {
  <span class="code-keyword">try</span> {
    <span class="code-keyword">const</span> res = <span class="code-keyword">await</span> fetch(url);
    <span class="code-keyword">if</span> (!res.ok) <span class="code-keyword">throw new</span> Error('Network Down');
    <span class="code-keyword">const</span> data = <span class="code-keyword">await</span> res.json();
    <span class="code-keyword">return</span> data;
  } <span class="code-keyword">catch</span> (err) {
    console.error(\`Telemetry Error: \${err.message}\`);
  }
}`
  },
  'web-services': {
    title: 'Web Services & Fetch APIs',
    subject: 'Web Technology',
    category: 'Network Services',
    reflections: 'Mastering REST flow, dynamic payload assembly, and security configurations makes bridging client interfaces to data layers standard and straightforward.',
    details: [
      'REST Integrations: Built custom fetch wrappers to manage standard GET, POST, PUT, and DELETE exchanges.',
      'Payload Strategies: Constructed, transmitted, and decoded JSON structures containing structured error payloads.',
      'Security Protocols: Structured secure network headers, including CSRF tokens and bearer authorizations.'
    ],
    code: `// Secure API client wrapper
<span class="code-keyword">const</span> secureFetch = <span class="code-keyword">async</span> (url, token) => {
  <span class="code-keyword">return</span> fetch(url, {
    headers: {
      <span class="code-highlight">'Authorization'</span>: \`Bearer \${token}\`,
      <span class="code-highlight">'Content-Type'</span>: <span class="code-highlight">'application/json'</span>
    }
  });
};`
  },
  'web-optimization': {
    title: 'Responsive Design & Optimization',
    subject: 'Web Technology',
    category: 'Performance QA',
    reflections: 'Optimizing sites down to sub-second load times requires understanding how the browser processes the Critical Rendering Path (CRP). Speed is a vital feature.',
    details: [
      'Mobile-First Flowports: Used fluid viewport scales and media break engines to optimize visuals on screens down to 320px width.',
      'Critical Rendering Path: Deferring secondary scripts, inline critical layout calculations, and minimizing DOM repaints.',
      'Asset Auditing: Audited interfaces with Google Lighthouse to verify accessibility, SEO, performance, and best practices.'
    ],
    code: `// Debounce event listener to control repaints
<span class="code-keyword">function</span> debounce(func, wait = 100) {
  <span class="code-keyword">let</span> timeout;
  <span class="code-keyword">return function</span>(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(<span class="code-keyword">this</span>, args), wait);
  };
}`
  }
};

function openLearningDetail(moduleId) {
  const data = learningData[moduleId];
  if (!data) return;
  
  const content = `
    <div class="modal-header-desc">${data.subject} • ${data.category}</div>
    <h2 class="modal-title gradient-text">${data.title}</h2>
    
    <div class="modal-content-area">
      <div>
        <h3 class="info-section-title">Core Competencies Developed</h3>
        <ul class="modal-bullet-list">
          ${data.details.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
      
      <div>
        <h3 class="info-section-title">Academic & Developer Reflection</h3>
        <p style="font-size: 0.95rem; line-height: 1.6; font-style: italic; color: var(--text-muted);">
          "${data.reflections}"
        </p>
      </div>
      
      <div>
        <h3 class="info-section-title">Technical Sample Code</h3>
        <div class="code-block-header">
          <span>JavaScript</span>
          <i class="fa-solid fa-code"></i>
        </div>
        <pre class="code-block"><code>${data.code}</code></pre>
      </div>
    </div>
  `;
  
  document.getElementById('modal-body-content').innerHTML = content;
  document.getElementById('deep-dive-modal').classList.add('active');
  document.body.style.overflow = 'hidden'; // Lock scrolling
}

/* ==========================================================================
   6. Projects Dynamic Database & Filter Engine
   ========================================================================== */
function filterProjects(category) {
  // Update active buttons
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    if (btn.textContent.toLowerCase().includes(category.replace('webapp', 'web app')) || 
        (category === 'all' && btn.textContent.toLowerCase().includes('all'))) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  const cards = document.querySelectorAll('.project-card');
  
  cards.forEach(card => {
    const cardCat = card.getAttribute('data-category');
    
    // Smooth transition effect
    card.style.opacity = '0';
    card.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      if (category === 'all' || cardCat === category) {
        card.style.display = 'flex';
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
        }, 50);
      } else {
        card.style.display = 'none';
      }
    }, 250);
  });
}

// Project Case Database
const projectCases = {
  'devsync': {
    title: 'DevSync: Vanilla JS Scrum Tracking Portal',
    category: 'Web Application',
    tech: 'HTML5, CSS3 Grid, ES6 JS Core, LocalStorage',
    scope: 'Designed to solve standard student team management challenges. We needed a collaborative, responsive task portal that would function entirely client-side without heavy database backends.',
    architecture: 'Modular front-end built using raw JavaScript controllers and an observer state management core. UI components react instantly to model changes. Storing data cleanly in local browser segments.',
    keyPoints: [
      'Interactive Canvas Board: Column grids featuring drag-and-drop tasks with smooth transition boundaries.',
      'Active Velocity Visualizations: Custom vector charts rendering performance rates over time.',
      'Payload Sync Framework: Dynamic REST client that pushes local records to simulated mock databases.',
      'Modern Accessibility: Built with semantic structures to guarantee high keyboard navigation compatibility.'
    ],
    asciiSchema: `
+------------------------------------------+
|            DevSync Controller            |
+------------------------------------------+
                    | (Triggers State)
                    v
+------------------------------------------+
|          Observer Model Engine           |
+------------------------------------------+
      |                      |
      v (Renders UI)         v (Saves Storage)
+--------------+      +--------------------+
|  HTML5 DOM   |      | Local Browser DB   |
+--------------+      +--------------------+
    `
  },
  'archpattern': {
    title: 'ArchPattern: UML Pattern Simulator',
    category: 'Software Engineering Modeling',
    tech: 'Java Core, OOP, Vector UI, Design Patterns',
    scope: 'An educational application mapping patterns to physical, observable events. Created to simplify the visualization of object coordination.',
    architecture: 'Built using Java. Combines a core behavioral model with abstract strategy layers. Demonstrates modular OOP and runtime parameter swaps.',
    keyPoints: [
      'Observer Grid Nodes: Circular canvas nodes reacting to dynamic subject broadcasts in real-time.',
      'Strategy Pricing Sandbox: A testing widget simulating instant pricing changes based on selected logic.',
      'Dynamic Factory Registry: Implemented custom object instantiation menus without hardcoded dependency links.',
      'Diagnostic Console: Visual terminal reporting sequence maps, tracking runtime method calls.'
    ],
    asciiSchema: `
  [Subject Node] --- (Notify Event) ---> [Observer A Node]
        |
        +-----------------------------> [Observer B Node]
        
  *Active Strategies:*
  [Strategy A: Student 20% Off]  <--->  [Strategy B: Base Billing]
    `
  },
  'aetheria': {
    title: 'Aetheria Glassmorphism Component Library',
    category: 'Frontend UI Design',
    tech: 'CSS Custom Tokens, Backdrop Filter, Web Components',
    scope: 'A premium experimental layout library engineered purely with vanilla CSS and responsive micro-interactions. Developed to prove that high-performance designs can be built without bulky styling engines.',
    architecture: 'Standard CSS custom properties organizing HSL tokens. Features optimized blur overlays and keyframe configurations. Maintains layout speeds under 1.2ms.',
    keyPoints: [
      'Fluid Typography Matrices: Structured scale variables adapting font layouts relative to screen widths.',
      'Glassmorphic Layout Cards: Cards utilizing HSL borders, shadows, and backdrop filters.',
      'High-Speed Keyframes: Optimized transitions designed to trigger GPU layer-compositing.',
      'A11y Compliant Contrasts: Tailored HSL structures providing high contrast ratios on dark canvas gradients.'
    ],
    asciiSchema: `
   +------------------------------------+
   |    Aetheria HSL Layout Tokens      |
   +------------------------------------+
                     | (Applies Styles)
                     v
   +------------------------------------+
   | Backdrop Filter Blur (12px - 20px) |
   +------------------------------------+
                     | (Optimized GPU Rendering)
                     v
   [ 60 FPS Fluid Transitions & Dynamic Glows ]
    `
  },
  'edudb': {
    title: 'EduDB: Database Index Optimizer',
    category: 'Database System Design',
    tech: 'Python Core, PostgreSQL, SQL Profiling Tools',
    scope: 'Developed to address optimization constraints in educational management databases. Designed to profile query bottlenecks and evaluate indexing strategies.',
    architecture: 'PostgreSQL database managed by a Python API. Includes telemetry engines measuring query runtime variations, demonstrating sub-millisecond query returns.',
    keyPoints: [
      'Relational Schema Blueprinting: Multi-table relational architecture mapping student performance arrays.',
      'Automated Index Optimizers: Script routines that evaluate B-Tree structure setups, optimizing slow queries.',
      'JSON Profiling Exports: Integrated telemetry exporting query benchmarks in formatted tables.',
      'Transaction Concurrency: Custom locks simulating high-volume operations.'
    ],
    asciiSchema: `
  +-------------+                 +----------------------+
  | Python App  | --(Telemetry)-> |   SQL Query Profiler |
  +-------------+                 +----------------------+
         |                                   |
         | (Executes Structured Queries)     | (Evaluates)
         v                                   v
  +-------------+                 +----------------------+
  | Postgres DB | <-------------- |  B-Tree Index Tuning |
  +-------------+                 +----------------------+
    `
  },
  'ppes': {
    title: 'PPES: Personal Protective Equipment Safety Suite',
    category: 'Web Application',
    tech: 'Vanilla ES6+, WebSockets, HTML5 Canvas, SVG Diagnostics',
    scope: 'Designed for industrial safety compliance, PPES acts as a real-time compliance monitor for high-hazard work zones. The suite ensures that personnel are equipped with mandatory safety gear (hard hats, safety harnesses, goggles) using smart sensor validation before entering hazardous environments.',
    architecture: 'Built with a modular frontend controller that listens to real-time telemetry streams via a secure WebSocket gateway. A dynamic Canvas mapping engine visualizes safe and unsafe hazard zones, rendering real-time compliance updates and generating safety alert broadcasts.',
    keyPoints: [
      'WebSocket Telemetry Stream: Maintains a persistent, bi-directional socket pipeline streaming real-time sensor states from worker badges.',
      'Interactive Safety Map: A HTML5 canvas layout mapping active zones, coloring workers green (compliant) or red (violation) in real-time.',
      'Instant Warning Dispatch: Integrates a Web Audio and passive UI alert notification trigger immediately upon detecting equipment bypasses.',
      'Audit Ledger Engine: Stored structured safety logs locally with search and filtering utilities, ready for daily compliance exports.'
    ],
    asciiSchema: `
  +------------------+                   +--------------------+
  | IoT Sensor Badges| --(WebSocket)-->  | PPES Secure Gateway|
  +------------------+                   +--------------------+
                                                   | (Telemetry payload)
                                                   v
  +------------------+                   +--------------------+
  | HTML5 Canvas Map | <--(Render Loop)--| PPES Central State |
  | (Compliance View)|                   +--------------------+
  +------------------+                             |
                                                   v (Triggers)
                                         [ Web Audio / Alert Engine ]
    `
  }
};

function openProjectCase(caseId) {
  const data = projectCases[caseId];
  if (!data) return;
  
  const content = `
    <div class="modal-header-desc">${data.category} • Case Study</div>
    <h2 class="modal-title gradient-text">${data.title}</h2>
    
    <div class="modal-content-area">
      <div style="background: rgba(0, 255, 255, 0.03); border: 1px solid rgba(0, 255, 255, 0.1); border-radius: 8px; padding: 1.2rem;">
        <strong style="color: var(--accent-cyan);">Core Technologies:</strong>
        <span style="color: var(--text-white); font-family: var(--font-header); font-size: 0.9rem; margin-left: 8px;">${data.tech}</span>
      </div>

      <div>
        <h3 class="info-section-title">Project Purpose & Scope</h3>
        <p style="font-size: 0.95rem; line-height: 1.6;">${data.scope}</p>
      </div>
      
      <div>
        <h3 class="info-section-title">Technical Architecture</h3>
        <p style="font-size: 0.95rem; line-height: 1.6; margin-bottom: 1rem;">${data.architecture}</p>
        <div class="code-block-header">
          <span>System Flow / Schema Blueprint</span>
          <i class="fa-solid fa-network-wired"></i>
        </div>
        <pre class="code-block"><code style="color: var(--accent-cyan);">${data.asciiSchema}</code></pre>
      </div>
      
      <div>
        <h3 class="info-section-title">Key Implementations</h3>
        <ul class="modal-bullet-list">
          ${data.keyPoints.map(point => `<li>${point}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
  
  document.getElementById('modal-body-content').innerHTML = content;
  document.getElementById('deep-dive-modal').classList.add('active');
  document.body.style.overflow = 'hidden'; // Lock body scroll
}

/* ==========================================================================
   7. Reusable Modal & Escape Controls
   ========================================================================== */
function closeModal() {
  document.getElementById('deep-dive-modal').classList.remove('active');
  document.body.style.overflow = 'auto'; // Unlock scroll
}

// Close Modal on background overlay clicks
document.getElementById('deep-dive-modal').addEventListener('click', (e) => {
  if (e.target.id === 'deep-dive-modal') {
    closeModal();
  }
});

// Escape key to close modal naturally
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
});

/* ==========================================================================
   8. Contact Form Validator & Toast Notifications
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('form-name').value.trim();
    const email = document.getElementById('form-email').value.trim();
    const subject = document.getElementById('form-subject').value.trim();
    const message = document.getElementById('form-message').value.trim();
    const submitBtn = document.getElementById('submit-btn');
    
    // Quick validation
    if (!name || !email || !subject || !message) {
      showToast('Please fill out all fields.', 'error');
      return;
    }
    
    // Simple Email Regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    
    // Loading State
    submitBtn.disabled = true;
    submitBtn.innerHTML = `Encrypting Payload <i class="fa-solid fa-circle-notch fa-spin"></i>`;
    
    // Web3Forms API Configuration (100% Free & Fast background emails)
    // 1. Enter your email on https://web3forms.com/ to receive a free Access Key instantly.
    // 2. Paste your Access Key below.
    // If left as "YOUR_ACCESS_KEY_HERE", it automatically falls back to mailto:vedantkhot112@gmail.com
    const WEB3FORMS_ACCESS_KEY = "YOUR_ACCESS_KEY_HERE";
    
    if (WEB3FORMS_ACCESS_KEY && WEB3FORMS_ACCESS_KEY !== "YOUR_ACCESS_KEY_HERE") {
      // Background API Dispatch
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          name: name,
          email: email,
          subject: "Portfolio Inquiry: " + subject,
          message: message
        })
      })
      .then(async (response) => {
        const json = await response.json();
        if (response.status === 200) {
          showToast("Message sent successfully in the background!", "success");
          form.reset();
        } else {
          showToast(json.message || "Failed to dispatch email.", "error");
        }
      })
      .catch(() => {
        showToast("Network pipeline failed. Triggering mailto fallback...", "error");
        triggerMailtoFallback();
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `Send Message <i class="fa-solid fa-paper-plane"></i>`;
      });
    } else {
      // Fallback redirection
      setTimeout(() => {
        triggerMailtoFallback();
        submitBtn.disabled = false;
        submitBtn.innerHTML = `Send Message <i class="fa-solid fa-paper-plane"></i>`;
      }, 1000);
    }
    
    function triggerMailtoFallback() {
      const emailBody = `Sender Name: ${name}\nSender Email: ${email}\n\nMessage Detail:\n${message}\n\n-----------------------------------------\nDispatch payload compiled via Academic Portfolio Contact Form.`;
      const mailtoUrl = `mailto:vedantkhot112@gmail.com?subject=${encodeURIComponent("Portfolio Contact: " + subject)}&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailtoUrl;
      showToast('Opening default email client...', 'success');
      form.reset();
    }
  });
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'error' : ''}`;
  
  const icon = type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-check';
  const color = type === 'error' ? 'var(--accent-purple)' : 'var(--accent-cyan)';
  
  toast.innerHTML = `
    <i class="fa-solid ${icon}" style="color: ${color}"></i>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  // Transition out after 4 seconds
  setTimeout(() => {
    toast.classList.add('hide');
    // Remove element completely after animation completes
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 4000);
}

/* ==========================================================================
   9. PPES Interactive Architecture Diagnostics & Inspector
   ========================================================================== */
const ppesModelSchemas = {
  'User': [
    '• userId: String (unique identification index)',
    '• usn: String (sparse index; unique student number)',
    '• name: String (full student/faculty name)',
    '• email: String (unique primary credential)',
    '• password: String (bcrypt-encrypted hash value)',
    '• role: Enum ["admin", "faculty", "student"]',
    '• unlockedCourses: Array [ ObjectId → Course references ]',
    '• isEmailSent: Boolean (tracks automated welcome dispatch)'
  ],
  'Course': [
    '• course_name: String (display name)',
    '• course_id: String (unique database primary key)',
    '• course_description: String (rich markdown summary)',
    '• price: Number (pricing tier for Razorpay orders)',
    '• isPublished: Boolean (toggles student visibility)',
    '• subjects: Array [ ObjectId → Subject references ]'
  ],
  'Subject': [
    '• subject_name: String (display name)',
    '• subject_id: String (unique core identifier code)',
    '• description: String (learning overview text)',
    '• teacherId: ObjectId → User (references active faculty)',
    '• materials: Array [ ObjectId → Material resources ]'
  ],
  'Doubt': [
    '• title: String (student doubt query topic)',
    '• subject_id: String (references subject core ID)',
    '• student_id: String (references student USN)',
    '• assigned_teacher_id: String (references assigned faculty)',
    '• status: Enum ["open", "resolved", "closed"] (state tracker)',
    '• is_teacher_validated: Boolean (confirms faculty response status)'
  ],
  'Payment': [
    '• studentId: String (indexed; references paying student)',
    '• courseId: ObjectId → Course (references purchased course)',
    '• amount: Number (transaction value in INR)',
    '• razorpay_order_id: String (order reference token)',
    '• razorpay_payment_id: String (unique capture receipt token)',
    '• status: Enum ["success", "failed", "pending"]'
  ]
};

function inspectModel(modelName) {
  const schemaFields = ppesModelSchemas[modelName];
  if (!schemaFields) return;
  
  const titleEl = document.getElementById('model-inspect-title');
  const fieldsEl = document.getElementById('model-inspect-fields');
  
  // Dynamic glow transition
  fieldsEl.style.opacity = '0';
  fieldsEl.style.transform = 'translateY(5px)';
  
  setTimeout(() => {
    titleEl.textContent = `Mongoose Model: ${modelName}`;
    fieldsEl.innerHTML = schemaFields.map(f => `<div style="margin-bottom: 0.4rem; font-family: 'Courier New', monospace;">${f}</div>`).join('');
    fieldsEl.style.opacity = '1';
    fieldsEl.style.transform = 'translateY(0)';
  }, 200);
}

// Telemetry execution logs
const diagnosticPipelines = {
  'payment': [
    '⚡ [Client] Student clicked "Enroll Now" on Course: 665e8a...',
    '⚡ [Client] Dispatching order request payload to frontend router...',
    '⚡ [Next.js] Router forwarding request: POST http://localhost:5000/api/v1/payment/order',
    '⚡ [Express] Payload parsed. Initiating client order handshake with Payment Gateway...',
    '⚡ [Razorpay] Order credentials captured: order_887e3x (Amount: INR 4,999)',
    '⚡ [Express] Payload signed. Sending Order ID to client...',
    '⚡ [Client] Opening secured Razorpay checkout modal overlay (checkout.js)...',
    '⚡ [System] payment.capture: Transaction completed by student. Signature received.',
    '⚡ [Client] Dispatching HMAC signature bundle: POST /api/v1/payment/verify',
    '⚡ [Express] Verification payload parsed. Initiating security checks...',
    '⚙️ [Express] Running crypto HMAC validation: sha256(order_887e3x | payment_992x)...',
    '✔ [Express] Signatures MATCH. Payment validated as 100% SECURE!',
    '💾 [Express] Logging Payment record to MongoDB Atlas...',
    '💾 [Mongoose] Payment.create({ status: "success", r_pay_id: "pay_992x" }) successful.',
    '💾 [Mongoose] Unlocking course index under student unlockedCourses array...',
    '⚡ [Next.js] Returning payload verify confirmation to browser dashboard...',
    '📋 [Client] Generating dynamic receipt invoice using jsPDF module...',
    '📋 [Client] Download triggered: invoice_pay_992x.pdf',
    '🚀 [System] Pipeline completed. SUCCESS.'
  ],
  'timetable': [
    '⚡ [Client] Faculty clicked "Inspect Scheduled Classes" tab...',
    '⚡ [Next.js] Resolving Server Components for timetable shell view...',
    '⚡ [Next.js] Triggering Next.js Server Action: getStudentTimetable("Class-10")...',
    '🔌 [Next.js] Direct database protocol activated (bypassing REST server on 5000)...',
    '💾 [Mongoose] Connecting directly to shared MongoDB Atlas Cluster...',
    '💾 [Mongoose] MongoDB Connected successfully. Preparing slot queries...',
    '🔍 [Mongoose] Running query: TimetableSession.find({ studentClass: "10" }).sort("slotIndex")...',
    '🔍 [Mongoose] Database hit. Found 5 active slot models. Closing raw pool...',
    '⚡ [Next.js] Server Components compiled markup grid with retrieved slot models.',
    '⚡ [Client] Render complete. Timetable grid synchronized in 12ms (Direct-DB flow).',
    '🚀 [System] Pipeline completed. SUCCESS.'
  ],
  'auth': [
    '⚡ [Client] User submitted credentials inside portal: "/login/student"...',
    '⚡ [Client] POST payload: { email: "student@ppes.edu", password: "••••" }',
    '⚡ [Client] Fetching target REST route: POST http://localhost:5000/api/auth/login',
    '🔍 [Express] Querying database for primary email matching "student@ppes.edu"...',
    '🔍 [Mongoose] User found. Extracting bcrypt password hash...',
    '⚙️ [Express] Comparing bcrypt parameters: hash(password, salt) vs DB record...',
    '✔ [Express] Password verified. Role matches "student". Access Authorized.',
    '⚡ [Next.js] Invoking Next.js Server Action: loginAction(userId, role)...',
    '🔑 [Next.js] Signing authentication token via jose.SignJWT() standard...',
    '🔑 [Next.js] Expiry threshold configured: 24 Hours. Role="student" signed.',
    '🍪 [Next.js] Appending client cookies: "token" (JWT) & "user-data" (identity)...',
    '⚡ [Client] Redirecting student layout viewport to portal path: "/student"...',
    '🛡️ [Next.js] middleware.ts: Intercepting incoming path "/student/*"...',
    '🛡️ [Next.js] Decoding JWT payload with jose.jwtVerify(). Role permission matches.',
    '🚀 [System] Route authorized. Dashboard rendered. SUCCESS.'
  ]
};

let diagnosticInterval = null;

function runDiagnostics(pipelineName) {
  const logs = diagnosticPipelines[pipelineName];
  if (!logs) return;
  
  const terminal = document.getElementById('ppes-terminal-output');
  if (!terminal) return;
  
  // Clear any active run
  if (diagnosticInterval) clearInterval(diagnosticInterval);
  
  terminal.innerHTML = '';
  let lineIdx = 0;
  
  // Disable diagnostic controls to prevent overlapping console draws
  const buttons = document.querySelectorAll('#ppes-hub .project-details-btn');
  buttons.forEach(btn => btn.disabled = true);
  
  diagnosticInterval = setInterval(() => {
    if (lineIdx < logs.length) {
      const line = logs[lineIdx];
      let colorClass = 'var(--accent-cyan)';
      if (line.includes('✔')) colorClass = '#22c55e'; // Green success
      if (line.includes('💾')) colorClass = 'var(--accent-purple)'; // Purple DB
      if (line.includes('⚙️')) colorClass = '#eab308'; // Yellow action
      
      terminal.innerHTML += `<div style="margin-bottom: 0.4rem; color: ${colorClass}; font-family: 'Courier New', monospace;">${line}</div>`;
      terminal.scrollTop = terminal.scrollHeight;
      lineIdx++;
    } else {
      clearInterval(diagnosticInterval);
      buttons.forEach(btn => btn.disabled = false);
    }
  }, 350);
}

/* ==========================================================================
   10. Interactive Certificate Visualizer
   ========================================================================== */
const certificateImages = {
  'foundation': {
    title: 'DevOps Foundation Certification',
    issuer: 'DevOps Institute',
    path: 'docs/Devops_foundation.png'
  },
  'ci-cd': {
    title: 'Continuous Integration & Delivery - DevOps',
    issuer: 'DevOps Specialization',
    path: 'docs/TechA_devops.png'
  },
  'ibm': {
    title: 'IBM: DevOps Basics for Everyone',
    issuer: 'IBM Professional',
    path: 'docs/01fe24bci028_IBM.jpeg'
  }
};

function openCertificate(certId) {
  const data = certificateImages[certId];
  if (!data) return;
  
  const content = `
    <div class="modal-header-desc">Professional Credentials</div>
    <h2 class="modal-title gradient-text">${data.title}</h2>
    <div style="font-family: var(--font-header); font-size: 0.9rem; color: var(--accent-cyan); margin-bottom: 1.5rem;">
      Issued by: ${data.issuer}
    </div>
    <div style="width: 100%; border: 1px solid var(--card-border); border-radius: 12px; overflow: hidden; background: #000; display: flex; justify-content: center; align-items: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <img src="${data.path}" alt="${data.title}" style="width: 100%; height: auto; max-height: 60vh; object-fit: contain; display: block;">
    </div>
    <div style="margin-top: 1.5rem; text-align: center;">
      <a href="${data.path}" download class="cta-button" style="font-size: 0.85rem; padding: 0.6rem 1.5rem; margin-top: 0; cursor: pointer;">
        <i class="fa-solid fa-download"></i> Download Original File
      </a>
    </div>
  `;
  
  document.getElementById('modal-body-content').innerHTML = content;
  document.getElementById('deep-dive-modal').classList.add('active');
  document.body.style.overflow = 'hidden';
}
