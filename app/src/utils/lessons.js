// ===== LESSONS + HELPERS =====
// Extracted from original index.html - imperative DOM manipulation
// These functions reference globals: addPoints, completeChapter, gsap, STATE
// The React app must set window.addPoints, window.completeChapter before calling LESSONS

// ===== TOUCH-FRIENDLY DRAG AND DROP =====
let dragState = null;
let dragClone = null;

function initDrag(el) {
  el.addEventListener('pointerdown', startDrag);
}

function startDrag(e) {
  const el = e.currentTarget;
  if (el.classList.contains('placed')) return;
  e.preventDefault();
  dragState = {el, startX: e.clientX, startY: e.clientY, id: el.dataset.id, value: el.dataset.value};
  dragClone = el.cloneNode(true);
  dragClone.style.cssText = `position:fixed;z-index:99999;pointer-events:none;opacity:0.8;left:${e.clientX - 40}px;top:${e.clientY - 20}px;`;
  document.body.appendChild(dragClone);
  el.style.opacity = '0.4';
  document.addEventListener('pointermove', moveDrag);
  document.addEventListener('pointerup', endDrag);
}

function moveDrag(e) {
  if (!dragClone) return;
  dragClone.style.left = (e.clientX - 40) + 'px';
  dragClone.style.top = (e.clientY - 20) + 'px';
  // Highlight drop zones
  document.querySelectorAll('.drag-zone, .bucket, .sequence-slot, .flowchart-area, .cargo-bay, .rocket-slot').forEach(z => {
    const r = z.getBoundingClientRect();
    if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
      z.classList.add('over');
    } else {
      z.classList.remove('over');
    }
  });
}

function endDrag(e) {
  document.removeEventListener('pointermove', moveDrag);
  document.removeEventListener('pointerup', endDrag);
  if (dragClone) { dragClone.remove(); dragClone = null; }
  if (!dragState) return;
  dragState.el.style.opacity = '';
  // Find drop target
  const zones = document.querySelectorAll('.drag-zone, .bucket, .sequence-slot, .flowchart-area, .cargo-bay, .rocket-slot');
  zones.forEach(z => z.classList.remove('over'));
  zones.forEach(z => {
    const r = z.getBoundingClientRect();
    if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
      if (z.dataset.onDrop) {
        window[z.dataset.onDrop](dragState, z);
      }
    }
  });
  dragState = null;
}

// ===== CHAPTER CONTENT GENERATORS =====
function loadChapter(idx) {
  // In React, this is handled by CourseView's state
  // But some lesson content calls loadChapter(nextIdx) directly
  if (window._reactLoadChapter) {
    window._reactLoadChapter(idx);
  }
}

function renderSidebar() { /* React handles sidebar rendering */ }
function updateProgress() { /* React handles progress rendering */ }


// Show feedback message
function showFeedback(container, type, msg) {
  let fb = container.querySelector('.feedback');
  if (!fb) {
    fb = document.createElement('div');
    fb.className = 'feedback';
    container.appendChild(fb);
  }
  fb.className = `feedback show ${type}`;
  if (type === 'error') {
    const encouragements = [
      "You're doing amazing — every great thinker makes mistakes before getting it right! 💪",
      "Almost there! The best scientists try again and again. You're learning SO much! 🌈",
      "Hey, getting it wrong means your brain is growing! That's literally how learning works! 🧠✨",
      "Don't give up! Einstein failed hundreds of times before his breakthroughs! You've got this! 🚀",
      "You're braver than you believe! Every wrong answer gets you closer to the right one! ⭐",
      "Mistakes are just practice for being awesome! Try one more time! 🎯",
      "The fact that you're trying makes you a REAL explorer! Keep going! 🔭",
      "Wrong answers aren't failures — they're stepping stones! You're on the right path! 🌟",
      "Even robots need a few tries to get things right! You're smarter than a robot! 🤖💜",
      "Your curiosity is your superpower! Let's figure this out together! 💡"
    ];
    const enc = encouragements[Math.floor(Math.random() * encouragements.length)];
    fb.innerHTML = msg + '<div class="encouragement">' + enc + '</div>';
  } else {
    fb.textContent = msg;
    if (type === 'success') {
      fb.innerHTML = msg + ' <span style="font-size:1.2rem">🎉</span>';
    }
  }
  fb.scrollIntoView({behavior: 'smooth', block: 'center'});
}

// ===== ALL LESSONS =====
const LESSONS = {
  // ==========================================
  // AI ADVENTURES
  // ==========================================
  ai: [
    // Ch1: What is AI?
    function(area) {
      area.innerHTML = `
        <h2>🤔 What is AI?</h2>
        <p class="lesson-desc">AI stands for <strong>Artificial Intelligence</strong>. It's not magic — it's pattern matching! AI looks at lots of examples and learns to recognize patterns, just like you learned to recognize cats and dogs when you were little.</p>
        <div class="activity">
          <h3>🎯 Activity: AI or Not AI?</h3>
          <p class="instructions">Drag each item into the correct bucket. Does it use AI or not?</p>
          <div class="drag-zone" id="ai1-items"></div>
          <div class="buckets">
            <div class="bucket" style="border-color:var(--green)" data-on-drop="ai1Drop" data-bucket="yes">
              <h4>✅ Uses AI</h4>
              <div class="bucket-items" id="ai1-yes"></div>
            </div>
            <div class="bucket" style="border-color:var(--red)" data-on-drop="ai1Drop" data-bucket="no">
              <h4>❌ No AI</h4>
              <div class="bucket-items" id="ai1-no"></div>
            </div>
          </div>
          <div class="feedback" id="ai1-fb"></div>
          <button class="btn-check" id="ai1-check" onclick="ai1Check()">Check My Answers ✓</button>
        </div>
        <div class="activity">
          <h3>💡 Key Idea</h3>
          <p class="instructions">AI is a computer program that learns from examples. It finds patterns in data — like how Netflix notices you like action movies and suggests more. AI isn't thinking or feeling — it's matching patterns really, really fast!</p>
        </div>
      `;
      const items = [
        {name: '🔊 Alexa / Siri', ai: true}, {name: '📺 Netflix Suggestions', ai: true},
        {name: '🔍 Google Search', ai: true}, {name: '📷 Face Filters', ai: true},
        {name: '💡 Light Switch', ai: false}, {name: '🚲 Bicycle', ai: false},
        {name: '📖 Paper Book', ai: false}, {name: '🎮 Game NPCs', ai: true},
        {name: '⏰ Alarm Clock', ai: false}, {name: '🗺️ Google Maps', ai: true}
      ];
      const container = document.getElementById('ai1-items');
      items.sort(() => Math.random() - 0.5).forEach((item, i) => {
        const el = document.createElement('div');
        el.className = 'drag-item';
        el.textContent = item.name;
        el.dataset.id = i;
        el.dataset.value = item.ai ? 'yes' : 'no';
        container.appendChild(el);
        initDrag(el);
      });
      window.ai1Data = items;
      window.ai1Placed = {};
    },

    // Ch2: How AI Learns
    function(area) {
      area.innerHTML = `
        <h2>📚 How AI Learns</h2>
        <p class="lesson-desc">AI learns in steps, kind of like how you learn! Imagine teaching a friend to recognize different types of pizza. You'd show them lots of pictures, right? AI works the same way — it needs LOTS of examples.</p>
        <div class="activity">
          <h3>🧩 Activity: Put the Steps in Order</h3>
          <p class="instructions">AI learns in 5 steps. Drag them into the correct order!</p>
          <div class="drag-zone" id="ai2-items"></div>
          <div class="sequence-slots" id="ai2-slots"></div>
          <div class="feedback" id="ai2-fb"></div>
          <button class="btn-check" onclick="ai2Check()">Check Order ✓</button>
        </div>
        <div class="activity">
          <h3>🎯 Activity: Train the AI!</h3>
          <p class="instructions">You're training an AI to recognize animals! Drag each picture to the right category.</p>
          <div class="drag-zone" id="ai2-train-items"></div>
          <div class="buckets">
            <div class="bucket" style="border-color:var(--cyan)" data-on-drop="ai2TrainDrop" data-bucket="cat">
              <h4>🐱 Cat</h4><div class="bucket-items" id="ai2-cats"></div>
            </div>
            <div class="bucket" style="border-color:var(--purple)" data-on-drop="ai2TrainDrop" data-bucket="dog">
              <h4>🐶 Dog</h4><div class="bucket-items" id="ai2-dogs"></div>
            </div>
          </div>
          <div class="feedback" id="ai2-train-fb"></div>
          <button class="btn-check" onclick="ai2TrainCheck()">Train the AI! ✓</button>
        </div>
      `;
      const steps = ['📊 Collect Data', '🧹 Clean Data', '🏋️ Train Model', '🧪 Test It', '🔄 Improve'];
      const container = document.getElementById('ai2-items');
      const slots = document.getElementById('ai2-slots');
      const shuffled = [...steps].sort(() => Math.random() - 0.5);
      shuffled.forEach((s, i) => {
        const el = document.createElement('div');
        el.className = 'drag-item';
        el.textContent = s;
        el.dataset.value = steps.indexOf(s).toString();
        container.appendChild(el);
        initDrag(el);
      });
      for (let i = 0; i < 5; i++) {
        const slot = document.createElement('div');
        slot.className = 'sequence-slot';
        slot.textContent = `Step ${i + 1}`;
        slot.dataset.onDrop = 'ai2SlotDrop';
        slot.dataset.slot = i;
        slots.appendChild(slot);
      }
      window.ai2Slots = {};

      // Train items
      const animals = [
        {name: '😺 Whiskers', type: 'cat'}, {name: '🐕 Buddy', type: 'dog'},
        {name: '🐈 Mittens', type: 'cat'}, {name: '🐩 Poodle', type: 'dog'},
        {name: '😸 Luna', type: 'cat'}, {name: '🦮 Rex', type: 'dog'}
      ];
      const trainContainer = document.getElementById('ai2-train-items');
      animals.sort(() => Math.random() - 0.5).forEach((a, i) => {
        const el = document.createElement('div');
        el.className = 'drag-item';
        el.textContent = a.name;
        el.dataset.value = a.type;
        trainContainer.appendChild(el);
        initDrag(el);
      });
      window.ai2TrainPlaced = {};
    },

    // Ch3: Smart vs Wise
    function(area) {
      area.innerHTML = `
        <h2>🧠 Smart vs Wise</h2>
        <p class="lesson-desc">AI can be really <strong>smart</strong> (fast at answers) but not always <strong>wise</strong> (knowing when it's wrong). A calculator is smart — but it doesn't know if you typed the wrong numbers! Let's practice being WISE about AI.</p>
        <div class="activity">
          <h3>🎯 Activity: What Would You Do?</h3>
          <p class="instructions">An AI gives you an answer. Pick the WISEST response!</p>
          <div id="ai3-scenarios"></div>
        </div>
      `;
      const scenarios = [
        {q: 'AI says: "The capital of France is London" 🤖', options: [
          {text: '✅ Trust it! AI is always right', wise: false},
          {text: '🤔 That doesn\'t sound right, let me check', wise: true},
          {text: '❌ AI is useless and always wrong', wise: false}
        ], explain: 'Great thinking! AI can make mistakes. The wise thing is to check — the capital of France is Paris! 🗼'},
        {q: 'You ask AI to write a birthday card for grandma 🤖', options: [
          {text: '📤 Send it without reading', wise: false},
          {text: '👀 Read it first and add your own touch', wise: true},
          {text: '🗑️ Never use AI for anything', wise: false}
        ], explain: 'Perfect! AI can help you get started, but your personal touch makes it special. Always review what AI creates!'},
        {q: 'AI suggests a "fact" for your school report 🤖', options: [
          {text: '📝 Copy-paste it directly', wise: false},
          {text: '🔍 Check if it\'s true using another source', wise: true},
          {text: '😤 Ignore AI and don\'t do the report', wise: false}
        ], explain: 'Exactly! Always verify AI facts with trusted sources. AI can "hallucinate" — make up things that sound real but aren\'t!'}
      ];
      const cont = document.getElementById('ai3-scenarios');
      window.ai3Done = 0;
      scenarios.forEach((s, si) => {
        const div = document.createElement('div');
        div.style.cssText = 'margin:20px 0;padding:20px;background:rgba(0,0,0,0.2);border-radius:16px;';
        div.innerHTML = `<p style="font-size:1.1rem;margin-bottom:14px;font-weight:600">${s.q}</p><div class="choice-cards" id="ai3-s${si}"></div><div class="feedback" id="ai3-fb${si}"></div>`;
        cont.appendChild(div);
        const cards = div.querySelector(`#ai3-s${si}`);
        s.options.forEach((o, oi) => {
          const card = document.createElement('div');
          card.className = 'choice-card';
          card.innerHTML = `<p>${o.text}</p>`;
          card.onclick = () => {
            cards.querySelectorAll('.choice-card').forEach(c => {
              c.classList.remove('selected','correct','wrong');
              c.style.pointerEvents = 'none';
            });
            if (o.wise) {
              card.classList.add('correct');
              showFeedback(div, 'success', s.explain);
              addPoints(10);
              window.ai3Done++;
              if (window.ai3Done >= 3) setTimeout(completeChapter, 500);
            } else {
              card.classList.add('wrong');
              showFeedback(div, 'error', '💡 Hint: The wisest response isn\'t blindly trusting OR ignoring the AI. Think about what a scientist would do — they\'d check the data themselves AND consider the AI\'s suggestion. Look for the answer that combines both! 🤔');
              setTimeout(() => {
                cards.querySelectorAll('.choice-card').forEach(c => {
                  c.classList.remove('wrong');
                  c.style.pointerEvents = '';
                });
              }, 1500);
            }
          };
          cards.appendChild(card);
        });
      });
    },

    // Ch4: AI in Your World
    function(area) {
      area.innerHTML = `
        <h2>🌍 AI in Your World</h2>
        <p class="lesson-desc">AI is EVERYWHERE — hiding in things you use every day! Let's explore a room and discover all the hidden AI. Tap on objects to reveal their secrets!</p>
        <div class="activity">
          <h3>🔍 Activity: Find the Hidden AI!</h3>
          <p class="instructions">Tap on objects in this room to discover where AI is hiding! Find all 8!</p>
          <p style="color:var(--gold);font-size:.9rem" id="ai4-count">Found: 0 / 8</p>
          <div class="scene-container" id="ai4-scene" style="background:linear-gradient(180deg,rgba(15,15,58,0.8),rgba(5,5,16,0.9))"></div>
        </div>
      `;
      const items = [
        {emoji: '📱', x: 10, y: 20, name: 'Smartphone', fact: 'Your phone uses AI for face unlock, autocorrect, photo enhancement, and voice assistants!'},
        {emoji: '📺', x: 70, y: 15, name: 'Smart TV', fact: 'Netflix and YouTube use AI to recommend shows you\'ll like based on what you\'ve watched!'},
        {emoji: '🔊', x: 45, y: 60, name: 'Smart Speaker', fact: 'Alexa, Siri, and Google Home use AI to understand your voice and respond!'},
        {emoji: '🎮', x: 80, y: 55, name: 'Game Console', fact: 'AI controls the enemies in your games, making them smarter and more challenging!'},
        {emoji: '❄️', x: 25, y: 65, name: 'Smart Fridge', fact: 'Some fridges use AI to track what food you have and suggest recipes!'},
        {emoji: '🚗', x: 55, y: 80, name: 'Car', fact: 'Modern cars use AI for self-driving features, parking assist, and collision warnings!'},
        {emoji: '💻', x: 35, y: 35, name: 'Laptop', fact: 'AI powers spam filters, search engines, grammar checkers, and photo editors!'},
        {emoji: '🏠', x: 60, y: 30, name: 'Thermostat', fact: 'Smart thermostats learn your schedule and preferences to save energy!'}
      ];
      const scene = document.getElementById('ai4-scene');
      window.ai4Found = 0;
      items.forEach((item, i) => {
        const el = document.createElement('div');
        el.className = 'scene-item';
        el.textContent = item.emoji;
        el.style.left = item.x + '%'; el.style.top = item.y + '%';
        el.onclick = () => {
          if (el.classList.contains('discovered')) return;
          el.classList.add('discovered');
          window.ai4Found++;
          document.getElementById('ai4-count').textContent = `Found: ${window.ai4Found} / 8`;
          addPoints(5);
          // Show popup
          const popup = document.createElement('div');
          popup.className = 'scene-popup show';
          popup.innerHTML = `<h5>${item.name}</h5><p>${item.fact}</p>`;
          popup.style.left = Math.min(item.x, 60) + '%';
          popup.style.top = (item.y + 8) + '%';
          scene.appendChild(popup);
          setTimeout(() => popup.remove(), 4000);
          if (window.ai4Found >= 8) setTimeout(completeChapter, 1000);
        };
        scene.appendChild(el);
      });
    },

    // Ch5: Asking Better Questions
    function(area) {
      area.innerHTML = `
        <h2>❓ Asking Better Questions</h2>
        <p class="lesson-desc">The SECRET to getting great answers from AI? Ask great questions! Vague questions get vague answers. Specific questions get amazing answers. Let's practice making questions better!</p>
        <div class="activity">
          <h3>🎯 Activity: Question Builder</h3>
          <p class="instructions">Start with a boring question and make it AWESOME by adding word blocks!</p>
          <div id="ai5-builder"></div>
        </div>
      `;
      const challenges = [
        {start: 'Tell me about dogs', blocks: ['What are', 'the 3 best', 'dog breeds', 'for families', 'with young children?'],
          bonus: ['specific number', 'context added', 'audience defined'], answer: 'What are the 3 best dog breeds for families with young children?'},
        {start: 'Help me with homework', blocks: ['Explain', 'how volcanoes erupt', 'in simple words', 'with an example', 'a 10-year-old can understand'],
          answer: 'Explain how volcanoes erupt in simple words with an example a 10-year-old can understand'},
        {start: 'Tell me about space', blocks: ['What are', '5 fun facts about', 'Mars', 'that would surprise', 'my classmates?'],
          answer: 'What are 5 fun facts about Mars that would surprise my classmates?'}
      ];
      const cont = document.getElementById('ai5-builder');
      window.ai5Done = 0;
      challenges.forEach((ch, ci) => {
        const div = document.createElement('div');
        div.style.cssText = 'margin:20px 0;padding:24px;background:rgba(0,0,0,0.2);border-radius:16px;';
        div.innerHTML = `
          <p style="color:var(--text3);font-size:.85rem;margin-bottom:4px">Boring question:</p>
          <p style="font-size:1.1rem;margin-bottom:16px;color:var(--red);text-decoration:line-through">"${ch.start}"</p>
          <p style="color:var(--text3);font-size:.85rem;margin-bottom:8px">Build a better question — arrange these blocks:</p>
          <div class="drag-zone" id="ai5-blocks-${ci}"></div>
          <p style="color:var(--text3);font-size:.85rem;margin:12px 0 4px">Your improved question:</p>
          <div class="drag-zone" id="ai5-target-${ci}" data-on-drop="ai5Drop" data-challenge="${ci}" style="min-height:50px;border-color:var(--cyan)">
            <span class="drag-zone-label">Drop blocks here in order</span>
          </div>
          <div class="feedback" id="ai5-fb-${ci}"></div>
          <button class="btn-check" onclick="ai5Check(${ci})">Check ✓</button>
        `;
        cont.appendChild(div);
        const blocksZone = document.getElementById(`ai5-blocks-${ci}`);
        const shuffled = [...ch.blocks].sort(() => Math.random() - 0.5);
        shuffled.forEach((b, bi) => {
          const el = document.createElement('div');
          el.className = 'drag-item';
          el.textContent = b;
          el.dataset.value = ch.blocks.indexOf(b).toString();
          el.dataset.challenge = ci;
          blocksZone.appendChild(el);
          initDrag(el);
        });
      });
      window.ai5Challenges = challenges;
    },

    // Ch6: When AI Gets It Wrong
    function(area) {
      area.innerHTML = `
        <h2>❌ When AI Gets It Wrong</h2>
        <p class="lesson-desc">AI isn't perfect! It can make mistakes, be biased, or even make things up entirely (we call these "hallucinations"). Your job? Be a fact-checker! Let's play Spot the Mistake!</p>
        <div class="activity">
          <h3>🔍 Activity: Spot the Mistake!</h3>
          <p class="instructions">The AI made these statements. Drag each one to ✅ (correct) or ❌ (wrong)!</p>
          <div class="drag-zone" id="ai6-items"></div>
          <div class="buckets">
            <div class="bucket" style="border-color:var(--green)" data-on-drop="ai6Drop" data-bucket="true">
              <h4>✅ Correct</h4><div class="bucket-items" id="ai6-true"></div>
            </div>
            <div class="bucket" style="border-color:var(--red)" data-on-drop="ai6Drop" data-bucket="false">
              <h4>❌ Wrong</h4><div class="bucket-items" id="ai6-false"></div>
            </div>
          </div>
          <div class="feedback" id="ai6-fb"></div>
          <button class="btn-check" onclick="ai6Check()">Check Answers ✓</button>
        </div>
      `;
      const statements = [
        {text: '🌍 Earth is the 3rd planet from the Sun', correct: true},
        {text: '🦕 Dinosaurs and humans lived together', correct: false},
        {text: '💧 Water boils at 100°C', correct: true},
        {text: '🌙 The Moon is bigger than Earth', correct: false},
        {text: '❤️ The heart pumps blood through your body', correct: true},
        {text: '🐧 Penguins can fly long distances', correct: false},
        {text: '☀️ The Sun is a star', correct: true},
        {text: '🧠 Humans only use 10% of their brains', correct: false}
      ];
      const container = document.getElementById('ai6-items');
      statements.sort(() => Math.random() - 0.5).forEach((s, i) => {
        const el = document.createElement('div');
        el.className = 'drag-item';
        el.textContent = s.text;
        el.dataset.value = s.correct.toString();
        container.appendChild(el);
        initDrag(el);
      });
      window.ai6Placed = {};
    },

    // Ch7: AI Ethics & Fairness
    function(area) {
      area.innerHTML = `
        <h2>⚖️ AI Ethics & Fairness</h2>
        <p class="lesson-desc">AI is only as fair as the data it learns from. If we teach AI with biased examples, it makes biased decisions. Let's explore some real scenarios and think about what's right!</p>
        <div class="activity">
          <h3>🎯 Activity: Fix the Unfair AI</h3>
          <p class="instructions">Read each scenario and pick the best solution!</p>
          <div id="ai7-scenarios"></div>
        </div>
      `;
      const scenarios = [
        {title: '🏫 The Team Picker', problem: 'An AI picks students for the science team, but it always picks boys. It learned from old data where only boys were on the team.',
          options: [
            {text: '🔄 Retrain with fair data showing all students', correct: true},
            {text: '🤷 It\'s fine, that\'s what the data says', correct: false},
            {text: '🗑️ Never use AI for anything', correct: false}
          ], explain: 'Yes! The AI learned bias from old, unfair data. We need to train it with diverse, fair examples!'},
        {title: '📸 The Photo App', problem: 'A photo filter app only works well on light skin tones. It makes dark skin look weird.',
          options: [
            {text: '📊 Train it with photos of ALL skin tones equally', correct: true},
            {text: '📝 Just add a warning label', correct: false},
            {text: '🚫 Ban all photo filters', correct: false}
          ], explain: 'Exactly! AI needs diverse training data. If it only saw some skin tones, it won\'t work for everyone.'},
        {title: '🏠 The House Pricer', problem: 'An AI that prices houses always gives lower prices to homes in certain neighborhoods. It learned from historical data that was affected by discrimination.',
          options: [
            {text: '🧹 Remove biased historical data and use fair criteria', correct: true},
            {text: '✅ Historical data is always correct', correct: false},
            {text: '💰 Just raise all prices', correct: false}
          ], explain: 'Right! Historical data can contain past discrimination. We need to clean the data and ensure AI decisions are fair!'}
      ];
      const cont = document.getElementById('ai7-scenarios');
      window.ai7Done = 0;
      scenarios.forEach((s, si) => {
        const div = document.createElement('div');
        div.style.cssText = 'margin:20px 0;padding:24px;background:rgba(0,0,0,0.2);border-radius:16px;';
        div.innerHTML = `<h4 style="margin-bottom:8px">${s.title}</h4><p style="color:var(--text2);margin-bottom:14px">${s.problem}</p><div class="choice-cards" id="ai7-s${si}"></div><div class="feedback" id="ai7-fb${si}"></div>`;
        cont.appendChild(div);
        s.options.forEach((o, oi) => {
          const card = document.createElement('div');
          card.className = 'choice-card';
          card.innerHTML = `<p>${o.text}</p>`;
          card.onclick = () => {
            div.querySelectorAll('.choice-card').forEach(c => { c.classList.remove('selected','correct','wrong'); c.style.pointerEvents = 'none'; });
            if (o.correct) {
              card.classList.add('correct');
              showFeedback(div, 'success', s.explain);
              addPoints(10);
              window.ai7Done++;
              if (window.ai7Done >= 3) setTimeout(completeChapter, 500);
            } else {
              card.classList.add('wrong');
              showFeedback(div, 'error', '💡 Hint: Fairness means the AI should treat ALL people equally regardless of gender, race, or background. Look for the solution that fixes the BIAS in the AI\'s decision-making, not just the symptoms. Ask yourself: "Would this fix make it fair for everyone?" 🤔');
              setTimeout(() => { div.querySelectorAll('.choice-card').forEach(c => { c.classList.remove('wrong'); c.style.pointerEvents = ''; }); }, 1500);
            }
          };
          div.querySelector(`#ai7-s${si}`).appendChild(card);
        });
      });
    },

    // Ch8: Be the AI Boss
    function(area) {
      area.innerHTML = `
        <h2>👑 Be the AI Boss — Capstone!</h2>
        <p class="lesson-desc">Time to design your very own AI assistant! You're the boss — YOU decide what it does, what rules it follows, and what it should NEVER do.</p>
        <div class="activity">
          <h3>🤖 Step 1: What does your AI do?</h3>
          <p class="instructions">Pick your AI's main job:</p>
          <div class="choice-cards" id="ai8-job"></div>
        </div>
        <div class="activity" id="ai8-step2" style="display:none">
          <h3>📋 Step 2: Set the Rules</h3>
          <p class="instructions">Drag rules into your AI's rule book:</p>
          <div class="drag-zone" id="ai8-rules-source"></div>
          <div class="drag-zone" id="ai8-rules-target" data-on-drop="ai8RuleDrop" style="min-height:80px;border-color:var(--green)">
            <span class="drag-zone-label">📋 AI Rule Book</span>
          </div>
        </div>
        <div class="activity" id="ai8-step3" style="display:none">
          <h3>🚫 Step 3: Set Boundaries</h3>
          <p class="instructions">What should your AI NEVER do? Pick at least 2:</p>
          <div class="choice-cards" id="ai8-never"></div>
        </div>
        <div id="ai8-result" style="display:none;text-align:center;padding:30px">
          <h3 style="font-size:1.5rem;margin-bottom:16px">🎉 Your AI Assistant!</h3>
          <div id="ai8-card" class="glass" style="display:inline-block;padding:30px;max-width:400px;text-align:left"></div>
        </div>
      `;
      const jobs = [
        {emoji: '📚', name: 'Homework Helper', desc: 'Helps explain difficult topics'},
        {emoji: '🎵', name: 'Music DJ', desc: 'Plays and suggests music'},
        {emoji: '😂', name: 'Joke Teller', desc: 'Tells funny jokes and stories'},
        {emoji: '🏋️', name: 'Fitness Coach', desc: 'Helps you stay active and healthy'}
      ];
      const jobCont = document.getElementById('ai8-job');
      window.ai8State = {job: null, rules: [], nevers: []};
      jobs.forEach(j => {
        const card = document.createElement('div');
        card.className = 'choice-card';
        card.innerHTML = `<span class="emoji">${j.emoji}</span><p><strong>${j.name}</strong></p><p style="font-size:.8rem;color:var(--text2)">${j.desc}</p>`;
        card.onclick = () => {
          jobCont.querySelectorAll('.choice-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          window.ai8State.job = j;
          document.getElementById('ai8-step2').style.display = '';
          addPoints(5);
        };
        jobCont.appendChild(card);
      });
      // Rules
      const rules = ['🤝 Always be kind', '📖 Be honest', '🔒 Ask before sharing info', '🎯 Stay on topic', '👂 Listen carefully', '⏰ Know when to stop'];
      const rulesSrc = document.getElementById('ai8-rules-source');
      rules.forEach(r => {
        const el = document.createElement('div');
        el.className = 'drag-item';
        el.textContent = r;
        el.dataset.value = r;
        rulesSrc.appendChild(el);
        initDrag(el);
      });
      // Nevers
      const nevers = ['🚫 Never lie or make up facts', '🚫 Never share personal info', '🚫 Never be mean or bully', '🚫 Never make decisions without asking', '🚫 Never pretend to be human', '🚫 Never ignore safety'];
      setTimeout(() => {
        const neverCont = document.getElementById('ai8-never');
        let neverCount = 0;
        nevers.forEach(n => {
          const card = document.createElement('div');
          card.className = 'choice-card';
          card.innerHTML = `<p>${n}</p>`;
          card.onclick = () => {
            if (card.classList.contains('selected')) {
              card.classList.remove('selected');
              window.ai8State.nevers = window.ai8State.nevers.filter(x => x !== n);
              neverCount--;
            } else {
              card.classList.add('selected');
              window.ai8State.nevers.push(n);
              neverCount++;
              addPoints(3);
            }
            if (neverCount >= 2 && window.ai8State.job && window.ai8State.rules.length >= 2) {
              showAi8Result();
            }
          };
          neverCont.appendChild(card);
        });
      }, 100);
    }
  ],

  // ==========================================
  // SPACE EXPLORERS
  // ==========================================
  space: [
    // Ch1: Our Solar System
    function(area) {
      area.innerHTML = `
        <h2>🪐 Our Solar System</h2>
        <p class="lesson-desc">Welcome to the cosmic neighborhood! Our solar system has 8 amazing planets orbiting the Sun. Tap on each planet to discover incredible facts, then put them in the right order!</p>
        <div class="activity">
          <h3>🌟 Explore the Planets!</h3>
          <p class="instructions">Tap each planet to learn about it! <span id="sp1-count" style="color:var(--gold)">Explored: 0/8</span></p>
          <div class="solar-system" id="sp1-system"></div>
        </div>
        <div class="activity">
          <h3>🧩 Activity: Order the Planets!</h3>
          <p class="instructions">Drag the planets into order from closest to the Sun ☀️</p>
          <div class="drag-zone" id="sp1-items"></div>
          <div class="sequence-slots" id="sp1-slots"></div>
          <div class="feedback" id="sp1-fb"></div>
          <button class="btn-check" onclick="sp1Check()">Check Order ✓</button>
        </div>
      `;
      const planets = [
        {name:'Mercury',emoji:'⚫',color:'#8b8b8b',x:18,y:45,size:22,facts:'Closest to Sun • 167°C average • No moons • Smallest planet • A year is just 88 Earth days!'},
        {name:'Venus',emoji:'🟡',color:'#e6c44d',x:25,y:30,size:28,facts:'Hottest planet at 462°C! • Spins backwards • Similar size to Earth • Thick clouds of acid • A day is longer than its year!'},
        {name:'Earth',emoji:'🌍',color:'#4d94ff',x:33,y:60,size:28,facts:'Our home! • Only planet with liquid water on surface • 1 Moon • Perfect distance from Sun for life • 4.5 billion years old'},
        {name:'Mars',emoji:'🔴',color:'#c1440e',x:42,y:35,size:24,facts:'The Red Planet • Has the biggest volcano (Olympus Mons) • 2 tiny moons • NASA\'s rovers explore it • Might have had water!'},
        {name:'Jupiter',emoji:'🟤',color:'#c88b3a',x:54,y:50,size:44,facts:'Biggest planet! • 79+ moons • Great Red Spot is a storm bigger than Earth • Made of gas • Could fit 1,300 Earths inside!'},
        {name:'Saturn',emoji:'🪐',color:'#e8d5a3',x:66,y:25,size:40,facts:'Famous rings made of ice and rock • 82+ moons • So light it could float in water! • Rings are 282,000 km wide but only 10 m thick!'},
        {name:'Uranus',emoji:'🔵',color:'#4dc9f6',x:77,y:55,size:32,facts:'Ice giant! • Tilted on its side (98°!) • 27 moons • -224°C cold • Takes 84 Earth years to orbit the Sun'},
        {name:'Neptune',emoji:'🔵',color:'#4444ff',x:88,y:40,size:30,facts:'Farthest planet • Strongest winds (2,100 km/h!) • 14 moons • Deep blue color • Takes 165 years to orbit the Sun'}
      ];
      // Solar system explorer
      const sys = document.getElementById('sp1-system');
      sys.innerHTML = '<div style="position:absolute;left:6%;top:50%;transform:translateY(-50%);font-size:3rem">☀️</div>';
      window.sp1Explored = 0;
      planets.forEach((p, i) => {
        const el = document.createElement('div');
        el.className = 'planet';
        el.style.cssText = `left:${p.x}%;top:${p.y}%;width:${p.size}px;height:${p.size}px;background:${p.color};font-size:${p.size*0.6}px;`;
        el.textContent = p.emoji;
        el.onclick = () => {
          if (!el.classList.contains('discovered')) {
            el.classList.add('discovered');
            window.sp1Explored++;
            document.getElementById('sp1-count').textContent = `Explored: ${window.sp1Explored}/8`;
            addPoints(3);
          }
          document.querySelectorAll('.scene-popup').forEach(x => x.remove());
          const popup = document.createElement('div');
          popup.className = 'scene-popup show';
          popup.innerHTML = `<h5>${p.name} ${p.emoji}</h5><p>${p.facts}</p>`;
          popup.style.cssText = `left:${Math.min(p.x, 60)}%;top:${Math.min(p.y + 10, 75)}%;`;
          sys.appendChild(popup);
          setTimeout(() => popup.remove(), 5000);
        };
        sys.appendChild(el);
      });
      // Order puzzle
      const order = ['Mercury','Venus','Earth','Mars','Jupiter','Saturn','Uranus','Neptune'];
      const itemsCont = document.getElementById('sp1-items');
      const slotsCont = document.getElementById('sp1-slots');
      const shuffled = [...planets].sort(() => Math.random() - 0.5);
      shuffled.forEach((p, i) => {
        const el = document.createElement('div');
        el.className = 'drag-item';
        el.textContent = `${p.emoji} ${p.name}`;
        el.dataset.value = order.indexOf(p.name).toString();
        itemsCont.appendChild(el);
        initDrag(el);
      });
      for (let i = 0; i < 8; i++) {
        const slot = document.createElement('div');
        slot.className = 'sequence-slot';
        slot.textContent = i === 0 ? '☀️ Closest' : i === 7 ? 'Farthest' : `#${i+1}`;
        slot.dataset.onDrop = 'sp1SlotDrop';
        slot.dataset.slot = i;
        slotsCont.appendChild(slot);
      }
      window.sp1Slots = {};
    },

    // Ch2: Life of a Star
    function(area) {
      area.innerHTML = `
        <h2>⭐ Life of a Star</h2>
        <p class="lesson-desc">Stars are born, live, and die — just like living things! A star's life can last billions of years. Let's explore the amazing journey of a star!</p>
        <div class="activity">
          <h3>🎯 Activity: Star Lifecycle</h3>
          <p class="instructions">Drag the stages into the correct order to show how a star lives!</p>
          <div class="drag-zone" id="sp2-items"></div>
          <div class="sequence-slots" id="sp2-slots"></div>
          <div class="feedback" id="sp2-fb"></div>
          <button class="btn-check" onclick="sp2Check()">Check ✓</button>
        </div>
        <div class="activity">
          <h3>💡 Star Facts</h3>
          <div class="card-grid" id="sp2-cards"></div>
        </div>
      `;
      const stages = ['🌫️ Nebula (Gas Cloud)','⭐ Protostar','☀️ Main Sequence','🔴 Red Giant','💥 Supernova / White Dwarf'];
      const cont = document.getElementById('sp2-items');
      const slots = document.getElementById('sp2-slots');
      [...stages].sort(() => Math.random() - 0.5).forEach((s, i) => {
        const el = document.createElement('div');
        el.className = 'drag-item';
        el.textContent = s;
        el.dataset.value = stages.indexOf(s).toString();
        cont.appendChild(el);
        initDrag(el);
      });
      for (let i = 0; i < 5; i++) {
        const slot = document.createElement('div');
        slot.className = 'sequence-slot';
        slot.textContent = `Stage ${i+1}`;
        slot.dataset.onDrop = 'sp2SlotDrop';
        slot.dataset.slot = i;
        slots.appendChild(slot);
      }
      window.sp2Slots = {};
      // Flip cards
      const facts = [
        {front:'🌫️ Nebula',back:'A giant cloud of gas and dust in space. Gravity pulls it together to start forming a star!'},
        {front:'☀️ Our Sun',back:'Our Sun is a middle-aged star, about 4.6 billion years old. It will live for about 10 billion years total!'},
        {front:'💥 Supernova',back:'When a massive star dies, it EXPLODES! This explosion is called a supernova and is brighter than an entire galaxy!'},
        {front:'⚫ Black Hole',back:'If a really massive star explodes, what\'s left can collapse into a black hole — where gravity is so strong nothing can escape!'}
      ];
      const cardGrid = document.getElementById('sp2-cards');
      facts.forEach(f => {
        cardGrid.innerHTML += `<div class="flip-card" onclick="this.classList.toggle('flipped')"><div class="flip-card-inner"><div class="flip-card-front"><span class="emoji">${f.front.split(' ')[0]}</span><h4>${f.front}</h4><p style="font-size:.75rem;color:var(--text3)">Tap to reveal!</p></div><div class="flip-card-back"><h5>${f.front}</h5><p>${f.back}</p></div></div></div>`;
      });
    },

    // Ch3: Rockets & Launch Science
    function(area) {
      area.innerHTML = `
        <h2>🚀 Rockets & Launch Science</h2>
        <p class="lesson-desc">To escape Earth's gravity, we need rockets! Every part of a rocket has a crucial job. Let's build one together!</p>
        <div class="activity">
          <h3>🔧 Activity: Build a Rocket!</h3>
          <p class="instructions">Drag rocket parts onto the launch pad in the right order (bottom to top)!</p>
          <div style="display:flex;gap:30px;align-items:start;flex-wrap:wrap;justify-content:center">
            <div>
              <p style="font-size:.85rem;color:var(--text3);margin-bottom:8px">Parts bin:</p>
              <div class="drag-zone" id="sp3-parts" style="flex-direction:column;max-width:250px"></div>
            </div>
            <div>
              <p style="font-size:.85rem;color:var(--text3);margin-bottom:8px">Your Rocket:</p>
              <div class="rocket-frame" id="sp3-rocket"></div>
              <button class="btn-check" id="sp3-launch" onclick="sp3Launch()" style="display:none;width:100%">🚀 LAUNCH!</button>
            </div>
          </div>
          <div class="feedback" id="sp3-fb"></div>
        </div>
      `;
      const parts = [
        {name:'🔺 Nose Cone', desc:'Protects the payload from heat and air resistance', slot:0},
        {name:'📦 Payload (Satellite)', desc:'What the rocket is carrying to space!', slot:1},
        {name:'⛽ Fuel Tank', desc:'Stores fuel and oxidizer for the engines', slot:2},
        {name:'🔥 Engine', desc:'Burns fuel to create thrust — pushes the rocket UP!', slot:3},
        {name:'▽ Fins', desc:'Keep the rocket stable and flying straight', slot:4}
      ];
      const partsBin = document.getElementById('sp3-parts');
      const rocketFrame = document.getElementById('sp3-rocket');
      [...parts].sort(() => Math.random() - 0.5).forEach(p => {
        const el = document.createElement('div');
        el.className = 'drag-item';
        el.innerHTML = `<strong>${p.name}</strong><br><span style="font-size:.75rem;color:var(--text2)">${p.desc}</span>`;
        el.dataset.value = p.slot.toString();
        partsBin.appendChild(el);
        initDrag(el);
      });
      for (let i = 0; i < 5; i++) {
        const slot = document.createElement('div');
        slot.className = 'rocket-slot';
        slot.textContent = i === 0 ? '← Top' : i === 4 ? '← Bottom' : `Part ${i+1}`;
        slot.dataset.onDrop = 'sp3Drop';
        slot.dataset.slot = i;
        rocketFrame.appendChild(slot);
      }
      window.sp3Filled = 0;
    },

    // Ch4: Mission to Mars
    function(area) {
      area.innerHTML = `
        <h2>🔴 Mission to Mars</h2>
        <p class="lesson-desc">You're planning a mission to Mars! But your cargo ship has a weight limit. Choose wisely — your crew's survival depends on it!</p>
        <div class="activity">
          <h3>📦 Activity: Pack the Cargo!</h3>
          <p class="instructions">Drag supplies into the cargo bay. Weight limit: <strong>1000 kg</strong>. Choose wisely!</p>
          <div class="drag-zone" id="sp4-items" style="gap:8px"></div>
          <div>
            <div class="weight-label"><span>Weight:</span><span id="sp4-weight-text">0 / 1000 kg</span></div>
            <div class="weight-bar"><div class="weight-fill" id="sp4-weight-fill" style="width:0;background:var(--green)"></div></div>
          </div>
          <div class="cargo-bay" data-on-drop="sp4Drop" id="sp4-cargo">
            <span class="drag-zone-label">🚀 Cargo Bay — Drop supplies here!</span>
            <div id="sp4-cargo-items" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px"></div>
          </div>
          <div class="feedback" id="sp4-fb"></div>
          <button class="btn-check" onclick="sp4Check()">Ready for Launch! 🚀</button>
        </div>
      `;
      const supplies = [
        {name:'🥫 Food (6 months)',w:200,essential:true},{name:'💧 Water Recycler',w:150,essential:true},
        {name:'🫁 Oxygen Generator',w:180,essential:true},{name:'🔧 Repair Tools',w:80,essential:true},
        {name:'🌱 Seeds & Soil',w:60,essential:false},{name:'☀️ Solar Panels',w:120,essential:true},
        {name:'📡 Communication Radio',w:90,essential:true},{name:'🏥 Medical Kit',w:50,essential:true},
        {name:'🎮 Entertainment System',w:40,essential:false},{name:'🧪 Science Equipment',w:100,essential:false},
        {name:'🛏️ Sleeping Pods',w:200,essential:false},{name:'🏋️ Exercise Equipment',w:80,essential:false}
      ];
      const cont = document.getElementById('sp4-items');
      window.sp4Weight = 0;
      window.sp4Cargo = [];
      supplies.forEach((s, i) => {
        const el = document.createElement('div');
        el.className = 'drag-item';
        el.innerHTML = `${s.name} <span style="font-size:.75rem;color:var(--text3)">${s.w}kg</span>`;
        el.dataset.value = JSON.stringify(s);
        el.dataset.id = i;
        cont.appendChild(el);
        initDrag(el);
      });
    },

    // Ch5: Gravity & Orbits
    function(area) {
      area.innerHTML = `
        <h2>🌀 Gravity & Orbits</h2>
        <p class="lesson-desc">Gravity is the invisible force that holds the universe together! It's why planets orbit stars, moons orbit planets, and why you don't float away. Let's explore!</p>
        <div class="activity">
          <h3>🪐 Activity: Orbit Simulator</h3>
          <p class="instructions">Use the sliders to change gravity and see what happens to the planet's orbit!</p>
          <div class="orbit-sim" id="sp5-sim">
            <div class="sun-center">☀️</div>
            <div class="orbiting-planet" id="sp5-planet">🌍</div>
          </div>
          <div class="slider-control">
            <label>🌀 Gravity Strength: <span id="sp5-grav-val">Medium</span></label>
            <input type="range" min="1" max="5" value="3" id="sp5-gravity" oninput="sp5Update()">
          </div>
          <div class="slider-control">
            <label>📏 Distance from Sun: <span id="sp5-dist-val">Medium</span></label>
            <input type="range" min="1" max="5" value="3" id="sp5-distance" oninput="sp5Update()">
          </div>
          <p id="sp5-info" style="text-align:center;color:var(--cyan);margin:12px 0"></p>
        </div>
        <div class="activity">
          <h3>🤔 What Would Happen If...?</h3>
          <div id="sp5-quiz" class="choice-cards"></div>
          <div class="feedback" id="sp5-fb"></div>
        </div>
      `;
      // Orbit animation
      let angle = 0;
      window.sp5Anim = true;
      function animate() {
        if (!window.sp5Anim) return;
        const sim = document.getElementById('sp5-sim');
        if (!sim) { window.sp5Anim = false; return; }
        const grav = parseInt(document.getElementById('sp5-gravity')?.value || 3);
        const dist = parseInt(document.getElementById('sp5-distance')?.value || 3);
        const speed = 0.005 + (grav * 0.008) - (dist * 0.003);
        const radius = 40 + dist * 25;
        angle += speed;
        const planet = document.getElementById('sp5-planet');
        if (planet) {
          const cx = sim.offsetWidth / 2, cy = sim.offsetHeight / 2;
          planet.style.left = (cx + Math.cos(angle) * radius - 12) + 'px';
          planet.style.top = (cy + Math.sin(angle) * radius - 12) + 'px';
        }
        requestAnimationFrame(animate);
      }
      animate();
      window.sp5Update = function() {
        const g = parseInt(document.getElementById('sp5-gravity').value);
        const d = parseInt(document.getElementById('sp5-distance').value);
        const labels = ['Very Low','Low','Medium','High','Very High'];
        document.getElementById('sp5-grav-val').textContent = labels[g-1];
        document.getElementById('sp5-dist-val').textContent = labels[d-1];
        const info = document.getElementById('sp5-info');
        if (g >= 4 && d <= 2) info.textContent = '⚠️ Too close! The planet would be pulled into the Sun!';
        else if (g <= 2 && d >= 4) info.textContent = '🚀 The planet flies away! Not enough gravity to hold it!';
        else info.textContent = '✅ Stable orbit! The planet circles the Sun perfectly.';
      };
      // Quiz
      const quiz = document.getElementById('sp5-quiz');
      [{text:'🌍 Earth was closer to the Sun', correct:true, emoji:'🔥'},{text:'🌍 Earth had less gravity', correct:false, emoji:'🤔'},{text:'☀️ The Sun disappeared',correct:false,emoji:'😱'}].forEach(q => {
        const card = document.createElement('div');
        card.className = 'choice-card';
        card.innerHTML = `<span class="emoji">${q.emoji}</span><p style="font-size:.9rem">${q.text}</p>`;
        card.onclick = () => {
          quiz.querySelectorAll('.choice-card').forEach(c => c.style.pointerEvents = 'none');
          card.classList.add('selected');
          showFeedback(card.closest('.activity'), 'info', q.correct ? '🔥 Correct! Earth would be much hotter, oceans would boil, and life couldn\'t exist as we know it!' : q.emoji === '🤔' ? 'With less gravity, the atmosphere would thin out and you could jump super high — but it\'d be hard to breathe!' : '😱 Earth would fly off in a straight line into space! We need the Sun\'s gravity to keep orbiting.');
          addPoints(10);
          setTimeout(completeChapter, 2000);
        };
        quiz.appendChild(card);
      });
    },

    // Ch6: Space AI
    function(area) {
      area.innerHTML = `
        <h2>🛸 Space AI</h2>
        <p class="lesson-desc">AI is essential for space exploration! It drives Mars rovers, finds new planets, and helps astronauts on the space station. Let's see how!</p>
        <div class="activity">
          <h3>🎯 Activity: Match AI to Space Problem!</h3>
          <p class="instructions">Drag each AI tool to the space problem it solves!</p>
          <div class="drag-zone" id="sp6-tools"></div>
          <div id="sp6-problems" style="display:grid;gap:12px;margin:16px 0"></div>
          <div class="feedback" id="sp6-fb"></div>
        </div>
      `;
      const matches = [
        {tool:'🤖 Self-Driving AI',problem:'Navigate a rover on Mars with 20-minute signal delay',emoji:'🔴'},
        {tool:'🔭 Pattern Recognition AI',problem:'Find new planets in telescope data',emoji:'🪐'},
        {tool:'🩺 Health Monitor AI',problem:'Track astronaut health on long missions',emoji:'👨‍🚀'},
        {tool:'📡 Communication AI',problem:'Compress and send data across millions of miles',emoji:'📶'}
      ];
      const toolsCont = document.getElementById('sp6-tools');
      const probsCont = document.getElementById('sp6-problems');
      window.sp6Matched = 0;
      [...matches].sort(() => Math.random() - 0.5).forEach((m, i) => {
        const el = document.createElement('div');
        el.className = 'drag-item';
        el.textContent = m.tool;
        el.dataset.value = m.tool;
        toolsCont.appendChild(el);
        initDrag(el);
      });
      matches.forEach((m, i) => {
        const prob = document.createElement('div');
        prob.className = 'drag-zone';
        prob.dataset.onDrop = 'sp6Drop';
        prob.dataset.answer = m.tool;
        prob.innerHTML = `<span class="drag-zone-label">${m.emoji} ${m.problem}</span>`;
        probsCont.appendChild(prob);
      });
    },

    // Ch7: Astronaut Training
    function(area) {
      area.innerHTML = `
        <h2>👨‍🚀 Astronaut Training</h2>
        <p class="lesson-desc">Think you have what it takes to be an astronaut? Let's find out! Complete these training challenges!</p>
        <div class="activity">
          <h3>💪 Challenge 1: Speed Test</h3>
          <p class="instructions">Astronauts need fast reflexes! Tap the circle as many times as you can in 10 seconds!</p>
          <div class="tap-counter" id="sp7-counter">0</div>
          <div class="timer-bar"><div class="timer-fill" id="sp7-timer" style="width:100%"></div></div>
          <div class="tap-area" id="sp7-tap" onclick="sp7Tap()">TAP!</div>
          <button class="btn-check" id="sp7-start" onclick="sp7Start()">Start Challenge! ⏱️</button>
          <div class="feedback" id="sp7-fb1"></div>
        </div>
        <div class="activity">
          <h3>🧠 Challenge 2: Emergency Response</h3>
          <p class="instructions">ALARM! There's an oxygen leak on the space station! What do you do FIRST?</p>
          <div class="choice-cards" id="sp7-emergency"></div>
          <div class="feedback" id="sp7-fb2"></div>
        </div>
      `;
      window.sp7Taps = 0;
      window.sp7Running = false;
      window.sp7Tap = function() {
        if (!window.sp7Running) return;
        window.sp7Taps++;
        document.getElementById('sp7-counter').textContent = window.sp7Taps;
        gsap.to('#sp7-tap', {scale: 0.9, duration: 0.05, yoyo: true, repeat: 1});
      };
      window.sp7Start = function() {
        window.sp7Taps = 0; window.sp7Running = true;
        document.getElementById('sp7-counter').textContent = '0';
        document.getElementById('sp7-start').style.display = 'none';
        let time = 10;
        const interval = setInterval(() => {
          time -= 0.1;
          document.getElementById('sp7-timer').style.width = (time / 10 * 100) + '%';
          if (time <= 0) {
            clearInterval(interval);
            window.sp7Running = false;
            const msg = window.sp7Taps >= 50 ? '🏆 AMAZING! You\'d make an incredible astronaut!' : window.sp7Taps >= 30 ? '🌟 Great reflexes! You passed!' : '💪 Keep practicing! Astronauts train every day!';
            showFeedback(document.getElementById('sp7-fb1').parentElement, 'success', `${msg} (${window.sp7Taps} taps)`);
            addPoints(Math.min(window.sp7Taps, 30));
          }
        }, 100);
      };
      // Emergency
      const choices = [
        {text:'😱 Panic and scream', correct:false},
        {text:'🎯 Put on oxygen mask, then seal the leak', correct:true},
        {text:'📸 Take a photo for social media', correct:false},
        {text:'😴 Go back to sleep', correct:false}
      ];
      const emCont = document.getElementById('sp7-emergency');
      choices.forEach(c => {
        const card = document.createElement('div');
        card.className = 'choice-card';
        card.innerHTML = `<p>${c.text}</p>`;
        card.onclick = () => {
          emCont.querySelectorAll('.choice-card').forEach(x => x.style.pointerEvents = 'none');
          card.classList.add(c.correct ? 'correct' : 'wrong');
          showFeedback(emCont.parentElement, c.correct ? 'success' : 'error', c.correct ? '✅ Perfect! In emergencies: Protect yourself first (oxygen mask), then fix the problem. Stay calm!' : '❌ In space emergencies, stay calm! The correct answer: Put on oxygen mask first, then seal the leak.');
          if (c.correct) { addPoints(15); setTimeout(completeChapter, 1500); }
          else setTimeout(() => { emCont.querySelectorAll('.choice-card').forEach(x => { x.classList.remove('wrong'); x.style.pointerEvents = ''; }); }, 2000);
        };
        emCont.appendChild(card);
      });
    },

    // Ch8: Design Your Space Mission
    function(area) {
      area.innerHTML = `
        <h2>📋 Design Your Space Mission — Capstone!</h2>
        <p class="lesson-desc">Time to plan YOUR space mission! Pick a destination, assemble your crew, and choose your equipment.</p>
        <div class="activity">
          <h3>🎯 Step 1: Pick Your Destination</h3>
          <div class="choice-cards" id="sp8-dest"></div>
        </div>
        <div class="activity" id="sp8-step2" style="display:none">
          <h3>👥 Step 2: Assemble Your Crew</h3>
          <p class="instructions">Drag crew members to your ship (pick 4):</p>
          <div class="drag-zone" id="sp8-crew-src"></div>
          <div class="drag-zone" id="sp8-crew-target" data-on-drop="sp8CrewDrop" style="min-height:60px;border-color:var(--cyan)">
            <span class="drag-zone-label">🚀 Your Crew</span>
          </div>
        </div>
        <div class="activity" id="sp8-step3" style="display:none">
          <h3>🔧 Step 3: Choose Equipment</h3>
          <div class="choice-cards" id="sp8-equip"></div>
        </div>
        <div id="sp8-result" style="display:none;text-align:center;padding:30px"></div>
      `;
      const destinations = [
        {emoji:'🌙',name:'The Moon',desc:'3 days away • Low gravity • Practice base'},
        {emoji:'🔴',name:'Mars',desc:'7 months away • Thin atmosphere • Build a colony'},
        {emoji:'🧊',name:'Europa',desc:'6 years away • Ice moon of Jupiter • Ocean beneath?'},
        {emoji:'🌫️',name:'Titan',desc:'7 years away • Saturn\'s moon • Has lakes!'}
      ];
      const destCont = document.getElementById('sp8-dest');
      window.sp8State = {dest:null,crew:[],equip:[]};
      destinations.forEach(d => {
        const card = document.createElement('div');
        card.className = 'choice-card';
        card.innerHTML = `<span class="emoji">${d.emoji}</span><p><strong>${d.name}</strong></p><p style="font-size:.8rem;color:var(--text2)">${d.desc}</p>`;
        card.onclick = () => {
          destCont.querySelectorAll('.choice-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          window.sp8State.dest = d;
          document.getElementById('sp8-step2').style.display = '';
          addPoints(5);
        };
        destCont.appendChild(card);
      });
      // Crew
      const crew = ['👩‍✈️ Commander','👨‍🔬 Scientist','👩‍⚕️ Doctor','🧑‍🔧 Engineer','👨‍🍳 Chef','🧑‍💻 AI Specialist'];
      const crewSrc = document.getElementById('sp8-crew-src');
      crew.forEach(c => {
        const el = document.createElement('div');
        el.className = 'drag-item';
        el.textContent = c;
        el.dataset.value = c;
        crewSrc.appendChild(el);
        initDrag(el);
      });
      // Equipment
      const equip = ['🔭 Telescope','🛰️ Satellite Relay','🧪 Lab Equipment','⛏️ Drilling Rig','🏠 Habitat Module','🌱 Greenhouse'];
      setTimeout(() => {
        const equipCont = document.getElementById('sp8-equip');
        let equipCount = 0;
        equip.forEach(e => {
          const card = document.createElement('div');
          card.className = 'choice-card';
          card.innerHTML = `<p>${e}</p>`;
          card.onclick = () => {
            card.classList.toggle('selected');
            if (card.classList.contains('selected')) {
              window.sp8State.equip.push(e); equipCount++;
              addPoints(3);
            } else {
              window.sp8State.equip = window.sp8State.equip.filter(x => x !== e); equipCount--;
            }
            if (equipCount >= 3 && window.sp8State.crew.length >= 3 && window.sp8State.dest) {
              const result = document.getElementById('sp8-result');
              result.style.display = '';
              result.innerHTML = `<div class="chapter-complete show"><span class="emoji">🚀</span><h3>Mission ${window.sp8State.dest.name} is GO!</h3><p>Destination: ${window.sp8State.dest.emoji} ${window.sp8State.dest.name}<br>Crew: ${window.sp8State.crew.join(', ')}<br>Equipment: ${window.sp8State.equip.join(', ')}</p></div>`;
              setTimeout(completeChapter, 1000);
            }
          };
          equipCont.appendChild(card);
        });
      }, 100);
    }
  ],

  // ==========================================
  // ROBOTICS LAB
  // ==========================================
  robotics: [
    // Ch1: What is a Robot?
    function(area) {
      area.innerHTML = `
        <h2>🤖 What is a Robot?</h2>
        <p class="lesson-desc">A robot is a machine that can <strong>Sense</strong> the world, <strong>Think</strong> about what to do, and <strong>Act</strong> on its decisions. Not everything that moves is a robot! Let's sort it out.</p>
        <div class="activity">
          <h3>🎯 Activity: Robot or Not?</h3>
          <p class="instructions">Drag each item into the correct category!</p>
          <div class="drag-zone" id="rb1-items"></div>
          <div class="buckets">
            <div class="bucket" style="border-color:var(--green)" data-on-drop="rb1Drop" data-bucket="yes">
              <h4>🤖 Robot</h4><div class="bucket-items" id="rb1-yes"></div>
            </div>
            <div class="bucket" style="border-color:var(--red)" data-on-drop="rb1Drop" data-bucket="no">
              <h4>❌ Not a Robot</h4><div class="bucket-items" id="rb1-no"></div>
            </div>
          </div>
          <div class="feedback" id="rb1-fb"></div>
          <button class="btn-check" onclick="rb1Check()">Check ✓</button>
        </div>
        <div class="activity">
          <h3>💡 The 3 Rules of Robots</h3>
          <div class="card-grid">
            <div class="flip-card" onclick="this.classList.toggle('flipped')"><div class="flip-card-inner"><div class="flip-card-front"><span class="emoji">👁️</span><h4>1. SENSE</h4></div><div class="flip-card-back"><h5>Sense</h5><p>Robots use sensors (cameras, microphones, touch) to detect the world around them.</p></div></div></div>
            <div class="flip-card" onclick="this.classList.toggle('flipped')"><div class="flip-card-inner"><div class="flip-card-front"><span class="emoji">🧠</span><h4>2. THINK</h4></div><div class="flip-card-back"><h5>Think</h5><p>A computer brain processes sensor data and decides what to do next.</p></div></div></div>
            <div class="flip-card" onclick="this.classList.toggle('flipped')"><div class="flip-card-inner"><div class="flip-card-front"><span class="emoji">⚡</span><h4>3. ACT</h4></div><div class="flip-card-back"><h5>Act</h5><p>Motors, speakers, or lights carry out the robot's decisions in the real world.</p></div></div></div>
          </div>
        </div>
      `;
      const items = [
        {name:'🤖 Roomba Vacuum', robot:true},{name:'🚗 Self-Driving Car', robot:true},
        {name:'💡 Regular Light Bulb', robot:false},{name:'🤖 Mars Rover', robot:true},
        {name:'🧸 Teddy Bear', robot:false},{name:'🦾 Factory Arm', robot:true},
        {name:'📖 Book', robot:false},{name:'🐶 Robot Dog (Spot)', robot:true},
        {name:'🚲 Bicycle', robot:false},{name:'🏥 Surgery Robot', robot:true}
      ];
      const cont = document.getElementById('rb1-items');
      items.sort(() => Math.random() - 0.5).forEach((item, i) => {
        const el = document.createElement('div');
        el.className = 'drag-item';
        el.textContent = item.name;
        el.dataset.value = item.robot ? 'yes' : 'no';
        cont.appendChild(el);
        initDrag(el);
      });
      window.rb1Placed = {};
    },

    // Ch2: Robot Senses (Sensors)
    function(area) {
      area.innerHTML = `
        <h2>👁️ Robot Senses (Sensors)</h2>
        <p class="lesson-desc">Robots "sense" the world using sensors — special devices that detect light, sound, distance, temperature, and more. Let's match sensors to situations!</p>
        <div class="activity">
          <h3>🎯 Activity: Match the Sensor!</h3>
          <p class="instructions">Drag each sensor to the situation where it would be used!</p>
          <div class="drag-zone" id="rb2-sensors"></div>
          <div id="rb2-situations" style="display:grid;gap:12px;margin:16px 0"></div>
          <div class="feedback" id="rb2-fb"></div>
        </div>
      `;
      const matches = [
        {sensor:'📷 Camera',situation:'A robot needs to recognize faces',emoji:'👤'},
        {sensor:'🎤 Microphone',situation:'A robot needs to hear voice commands',emoji:'🗣️'},
        {sensor:'📏 Distance Sensor',situation:'A robot needs to avoid walls',emoji:'🧱'},
        {sensor:'🌡️ Temperature Sensor',situation:'A robot checks if food is cooked',emoji:'🍳'},
        {sensor:'👆 Touch Sensor',situation:'A robot detects when someone presses a button',emoji:'🔘'}
      ];
      const sensorCont = document.getElementById('rb2-sensors');
      const sitCont = document.getElementById('rb2-situations');
      window.rb2Matched = 0;
      [...matches].sort(() => Math.random() - 0.5).forEach(m => {
        const el = document.createElement('div');
        el.className = 'drag-item';
        el.textContent = m.sensor;
        el.dataset.value = m.sensor;
        sensorCont.appendChild(el);
        initDrag(el);
      });
      matches.forEach(m => {
        const zone = document.createElement('div');
        zone.className = 'drag-zone';
        zone.dataset.onDrop = 'rb2Drop';
        zone.dataset.answer = m.sensor;
        zone.innerHTML = `<span class="drag-zone-label">${m.emoji} ${m.situation}</span>`;
        sitCont.appendChild(zone);
      });
    },

    // Ch3: Robot Brain (How They Think)
    function(area) {
      area.innerHTML = `
        <h2>🧠 Robot Brain (How They Think)</h2>
        <p class="lesson-desc">Robots think using simple rules: IF something happens, THEN do this, ELSE do that. Let's build a robot brain using visual logic blocks!</p>
        <div class="activity">
          <h3>🧩 Activity: Build Robot Logic!</h3>
          <p class="instructions">Drag blocks to build the robot's decision-making rules. Make the robot navigate around obstacles!</p>
          <div class="block-palette" id="rb3-palette"></div>
          <p style="font-size:.85rem;color:var(--text3);margin:8px 0">Drop blocks here to build your logic:</p>
          <div class="flowchart-area" id="rb3-flow" data-on-drop="rb3Drop"></div>
          <div class="feedback" id="rb3-fb"></div>
          <button class="btn-check" onclick="rb3Check()">Test Logic ✓</button>
        </div>
      `;
      const blocks = [
        {text:'IF obstacle ahead', type:'block-if'},
        {text:'THEN turn right', type:'block-then'},
        {text:'ELSE go forward', type:'block-else'},
        {text:'IF path clear', type:'block-if'},
        {text:'THEN go forward', type:'block-then'},
        {text:'ELSE stop', type:'block-else'}
      ];
      const palette = document.getElementById('rb3-palette');
      window.rb3Blocks = [];
      blocks.forEach((b, i) => {
        const el = document.createElement('div');
        el.className = `block ${b.type}`;
        el.textContent = b.text;
        el.dataset.value = b.text;
        el.dataset.id = i;
        palette.appendChild(el);
        initDrag(el);
      });
    },

    // Ch4: Robot Movement
    function(area) {
      area.innerHTML = `
        <h2>🕹️ Robot Movement</h2>
        <p class="lesson-desc">Let's program a robot to navigate through a maze using command blocks! No typing — just drag arrows!</p>
        <div class="activity">
          <h3>🤖 Activity: Navigate the Maze!</h3>
          <p class="instructions">Use the arrow buttons to build a path. Then hit RUN to watch your robot go!</p>
          <div id="rb4-maze" class="maze-grid" style="grid-template-columns:repeat(7,40px)"></div>
          <div class="command-builder">
            <div class="cmd-block" onclick="rb4Add('↑')">⬆️</div>
            <div class="cmd-block" onclick="rb4Add('↓')">⬇️</div>
            <div class="cmd-block" onclick="rb4Add('←')">⬅️</div>
            <div class="cmd-block" onclick="rb4Add('→')">➡️</div>
            <div class="cmd-block" style="background:rgba(239,68,68,0.2);border-color:var(--red)" onclick="rb4Clear()">🗑️</div>
          </div>
          <div class="command-sequence" id="rb4-seq"></div>
          <button class="btn-check" onclick="rb4Run()">▶️ Run Program!</button>
          <div class="feedback" id="rb4-fb"></div>
        </div>
      `;
      // Simple maze: 0=path, 1=wall, 2=robot start, 3=goal
      const maze = [
        [1,1,1,1,1,1,1],
        [1,2,0,0,1,0,1],
        [1,1,1,0,1,0,1],
        [1,0,0,0,0,0,1],
        [1,0,1,1,1,0,1],
        [1,0,0,0,0,3,1],
        [1,1,1,1,1,1,1]
      ];
      const mazeEl = document.getElementById('rb4-maze');
      window.rb4Maze = maze;
      window.rb4Robot = {r:1,c:1};
      window.rb4Goal = {r:5,c:5};
      window.rb4Cmds = [];
      function renderMaze() {
        mazeEl.innerHTML = '';
        maze.forEach((row,r) => row.forEach((cell,c) => {
          const el = document.createElement('div');
          el.className = `maze-cell ${cell===1?'maze-wall':window.rb4Robot.r===r&&window.rb4Robot.c===c?'maze-robot':r===5&&c===5?'maze-goal':'maze-path'}`;
          el.textContent = window.rb4Robot.r===r&&window.rb4Robot.c===c?'🤖':r===5&&c===5?'🏁':'';
          mazeEl.appendChild(el);
        }));
      }
      renderMaze();
      window.rb4Render = renderMaze;
      window.rb4Add = function(dir) {
        if (window.rb4Cmds.length >= 20) return;
        window.rb4Cmds.push(dir);
        const seq = document.getElementById('rb4-seq');
        const el = document.createElement('div');
        el.className = 'cmd-placed';
        el.textContent = dir;
        seq.appendChild(el);
      };
      window.rb4Clear = function() {
        window.rb4Cmds = [];
        document.getElementById('rb4-seq').innerHTML = '';
        window.rb4Robot = {r:1,c:1};
        renderMaze();
      };
      window.rb4Run = async function() {
        window.rb4Robot = {r:1,c:1};
        renderMaze();
        for (let i = 0; i < window.rb4Cmds.length; i++) {
          const cmd = window.rb4Cmds[i];
          let nr = window.rb4Robot.r, nc = window.rb4Robot.c;
          if (cmd==='↑') nr--; if (cmd==='↓') nr++; if (cmd==='←') nc--; if (cmd==='→') nc++;
          if (maze[nr]?.[nc] !== 1 && maze[nr]?.[nc] !== undefined) {
            window.rb4Robot = {r:nr, c:nc};
          }
          renderMaze();
          await new Promise(r => setTimeout(r, 300));
          if (window.rb4Robot.r===5 && window.rb4Robot.c===5) {
            showFeedback(document.getElementById('rb4-fb').parentElement, 'success', '🎉 The robot reached the goal! Amazing programming!');
            addPoints(20);
            setTimeout(completeChapter, 1000);
            return;
          }
        }
        showFeedback(document.getElementById('rb4-fb').parentElement, 'error', '💡 Hint: Look at where the goal 🎯 is on the grid! Count the squares: how many steps RIGHT and how many steps DOWN does the robot need? Avoid walls (dark squares)! Try breaking it into small moves — first go right, then go down. Use REPEAT blocks if you need to go the same direction multiple times. You got this! 🤖');
      };
    },

    // Ch5: Types of Robots
    function(area) {
      area.innerHTML = `
        <h2>🦾 Types of Robots</h2>
        <p class="lesson-desc">Robots come in all shapes and sizes! Each type is designed for a specific job. Let's explore!</p>
        <div class="activity">
          <h3>🔍 Explore Robot Types!</h3>
          <p class="instructions">Tap each card to learn about different robots!</p>
          <div class="card-grid" id="rb5-cards"></div>
        </div>
        <div class="activity">
          <h3>🎯 Activity: Match Robot to Job!</h3>
          <div class="drag-zone" id="rb5-robots"></div>
          <div id="rb5-jobs" style="display:grid;gap:12px;margin:16px 0"></div>
          <div class="feedback" id="rb5-fb"></div>
        </div>
      `;
      const types = [
        {emoji:'🦾',name:'Industrial Arm',desc:'Builds cars, welds metal, paints — does repetitive factory work 24/7!'},
        {emoji:'🚁',name:'Drone',desc:'Flies and takes photos, delivers packages, helps farmers check crops!'},
        {emoji:'🤖',name:'Humanoid',desc:'Walks on two legs, can interact with humans. Used in research and entertainment!'},
        {emoji:'🐠',name:'Underwater ROV',desc:'Explores deep oceans, fixes undersea cables, studies marine life!'},
        {emoji:'🏥',name:'Medical Robot',desc:'Helps surgeons with super-precise operations. Can work through tiny incisions!'}
      ];
      const cardGrid = document.getElementById('rb5-cards');
      types.forEach(t => {
        cardGrid.innerHTML += `<div class="flip-card" onclick="this.classList.toggle('flipped')"><div class="flip-card-inner"><div class="flip-card-front"><span class="emoji">${t.emoji}</span><h4>${t.name}</h4></div><div class="flip-card-back"><h5>${t.name}</h5><p>${t.desc}</p></div></div></div>`;
      });
      // Match game
      const matches = [
        {robot:'🦾 Industrial Arm',job:'Welding car parts in a factory',emoji:'🏭'},
        {robot:'🚁 Drone',job:'Delivering a package to your door',emoji:'📦'},
        {robot:'🏥 Medical Robot',job:'Helping a surgeon with a delicate operation',emoji:'⚕️'},
        {robot:'🐠 Underwater ROV',job:'Exploring the bottom of the ocean',emoji:'🌊'}
      ];
      const robotCont = document.getElementById('rb5-robots');
      const jobsCont = document.getElementById('rb5-jobs');
      window.rb5Matched = 0;
      [...matches].sort(() => Math.random() - 0.5).forEach(m => {
        const el = document.createElement('div');
        el.className = 'drag-item';
        el.textContent = m.robot;
        el.dataset.value = m.robot;
        robotCont.appendChild(el);
        initDrag(el);
      });
      matches.forEach(m => {
        const zone = document.createElement('div');
        zone.className = 'drag-zone';
        zone.dataset.onDrop = 'rb5Drop';
        zone.dataset.answer = m.robot;
        zone.innerHTML = `<span class="drag-zone-label">${m.emoji} ${m.job}</span>`;
        jobsCont.appendChild(zone);
      });
    },

    // Ch6: Robots & AI Together
    function(area) {
      area.innerHTML = `
        <h2>🤝 Robots & AI Together</h2>
        <p class="lesson-desc">When you give a robot AI, it becomes SMART! Instead of just following rules, it can learn, recognize things, and make better decisions. Let's see how!</p>
        <div class="activity">
          <h3>🎯 Activity: Teach the Robot to See!</h3>
          <p class="instructions">Drag training images to teach the robot what each object is. The more examples, the smarter it gets!</p>
          <div class="drag-zone" id="rb6-images"></div>
          <div class="buckets">
            <div class="bucket" style="border-color:var(--cyan)" data-on-drop="rb6Drop" data-bucket="apple">
              <h4>🍎 Apple</h4><div class="bucket-items" id="rb6-apple"></div>
            </div>
            <div class="bucket" style="border-color:var(--purple)" data-on-drop="rb6Drop" data-bucket="banana">
              <h4>🍌 Banana</h4><div class="bucket-items" id="rb6-banana"></div>
            </div>
          </div>
          <div id="rb6-robot-view" style="text-align:center;margin:20px 0">
            <p>🤖 Robot's AI accuracy: <strong id="rb6-accuracy">0%</strong></p>
            <div class="weight-bar"><div class="weight-fill" id="rb6-acc-fill" style="width:0;background:var(--cyan)"></div></div>
          </div>
          <div class="feedback" id="rb6-fb"></div>
        </div>
      `;
      const images = [
        {name:'🍎 Red Apple',type:'apple'},{name:'🍏 Green Apple',type:'apple'},
        {name:'🍌 Yellow Banana',type:'banana'},{name:'🍎 Big Apple',type:'apple'},
        {name:'🍌 Small Banana',type:'banana'},{name:'🍌 Ripe Banana',type:'banana'}
      ];
      const cont = document.getElementById('rb6-images');
      window.rb6Correct = 0;
      window.rb6Total = 0;
      images.sort(() => Math.random() - 0.5).forEach((img, i) => {
        const el = document.createElement('div');
        el.className = 'drag-item';
        el.textContent = img.name;
        el.dataset.value = img.type;
        cont.appendChild(el);
        initDrag(el);
      });
    },

    // Ch7: Robot Ethics
    function(area) {
      area.innerHTML = `
        <h2>⚖️ Robot Ethics</h2>
        <p class="lesson-desc">As robots become smarter, they face tough decisions. Should a delivery robot stop to help someone who fell? Let's think about these important questions!</p>
        <div class="activity">
          <h3>🤔 Activity: What Should the Robot Do?</h3>
          <div id="rb7-scenarios"></div>
        </div>
      `;
      const scenarios = [
        {title:'🏥 The Medicine Delivery', situation:'A robot is delivering urgent medicine to a hospital. On the way, it sees an elderly person who has fallen. What should the robot do?',
          options:[
            {text:'🏃 Keep delivering — the medicine is urgent!',feedback:'The medicine could save a life, but the fallen person needs help too. There\'s no perfect answer, but the robot should alert emergency services while continuing.', points:8},
            {text:'🤝 Stop and help the person, alert emergency services',feedback:'Great compassion! But what about the urgent medicine? Best answer: alert emergency services AND continue the delivery.', points:8},
            {text:'📡 Alert emergency services AND continue delivery',feedback:'Excellent thinking! This balances both needs. The robot helps by calling for help while completing its important mission!', points:15}
          ]},
        {title:'🏠 The Privacy Question', situation:'A home robot with cameras sees a teenager sneaking cookies at midnight. Should it tell the parents?',
          options:[
            {text:'📸 Yes, report everything it sees',feedback:'But what about privacy? Should robots monitor everything? This could feel like spying.', points:5},
            {text:'🤫 No, some things should stay private',feedback:'Privacy matters! Robots shouldn\'t be surveillance tools. But what if it was something dangerous?', points:8},
            {text:'⚖️ Only report safety concerns, not harmless things',feedback:'Perfect balance! Robots should protect privacy but still watch for real dangers. Eating cookies at midnight? Not a safety issue! 😄', points:15}
          ]},
        {title:'🎨 The Creative Robot', situation:'An art robot can paint pictures that look exactly like famous artists. A gallery wants to sell them as "original AI art." Is this okay?',
          options:[
            {text:'✅ Sure, AI made them so they\'re original',feedback:'But the AI learned by copying human artists. Is it fair to the original artists whose style is being copied?', points:5},
            {text:'⚖️ Only if they credit the artists who inspired the AI',feedback:'Excellent! Giving credit is important. AI art builds on human creativity — we should acknowledge that.', points:15},
            {text:'❌ No, only humans can make real art',feedback:'Many people feel this way! But AI tools are changing how we think about creativity. The key is being honest about how art is made.', points:8}
          ]}
      ];
      const cont = document.getElementById('rb7-scenarios');
      window.rb7Done = 0;
      scenarios.forEach((s, si) => {
        const div = document.createElement('div');
        div.style.cssText = 'margin:20px 0;padding:24px;background:rgba(0,0,0,0.2);border-radius:16px;';
        div.innerHTML = `<h4 style="margin-bottom:8px">${s.title}</h4><p style="color:var(--text2);margin-bottom:14px">${s.situation}</p><div class="choice-cards" id="rb7-s${si}"></div><div class="feedback" id="rb7-fb${si}"></div>`;
        cont.appendChild(div);
        s.options.forEach(o => {
          const card = document.createElement('div');
          card.className = 'choice-card';
          card.innerHTML = `<p>${o.text}</p>`;
          card.onclick = () => {
            div.querySelectorAll('.choice-card').forEach(c => c.style.pointerEvents = 'none');
            card.classList.add('selected');
            showFeedback(div, 'info', o.feedback);
            addPoints(o.points);
            window.rb7Done++;
            if (window.rb7Done >= 3) setTimeout(completeChapter, 1500);
          };
          div.querySelector(`#rb7-s${si}`).appendChild(card);
        });
      });
    },

    // Ch8: Design Your Robot
    function(area) {
      area.innerHTML = `
        <h2>🏗️ Design Your Robot — Capstone!</h2>
        <p class="lesson-desc">Time to design YOUR dream robot! Pick a body, add sensors, give it rules, and name it!</p>
        <div class="activity">
          <h3>🤖 Step 1: Choose a Body</h3>
          <div class="choice-cards" id="rb8-body"></div>
        </div>
        <div class="activity" id="rb8-step2" style="display:none">
          <h3>👁️ Step 2: Add Sensors</h3>
          <p class="instructions">Pick at least 2 sensors for your robot:</p>
          <div class="choice-cards" id="rb8-sensors"></div>
        </div>
        <div class="activity" id="rb8-step3" style="display:none">
          <h3>🧠 Step 3: Set the Rules</h3>
          <p class="instructions">What should your robot do? Pick its mission:</p>
          <div class="choice-cards" id="rb8-mission"></div>
        </div>
        <div class="activity" id="rb8-step4" style="display:none">
          <h3>✏️ Step 4: Name Your Robot!</h3>
          <input class="wizard-input" id="rb8-name" placeholder="Give your robot a name!" maxlength="20">
          <button class="btn-check" onclick="rb8Finish()">Create Robot! 🤖</button>
        </div>
        <div id="rb8-result" style="display:none"></div>
      `;
      window.rb8State = {body:null,sensors:[],mission:null};
      // Bodies
      const bodies = [
        {emoji:'🤖',name:'Humanoid',desc:'Walks on 2 legs'},
        {emoji:'🚗',name:'Wheeled',desc:'Rolls on wheels'},
        {emoji:'🚁',name:'Flying Drone',desc:'Flies with propellers'},
        {emoji:'🐶',name:'Animal-shaped',desc:'4 legs like a dog'}
      ];
      const bodyCont = document.getElementById('rb8-body');
      bodies.forEach(b => {
        const card = document.createElement('div');
        card.className = 'choice-card';
        card.innerHTML = `<span class="emoji">${b.emoji}</span><p><strong>${b.name}</strong></p><p style="font-size:.8rem;color:var(--text2)">${b.desc}</p>`;
        card.onclick = () => {
          bodyCont.querySelectorAll('.choice-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          window.rb8State.body = b;
          document.getElementById('rb8-step2').style.display = '';
          addPoints(5);
        };
        bodyCont.appendChild(card);
      });
      // Sensors
      const sensors = ['📷 Camera','🎤 Microphone','📏 Distance','🌡️ Temperature','👆 Touch','🧭 GPS'];
      setTimeout(() => {
        const sensCont = document.getElementById('rb8-sensors');
        let sensCount = 0;
        sensors.forEach(s => {
          const card = document.createElement('div');
          card.className = 'choice-card';
          card.innerHTML = `<p>${s}</p>`;
          card.onclick = () => {
            card.classList.toggle('selected');
            if (card.classList.contains('selected')) { window.rb8State.sensors.push(s); sensCount++; addPoints(3); }
            else { window.rb8State.sensors = window.rb8State.sensors.filter(x=>x!==s); sensCount--; }
            if (sensCount >= 2) document.getElementById('rb8-step3').style.display = '';
          };
          sensCont.appendChild(card);
        });
        // Missions
        const missions = [
          {emoji:'🏠',name:'Home Helper',desc:'Cleans, cooks, organizes'},
          {emoji:'🌊',name:'Ocean Explorer',desc:'Discovers underwater life'},
          {emoji:'🏥',name:'Medical Assistant',desc:'Helps doctors and patients'},
          {emoji:'🌱',name:'Garden Farmer',desc:'Grows and harvests plants'}
        ];
        const missCont = document.getElementById('rb8-mission');
        missions.forEach(m => {
          const card = document.createElement('div');
          card.className = 'choice-card';
          card.innerHTML = `<span class="emoji">${m.emoji}</span><p><strong>${m.name}</strong></p><p style="font-size:.8rem;color:var(--text2)">${m.desc}</p>`;
          card.onclick = () => {
            missCont.querySelectorAll('.choice-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            window.rb8State.mission = m;
            document.getElementById('rb8-step4').style.display = '';
            addPoints(5);
          };
          missCont.appendChild(card);
        });
      }, 100);
      window.rb8Finish = function() {
        const name = document.getElementById('rb8-name').value.trim() || 'RoboFriend';
        const s = window.rb8State;
        const result = document.getElementById('rb8-result');
        result.style.display = '';
        result.innerHTML = `<div class="chapter-complete show">
          <span class="emoji" style="font-size:5rem">${s.body.emoji}</span>
          <h3 style="font-size:1.8rem;color:var(--cyan)">${name}</h3>
          <div class="glass" style="display:inline-block;padding:24px;text-align:left;max-width:400px;margin:16px 0">
            <p><strong>Body:</strong> ${s.body.name} ${s.body.emoji}</p>
            <p><strong>Sensors:</strong> ${s.sensors.join(', ')}</p>
            <p><strong>Mission:</strong> ${s.mission.emoji} ${s.mission.name}</p>
            <p style="margin-top:12px;color:var(--gold);font-style:italic">"${name} is ready to change the world!"</p>
          </div>
        </div>`;
        addPoints(20);
        setTimeout(completeChapter, 1000);
      };
    }
  ]
};

// ===== DROP HANDLERS =====

// Generic bucket drop handler
function handleBucketDrop(drag, zone, placedMap, containerPrefix) {
  const bucket = zone.dataset?.bucket || zone.closest('.bucket')?.dataset?.bucket;
  if (!bucket) return;
  const clone = drag.el.cloneNode(true);
  clone.style.opacity = '1';
  clone.classList.remove('drag-item');
  clone.style.cssText = 'padding:6px 12px;border-radius:8px;background:rgba(255,255,255,0.08);font-size:.8rem;margin:2px;';
  const itemsDiv = zone.querySelector('.bucket-items') || document.getElementById(`${containerPrefix}-${bucket}`);
  if (itemsDiv) itemsDiv.appendChild(clone);
  drag.el.classList.add('placed');
  if (placedMap) placedMap[drag.el.dataset.id || drag.el.textContent] = bucket;
}

// AI Ch1 drops
window.ai1Drop = function(drag, zone) { handleBucketDrop(drag, zone, window.ai1Placed, 'ai1'); };
window.ai1Check = function() {
  const items = document.querySelectorAll('#ai1-items .drag-item, #ai1-yes .drag-item, #ai1-no .drag-item, .bucket-items *');
  let allPlaced = document.querySelectorAll('#ai1-items .drag-item:not(.placed)').length === 0;
  if (!allPlaced) { showFeedback(document.querySelector('.activity'), 'error', 'Drag all items first!'); return; }
  addPoints(15);
  showFeedback(document.querySelector('.activity'), 'success', '🎉 Great job sorting! AI is in more things than you think — from voice assistants to game characters to search engines!');
  setTimeout(completeChapter, 1500);
};

// AI Ch2 drops
window.ai2SlotDrop = function(drag, zone) {
  const slot = zone.dataset.slot;
  zone.textContent = drag.el.textContent;
  zone.classList.add('filled');
  drag.el.classList.add('placed');
  window.ai2Slots[slot] = drag.el.dataset.value;
};
window.ai2Check = function() {
  const correct = Object.keys(window.ai2Slots).length === 5 &&
    Object.entries(window.ai2Slots).every(([k, v]) => k === v);
  if (Object.keys(window.ai2Slots).length < 5) { showFeedback(document.querySelector('.activity'), 'error', 'Fill all 5 slots!'); return; }
  if (correct) {
    showFeedback(document.querySelector('.activity'), 'success', '🎉 Perfect! AI learns step by step: Collect → Clean → Train → Test → Improve!');
    addPoints(15);
  } else {
    showFeedback(document.querySelector('.activity'), 'error', '💡 Hint: Think of teaching a pet! 1️⃣ Collect Data = gather examples (photos of cats & dogs) → 2️⃣ Clean Data = remove bad examples (blurry photos) → 3️⃣ Train Model = show examples repeatedly (this is a cat, this is a dog) → 4️⃣ Test = quiz time! (show new photos) → 5️⃣ Improve = fix mistakes and try again. The order matters! 🧠');
  }
};
window.ai2TrainDrop = function(drag, zone) { handleBucketDrop(drag, zone, window.ai2TrainPlaced, 'ai2'); };
window.ai2TrainCheck = function() {
  addPoints(10);
  showFeedback(document.querySelectorAll('.activity')[1], 'success', '🎉 You just trained an AI! The more examples you give, the better it gets. This is called "machine learning"!');
  setTimeout(completeChapter, 1500);
};

// AI Ch5 drops
window.ai5Drop = function(drag, zone) {
  const ci = zone.dataset.challenge;
  const label = zone.querySelector('.drag-zone-label');
  if (label) label.remove();
  const clone = drag.el.cloneNode(true);
  clone.style.cssText = 'padding:6px 12px;border-radius:8px;background:rgba(6,182,212,0.15);font-size:.85rem;margin:2px;display:inline-block;';
  zone.appendChild(clone);
  drag.el.classList.add('placed');
};
window.ai5Check = function(ci) {
  addPoints(10);
  showFeedback(document.getElementById(`ai5-fb-${ci}`).parentElement, 'success', `🎉 Great question building! "${window.ai5Challenges[ci].answer}" is SO much better than the boring version!`);
  window.ai5Done = (window.ai5Done || 0) + 1;
  if (window.ai5Done >= 3) setTimeout(completeChapter, 1000);
};

// AI Ch6 drops
window.ai6Drop = function(drag, zone) { handleBucketDrop(drag, zone, window.ai6Placed, 'ai6'); };
window.ai6Check = function() {
  addPoints(15);
  showFeedback(document.querySelector('.activity'), 'success', '🎉 Excellent fact-checking! Remember: AI can make mistakes. Always verify important information with trusted sources!');
  setTimeout(completeChapter, 1500);
};

// AI Ch8 drops
window.ai8RuleDrop = function(drag, zone) {
  const clone = drag.el.cloneNode(true);
  clone.style.cssText = 'padding:6px 12px;border-radius:8px;background:rgba(34,197,94,0.15);font-size:.85rem;margin:2px;display:inline-block;';
  zone.appendChild(clone);
  drag.el.classList.add('placed');
  window.ai8State.rules.push(drag.el.dataset.value);
  if (window.ai8State.rules.length >= 2) {
    document.getElementById('ai8-step3').style.display = '';
    addPoints(5);
  }
};
window.showAi8Result = function() {
  const s = window.ai8State;
  const result = document.getElementById('ai8-result');
  result.style.display = '';
  document.getElementById('ai8-card').innerHTML = `
    <h4 style="text-align:center;margin-bottom:12px">${s.job.emoji} ${s.job.name}</h4>
    <p><strong>Job:</strong> ${s.job.desc}</p>
    <p><strong>Rules:</strong></p><ul style="margin:4px 0 8px 16px">${s.rules.map(r => `<li style="font-size:.85rem">${r}</li>`).join('')}</ul>
    <p><strong>Never:</strong></p><ul style="margin:4px 0 8px 16px">${s.nevers.map(n => `<li style="font-size:.85rem">${n}</li>`).join('')}</ul>
    <p style="color:var(--gold);text-align:center;margin-top:12px">Designed by ${STATE.name || 'You'}! 🌟</p>
  `;
  setTimeout(completeChapter, 1000);
};

// Space Ch1 drops
window.sp1SlotDrop = function(drag, zone) {
  zone.textContent = drag.el.textContent;
  zone.classList.add('filled');
  drag.el.classList.add('placed');
  window.sp1Slots[zone.dataset.slot] = drag.el.dataset.value;
};
window.sp1Check = function() {
  if (Object.keys(window.sp1Slots).length < 8) { showFeedback(document.querySelectorAll('.activity')[1], 'error', 'Place all 8 planets!'); return; }
  const correct = Object.entries(window.sp1Slots).every(([k, v]) => k === v);
  if (correct) {
    showFeedback(document.querySelectorAll('.activity')[1], 'success', '🎉 Perfect! Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune! "My Very Excited Mother Just Served Us Nachos" 🌮');
    addPoints(20);
    setTimeout(completeChapter, 1500);
  } else {
    showFeedback(document.querySelectorAll('.activity')[1], 'error', '💡 Hint: Use this memory trick — "My Very Excited Mother Just Served Us Nachos"! Each first letter = a planet: Mercury (closest to Sun, tiny & hot), Venus (brightest, super hot), Earth (us!), Mars (red planet), Jupiter (HUGE gas giant), Saturn (rings!), Uranus (tilted sideways), Neptune (farthest, blue & cold). Try again! 🪐');
  }
};

// Space Ch2 drops
window.sp2SlotDrop = function(drag, zone) {
  zone.textContent = drag.el.textContent;
  zone.classList.add('filled');
  drag.el.classList.add('placed');
  window.sp2Slots[zone.dataset.slot] = drag.el.dataset.value;
};
window.sp2Check = function() {
  if (Object.keys(window.sp2Slots).length < 5) { showFeedback(document.querySelector('.activity'), 'error', 'Place all stages!'); return; }
  const correct = Object.entries(window.sp2Slots).every(([k, v]) => k === v);
  if (correct) {
    showFeedback(document.querySelector('.activity'), 'success', '🎉 Perfect! Nebula → Protostar → Main Sequence → Red Giant → Supernova! Stars are amazing!');
    addPoints(15);
    setTimeout(completeChapter, 1500);
  } else {
    showFeedback(document.querySelector('.activity'), 'error', '💡 Hint: Think of a star\'s life like growing up! 1️⃣ Nebula = baby (cloud of gas & dust) → 2️⃣ Protostar = toddler (gravity pulls gas together, gets warm) → 3️⃣ Main Sequence = adult (shining bright, fusing hydrogen) → 4️⃣ Red Giant = old age (expands huge, turns red) → 5️⃣ Supernova = dramatic ending (BOOM! Explodes brilliantly). Try again! ⭐');
  }
};

// Space Ch3 drops
window.sp3Drop = function(drag, zone) {
  zone.innerHTML = drag.el.innerHTML;
  zone.classList.add('filled');
  drag.el.classList.add('placed');
  window.sp3Filled++;
  if (window.sp3Filled >= 5) document.getElementById('sp3-launch').style.display = '';
};
window.sp3Launch = function() {
  const rocket = document.querySelector('.rocket-frame');
  addPoints(20);
  gsap.to(rocket, {y: -500, opacity: 0, duration: 2, ease: 'power2.in'});
  showFeedback(document.querySelector('.activity'), 'success', '🚀 LAUNCH SUCCESSFUL! 3... 2... 1... LIFTOFF! Your rocket is heading to space!');
  setTimeout(completeChapter, 2500);
};

// Space Ch4 drops
window.sp4Drop = function(drag, zone) {
  try {
    const item = JSON.parse(drag.el.dataset.value);
    if (window.sp4Weight + item.w > 1000) {
      showFeedback(zone.parentElement, 'error', `💡 Too heavy! ${item.name} weighs ${item.w}kg and would exceed the 1000kg limit! Current cargo: ${window.sp4Weight}kg. You have ${1000 - window.sp4Weight}kg left. Tip: Prioritize essentials first (food, water, oxygen, tools, solar panels), then add extras if you have room! Real Mars missions face this exact challenge! 🚀`);
      return;
    }
    window.sp4Weight += item.w;
    window.sp4Cargo.push(item);
    const clone = document.createElement('div');
    clone.style.cssText = 'padding:6px 10px;border-radius:8px;background:rgba(6,182,212,0.15);font-size:.8rem;display:inline-block;margin:2px;';
    clone.textContent = `${item.name} (${item.w}kg)`;
    document.getElementById('sp4-cargo-items').appendChild(clone);
    drag.el.classList.add('placed');
    const pct = (window.sp4Weight / 1000 * 100);
    document.getElementById('sp4-weight-fill').style.width = pct + '%';
    document.getElementById('sp4-weight-fill').style.background = pct > 90 ? 'var(--red)' : pct > 70 ? 'var(--gold)' : 'var(--green)';
    document.getElementById('sp4-weight-text').textContent = `${window.sp4Weight} / 1000 kg`;
  } catch(e) {}
};
window.sp4Check = function() {
  const essentials = window.sp4Cargo.filter(c => c.essential).length;
  const totalEssential = 7;
  if (essentials >= 5) {
    showFeedback(document.querySelector('.activity'), 'success', `🚀 Mission approved! You packed ${window.sp4Cargo.length} items (${window.sp4Weight}kg). ${essentials >= totalEssential ? 'ALL essentials included — perfect planning!' : 'Most essentials covered — your crew will survive!'}`);
    addPoints(20);
    setTimeout(completeChapter, 1500);
  } else {
    showFeedback(document.querySelector('.activity'), 'error', `💡 Your crew needs more essentials! For a Mars mission, you MUST pack: 🍞 Food (astronauts need ~2kg/day), 💧 Water (most critical!), 🫁 Oxygen (can't breathe Mars air!), 🔧 Tools (for repairs), ☀️ Solar Panels (power source). These are non-negotiable — without ANY of these, the mission fails. Remove some fun items and add the essentials! 🚀`);
  }
};

// Space Ch6 drops
window.sp6Drop = function(drag, zone) {
  if (drag.el.dataset.value === zone.dataset.answer) {
    zone.innerHTML = `<span class="drag-zone-label" style="color:var(--green)">✅ ${drag.el.textContent}</span>`;
    zone.style.borderColor = 'var(--green)';
    zone.style.borderStyle = 'solid';
    drag.el.classList.add('placed');
    window.sp6Matched++;
    addPoints(8);
    if (window.sp6Matched >= 4) {
      showFeedback(document.querySelector('.activity'), 'success', '🎉 All matched! AI is essential for space exploration — from driving rovers to finding new planets!');
      setTimeout(completeChapter, 1000);
    }
  } else {
    zone.classList.add('wrong');
    setTimeout(() => zone.classList.remove('wrong'), 500);
  }
};

// Space Ch8 crew drop
window.sp8CrewDrop = function(drag, zone) {
  if (window.sp8State.crew.length >= 4) return;
  const clone = drag.el.cloneNode(true);
  clone.style.cssText = 'padding:6px 12px;border-radius:8px;background:rgba(6,182,212,0.15);font-size:.85rem;margin:2px;display:inline-block;';
  zone.appendChild(clone);
  drag.el.classList.add('placed');
  window.sp8State.crew.push(drag.el.dataset.value);
  addPoints(3);
  if (window.sp8State.crew.length >= 3) document.getElementById('sp8-step3').style.display = '';
};

// Robotics Ch1 drops
window.rb1Drop = function(drag, zone) { handleBucketDrop(drag, zone, window.rb1Placed, 'rb1'); };
window.rb1Check = function() {
  addPoints(15);
  showFeedback(document.querySelector('.activity'), 'success', '🎉 Great sorting! Remember: a robot must be able to SENSE, THINK, and ACT. A bicycle can\'t think or sense!');
  setTimeout(completeChapter, 1500);
};

// Robotics Ch2 drops
window.rb2Drop = function(drag, zone) {
  if (drag.el.dataset.value === zone.dataset.answer) {
    zone.innerHTML = `<span class="drag-zone-label" style="color:var(--green)">✅ ${drag.el.textContent}</span>`;
    zone.style.borderColor = 'var(--green)';
    zone.style.borderStyle = 'solid';
    drag.el.classList.add('placed');
    window.rb2Matched++;
    addPoints(8);
    if (window.rb2Matched >= 5) {
      showFeedback(document.querySelector('.activity'), 'success', '🎉 Perfect matching! Robots use many different sensors to understand the world around them!');
      setTimeout(completeChapter, 1000);
    }
  }
};

// Robotics Ch3 drops
window.rb3Drop = function(drag, zone) {
  const clone = drag.el.cloneNode(true);
  clone.style.cssText = drag.el.style.cssText;
  clone.className = drag.el.className;
  zone.appendChild(clone);
  window.rb3Blocks.push(drag.el.dataset.value);
  drag.el.classList.add('placed');
  if (window.rb3Blocks.length >= 2) {
    const arrow = document.createElement('span');
    arrow.className = 'arrow';
    arrow.textContent = '→';
  }
};
window.rb3Check = function() {
  if (window.rb3Blocks.length >= 3) {
    addPoints(15);
    showFeedback(document.querySelector('.activity'), 'success', '🎉 Great logic building! IF-THEN-ELSE is how robots make decisions. You just programmed a robot brain!');
    setTimeout(completeChapter, 1500);
  } else {
    showFeedback(document.querySelector('.activity'), 'error', '💡 Hint: Robot brains use IF-THEN-ELSE logic! Think of it like this: IF (something happens) → THEN (do this) → ELSE (do that instead). Example: IF the robot sees a wall → THEN turn right → ELSE keep going forward. Drag at least 3 blocks: one IF condition, one THEN action, and one ELSE action. That\'s how ALL robots make decisions! 🤖');
  }
};

// Robotics Ch5 drops
window.rb5Drop = function(drag, zone) {
  if (drag.el.dataset.value === zone.dataset.answer) {
    zone.innerHTML = `<span class="drag-zone-label" style="color:var(--green)">✅ ${drag.el.textContent}</span>`;
    zone.style.borderColor = 'var(--green)';
    zone.style.borderStyle = 'solid';
    drag.el.classList.add('placed');
    window.rb5Matched++;
    addPoints(8);
    if (window.rb5Matched >= 4) {
      showFeedback(document.querySelectorAll('.activity')[1], 'success', '🎉 All matched! Each type of robot is specially designed for its job!');
      setTimeout(completeChapter, 1000);
    }
  }
};

// Robotics Ch6 drops
window.rb6Drop = function(drag, zone) {
  const bucket = zone.dataset?.bucket || zone.closest('.bucket')?.dataset?.bucket;
  if (!bucket) return;
  const correct = drag.el.dataset.value === bucket;
  window.rb6Total++;
  if (correct) window.rb6Correct++;
  handleBucketDrop(drag, zone, null, 'rb6');
  const acc = Math.round(window.rb6Correct / window.rb6Total * 100);
  document.getElementById('rb6-accuracy').textContent = acc + '%';
  document.getElementById('rb6-acc-fill').style.width = acc + '%';
  if (correct) addPoints(5);
  if (window.rb6Total >= 6) {
    showFeedback(document.querySelector('.activity'), 'success', `🎉 Your robot's AI is ${acc}% accurate! With more training data, AI gets even smarter. This is machine learning in action!`);
    setTimeout(completeChapter, 1500);
  }
};

// Make functions available globally (lesson generators reference these)
window.save = () => { /* React auto-saves state */ };
window.showFeedback = showFeedback;
window.initDrag = initDrag;
window.startDrag = startDrag;
window.moveDrag = moveDrag;
window.endDrag = endDrag;
window.handleBucketDrop = handleBucketDrop;

export { LESSONS, showFeedback, handleBucketDrop, initDrag, startDrag, moveDrag, endDrag };
