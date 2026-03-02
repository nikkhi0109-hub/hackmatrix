/* ============================================
   BREATHE 🌿 — App Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initNav();
    initScrollAnimations();
    initBreathing();
    initMoodCheckIn();
    initChat();
    initGrounding();
    initSwipeAway();
    initRhythmTapping();
    initAmbientSounds();
});

/* ============================================
   PARTICLES BACKGROUND
   ============================================ */
function initParticles() {
    const container = document.getElementById('particles');
    const count = 30;
    const colors = [
        'rgba(45, 212, 191, 0.3)',
        'rgba(167, 139, 250, 0.3)',
        'rgba(253, 164, 175, 0.2)',
        'rgba(252, 211, 77, 0.2)',
    ];

    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        const size = Math.random() * 4 + 2;
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        p.style.left = Math.random() * 100 + '%';
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.animationDuration = (Math.random() * 20 + 15) + 's';
        p.style.animationDelay = (Math.random() * 20) + 's';
        container.appendChild(p);
    }
}

/* ============================================
   NAVIGATION
   ============================================ */
function initNav() {
    const nav = document.getElementById('nav');
    const toggle = document.getElementById('navToggle');
    const mobileNav = document.getElementById('mobileNav');
    const allLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

    // Scroll effect
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 50);
        updateActiveNav();
    });

    // Mobile toggle
    toggle.addEventListener('click', () => {
        mobileNav.classList.toggle('open');
        toggle.classList.toggle('active');
    });

    // Close mobile nav on link click
    allLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('open');
            toggle.classList.remove('active');
        });
    });

    function updateActiveNav() {
        const sections = document.querySelectorAll('.section');
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 120;
            if (window.scrollY >= top) {
                current = section.getAttribute('id');
            }
        });
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
    }
}

/* ============================================
   SCROLL ANIMATIONS (Intersection Observer)
   ============================================ */
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

/* ============================================
   BREATHING EXERCISE
   ============================================ */
function initBreathing() {
    const ring = document.getElementById('breathRing');
    const text = document.getElementById('breathText');
    const timer = document.getElementById('breathTimer');
    const toggleBtn = document.getElementById('breathToggle');
    const cycleCount = document.getElementById('breathCycleCount');
    const holdHint = document.getElementById('breathHoldHint');
    const modeGuidedBtn = document.getElementById('breathModeGuided');
    const modeHoldBtn = document.getElementById('breathModeHold');

    const phases = [
        { label: 'Breathe in', duration: 4000, color: 'var(--teal-400)' },
        { label: 'Hold', duration: 4000, color: 'var(--lavender-400)' },
        { label: 'Breathe out', duration: 6000, color: 'var(--rose-300)' },
        { label: 'Rest', duration: 2000, color: 'var(--text-muted)' },
    ];

    let currentPhase = 0;
    let cycles = 0;
    let isPaused = false;
    let phaseTimeout = null;
    let timerInterval = null;
    let currentMode = 'guided'; // 'guided' or 'hold'

    // Hold mode state
    let holdStartTime = 0;
    let holdCycles = 0;
    let isHolding = false;
    let holdExhaleTimeout = null;

    ring.style.animation = 'none';

    // ---- GUIDED MODE ----
    function animateRing() {
        const phase = phases[currentPhase];
        text.textContent = phase.label;
        text.style.color = phase.color;

        let remaining = phase.duration / 1000;
        timer.textContent = remaining;
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            remaining--;
            if (remaining > 0) timer.textContent = remaining;
        }, 1000);

        if (phase.label === 'Breathe in') {
            ring.style.transition = `transform ${phase.duration}ms ease-in-out`;
            ring.style.transform = 'scale(1.15)';
        } else if (phase.label === 'Breathe out') {
            ring.style.transition = `transform ${phase.duration}ms ease-in-out`;
            ring.style.transform = 'scale(0.85)';
        }

        phaseTimeout = setTimeout(() => {
            currentPhase = (currentPhase + 1) % phases.length;
            if (currentPhase === 0) {
                cycles++;
                cycleCount.textContent = cycles;
            }
            if (!isPaused && currentMode === 'guided') animateRing();
        }, phase.duration);
    }

    function stopGuided() {
        clearTimeout(phaseTimeout);
        clearInterval(timerInterval);
    }

    // ---- HOLD MODE ----
    function startHoldMode() {
        text.textContent = 'Press & hold';
        text.style.color = 'var(--text-muted)';
        timer.textContent = '—';
        ring.style.transition = 'transform 0.3s ease';
        ring.style.transform = 'scale(0.85)';
    }

    function onHoldStart(e) {
        if (currentMode !== 'hold') return;
        e.preventDefault();
        isHolding = true;
        holdStartTime = Date.now();
        clearTimeout(holdExhaleTimeout);

        // Inhale
        text.textContent = 'Breathe in…';
        text.style.color = 'var(--teal-400)';
        ring.style.transition = 'transform 3s ease-out';
        ring.style.transform = 'scale(1.2)';
        ring.classList.add('hold-active');

        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate(30);

        // Animate timer
        let elapsed = 0;
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            elapsed++;
            timer.textContent = elapsed;
        }, 1000);
    }

    function onHoldEnd(e) {
        if (currentMode !== 'hold' || !isHolding) return;
        e.preventDefault();
        isHolding = false;
        clearInterval(timerInterval);
        ring.classList.remove('hold-active');

        const holdDuration = Date.now() - holdStartTime;

        // Exhale
        text.textContent = 'Breathe out…';
        text.style.color = 'var(--rose-300)';
        const exhaleDuration = Math.min(holdDuration * 1.5, 8000);
        ring.style.transition = `transform ${exhaleDuration}ms ease-in-out`;
        ring.style.transform = 'scale(0.85)';

        let exhaleRemaining = Math.ceil(exhaleDuration / 1000);
        timer.textContent = exhaleRemaining;
        timerInterval = setInterval(() => {
            exhaleRemaining--;
            if (exhaleRemaining > 0) timer.textContent = exhaleRemaining;
        }, 1000);

        if (navigator.vibrate) navigator.vibrate(15);

        holdExhaleTimeout = setTimeout(() => {
            clearInterval(timerInterval);
            holdCycles++;
            cycles++;
            cycleCount.textContent = cycles;
            text.textContent = 'Press & hold';
            text.style.color = 'var(--text-muted)';
            timer.textContent = '—';

            if (holdCycles === 3) {
                text.textContent = 'You\'re doing great 💛';
                text.style.color = 'var(--amber-300)';
                setTimeout(() => {
                    if (currentMode === 'hold' && !isHolding) {
                        text.textContent = 'Press & hold';
                        text.style.color = 'var(--text-muted)';
                    }
                }, 2000);
            }
        }, exhaleDuration);
    }

    // Pointer events for hold mode
    ring.addEventListener('pointerdown', onHoldStart);
    ring.addEventListener('pointerup', onHoldEnd);
    ring.addEventListener('pointerleave', onHoldEnd);
    ring.addEventListener('pointercancel', onHoldEnd);

    // ---- MODE SWITCHING ----
    function switchMode(mode) {
        currentMode = mode;
        stopGuided();
        clearTimeout(holdExhaleTimeout);
        clearInterval(timerInterval);
        ring.classList.remove('hold-active');
        isHolding = false;
        isPaused = false;

        modeGuidedBtn.classList.toggle('active', mode === 'guided');
        modeHoldBtn.classList.toggle('active', mode === 'hold');

        if (mode === 'guided') {
            toggleBtn.style.display = '';
            holdHint.style.display = 'none';
            ring.style.cursor = 'default';
            ring.style.touchAction = 'auto';
            toggleBtn.innerHTML = `<span id="breathToggleIcon">⏸</span> Pause`;
            animateRing();
        } else {
            toggleBtn.style.display = 'none';
            holdHint.style.display = '';
            ring.style.cursor = 'pointer';
            ring.style.touchAction = 'none';
            holdCycles = 0;
            startHoldMode();
        }
    }

    modeGuidedBtn.addEventListener('click', () => switchMode('guided'));
    modeHoldBtn.addEventListener('click', () => switchMode('hold'));

    // Pause/resume (guided mode only)
    toggleBtn.addEventListener('click', () => {
        if (currentMode !== 'guided') return;
        isPaused = !isPaused;
        if (isPaused) {
            stopGuided();
            toggleBtn.innerHTML = `<span id="breathToggleIcon">▶</span> Resume`;
            ring.classList.add('paused');
        } else {
            ring.classList.remove('paused');
            toggleBtn.innerHTML = `<span id="breathToggleIcon">⏸</span> Pause`;
            animateRing();
        }
    });

    // Start in guided mode
    animateRing();
}

/* ============================================
   MOOD CHECK-IN
   ============================================ */
function initMoodCheckIn() {
    const buttons = document.querySelectorAll('.mood-btn');
    const response = document.getElementById('moodResponse');
    const affirmation = document.getElementById('moodAffirmation');
    const historyDots = document.getElementById('moodHistoryDots');

    const affirmations = {
        great: [
            "That's wonderful. Hold onto this feeling — you earned it. 💛",
            "You're glowing today. What a gift to feel this way. ✨",
            "Joy looks good on you. Soak it in. 🌻"
        ],
        okay: [
            "Okay is perfectly fine. Not every day needs to be extraordinary. 🌤️",
            "Steady is a kind of strength most people overlook. You're doing well. 💙",
            "An 'okay' day is still a day you showed up. That matters. 🌿"
        ],
        meh: [
            "Meh days happen. They don't define you — they're just passing through. 🍃",
            "Sometimes the best thing to do on a 'meh' day is just… be. No pressure. 🌙",
            "Even the sky is grey sometimes. It doesn't mean the sun is gone. ☁️"
        ],
        low: [
            "I'm sorry you're feeling low. You don't have to fix anything right now. Just being here is enough. 💜",
            "Low moments pass. You've weathered them before, and you will again. You're not alone in this. 🌧️",
            "It's okay to not be okay. Take it one breath at a time. 🤍"
        ],
        rough: [
            "That sounds really hard. I'm glad you checked in — that takes courage. You matter. 💙",
            "Rough days are heavy, but they don't last forever. Be gentle with yourself right now. 🕊️",
            "You don't have to carry this alone. Even just acknowledging how you feel is a brave step. 🫂"
        ]
    };

    const emojiMap = {
        great: '😊', okay: '🙂', meh: '😐', low: '😔', rough: '😢'
    };

    let history = JSON.parse(localStorage.getItem('breathe-mood-history') || '[]');
    renderHistory();

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const mood = btn.dataset.mood;

            // Visual selection
            buttons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');

            // Show affirmation
            const msgs = affirmations[mood];
            affirmation.textContent = msgs[Math.floor(Math.random() * msgs.length)];
            response.classList.add('show');

            // Save to history
            history.push({ mood, time: Date.now() });
            if (history.length > 14) history = history.slice(-14);
            localStorage.setItem('breathe-mood-history', JSON.stringify(history));
            renderHistory();
        });
    });

    function renderHistory() {
        historyDots.innerHTML = '';
        const recent = history.slice(-7);
        recent.forEach(entry => {
            const dot = document.createElement('div');
            dot.classList.add('mood-dot');
            dot.textContent = emojiMap[entry.mood] || '•';
            dot.title = entry.mood;
            historyDots.appendChild(dot);
        });
    }
}

/* ============================================
   CONVERSATIONAL COMPANION
   ============================================ */
function initChat() {
    const form = document.getElementById('chatForm');
    const input = document.getElementById('chatInput');
    const messages = document.getElementById('chatMessages');
    const suggestions = document.getElementById('chatSuggestions');

    const responses = {
        overwhelmed: [
            "That's a lot to carry. Let's slow things down. You don't have to solve everything right now — just this moment.",
            "When everything feels like too much, sometimes the bravest thing is to stop and breathe. Want to try the breathing exercise above?",
            "Overwhelm is your mind trying to do everything at once. You only need to do one thing: be here, right now. The rest can wait."
        ],
        overthinking: [
            "Your mind is working overtime, huh? That loop of thoughts can feel exhausting. You're not broken — you're just thinking too loudly.",
            "What if the answer isn't in your head right now? Sometimes the wisest thing is to step away from the puzzle and let your subconscious work on it.",
            "Overthinking is like holding a flashlight in a bright room — it doesn't help. Try grounding yourself with the 5-4-3-2-1 exercise below."
        ],
        moment: [
            "Then let's have one. Right here. Take a breath. Feel your feet on the ground. Notice what you hear. You're here. That's enough. 🌿",
            "Absolutely. No talking needed. Just sit with me for a moment. Sometimes silence is the best conversation.",
            "Here's your moment. No expectations. No tasks. Just you, breathing, existing. That's plenty."
        ],
        positive: [
            "That's beautiful! I love hearing that. What made it special? (No pressure to answer — sometimes joy just… is.)",
            "Hold onto that warmth. Remember it on harder days. You deserve good things happening to you. ✨",
            "That makes me happy to hear. You're allowed to celebrate the small wins — they add up more than you think."
        ],
        default: [
            "Thank you for sharing that with me. I hear you. Sometimes just saying things out loud — even to a screen — helps lighten the weight a little.",
            "I appreciate you opening up. There's no right or wrong thing to say here. Whatever you're feeling is valid.",
            "That sounds like it matters to you. Want to sit with it for a moment, or would you like to try one of the exercises here?",
            "I'm here. No judgment, no advice unless you want it. Just someone (well, something) that's listening. 💙",
            "You know, the fact that you're here, taking a moment for yourself — that's already a really good sign. Be proud of that."
        ]
    };

    function getCategory(text) {
        const lower = text.toLowerCase();
        if (/overwhelm|too much|can't cope|stressed|stress|anxious|anxiety|panic/.test(lower)) return 'overwhelmed';
        if (/overthink|can't stop thinking|racing thoughts|mind won't stop|ruminating|loop/.test(lower)) return 'overthinking';
        if (/need a moment|break|pause|rest|breathe|calm down|quiet/.test(lower)) return 'moment';
        if (/good|great|happy|wonderful|amazing|positive|excited|love|grateful|gratitude/.test(lower)) return 'positive';
        return 'default';
    }

    function addMessage(content, type) {
        const div = document.createElement('div');
        div.classList.add('chat-message', type);
        const avatar = type === 'companion' ? '🌿' : '🫧';
        div.innerHTML = `
            <div class="chat-avatar">${avatar}</div>
            <div class="chat-bubble"><p>${content}</p></div>
        `;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    function addTypingIndicator() {
        const div = document.createElement('div');
        div.classList.add('chat-message', 'companion');
        div.id = 'typingIndicator';
        div.innerHTML = `
            <div class="chat-avatar">🌿</div>
            <div class="chat-bubble">
                <div class="typing-indicator"><span></span><span></span><span></span></div>
            </div>
        `;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    function removeTypingIndicator() {
        const el = document.getElementById('typingIndicator');
        if (el) el.remove();
    }

    function handleUserMessage(text) {
        if (!text.trim()) return;
        addMessage(text, 'user');
        input.value = '';

        // Hide suggestions after first message
        suggestions.style.display = 'none';

        // Show typing indicator then respond
        addTypingIndicator();
        const delay = 1200 + Math.random() * 1000;
        setTimeout(() => {
            removeTypingIndicator();
            const category = getCategory(text);
            const pool = responses[category];
            const reply = pool[Math.floor(Math.random() * pool.length)];
            addMessage(reply, 'companion');
        }, delay);
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleUserMessage(input.value);
    });

    // Suggestion chips
    suggestions.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            handleUserMessage(chip.dataset.suggestion);
        });
    });
}

/* ============================================
   5-4-3-2-1 GROUNDING EXERCISE
   ============================================ */
function initGrounding() {
    const steps = [
        { num: 5, icon: '👁️', sense: 'see', instruction: 'Name <strong>5 things</strong> you can see.', hint: 'Look around you slowly. A shadow on the wall, the color of your phone, the light in the room...' },
        { num: 4, icon: '🤚', sense: 'touch', instruction: 'Name <strong>4 things</strong> you can touch.', hint: 'The texture of your clothes, the surface of your desk, the warmth of your own skin...' },
        { num: 3, icon: '👂', sense: 'hear', instruction: 'Name <strong>3 things</strong> you can hear.', hint: 'A fan humming, distant traffic, your own breathing, the sound of quiet...' },
        { num: 2, icon: '👃', sense: 'smell', instruction: 'Name <strong>2 things</strong> you can smell.', hint: 'Coffee, fresh air, your shampoo, the faint scent of the room...' },
        { num: 1, icon: '👅', sense: 'taste', instruction: 'Name <strong>1 thing</strong> you can taste.', hint: 'Toothpaste, tea, the clean taste of water, or even just the taste of this moment...' },
    ];

    let currentStep = 0;

    const progressEls = document.querySelectorAll('.ground-step');
    const icon = document.getElementById('groundIcon');
    const instruction = document.getElementById('groundInstruction');
    const hint = document.getElementById('groundHint');
    const content = document.getElementById('groundContent');
    const nextBtn = document.getElementById('groundNext');
    const restartBtn = document.getElementById('groundRestart');
    const complete = document.getElementById('groundComplete');
    const actions = document.querySelector('.ground-actions');

    function renderStep() {
        const step = steps[currentStep];
        icon.textContent = step.icon;
        instruction.innerHTML = step.instruction;
        hint.textContent = step.hint;

        progressEls.forEach((el, i) => {
            el.classList.remove('active', 'done');
            if (i < currentStep) el.classList.add('done');
            if (i === currentStep) el.classList.add('active');
        });
    }

    nextBtn.addEventListener('click', () => {
        currentStep++;
        if (currentStep >= steps.length) {
            // Complete
            content.style.display = 'none';
            actions.style.display = 'none';
            complete.style.display = 'block';
            restartBtn.style.display = 'inline-flex';
            restartBtn.parentElement.style.display = 'flex';
            progressEls.forEach(el => {
                el.classList.remove('active');
                el.classList.add('done');
            });
        } else {
            renderStep();
        }
    });

    restartBtn.addEventListener('click', () => {
        currentStep = 0;
        content.style.display = 'block';
        complete.style.display = 'none';
        nextBtn.style.display = 'inline-flex';
        actions.style.display = 'flex';
        restartBtn.style.display = 'none';
        renderStep();
    });

    // Init
    renderStep();
}

/* ============================================
   AMBIENT SOUNDS (Web Audio API — Procedural)
   ============================================ */
/* ============================================
   SWIPE AWAY INTRUSIVE THOUGHTS
   ============================================ */
function initSwipeAway() {
    const card = document.getElementById('letgoCard');
    const quote = document.getElementById('letgoQuote');
    const countEl = document.getElementById('letgoCount');
    const messageEl = document.getElementById('letgoMessage');
    const particlesContainer = document.getElementById('letgoParticles');

    const thoughts = [
        "I'm not good enough.",
        "Everyone is judging me.",
        "I'll never be able to fix this.",
        "What if something terrible happens?",
        "I should have done better.",
        "Nobody really cares about me.",
        "I'm falling behind everyone else.",
        "I don't deserve to be happy.",
        "It's all my fault.",
        "Things will never get better.",
        "I can't handle this.",
        "I'm a burden to everyone.",
        "Something bad is about to happen.",
        "I'm running out of time.",
        "What's the point of trying?"
    ];

    const milestoneMessages = {
        3: "You're doing it. Each swipe is a release. 🌿",
        5: "Five thoughts released. Lighter already? 🍃",
        8: "Your mind is clearing. Keep going. ✨",
        10: "Ten. That's real strength. Be proud. 💛",
        15: "You've let go of so much. You are not your thoughts. 🌟"
    };

    let count = 0;
    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    let usedThoughts = [];

    function getRandomThought() {
        if (usedThoughts.length >= thoughts.length) usedThoughts = [];
        const available = thoughts.filter(t => !usedThoughts.includes(t));
        const thought = available[Math.floor(Math.random() * available.length)];
        usedThoughts.push(thought);
        return thought;
    }

    function spawnParticles(x, y) {
        const colors = ['var(--teal-400)', 'var(--lavender-400)', 'var(--rose-300)', 'var(--amber-300)'];
        for (let i = 0; i < 12; i++) {
            const p = document.createElement('div');
            p.classList.add('letgo-particle');
            p.style.left = x + 'px';
            p.style.top = y + 'px';
            p.style.background = colors[Math.floor(Math.random() * colors.length)];
            const angle = (Math.PI * 2 / 12) * i + (Math.random() - 0.5);
            const dist = 60 + Math.random() * 80;
            p.style.setProperty('--px', Math.cos(angle) * dist + 'px');
            p.style.setProperty('--py', Math.sin(angle) * dist + 'px');
            particlesContainer.appendChild(p);
            setTimeout(() => p.remove(), 800);
        }
    }

    function dismissCard(direction) {
        isDragging = false;
        const flyX = direction * 600;
        card.classList.add('dismissed');
        card.style.transform = `translateX(${flyX}px) rotate(${direction * 30}deg)`;

        // Particle burst from center of arena
        const rect = card.parentElement.getBoundingClientRect();
        spawnParticles(rect.width / 2, rect.height / 2);

        if (navigator.vibrate) navigator.vibrate(40);

        count++;
        countEl.textContent = count;

        // Milestone message
        if (milestoneMessages[count]) {
            messageEl.textContent = milestoneMessages[count];
            messageEl.style.opacity = '1';
        }

        // Bring in new card
        setTimeout(() => {
            card.classList.remove('dismissed');
            card.style.transform = '';
            quote.textContent = getRandomThought();
            card.classList.add('entering');
            setTimeout(() => card.classList.remove('entering'), 500);
        }, 500);
    }

    // Pointer events for dragging
    card.addEventListener('pointerdown', (e) => {
        isDragging = true;
        startX = e.clientX;
        currentX = 0;
        card.classList.add('dragging');
        card.setPointerCapture(e.pointerId);
    });

    card.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        currentX = e.clientX - startX;
        const rotation = currentX * 0.08;
        const opacity = 1 - Math.abs(currentX) / 400;
        card.style.transform = `translateX(${currentX}px) rotate(${rotation}deg)`;
        card.style.opacity = Math.max(0.3, opacity);
    });

    card.addEventListener('pointerup', (e) => {
        if (!isDragging) return;
        card.classList.remove('dragging');
        card.style.opacity = '';

        if (Math.abs(currentX) > 130) {
            // Dismiss
            dismissCard(currentX > 0 ? 1 : -1);
        } else {
            // Snap back
            card.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
            card.style.transform = 'translateX(0) rotate(0deg)';
            setTimeout(() => { card.style.transition = ''; }, 400);
            isDragging = false;
        }
    });

    card.addEventListener('pointercancel', () => {
        isDragging = false;
        card.classList.remove('dragging');
        card.style.transform = '';
        card.style.opacity = '';
    });

    // Set initial thought
    quote.textContent = getRandomThought();
}

/* ============================================
   RHYTHM TAPPING EXERCISE
   ============================================ */
function initRhythmTapping() {
    const tapTarget = document.getElementById('rhythmTapTarget');
    const tapText = document.getElementById('rhythmTapText');
    const ripples = document.getElementById('rhythmRipples');
    const cueRing = document.getElementById('rhythmCueRing');
    const phaseLabel = document.getElementById('rhythmPhaseLabel');
    const progressFill = document.getElementById('rhythmProgressFill');
    const progressText = document.getElementById('rhythmProgressText');
    const feedbackEl = document.getElementById('rhythmFeedback');
    const completeEl = document.getElementById('rhythmComplete');
    const restartBtn = document.getElementById('rhythmRestart');
    const visualizer = document.getElementById('rhythmVisualizer');
    const infoEl = document.querySelector('.rhythm-info');
    const outerRing = document.querySelector('.rhythm-ring-outer');
    const middleRing = document.querySelector('.rhythm-ring-middle');

    // Rhythm patterns: each phase has a name, BPM, and number of beats
    const phases = [
        { name: 'Grounding', bpm: 80, beats: 8, message: 'Match the heartbeat rhythm' },
        { name: 'Calming', bpm: 60, beats: 8, message: 'Slower now… feel it settle' },
        { name: 'Meditative', bpm: 45, beats: 8, message: 'Deep and steady… you\'re safe' }
    ];

    let isRunning = false;
    let currentPhaseIdx = 0;
    let currentBeat = 0;
    let beatTimeout = null;
    let cueTime = 0;
    let totalBeats = phases.reduce((sum, p) => sum + p.beats, 0);
    let completedBeats = 0;

    function getBeatInterval(bpm) {
        return (60 / bpm) * 1000;
    }

    function createRipple() {
        const ripple = document.createElement('div');
        ripple.classList.add('rhythm-ripple');
        ripples.appendChild(ripple);
        setTimeout(() => ripple.remove(), 800);
    }

    function showFeedback(text, type) {
        feedbackEl.textContent = text;
        feedbackEl.className = 'rhythm-feedback ' + type;
        setTimeout(() => { feedbackEl.textContent = ''; }, 1200);
    }

    function showCue() {
        tapTarget.classList.add('cue');
        cueRing.classList.add('pulse');
        cueTime = Date.now();

        setTimeout(() => {
            tapTarget.classList.remove('cue');
        }, 400);
        setTimeout(() => {
            cueRing.classList.remove('pulse');
        }, 600);
    }

    function runBeat() {
        if (!isRunning) return;

        const phase = phases[currentPhaseIdx];
        const interval = getBeatInterval(phase.bpm);

        showCue();
        tapText.textContent = 'Tap!';

        beatTimeout = setTimeout(() => {
            // If user didn't tap, count as missed beat
            currentBeat++;
            completedBeats++;
            updateProgress();

            if (currentBeat >= phase.beats) {
                // Move to next phase
                currentBeat = 0;
                currentPhaseIdx++;

                if (currentPhaseIdx >= phases.length) {
                    finishExercise();
                    return;
                }

                const nextPhase = phases[currentPhaseIdx];
                phaseLabel.textContent = nextPhase.name;
                progressText.textContent = nextPhase.message;
                tapText.textContent = 'Ready…';

                // Small pause between phases
                setTimeout(() => {
                    if (isRunning) runBeat();
                }, 1500);
                return;
            }

            tapText.textContent = '•';
            if (isRunning) runBeat();
        }, interval);
    }

    function handleTap() {
        if (!isRunning) {
            startExercise();
            return;
        }

        createRipple();
        if (navigator.vibrate) navigator.vibrate(20);

        // Check timing accuracy
        const timeSinceCue = Date.now() - cueTime;
        const phase = phases[currentPhaseIdx];
        const interval = getBeatInterval(phase.bpm);
        const tolerance = interval * 0.35;

        if (timeSinceCue < tolerance) {
            showFeedback('Perfect! ✨', 'great');
        } else if (timeSinceCue < tolerance * 2) {
            showFeedback('Good 🌿', 'good');
        } else {
            showFeedback('Keep going…', 'miss');
        }
    }

    function updateProgress() {
        const pct = (completedBeats / totalBeats) * 100;
        progressFill.style.width = pct + '%';
    }

    function startExercise() {
        isRunning = true;
        currentPhaseIdx = 0;
        currentBeat = 0;
        completedBeats = 0;

        outerRing.classList.add('active');
        middleRing.classList.add('active');

        const firstPhase = phases[0];
        phaseLabel.textContent = firstPhase.name;
        progressText.textContent = firstPhase.message;
        progressFill.style.width = '0%';
        completeEl.style.display = 'none';
        visualizer.style.display = '';
        infoEl.style.display = '';

        tapText.textContent = 'Ready…';
        setTimeout(() => {
            if (isRunning) runBeat();
        }, 1000);
    }

    function finishExercise() {
        isRunning = false;
        clearTimeout(beatTimeout);
        outerRing.classList.remove('active');
        middleRing.classList.remove('active');

        visualizer.style.display = 'none';
        infoEl.style.display = 'none';
        completeEl.style.display = 'block';

        if (navigator.vibrate) navigator.vibrate([50, 100, 50]);
    }

    function resetExercise() {
        isRunning = false;
        currentPhaseIdx = 0;
        currentBeat = 0;
        completedBeats = 0;
        clearTimeout(beatTimeout);

        outerRing.classList.remove('active');
        middleRing.classList.remove('active');

        visualizer.style.display = '';
        infoEl.style.display = '';
        completeEl.style.display = 'none';
        phaseLabel.textContent = 'Ready';
        progressText.textContent = 'Tap the circle to begin';
        progressFill.style.width = '0%';
        tapText.textContent = 'Tap to Start';
        feedbackEl.textContent = '';
    }

    tapTarget.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        handleTap();
    });

    restartBtn.addEventListener('click', resetExercise);
}

function initAmbientSounds() {
    const soundCards = document.querySelectorAll('.sound-card');
    const volumeSlider = document.getElementById('volumeSlider');

    let audioCtx = null;
    const activeSounds = {};
    let masterGain = null;

    function getAudioCtx() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            masterGain = audioCtx.createGain();
            masterGain.gain.value = volumeSlider.value / 100;
            masterGain.connect(audioCtx.destination);
        }
        return audioCtx;
    }

    // Procedurally generated ambient sounds using Web Audio API
    function createRainSound(ctx) {
        const bufferSize = 2 * ctx.sampleRate;
        const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
            const data = buffer.getChannelData(ch);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * 0.15;
            }
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1200;
        filter.Q.value = 0.5;
        source.connect(filter);
        return { source, output: filter };
    }

    function createForestSound(ctx) {
        const bufferSize = 3 * ctx.sampleRate;
        const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
            const data = buffer.getChannelData(ch);
            for (let i = 0; i < bufferSize; i++) {
                const t = i / ctx.sampleRate;
                const bird = Math.sin(2 * Math.PI * (2000 + 500 * Math.sin(t * 3)) * t) * 0.02 * Math.max(0, Math.sin(t * 0.5));
                const wind = (Math.random() * 2 - 1) * 0.04;
                const rustle = (Math.random() * 2 - 1) * 0.03 * Math.max(0, Math.sin(t * 0.3));
                data[i] = bird + wind + rustle;
            }
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 3000;
        source.connect(filter);
        return { source, output: filter };
    }

    function createOceanSound(ctx) {
        const bufferSize = 4 * ctx.sampleRate;
        const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
            const data = buffer.getChannelData(ch);
            for (let i = 0; i < bufferSize; i++) {
                const t = i / ctx.sampleRate;
                const wave = Math.sin(t * 0.15 * Math.PI * 2) * 0.5 + 0.5;
                const noise = (Math.random() * 2 - 1) * 0.12 * wave;
                data[i] = noise;
            }
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        filter.Q.value = 0.3;
        source.connect(filter);
        return { source, output: filter };
    }

    function createNightSound(ctx) {
        const bufferSize = 2 * ctx.sampleRate;
        const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
            const data = buffer.getChannelData(ch);
            for (let i = 0; i < bufferSize; i++) {
                const t = i / ctx.sampleRate;
                const cricket = Math.sin(2 * Math.PI * 4500 * t) * 0.03 * (Math.sin(t * 12) > 0.5 ? 1 : 0);
                const bg = (Math.random() * 2 - 1) * 0.02;
                data[i] = cricket + bg;
            }
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        return { source, output: source };
    }

    function createFireSound(ctx) {
        const bufferSize = 3 * ctx.sampleRate;
        const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
            const data = buffer.getChannelData(ch);
            for (let i = 0; i < bufferSize; i++) {
                const t = i / ctx.sampleRate;
                const crackle = (Math.random() > 0.997) ? (Math.random() * 0.5) : 0;
                const base = (Math.random() * 2 - 1) * 0.06;
                data[i] = base + crackle;
            }
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1800;
        source.connect(filter);
        return { source, output: filter };
    }

    function createWindSound(ctx) {
        const bufferSize = 4 * ctx.sampleRate;
        const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
            const data = buffer.getChannelData(ch);
            for (let i = 0; i < bufferSize; i++) {
                const t = i / ctx.sampleRate;
                const swell = Math.sin(t * 0.1 * Math.PI * 2) * 0.4 + 0.6;
                data[i] = (Math.random() * 2 - 1) * 0.07 * swell;
            }
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 400;
        filter.Q.value = 0.3;
        source.connect(filter);
        return { source, output: filter };
    }

    const generators = {
        rain: createRainSound,
        forest: createForestSound,
        ocean: createOceanSound,
        night: createNightSound,
        fire: createFireSound,
        wind: createWindSound,
    };

    soundCards.forEach(card => {
        card.addEventListener('click', () => {
            const soundId = card.dataset.sound;
            const ctx = getAudioCtx();

            if (activeSounds[soundId]) {
                // Stop
                activeSounds[soundId].source.stop();
                delete activeSounds[soundId];
                card.classList.remove('playing');
                card.querySelector('.sound-status').textContent = 'Tap to play';
            } else {
                // Start
                const gen = generators[soundId];
                if (!gen) return;

                const { source, output } = gen(ctx);
                const gainNode = ctx.createGain();
                gainNode.gain.value = 0;
                output.connect(gainNode);
                gainNode.connect(masterGain);
                source.start();

                // Fade in
                gainNode.gain.linearRampToValueAtTime(1, ctx.currentTime + 1);

                activeSounds[soundId] = { source, gain: gainNode };
                card.classList.add('playing');
                card.querySelector('.sound-status').textContent = 'Playing';
            }
        });
    });

    volumeSlider.addEventListener('input', () => {
        if (masterGain) {
            masterGain.gain.value = volumeSlider.value / 100;
        }
    });
}
