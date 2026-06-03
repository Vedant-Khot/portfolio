/**
 * WiDS Datathon 2026 - Wildfire prediction report modular script
 * Contains Chart.js initializations, Scroll-Reveal Intersection Observers,
 * and the Canvas-based interactive ember storm background.
 */

(function() {
  // ==========================================
  // 1. Chart.js Dashboard Visualizations
  // ==========================================
  
  // Shared color palette & styling
  const ORANGE  = 'hsl(20, 95%, 45%)';
  const CRIMSON = 'hsl(0, 85%, 45%)';
  const AMBER   = 'hsl(36, 100%, 50%)';
  const GOLD    = 'hsl(42, 100%, 48%)';
  const PEACH   = 'hsl(16, 90%, 62%)';

  if (typeof Chart !== 'undefined') {
    Chart.defaults.font.family = "'Space Grotesk', 'Inter', sans-serif";
    Chart.defaults.font.size   = 12;
    Chart.defaults.color       = 'hsl(20, 12%, 35%)';
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;

    // ── 1.1 MONTHLY WILDFIRE ACTIVITY BAR CHART ──
    const monthCtx = document.getElementById('chart-monthly');
    if (monthCtx) {
      const monthData  = [3, 2, 4, 6, 9, 14, 31, 31, 18, 10, 6, 4];
      const totalSum   = monthData.reduce((a,b) => a+b, 0);
      const pct        = monthData.map(v => +(v/totalSum*100).toFixed(1));
      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

      const monthColors = monthData.map((_, i) =>
        (i === 6 || i === 7)
          ? `hsla(20, 95%, 45%, 0.88)`
          : `hsla(20, 70%, 60%, ${0.38 + i * 0.015})`
      );
      const monthBorders = monthData.map((_, i) =>
        (i === 6 || i === 7) ? ORANGE : 'rgba(234, 88, 12, 0.4)'
      );

      new Chart(monthCtx, {
        type: 'bar',
        data: {
          labels: monthNames,
          datasets: [{
            label: '% of Annual Breaches',
            data: pct,
            backgroundColor: monthColors,
            borderColor: monthBorders,
            borderWidth: 1.5,
            borderRadius: 6,
            borderSkipped: false,
          }]
        },
        options: {
          animation: { duration: 1200, easing: 'easeOutQuart' },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => ` ${ctx.raw}% of annual breaches`
              },
              backgroundColor: 'rgba(255,252,248,0.95)',
              titleColor: 'hsl(20,24%,12%)',
              bodyColor:  'hsl(20,12%,35%)',
              borderColor: 'rgba(234,88,12,0.3)',
              borderWidth: 1,
              cornerRadius: 8,
              padding: 10,
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { weight: '600' } }
            },
            y: {
              grid: { color: 'rgba(234,88,12,0.06)', drawBorder: false },
              ticks: { callback: v => v + '%' },
              title: { display: true, text: '% Breach Events', color: ORANGE, font: { size: 11 } }
            }
          }
        }
      });
    }

    // ── 1.2 CLASS IMBALANCE DOUGHNUT CHART ──
    const classCtx = document.getElementById('chart-class');
    if (classCtx) {
      new Chart(classCtx, {
        type: 'doughnut',
        data: {
          labels: ['No Breach (Event=0)', 'Breach (Event=1)'],
          datasets: [{
            data: [68.8, 31.2],
            backgroundColor: [
              'rgba(234, 88, 12, 0.12)',
              'rgba(234, 88, 12, 0.82)'
            ],
            borderColor: [PEACH, ORANGE],
            borderWidth: 2,
            hoverBackgroundColor: [
              'rgba(234, 88, 12, 0.20)',
              ORANGE
            ],
            hoverBorderWidth: 3,
            hoverOffset: 8
          }]
        },
        options: {
          animation: { animateRotate: true, duration: 1400, easing: 'easeOutQuart' },
          cutout: '66%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 14,
                usePointStyle: true,
                pointStyleWidth: 10,
                font: { size: 11, weight: '500' }
              }
            },
            tooltip: {
              callbacks: { label: ctx => ` ${ctx.raw}%  — ${ctx.label}` },
              backgroundColor: 'rgba(255,252,248,0.95)',
              titleColor: 'hsl(20,24%,12%)',
              bodyColor:  'hsl(20,12%,35%)',
              borderColor: 'rgba(234,88,12,0.3)',
              borderWidth: 1,
              cornerRadius: 8,
              padding: 10,
            }
          }
        }
      });
    }

    // ── 1.3 FEATURE IMPORTANCE HORIZONTAL BAR ──
    const featCtx = document.getElementById('chart-features');
    if (featCtx) {
      const features = [
        'Projected Advance Dist.',
        'Along-Track Closing Speed',
        'Time to Hit (hours)',
        'Distance Slope (km/hr)',
        'Alignment Cosine',
        'Radial Growth Speed',
        'Area Growth Rate',
        'Start Hour of Day',
        'Observation Time Gap',
        'Fire Centroid Displacement'
      ].reverse();
      const importance = [0.54, 0.89, 0.94, 0.85, 0.78, 0.63, 0.71, 0.38, 0.46, 0.52].reverse();

      const barColors = importance.map(v =>
        v > 0.85
          ? `rgba(234, 88, 12, 0.82)`
          : v > 0.65
          ? `rgba(234, 88, 12, 0.55)`
          : `rgba(234, 88, 12, 0.30)`
      );

      new Chart(featCtx, {
        type: 'bar',
        data: {
          labels: features,
          datasets: [{
            label: 'Importance Score',
            data: importance,
            backgroundColor: barColors,
            borderColor: ORANGE,
            borderWidth: 1.5,
            borderRadius: 4,
            borderSkipped: false,
          }]
        },
        options: {
          indexAxis: 'y',
          animation: { duration: 1400, easing: 'easeOutQuart' },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: { label: ctx => ` Score: ${ctx.raw.toFixed(3)}` },
              backgroundColor: 'rgba(255,252,248,0.95)',
              titleColor: 'hsl(20,24%,12%)',
              bodyColor:  'hsl(20,12%,35%)',
              borderColor: 'rgba(234,88,12,0.3)',
              borderWidth: 1,
              cornerRadius: 8,
              padding: 10,
            }
          },
          scales: {
            x: {
              min: 0, max: 1,
              grid: { color: 'rgba(234,88,12,0.06)', drawBorder: false },
              ticks: { callback: v => v.toFixed(1) },
              title: { display: true, text: 'Relative Importance (0–1)', color: ORANGE, font: { size: 11 } }
            },
            y: {
              grid: { display: false },
              ticks: { font: { size: 11 } }
            }
          }
        }
      });
    }

    // ── 1.4 CORRELATION HEATMAP (custom canvas rendering) ──
    const heatCtx = document.getElementById('chart-heatmap');
    if (heatCtx) {
      const labels = [
        'Time-to-Hit', 'Closing Speed', 'Dist. Slope',
        'Init. Distance', 'Growth Rate', 'Align. Cosine'
      ];
      const matrix = [
        [1.00,  0.87,  0.81, -0.79,  0.52,  0.73],
        [0.87,  1.00,  0.84, -0.82,  0.60,  0.78],
        [0.81,  0.84,  1.00, -0.76,  0.55,  0.68],
        [-0.79, -0.82, -0.76, 1.00, -0.48, -0.61],
        [0.52,  0.60,  0.55, -0.48, 1.00,  0.44],
        [0.73,  0.78,  0.68, -0.61, 0.44,  1.00],
      ];
      const n = labels.length;

      const heatData = [];
      matrix.forEach((row, r) => {
        row.forEach((val, c) => {
          heatData.push({ x: c, y: r, v: val });
        });
      });

      new Chart(heatCtx, {
        type: 'scatter',
        data: {
          datasets: [{
            data: heatData.map(d => ({ x: d.x, y: d.y, v: d.v })),
            pointStyle: 'rect',
            radius: 0
          }]
        },
        plugins: [{
          id: 'heatmap-renderer',
          beforeDraw(chart) {
            const { ctx, chartArea: { left, top, right, bottom } } = chart;
            const cellW = (right - left)  / n;
            const cellH = (bottom - top)  / n;
            const data  = chart.data.datasets[0].data;

            data.forEach(pt => {
              const xPx = left + pt.x * cellW;
              const yPx = top  + (n - 1 - pt.y) * cellH;
              const v   = pt.v;

              let r, g, b;
              if (v >= 0) {
                r = Math.round(255 - (255 - 234) * v);
                g = Math.round(252 - (252 - 88) * v * v);
                b = Math.round(248 - (248 - 12) * v * v * v);
              } else {
                const a = -v;
                r = Math.round(255 - (255 - 71)  * a);
                g = Math.round(252 - (252 - 85)  * a);
                b = Math.round(248 - (248 - 105) * a);
              }
              const alpha = 0.15 + Math.abs(v) * 0.75;

              ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
              ctx.fillRect(xPx + 2, yPx + 2, cellW - 4, cellH - 4);

              ctx.fillStyle = Math.abs(v) > 0.6
                ? (v > 0 ? 'hsl(20,90%,30%)' : 'hsl(220,50%,35%)')
                : 'hsl(20,12%,40%)';
              ctx.font = `600 11px 'Space Grotesk', sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(v.toFixed(2), xPx + cellW/2, yPx + cellH/2);
            });
          }
        }],
        options: {
          animation: { duration: 0 },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => {
                  const d = ctx.raw;
                  return ` r = ${d.v.toFixed(2)}  (${labels[d.x]} ↔ ${labels[n-1-d.y]})`;
                }
              },
              backgroundColor: 'rgba(255,252,248,0.95)',
              titleColor: 'hsl(20,24%,12%)',
              bodyColor:  'hsl(20,12%,35%)',
              borderColor: 'rgba(234,88,12,0.3)',
              borderWidth: 1,
              cornerRadius: 8,
              padding: 10,
            }
          },
          scales: {
            x: {
              type: 'linear', min: -0.5, max: n - 0.5,
              ticks: {
                stepSize: 1,
                callback: v => (Number.isInteger(v) && v >= 0 && v < n) ? labels[v] : '',
                maxRotation: 35, font: { size: 10.5 }
              },
              grid: { display: false }
            },
            y: {
              type: 'linear', min: -0.5, max: n - 0.5,
              ticks: {
                stepSize: 1,
                callback: v => (Number.isInteger(v) && v >= 0 && v < n) ? labels[n-1-v] : '',
                font: { size: 10.5 }
              },
              grid: { display: false }
            }
          }
        }
      });
    }

    // ── 1.5 BOX PLOT (custom whiskers bar scaffold) ──
    const bpCtx = document.getElementById('chart-boxplot');
    if (bpCtx) {
      const boxStats = {
        'No Breach (Event=0)': { min: 45,  q1: 98,  med: 131, q3: 182, max: 290 },
        'Breach (Event=1)':    { min: 0.4, q1: 1.2, med: 2.4, q3: 3.8, max: 5.0 }
      };
      const groupKeys  = Object.keys(boxStats);
      const colorMap   = ['rgba(234,88,12,0.18)', 'rgba(234,88,12,0.78)'];
      const borderMap  = ['rgba(234,88,12,0.55)', ORANGE];

      new Chart(bpCtx, {
        type: 'bar',
        data: {
          labels: groupKeys,
          datasets: [{
            label: 'IQR Box',
            data: groupKeys.map(k => boxStats[k].q3 - boxStats[k].q1),
            base: groupKeys.map(k => boxStats[k].q1),
            backgroundColor: colorMap,
            borderColor: borderMap,
            borderWidth: 2,
            borderRadius: 3,
            borderSkipped: false,
          }]
        },
        plugins: [{
          id: 'boxplot-whiskers',
          afterDraw(chart) {
            const { ctx, scales: { x, y } } = chart;
            ctx.save();
            ctx.lineWidth = 2.5;
            ctx.lineCap   = 'round';

            groupKeys.forEach((key, i) => {
              const s     = boxStats[key];
              const xPx   = x.getPixelForValue(i);
              const halfW = x.getPixelForValue(0.3) - x.getPixelForValue(0);

              ctx.strokeStyle = borderMap[i];
              ctx.fillStyle   = borderMap[i];

              // Lower whisker
              ctx.beginPath();
              ctx.moveTo(xPx, y.getPixelForValue(s.q1));
              ctx.lineTo(xPx, y.getPixelForValue(s.min));
              ctx.stroke();
              ctx.beginPath();
              ctx.moveTo(xPx - halfW * 0.5, y.getPixelForValue(s.min));
              ctx.lineTo(xPx + halfW * 0.5, y.getPixelForValue(s.min));
              ctx.stroke();

              // Upper whisker
              ctx.beginPath();
              ctx.moveTo(xPx, y.getPixelForValue(s.q3));
              ctx.lineTo(xPx, y.getPixelForValue(s.max));
              ctx.stroke();
              ctx.beginPath();
              ctx.moveTo(xPx - halfW * 0.5, y.getPixelForValue(s.max));
              ctx.lineTo(xPx + halfW * 0.5, y.getPixelForValue(s.max));
              ctx.stroke();

              // Median line
              ctx.lineWidth   = 3;
              ctx.strokeStyle = i === 1 ? '#fff' : ORANGE;
              ctx.beginPath();
              ctx.moveTo(xPx - halfW, y.getPixelForValue(s.med));
              ctx.lineTo(xPx + halfW, y.getPixelForValue(s.med));
              ctx.stroke();

              // Label
              ctx.fillStyle  = i === 1 ? ORANGE : 'hsl(20,90%,35%)';
              ctx.font       = `700 11px 'Space Grotesk', sans-serif`;
              ctx.textAlign  = 'center';
              ctx.textBaseline = 'bottom';
              ctx.fillText(`median: ${s.med} km`, xPx, y.getPixelForValue(s.max) - 6);
            });
            ctx.restore();
          }
        }],
        options: {
          animation: { duration: 1200, easing: 'easeOutQuart' },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => {
                  const s = boxStats[ctx.label];
                  return [
                    ` Min: ${s.min} km`,
                    ` Q1:  ${s.q1} km`,
                    ` Median: ${s.med} km`,
                    ` Q3:  ${s.q3} km`,
                    ` Max: ${s.max} km`
                  ];
                }
              },
              backgroundColor: 'rgba(255,252,248,0.95)',
              titleColor: 'hsl(20,24%,12%)',
              bodyColor:  'hsl(20,12%,35%)',
              borderColor: 'rgba(234,88,12,0.3)',
              borderWidth: 1,
              cornerRadius: 8,
              padding: 12,
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { size: 12, weight: '600' } }
            },
            y: {
              grid: { color: 'rgba(234,88,12,0.06)' },
              ticks: { callback: v => v + ' km' },
              title: { display: true, text: 'Starting Distance to 5 km Boundary (km)', color: ORANGE, font: { size: 11 } }
            }
          }
        }
      });
    }
  }

  // ==========================================
  // 2. Intersection Observer (Scroll Reveal)
  // ==========================================
  document.addEventListener('DOMContentLoaded', () => {
    // Only target elements that are present on the current page
    const revealElements = document.querySelectorAll(
      '.reveal, .metric-box, .sdg-badge, .scorecard-item, .roadmap-node, .insight-card, .feature-card, .dataset-stat-card'
    );
    
    if (revealElements.length > 0) {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      }, {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
      });
      
      revealElements.forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
      });
    }
  });

  // ==========================================
  // 3. Interactive Fire Ember Particle Background
  // ==========================================
  const canvas = document.getElementById('cyber-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null, radius: 120 };
    
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    class Ember {
      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
      }
      
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 20;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = -(Math.random() * 0.9 + 0.3); // Rise upwards
        this.radius = Math.random() * 2.5 + 0.6;
        this.alpha = Math.random() * 0.5 + 0.5;
        this.decay = Math.random() * 0.0025 + 0.0012;
        this.hue = Math.random() * 32 + 8; // Warm reds, hot oranges, fire gold
        this.swaySpeed = Math.random() * 0.015 + 0.004;
        this.swayOffset = Math.random() * Math.PI * 2;
      }
      
      update() {
        this.y += this.vy;
        this.swayOffset += this.swaySpeed;
        this.x += this.vx + Math.sin(this.swayOffset) * 0.3;
        this.alpha -= this.decay;
        
        if (this.alpha <= 0 || this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
          this.reset();
        }
        
        if (mouse.x && mouse.y) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= (dx / dist) * force * 0.8;
            this.y -= (dy / dist) * force * 0.8;
          }
        }
      }
      
      draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.shadowBlur = this.radius * 3;
        ctx.shadowColor = `hsla(${this.hue}, 95%, 45%, ${this.alpha})`;
        ctx.fillStyle = `hsla(${this.hue}, 100%, 48%, ${this.alpha})`;
        ctx.fill();
        ctx.restore();
      }
    }

    // Spawn particle density
    for (let i = 0; i < 70; i++) {
      particles.push(new Ember());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      let bgGrad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height * 1.1, 0,
        canvas.width / 2, canvas.height * 0.4, canvas.height * 1.1
      );
      bgGrad.addColorStop(0,   'hsl(24, 55%, 90%)');
      bgGrad.addColorStop(0.4, 'hsl(30, 40%, 94%)');
      bgGrad.addColorStop(1,   'hsl(38, 20%, 98%)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(animate);
    }
    animate();
  }

  // ==========================================
  // 4. Interactive Wildfire Risk Simulator
  // ==========================================
  const proximitySlider = document.getElementById('sim-proximity');
  const speedSlider     = document.getElementById('sim-speed');
  const alignmentSlider = document.getElementById('sim-alignment');
  
  if (proximitySlider && speedSlider && alignmentSlider) {
    const proximityVal = document.getElementById('val-proximity');
    const speedVal     = document.getElementById('val-speed');
    const alignmentVal = document.getElementById('val-alignment');
    
    const gaugeFill   = document.getElementById('sim-gauge-fill');
    const gaugeNeedle = document.getElementById('sim-gauge-needle');
    const riskLabel   = document.getElementById('sim-risk-level');
    const etaValue    = document.getElementById('sim-eta');
    
    function updateSimulator() {
      const dist = parseFloat(proximitySlider.value);
      const speed = parseFloat(speedSlider.value);
      const align = parseFloat(alignmentSlider.value);
      
      // Update displayed numerical values
      proximityVal.textContent = dist >= 1000 ? (dist / 1000).toFixed(1) + ' km' : dist.toFixed(0) + ' m';
      speedVal.textContent = speed.toFixed(0) + ' m/h';
      alignmentVal.textContent = align.toFixed(2);
      
      // Calculate Threat Index
      // ETA in hours to breach the 5 km (5000m) buffer zone
      // Speed along track = speed * alignment
      const activeSpeed = Math.max(speed * align, 0.1); 
      let eta = 72;
      
      if (dist <= 5000) {
        eta = 0;
      } else {
        eta = (dist - 5000) / activeSpeed;
      }
      
      // Caps ETA at 72 hours
      eta = Math.min(Math.max(eta, 0), 72);
      
      // Determine Risk Percent (0 to 100)
      // Risk is higher if distance is smaller, alignment is high, speed is high
      // If distance <= 5000, risk is 100% (since buffer is already breached).
      let riskPercent = 0;
      if (dist <= 5000) {
        riskPercent = 100;
      } else {
        // Calculate based on ETA
        riskPercent = Math.max(0, 100 - (eta / 72) * 100);
      }
      
      // Risk level text & colors
      let riskLevel = 'LOW';
      let accentColor = 'hsl(120, 50%, 42%)'; // green
      
      if (riskPercent > 75 || dist <= 5000) {
        riskLevel = 'CRITICAL ALERT';
        accentColor = 'hsl(0, 85%, 45%)'; // red
      } else if (riskPercent > 40) {
        riskLevel = 'ELEVATED RISK';
        accentColor = 'hsl(20, 95%, 45%)'; // orange
      } else if (riskPercent > 10) {
        riskLevel = 'MODERATE';
        accentColor = 'hsl(42, 100%, 48%)'; // amber
      }
      
      // Update UI displays
      riskLabel.textContent = riskLevel;
      riskLabel.style.color = accentColor;
      
      etaValue.textContent = dist <= 5000 
        ? 'IMMEDIATE EVACUATION' 
        : `EST. BREACH ETA: ${eta.toFixed(1)} hours`;
      
      // Rotate needle: -90deg is 0%, 90deg is 100%
      const angle = -90 + (riskPercent / 100) * 180;
      gaugeNeedle.style.transform = `translateX(-50%) rotate(${angle}deg)`;
      
      // Gauge fill rotation: -135deg (0%) to 45deg (100%)
      const fillAngle = -135 + (riskPercent / 100) * 180;
      gaugeFill.style.transform = `rotate(${fillAngle}deg)`;
      gaugeFill.style.borderColor = `${accentColor} ${accentColor} transparent transparent`;
    }
    
    proximitySlider.addEventListener('input', updateSimulator);
    speedSlider.addEventListener('input', updateSimulator);
    alignmentSlider.addEventListener('input', updateSimulator);
    
    // Run once on load
    updateSimulator();
  }

  // ==========================================
  // 5. Interactive Kaplan-Meier Curve Filters
  // ==========================================
  const survButtons = document.querySelectorAll('.surv-filter-btn');
  const kmSvg = document.getElementById('surv-km-svg');
  if (survButtons.length > 0 && kmSvg) {
    const paths = kmSvg.querySelectorAll('path[stroke]');
    const fills = kmSvg.querySelectorAll('path[fill^="url(#kmGrad"]');
    
    survButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Toggle active button
        survButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.getAttribute('data-filter');
        
        // Highlight/dim curves
        paths.forEach(p => {
          const stroke = p.getAttribute('stroke');
          let curveType = 'other';
          if (stroke.includes('hsl(20,90%') || stroke.includes('hsl(20,90,42)')) curveType = 'high';
          if (stroke.includes('hsl(200,70%') || stroke.includes('hsl(200,70,48)')) curveType = 'mid';
          if (stroke.includes('hsl(120,50%') || stroke.includes('hsl(120,50,42)')) curveType = 'low';
          
          if (filter === 'all' || curveType === filter) {
            p.style.opacity = '1';
            p.style.strokeWidth = filter === 'all' ? '2' : '3.5';
          } else {
            p.style.opacity = '0.08';
          }
        });

        // Highlight/dim fills
        fills.forEach(f => {
          const fillUrl = f.getAttribute('fill');
          let fillType = 'other';
          if (fillUrl.includes('kmGrad1')) fillType = 'high';
          if (fillUrl.includes('kmGrad2')) fillType = 'mid';
          if (fillUrl.includes('kmGrad3')) fillType = 'low';

          if (filter === 'all' || fillType === filter) {
            f.style.opacity = '1';
          } else {
            f.style.opacity = '0.0';
          }
        });
      });
    });
  }

  // ==========================================
  // 6. Interactive Model Selection Tabs (Chapter 5)
  // ==========================================
  const modelTabButtons = document.querySelectorAll('.model-tab-btn');
  if (modelTabButtons.length > 0) {
    modelTabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        modelTabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const targetModel = btn.getAttribute('data-model'); // e.g. aft, cox, rsf, wbl
        
        // Highlight model nodes in the pipeline diagram
        const modelNodes = document.querySelectorAll('.pipe-model');
        modelNodes.forEach(node => {
          const badge = node.querySelector('.pipe-model-badge');
          if (badge && badge.textContent.toLowerCase() === targetModel) {
            node.style.borderColor = 'var(--accent-cyan)';
            node.style.boxShadow = '0 10px 30px rgba(234, 88, 12, 0.2), 0 0 0 1px rgba(234, 88, 12, 0.15)';
            node.style.transform = 'translateY(-5px) scale(1.05)';
          } else {
            node.style.borderColor = 'rgba(234, 88, 12, 0.1)';
            node.style.boxShadow = 'none';
            node.style.transform = 'none';
          }
        });
      });
    });
  }
})();
