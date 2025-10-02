// LinguaLab Pro - App Logic (modular)
// Ensure you run via http://localhost:8000 (or any local server) due to ES Modules.

// ===== Firebase SDK (modular) via CDN imports =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// --- Firebase config ---
const firebaseConfig = {
  apiKey: "AIzaSyAVSux-JUn8tmQA5jqCy9clWzYRgBkNZwU",
  authDomain: "cl-english.firebaseapp.com",
  projectId: "cl-english",
  storageBucket: "cl-english.firebasestorage.app",
  messagingSenderId: "629186632292",
  appId: "1:629186632292:web:d65ddde473f771f0d35d71"
};

function scenarioIndex(id){ return LEARNING_PATH.findIndex(s=>s.id===id); }

function isUnlocked(id){
  // All lessons are unlocked (no prerequisite chaining)
  return true;
}

const appFB = initializeApp(firebaseConfig);
const auth = getAuth(appFB);
const db   = getFirestore(appFB);

// ===== Voiceflow project IDs =====
const VF_PROJECT = {
  // Everyday English (latest)
  'complaining': '68b7d8e3eaac078aee5e5ed4', // EE 07.02.25
  'suggestions-advice': '68b84ed7e5fbac7dac5f3a4d', // 2 in 1
  'shopping-enquiries': '68b7fceceaac078aee5e6849', // 2 in 1
  'hotel': '68b80716eaac078aee5e6cba',
  'gossip-personal': '68b84550e5fbac7dac5f36e6', // merged Gossiping/Changing Topics/Personal Experiences
  'small-talks': '689b0e5c3b90d9d386b4ba66',
  'ordering-food': '68985df43b90d9d386b3e573',
  'telephone-talk': '689af8fe3b90d9d386b4b1c9',
  'making-appointment': '689af5bc3b90d9d386b4b06f',
  'travel': '689b05df3b90d9d386b4b87f',

  // Workplace English (latest)
  'handle-complaints': '68b84c43e5fbac7dac5f3954',
  'speaking-politely': '68b84d37e5fbac7dac5f3970',
  'disagreements': '68b84e27e5fbac7dac5f3a1f',
  'feedback': '68b84ed7e5fbac7dac5f3a4d',
  'networking': '68de23845427f87add0e6761',
  'talking-prospects': '68de1f6c5427f87add0e6675',
  'negotiating': '689b32823b90d9d386b4c5e2',
  'interview': '689b2fa13b90d9d386b4c4f5',
  'presentation': '68b84b43e5fbac7dac5f3917'
,
  'freestyle': '68d7f93cb1c4c1f3c8575355'};

// ===== Learning path - Everyday English & Workplace English =====
const LEARNING_PATH = [
  // Everyday English (latest list)
  { id: 'complaining', title: 'Complaints & Compensation', desc: 'Express dissatisfaction and negotiate compensation professionally.', category: 'Everyday English' },
  { id: 'suggestions-advice', title: 'Suggestions & Advice', desc: 'Give and receive advice effectively in daily conversations.', category: 'Everyday English' },
  { id: 'shopping-enquiries', title: 'Shopping & Enquiries', desc: 'Ask questions and get information while shopping.', category: 'Everyday English' },
  { id: 'hotel', title: 'Hotel English', desc: 'Handle hotel bookings, requests, and issues confidently.', category: 'Everyday English' },
  { id: 'gossip-personal', title: 'Gossip & Changing Topics & Personal Experiences', desc: 'Navigate casual conversations, change topics, and describe experiences.', category: 'Everyday English' },
  { id: 'small-talks', title: 'Small Talk', desc: 'Start, maintain, and end small talk naturally.', category: 'Everyday English' },
  { id: 'ordering-food', title: 'Ordering Food', desc: 'Order food and drinks confidently.', category: 'Everyday English' },
  { id: 'telephone-talk', title: 'Telephone Conversations', desc: 'Make and receive calls politely and effectively.', category: 'Everyday English' },
  { id: 'making-appointment', title: 'Making Appointments', desc: 'Schedule and reschedule appointments.', category: 'Everyday English' },
  { id: 'travel', title: 'Travel', desc: 'Handle common travel situations with ease.', category: 'Everyday English' },
  { id: 'freestyle', title: 'Freestyle Practice', desc: 'Free conversation practice without a fixed scenario.', category: 'Everyday English' },
  
  // Workplace English (latest list)
  { id: 'handle-complaints', title: 'Handling Client Complaints & Issues', desc: 'Manage client complaints and resolve issues effectively.', category: 'Workplace English' },
  { id: 'speaking-politely', title: 'Speaking Politely (Making Requests)', desc: 'Use polite language and tone in professional settings.', category: 'Workplace English' },
  { id: 'disagreements', title: 'Managing Disagreements', desc: 'Express disagreement respectfully and find common ground.', category: 'Workplace English' },
  { id: 'feedback', title: 'Giving & Receiving Feedback', desc: 'Provide constructive feedback and receive criticism gracefully.', category: 'Workplace English' },
  { id: 'networking', title: 'Networking', desc: 'Build and maintain professional relationships.', category: 'Workplace English' },
  { id: 'talking-prospects', title: 'Talking to Prospects', desc: 'Speak effectively with potential clients and customers.', category: 'Workplace English' },
  { id: 'negotiating', title: 'Negotiating', desc: 'Negotiate terms and reach agreements professionally.', category: 'Workplace English' },
  { id: 'interview', title: 'Interview Skills', desc: 'Prepare for and handle job interviews.', category: 'Workplace English' },
  { id: 'presentation', title: 'Presentations', desc: 'Plan and deliver effective presentations.', category: 'Workplace English' },
];

// Icons for topics
const TOPIC_ICON = {
  // Everyday English
  'complaining': '😤',
  'suggestions-advice': '💡',
  'shopping-enquiries': '🛍️',
  'hotel': '🏨',
  'gossip-personal': '💬',
  'small-talks': '🗣️',
  'ordering-food': '🍽️',
  'telephone-talk': '📞',
  'making-appointment': '🗓️',
  'travel': '✈️',
  
  // Workplace English
  'handle-complaints': '📞',
  'speaking-politely': '🎩',
  'disagreements': '⚖️',
  'feedback': '📝',
  'networking': '🤝',
  'talking-prospects': '💼',
  'negotiating': '🤝',
  'interview': '🎯',
  'presentation': '📊',
  'freestyle': '🪄'

};

// Curated free icons (Lucide static SVGs)
const TOPIC_IMG = {
  // Everyday English
  'complaining': 'https://unpkg.com/lucide-static@latest/icons/frown.svg',
  'suggestions-advice': 'https://unpkg.com/lucide-static@latest/icons/lightbulb.svg',
  'shopping-enquiries': 'https://unpkg.com/lucide-static@latest/icons/shopping-bag.svg',
  'hotel': 'https://unpkg.com/lucide-static@latest/icons/building.svg',
  'gossip-personal': 'https://unpkg.com/lucide-static@latest/icons/messages-square.svg',
  'small-talks': 'https://unpkg.com/lucide-static@latest/icons/message-circle.svg',
  'ordering-food': 'https://unpkg.com/lucide-static@latest/icons/utensils.svg',
  'telephone-talk': 'https://unpkg.com/lucide-static@latest/icons/phone.svg',
  'making-appointment': 'https://unpkg.com/lucide-static@latest/icons/calendar.svg',
  'travel': 'https://unpkg.com/lucide-static@latest/icons/plane.svg',
  
  // Workplace English
  'handle-complaints': 'https://unpkg.com/lucide-static@latest/icons/phone-call.svg',
  'speaking-politely': 'https://unpkg.com/lucide-static@latest/icons/smile.svg',
  'disagreements': 'https://unpkg.com/lucide-static@latest/icons/scale.svg',
  'feedback': 'https://unpkg.com/lucide-static@latest/icons/edit-3.svg',
  'networking': 'https://unpkg.com/lucide-static@latest/icons/network.svg',
  'talking-prospects': 'https://unpkg.com/lucide-static@latest/icons/briefcase.svg',
  'negotiating': 'https://unpkg.com/lucide-static@latest/icons/handshake.svg',
  'interview': 'https://unpkg.com/lucide-static@latest/icons/user-check.svg',
  'presentation': 'https://unpkg.com/lucide-static@latest/icons/presentation.svg',
  'freestyle': 'https://unpkg.com/lucide-static@latest/icons/wand.svg'};

// ===== State =====
const state = {
  uid: null,
  name: localStorage.getItem('ll_name') || '',
  points: Number(localStorage.getItem('ll_points') || 0),
  completedCount: Number(localStorage.getItem('ll_completed') || 0),
  lastScenario: localStorage.getItem('ll_lastScenario') || '',
  streak: Number(localStorage.getItem('ll_streak') || 0),
  sessionStart: 0, timerId: null,
};

// Initialize completedList from localStorage (must occur after state is declared)
try {
  const savedList = localStorage.getItem('ll_completedList');
  state.completedList = savedList ? JSON.parse(savedList) : [];
  if (!Array.isArray(state.completedList)) state.completedList = [];
} catch { state.completedList = []; }

// ===== Helpers =====
const $ = (id)=> document.getElementById(id);
const pad = n => String(n).padStart(2,'0');
function fmtDate(d){ return d.toISOString().slice(0,10); }

function persistLocal(){
  localStorage.setItem('ll_name', state.name);
  localStorage.setItem('ll_points', String(state.points));
  localStorage.setItem('ll_completed', String(state.completedCount));
  localStorage.setItem('ll_lastScenario', state.lastScenario);
  localStorage.setItem('ll_streak', String(state.streak));
  localStorage.setItem('ll_completedList', JSON.stringify(state.completedList || []));
}

let saveTimer = null;
async function persistCloud(){
  if (!state.uid) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async ()=>{
    try{
      await setDoc(doc(db,'users',state.uid),{
        name: state.name, points: state.points, completedCount: state.completedCount,
        lastScenario: state.lastScenario, streak: state.streak, completedList: state.completedList || [], updatedAt: serverTimestamp(),
      },{ merge:true });
    }catch(e){ console.warn('save failed', e); }
  }, 250);
}

// ===== UI elements (per current index.html) =====
const el = {
  app: $('app'), authScreen: $('authScreen'),
  points: $('pointsDisplay'), streak: $('streakDisplay'), completed: $('completedDisplay'),
  levelFill: $('progressFill'), level: $('levelDisplay'), nextLevel: $('nextLevelPoints'),
  startBtn: $('startBtn'), resumeBtn: $('resumeBtn'), resetBtn: $('resetBtn'),
  dailyStatus: $('dailyStatus'), weeklyStatus: $('weeklyStatus'),
  learningPath: $('learningPath'),
  // modal
  backdrop: $('practiceModal'), title: $('practiceTitle'), desc: $('practiceDescription'),
  frame: $('practiceFrame'), timer: $('modalTimer'),
  closeBtn: $('closePracticeBtn'), completeBtn: $('completeBtn'), openChatBtn: $('openChatBtn'),
  // auth
  authName: $('authName'), authEmail: $('authEmail'), authPass: $('authPassword'),
  authError: $('authError'),
  loginBtn: $('loginBtn'), signupBtn: $('signupBtn'), logoutBtn: $('logoutBtn'),
  // misc
  toast: $('toast'), toastIcon: $('toastIcon'), toastMsg: $('toastMessage'),
};

function showLogin(){ el.authScreen.style.display='block'; el.app.style.display='none'; }
function showApp(){ el.authScreen.style.display='none'; el.app.style.display='block'; }

function showToast(msg, icon='check-circle'){
  el.toastMsg.textContent = msg; el.toastIcon.className = `toast-icon fas fa-${icon}`;
  el.toast.classList.add('show'); setTimeout(()=> el.toast.classList.remove('show'), 1600);
}

function setAuthError(text){
  try{
    if (!el.authError) return;
    if (text){
      el.authError.textContent = text;
      el.authError.style.display = 'block';
    } else {
      el.authError.textContent = '';
      el.authError.style.display = 'none';
    }
  }catch(_){/* noop */}
}

function currentLevel(points){ let L=1, base=100, acc=0; while(points >= acc+base){ acc+=base; base=Math.round(base*1.2); L++; } return L; }
function pointsForLevel(level){ if (level<=1) return 0; let total=0, base=100; for(let i=1;i<level;i++){ total+=base; base=Math.round(base*1.2);} return total; }

function renderStats(){
  el.points.textContent = state.points;
  el.streak.textContent = state.streak;
  el.completed.textContent = state.completedCount;
  const lvl = currentLevel(state.points);
  el.level.textContent = lvl;
  const next = pointsForLevel(lvl+1), prev = pointsForLevel(lvl);
  el.nextLevel.textContent = next;
  const width = Math.max(2, Math.min(100, Math.round(((state.points - prev)/(next - prev))*100)));
  el.levelFill.style.width = width + '%';
}

function renderLearningPath(){
  const root = el.learningPath; root.innerHTML = '';
  // Define two vertical paths (latest ordering)
  const EVERYDAY = ['complaining','suggestions-advice','shopping-enquiries','hotel','gossip-personal','small-talks','ordering-food','telephone-talk','making-appointment','travel','freestyle'];
  const WORKPLACE = ['handle-complaints','speaking-politely','disagreements','feedback','networking','talking-prospects','negotiating','interview','presentation'];

  const makeColumn = (title, ids)=>{
    const col = document.createElement('section');
    col.className = 'lp-column';
    col.innerHTML = `<h3 class="lp-heading">${title}</h3>`;
    const list = document.createElement('div');
    list.className = 'lp-vertical-list';
    ids.forEach((id, i)=>{
      const meta = LEARNING_PATH.find(x=>x.id===id);
      if (!meta) return;
      const unlocked = isUnlocked(id);
      const completed = state.completedList.includes(id);
      // Wrapper node for circle + label (aligned, no stagger)
      const node = document.createElement('div');
      node.className = 'lp-node';

      const card = document.createElement('button');
      card.className = 'topic-card topic-circle' + (completed ? ' completed' : '') + (!unlocked ? ' locked' : '');
      card.dataset.id = id;
      if (i === ids.length - 1) card.classList.add('last');
      const img = (TOPIC_IMG && TOPIC_IMG[id]) ? TOPIC_IMG[id] : null;
      const icon = (TOPIC_ICON && TOPIC_ICON[id]) ? TOPIC_ICON[id] : '🎯';
      const hero = img ? `<img src="${img}" alt="${meta.title} icon" loading="lazy" />` : icon;
      card.innerHTML = `
        <div class="topic-hero">${hero}</div>
        ${completed ? '<div class="topic-badge done">Done ✓</div>' : (!unlocked ? '<div class="topic-badge locked">Locked</div>' : '')}
      `;
      card.addEventListener('click', ()=>{
        if (!unlocked){ showToast('Complete the previous topic to unlock', 'lock'); return; }
        openScenario(id);
      });
      const label = document.createElement('div');
      label.className = 'topic-label';
      label.textContent = meta.title;
      node.appendChild(card);
      node.appendChild(label);
      list.appendChild(node);
    });
    col.appendChild(list);
    return col;
  };

  // Build two columns side-by-side (stack on mobile via CSS)
  const grid = document.createElement('div');
  grid.className = 'lp-columns';
  grid.appendChild(makeColumn('Everyday English', EVERYDAY));
  grid.appendChild(makeColumn('Workplace English', WORKPLACE));
  root.appendChild(grid);

  // Subtle highlight on first unlocked for a few seconds
  try{
    const first = getFirstUnlockedId();
    if (first){
      const btn = root.querySelector(`.topic-card[data-id="${first}"]`);
      if (btn){
        btn.classList.add('highlight-pulse');
        setTimeout(()=> btn.classList.remove('highlight-pulse'), 3500);
      }
    }
  }catch(_){/* noop */}
}

// --- UX Improvements: Enter to login, ESC to close modal ---
// Wire Enter key on login inputs
(()=>{
  const email = document.getElementById('authEmail') || document.querySelector('input[type="email"][id]');
  const pwd = document.getElementById('authPassword') || document.querySelector('input[type="password"][id]');
  const loginBtn = document.getElementById('loginBtn') || document.querySelector('[data-action="login"], button.login');
  const trySubmit = (e)=>{
    if (e.key === 'Enter' && loginBtn){
      e.preventDefault();
      loginBtn.click();
    }
  };
  if (email) email.addEventListener('keydown', trySubmit);
  if (pwd) pwd.addEventListener('keydown', trySubmit);
})();

// ESC to close practice modal
document.addEventListener('keydown', (e)=>{
  if (e.key !== 'Escape') return;
  const practice = document.getElementById('practiceModal');
  const isPracticeOpen = practice && (practice.classList.contains('show') || practice.classList.contains('open') || practice.classList.contains('active') || practice.style.display === 'flex' || getComputedStyle(practice).display !== 'none');
  if (isPracticeOpen){ document.getElementById('closePracticeBtn')?.click(); return; }
});

// Also support static tiles in original index.html
function renderStaticScenarios(){
  const cards = document.querySelectorAll('.card.scenario[data-scenario]');
  if (!cards.length) return;
  cards.forEach(card=>{
    const id = card.getAttribute('data-scenario');
    const locked = !isUnlocked(id);
    const done = (state.completedList||[]).includes(id);
    card.classList.toggle('locked', locked);
    card.classList.toggle('completed', done);
    // ensure single handler
    card.onclick = ()=>{
      if (locked){ showToast('Complete the previous lesson to unlock'); return; }
      openScenario(id);
    };
  });
}

// ===== Voiceflow loader (parent-level, official UI) =====
let VF_CURRENT_PROJECT = null; let VF_LOAD_PROMISE = null; let VF_SCRIPT_LOADING = false; let VF_OBSERVER = null;
function hideVFLauncher(){
  // This function is called after VoiceFlow chat is loaded
  try { 
    // Hide the specific 'Powered by Voiceflow' footer
    const hidePoweredBy = () => {
      // Try multiple possible selectors for the powered by element
      const poweredBySelectors = [
        '.vfrc-footer', 
        '.vfrc-powered-by', 
        '[class*="powered-by"]',
        'footer',
        '.vfrc-footer--watermark',
        'div:has(> a[href*="voiceflow.com"])',
        'div:has(> span:contains("Powered by"))',
        'div:contains("Powered by")',
        '[data-testid*="footer"]',
        '[data-testid*="powered"]',
        '[aria-label*="Powered"]'
      ];
      
      poweredBySelectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            if (el.textContent && el.textContent.toLowerCase().includes('powered by')) {
              el.style.display = 'none !important';
              el.style.visibility = 'hidden !important';
              el.style.height = '0px !important';
              el.style.overflow = 'hidden !important';
              el.textContent = '';
              // Also hide parent if it only contains this element
              if (el.parentElement && el.parentElement.textContent.trim() === el.textContent.trim()) {
                el.parentElement.style.display = 'none !important';
                el.parentElement.style.visibility = 'hidden !important';
                el.parentElement.style.height = '0px !important';
              }
            }
          });
        } catch(e) { /* ignore selector errors */ }
      });
      
      // Additional aggressive text-based removal
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        if (el.textContent && el.textContent.toLowerCase().includes('powered by voiceflow')) {
          el.style.display = 'none !important';
          el.style.visibility = 'hidden !important';
          el.style.height = '0px !important';
          el.textContent = '';
        }
      });
      
      // Additional check for iframes
      document.querySelectorAll('iframe').forEach(iframe => {
        try {
          // Only process VoiceFlow iframes
          if (iframe.src && iframe.src.includes('voiceflow')) {
            // Add style to hide footer in the iframe
            const style = document.createElement('style');
            style.textContent = `
              .vfrc-footer, 
              .vfrc-powered-by, 
              [class*="powered-by"],
              footer,
              .vfrc-footer--watermark,
              div:has(> a[href*="voiceflow.com"]),
              div:has(> span:contains("Powered by")),
              div:contains("Powered by"),
              [data-testid*="footer"],
              [data-testid*="powered"],
              [aria-label*="Powered"] {
                display: none !important;
                height: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
                visibility: hidden !important;
                opacity: 0 !important;
                position: absolute !important;
                left: -9999px !important;
              }
              
              /* Hide any element containing "Powered by Voiceflow" text */
              *:contains("Powered by Voiceflow"),
              *:contains("Powered by"),
              *[title*="Powered by"],
              *[alt*="Powered by"] {
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
                overflow: hidden !important;
              }
            `;
            
            // Wait for iframe to load
            if (iframe.contentDocument) {
              if (!iframe.contentDocument.head.querySelector('style[data-vf-hide]')) {
                style.setAttribute('data-vf-hide', 'true');
                iframe.contentDocument.head.appendChild(style);
              }
            } else {
              iframe.onload = function() {
                if (iframe.contentDocument && !iframe.contentDocument.head.querySelector('style[data-vf-hide]')) {
                  style.setAttribute('data-vf-hide', 'true');
                  iframe.contentDocument.head.appendChild(style);
                }
              };
            }
          }
        } catch (e) {
          console.warn('Error processing iframe:', e);
        }
      });
    };
    
    // Initial hide
    hidePoweredBy();
    
    // Set up a mutation observer to catch any dynamically added elements
    const observer = new MutationObserver((mutations) => {
      let needsUpdate = false;
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          needsUpdate = true;
        }
      });
      if (needsUpdate) {
        hidePoweredBy();
      }
    });
    
    // Start observing the document
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: false,
      characterData: false
    });
    
    // Also run periodically as a fallback
    const checkInterval = setInterval(hidePoweredBy, 500);
    
    // Make Voiceflow branding invisible - target only Voiceflow widget elements
    const makeInvisible = () => {
      // Target Voiceflow widget elements specifically
      document.querySelectorAll('iframe').forEach(iframe => {
        if (iframe.src && iframe.src.includes('voiceflow')) {
          try {
            // Try to access iframe content and hide branding
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (iframeDoc) {
              iframeDoc.querySelectorAll('*').forEach(el => {
                if (el.textContent && el.textContent.toLowerCase().includes('powered by')) {
                  el.style.color = 'transparent !important';
                  el.style.fontSize = '0px !important';
                  el.style.opacity = '0 !important';
                }
              });
            }
          } catch(e) { /* Cross-origin restriction */ }
        }
      });
      
      // Target Voiceflow elements outside iframes
      document.querySelectorAll('.vfrc-footer, .vfrc-powered-by, [class*="vfrc-"]').forEach(el => {
        el.style.color = 'transparent !important';
        el.style.fontSize = '0px !important';
        el.style.opacity = '0 !important';
      });
      
      // Target elements that contain "Powered by Voiceflow" but are NOT inside #app
      document.querySelectorAll('*').forEach(el => {
        // Skip if it's inside our main app
        if (el.closest('#app')) return;
        
        if (el.textContent && el.textContent.toLowerCase().includes('powered by voiceflow')) {
          el.style.color = 'transparent !important';
          el.style.fontSize = '0px !important';
          el.style.opacity = '0 !important';
        }
      });
    };
    
    // Run invisibility styling every 300ms
    const invisibilityInterval = setInterval(makeInvisible, 300);
    
    // Clean up intervals when page unloads
    window.addEventListener('unload', () => {
      clearInterval(checkInterval);
      clearInterval(invisibilityInterval);
    });
    
    // Hide VoiceFlow launcher button if it appears
    const launcher = document.querySelector('.vfrc-launcher, .vfrc-widget--launcher');
    if (launcher) launcher.style.display = 'none';
    
    // Hide iframe borders and branding
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      if (iframe.src.includes('voiceflow')) {
        iframe.style.border = 'none';
        iframe.style.borderRadius = '12px';
      }
    });
    
    // Set up a mutation observer to catch any dynamically added elements
    const observer2 = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          // Check if node is an element
          if (node.nodeType === 1) { 
            // Check the node itself
            if (node.matches && (node.matches('[class*="vf-"], [class*="voiceflow"]') || 
                                node.textContent.toLowerCase().includes('voiceflow'))) {
              node.style.display = 'none';
              node.textContent = '';
            }
            // Check all children
            node.querySelectorAll && node.querySelectorAll('[class*="vf-"], [class*="voiceflow"]').forEach(el => {
              el.style.display = 'none';
              el.textContent = '';
            });
          }
        });
      });
    });
    
    // Start observing the document with the configured parameters
    observer2.observe(document.body, { childList: true, subtree: true });
    
  } catch(e) { 
    console.warn('Error in hideVFLauncher:', e); 
  }
}
function showVFLauncher(){ try{ document.querySelectorAll('.vfrc-launcher').forEach(el=>{ el.style.display = el.dataset._prevDisplay || ''; delete el.dataset._prevDisplay; }); }catch(_){} }
function removeVFNodes(){
  try{
    document.querySelectorAll('#voiceflow-chat, [id^="voiceflow"], .vfrc-widget, .vfrc-launcher, .vfrc-container').forEach(n=>n.remove());
    document.querySelectorAll('iframe[src*="voiceflow"], script[src*="voiceflow"]').forEach(n=>n.remove());
  }catch(_){}
}
function purgeVFByText(){
  try{
    const needle = 'test your agent';
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, null);
    const toRemove = new Set();
    while (walker.nextNode()){
      const el = walker.currentNode;
      if (!el || !el.textContent) continue;
      const txt = el.textContent.trim().toLowerCase();
      if (!txt) continue;
      if (txt.includes(needle)){
        // remove the nearest fixed-position container/button
        let cur = el;
        for (let i=0; i<5 && cur; i++){
          const style = window.getComputedStyle(cur);
          if (style && (style.position === 'fixed' || style.position === 'sticky' || cur.getAttribute('role') === 'button')){
            toRemove.add(cur);
            break;
          }
          cur = cur.parentElement;
        }
      }
    }
    toRemove.forEach(n=> n.remove());
  }catch(_){}
}
function ensureVFObserver(){
  if (VF_OBSERVER) return;
  try{
    // Keep a lightweight observer for future diagnostics, but do not remove Voiceflow nodes.
    VF_OBSERVER = new MutationObserver(()=>{
      // Intentionally no-op to avoid deleting the widget between sessions
    });
    VF_OBSERVER.observe(document.body, { childList:true, subtree:true });
  }catch(_){ }
}
function ensureVoiceflow(projectID, autoOpen = true){
  // If already loaded for same project, optionally open
  if (window.voiceflow && window.voiceflow.chat && VF_CURRENT_PROJECT === projectID){
    try{ 
      console.debug('[VF] already loaded for', projectID); 
      if (autoOpen) window.voiceflow.chat.open && window.voiceflow.chat.open(); 
    }catch(e){ console.warn('[VF] open failed', e); }
    return Promise.resolve();
  }
  // If a different project is active, close and unload before switching
  if (window.voiceflow && window.voiceflow.chat && VF_CURRENT_PROJECT && VF_CURRENT_PROJECT !== projectID){
    try{ window.voiceflow.chat.close && window.voiceflow.chat.close(); }catch(_){}
    try{ window.voiceflow.chat.unload && window.voiceflow.chat.unload(); }catch(_){}
    console.debug('[VF] unloaded previous project', VF_CURRENT_PROJECT);
    VF_CURRENT_PROJECT = null;
  }
  // If script not present, append it once
  if (!window.voiceflow || !window.voiceflow.chat){
    if (!VF_SCRIPT_LOADING){
      VF_SCRIPT_LOADING = true;
      const s = document.createElement('script');
      s.src = 'https://cdn.voiceflow.com/widget-next/bundle.mjs';
      s.type = 'text/javascript';
      s.async = true; s.onload = ()=>{ VF_SCRIPT_LOADING = false; console.debug('[VF] widget-next script loaded'); };
      s.onerror = ()=>{ VF_SCRIPT_LOADING = false; console.error('[VF] failed to load script'); };
      document.head.appendChild(s);
    }
  }
  // Load chat for this project when api ready
  VF_LOAD_PROMISE = new Promise((resolve)=>{
    let tries = 0; const iv = setInterval(()=>{
      tries++;
      if (window.voiceflow && window.voiceflow.chat){
        clearInterval(iv);
        try{
          const p = window.voiceflow.chat.load({
            verify:{ projectID }, 
            url:'https://general-runtime.voiceflow.com', 
            versionID:'production',
            voice:{ url:'https://runtime-api.voiceflow.com' },
            styles: {
              // Hide VoiceFlow branding
              launcher: { icon: 'none' },
              header: { 
                title: 'English Tutor',
                subtitle: 'Practice your English',
                // Hide VoiceFlow logo and avatar
                avatar: { image: 'none' },
                // Hide VoiceFlow branding
                titleFont: 'inherit',
                subtitleFont: 'inherit'
              },
              // Hide VoiceFlow watermark
              watermark: { display: 'none' },
              // Hide VoiceFlow message branding
              message: { 
                user: { showAvatar: false },
                assistant: { showAvatar: false }
              },
              // Hide VoiceFlow input branding
              input: { 
                placeholder: 'Type your message...',
                // Hide VoiceFlow branding in the input
                button: { icon: 'none' }
              }
            }
          });
          Promise.resolve(p).then(()=>{ 
            VF_CURRENT_PROJECT = projectID; 
            console.debug('[VF] loaded project', projectID);
            try{ if (autoOpen) window.voiceflow.chat.open && window.voiceflow.chat.open(); hideVFLauncher(); }catch(e){ console.warn('[VF] open after load failed', e); }
            resolve(); 
          });
        }catch(e){ console.error('[VF] load failed', e); resolve(); }
      } else if (tries>200){ // ~20s max wait
        clearInterval(iv); 
        console.warn('[VF] script did not initialize in time');
        try{ showToast('Voiceflow chat blocked by network/extension','exclamation-triangle'); }catch(_){}
        resolve();
      }
    }, 100);
  });
  return VF_LOAD_PROMISE;
}

// ===== Timer (without gating) =====
const SESSION_SECONDS = 600;
function stopTimer(){ if (state.timerId){ clearInterval(state.timerId); state.timerId=null; } }
function secondsSince(start){ return start ? Math.floor((Date.now()-start)/1000) : 0; }
function startTimer(){ stopTimer(); state.sessionStart = Date.now(); el.completeBtn.disabled = false; tick(); state.timerId = setInterval(tick, 1000); }
function tick(){ const e=secondsSince(state.sessionStart), r=Math.max(0,SESSION_SECONDS-e); el.timer.textContent = `${pad(Math.floor(r/60))}:${pad(r%60)}`; }

// ===== Scenario open/close =====
function openScenario(key){
  if (!state.uid){ showLogin(); showToast('Please sign in first','info-circle'); return; }
  if (!isUnlocked(key)){ showToast('Complete the previous lesson to unlock','lock'); return; }
  const proj = VF_PROJECT[key];
  const meta = LEARNING_PATH.find(x=>x.id===key);
  if (!proj || !meta) return;
  if (!proj){ showToast('Freestyle not configured yet — please set its Voiceflow ID','wand'); return; }
  state.lastScenario = key; persistLocal(); persistCloud();
  el.title.textContent = meta.title; el.desc.textContent = meta.desc;
  el.backdrop.classList.add('show');
  // Ensure modal shows even if an inline display:none was set previously
  try{ el.backdrop.style.display = 'flex'; }catch(_){ /* noop */ }
  // mark chat active for CSS control
  document.documentElement.classList.add('vf-active');
  
  // Create branding blocker overlay
  createBrandingBlocker();
  
  // Load Voiceflow and auto-open so it's consistently visible each time
  ensureVoiceflow(proj, true).then(()=>{
    // Widget loaded and opened
  });
  // Optional hint kept minimal since chat auto-opens
  // showToast('Chat opened','comments');
  // No countdown; ensure Complete button is enabled and hide timer display
  try{ el.completeBtn.disabled = false; }catch(_){}
  try{ if (el.timer) el.timer.style.display = 'none'; }catch(_){}
}
function closeModal(){
  el.backdrop.classList.remove('show');
  el.backdrop.style.display = 'none';
  stopTimer();
  try{ window.voiceflow && window.voiceflow.chat && window.voiceflow.chat.close && window.voiceflow.chat.close(); }catch(e){}
  // mark chat inactive and remove nodes to ensure launcher disappears
  document.documentElement.classList.remove('vf-active');
  
  // Remove branding blocker overlay only
  removeBrandingBlocker();
  // Keep Voiceflow script and widget in DOM for faster subsequent loads
}

// ===== Branding Blocker Functions =====
function createBrandingBlocker() {
  // Remove existing blocker if any
  removeBrandingBlocker();
  
  // Create overlay element
  const blocker = document.createElement('div');
  blocker.className = 'vf-branding-blocker';
  blocker.id = 'vf-branding-blocker';
  
  // Position bigger overlay higher to cover "Powered by Voiceflow" text
  blocker.style.cssText = `
    position: fixed !important;
    bottom: 25px !important;
    right: 30px !important;
    width: 160px !important;
    height: 20px !important;
    background: white !important;
    z-index: 9999 !important;
    pointer-events: none !important;
    border-radius: 4px !important;
    display: none !important;
  `;
  
  document.body.appendChild(blocker);
  
  // Position bigger overlay higher over Voiceflow branding
  const positionOverBranding = () => {
    const chatWidget = document.querySelector('.vfrc-widget, .vfrc-container, #voiceflow-chat');
    if (chatWidget) {
      const rect = chatWidget.getBoundingClientRect();
      blocker.style.display = 'block';
      // Position higher and bigger to cover the branding
      blocker.style.right = (window.innerWidth - rect.right + rect.width/2 - 80) + 'px';
      blocker.style.bottom = '25px';
      blocker.style.width = '160px';
      blocker.style.height = '20px';
    }
  };
  
  // Multiple attempts to find and cover the branding
  setTimeout(positionOverBranding, 1000);
  setTimeout(positionOverBranding, 2000);
  setTimeout(positionOverBranding, 4000);
  
  // Continuous monitoring
  const monitorInterval = setInterval(positionOverBranding, 2000);
  setTimeout(() => clearInterval(monitorInterval), 30000);
}

function removeBrandingBlocker() {
  const blocker = document.getElementById('vf-branding-blocker');
  if (blocker) {
    blocker.remove();
  }
}

// ===== Points awarding (simple) =====
const POINTS_PER_COMPLETION = 50, DAILY_BONUS = 20;
function markCompleted(){
  if (el.completeBtn.disabled) return;
  let gained = POINTS_PER_COMPLETION;
  const today = fmtDate(new Date());
  if (localStorage.getItem('ll_dailyDate') !== today){ gained += DAILY_BONUS; localStorage.setItem('ll_dailyDate', today); }
  // Add to completedList in order if not already
  if (!state.completedList.includes(state.lastScenario)){
    state.completedList.push(state.lastScenario);
  }
  state.completedCount = state.completedList.length;
  state.points += gained;
  persistLocal(); persistCloud(); renderStats(); renderLearningPath(); renderStaticScenarios();
  showToast(`Saved! +${gained} pts`); closeModal();
}

// ===== Auth helpers =====
function humanAuthError(code){
  switch(code){
    case 'auth/invalid-email': return 'Please enter a valid email address.';
    case 'auth/missing-password': return 'Please enter your password.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'Incorrect email or password.';
    case 'auth/too-many-requests': return 'Too many attempts. Try again later.';
    case 'auth/email-already-in-use': return 'This email is already registered.';
    case 'auth/weak-password': return 'Password is too weak (min 6 characters).';
    case 'auth/network-request-failed': return 'Network error. Check your connection.';
    default: return 'Something went wrong. Please try again.';
  }
}

// ===== Wire events =====
function setupEvents(){
  // Auth - Updated to ensure proper element access
  el.loginBtn.addEventListener('click', async()=>{
    setAuthError('');
    const origText = el.loginBtn.textContent;
    try { 
      const email = (el.authEmail.value || '').trim();
      const password = el.authPass.value;
      
      if (!email) { showToast('Please enter your email', 'exclamation-circle'); setAuthError('Please enter your email.'); return; }
      if (!password) { showToast('Please enter your password', 'exclamation-circle'); setAuthError('Please enter your password.'); return; }
      
      el.loginBtn.disabled = true; el.loginBtn.textContent = 'Signing in...';
      await signInWithEmailAndPassword(auth, email, password);
    } catch(e) { 
      console.error('Login error:', e);
      const msg = humanAuthError(e.code);
      showToast(msg, 'exclamation-circle');
      setAuthError(`${msg} (${e.code || 'unknown'})`);
    } finally {
      el.loginBtn.disabled = false; el.loginBtn.textContent = origText;
    }
  });
  
  el.signupBtn.addEventListener('click', async()=>{
    setAuthError('');
    const origText = el.signupBtn.textContent;
    try {
      const name = (el.authName.value || '').trim();
      const email = (el.authEmail.value || '').trim();
      const password = el.authPass.value;
      
      if (!name) { showToast('Please enter your name', 'exclamation-circle'); setAuthError('Please enter your name.'); return; }
      if (!email) { showToast('Please enter your email', 'exclamation-circle'); setAuthError('Please enter your email.'); return; }
      if (!password) { showToast('Please enter a password', 'exclamation-circle'); setAuthError('Please enter a password.'); return; }
      if (password.length < 6) { showToast('Password must be at least 6 characters', 'exclamation-circle'); setAuthError('Password must be at least 6 characters.'); return; }
      
      el.signupBtn.disabled = true; el.signupBtn.textContent = 'Creating...';
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await setDoc(doc(db, 'users', cred.user.uid), { 
        name, 
        points: 0, 
        completedCount: 0, 
        streak: 0, 
        createdAt: serverTimestamp() 
      }, { merge: true });
      
      showToast('Account created successfully!', 'check-circle');
    } catch(e) { 
      console.error('Signup error:', e);
      const msg = humanAuthError(e.code);
      showToast(msg, 'exclamation-circle');
      setAuthError(`${msg} (${e.code || 'unknown'})`);
    } finally {
      el.signupBtn.disabled = false; el.signupBtn.textContent = origText;
    }
  });
  el.logoutBtn.addEventListener('click', ()=> signOut(auth));

  // Modal
  el.closeBtn.addEventListener('click', closeModal);
  el.completeBtn.addEventListener('click', markCompleted);
  if (el.openChatBtn){
    el.openChatBtn.addEventListener('click', async ()=>{
      try{
        el.openChatBtn.disabled = true;
        await ensureVoiceflow(VF_PROJECT[state.lastScenario] || VF_PROJECT.ordering);
        window.voiceflow && window.voiceflow.chat && window.voiceflow.chat.open && window.voiceflow.chat.open();
      } finally {
        el.openChatBtn.disabled = false;
      }
    });
  }

  // Resume/reset
  el.resumeBtn.addEventListener('click', ()=> state.lastScenario && openScenario(state.lastScenario));
  el.resetBtn.addEventListener('click', ()=>{
    state.points=0; state.completedCount=0; state.streak=0; state.completedList = [];
    localStorage.removeItem('ll_completedList');
    persistLocal(); persistCloud(); renderStats(); renderLearningPath(); showToast('Progress reset');
  });

  // Start button
  if (el.startBtn){
    el.startBtn.addEventListener('click', ()=>{
      if (!state.uid){ showLogin(); showToast('Please sign in first','info-circle'); return; }
      const first = getFirstUnlockedId();
      if (first){ openScenario(first); }
      else { document.getElementById('learningPath')?.scrollIntoView({ behavior:'smooth', block:'start' }); showToast('All challenges completed! 🎉'); }
    });
  }
}

// ===== Auth state =====
onAuthStateChanged(auth, async (user)=>{
  if (!user){ showLogin(); return; }
  state.uid = user.uid;
  try{
    const snap = await getDoc(doc(db,'users',user.uid));
    if (snap.exists()){
      const d=snap.data();
      state.name = d.name || state.name;
      state.points = d.points ?? state.points;
      state.completedCount = d.completedCount ?? state.completedCount;
      if (Array.isArray(d.completedList)) state.completedList = d.completedList;
    } else {
      await setDoc(doc(db,'users',user.uid),{ name: user.displayName||'', points:state.points, completedCount:state.completedCount, completedList: state.completedList || [], createdAt: serverTimestamp() },{merge:true});
    }
  }catch(e){ console.warn('load user failed', e); }
  showApp(); renderStats(); renderLearningPath(); renderStaticScenarios();

  // Move keyboard focus to Start button to guide next action
  try{ if (el.startBtn) setTimeout(()=> el.startBtn.focus(), 0); }catch(_){/* noop */}

  // Adjust Resume label when no last session
  try{
    if (el.resumeBtn){
      if (!state.lastScenario){ el.resumeBtn.innerHTML = '<i class="fas fa-flag-checkered"></i> Start'; }
      else { el.resumeBtn.innerHTML = '<i class="fas fa-play"></i> Resume Last'; }
    }
  }catch(_){/* noop */}

  // One-time onboarding: auto-scroll to learning path and show hint
  try{
    if (!localStorage.getItem('ll_onboarded')){
      document.getElementById('learningPath')?.scrollIntoView({ behavior:'smooth', block:'start' });
      showToast('Pick a challenge below to begin');
      localStorage.setItem('ll_onboarded','1');
    }
  }catch(_){/* noop */}
});

// ===== Init =====
(function init(){
  setupEvents();
  renderStats();
  renderLearningPath(); renderStaticScenarios();
  ensureVFObserver();
  showLogin();
  // Register service worker for PWA/offline (if supported)
  try{
    if ('serviceWorker' in navigator){
      window.addEventListener('load', ()=>{
        navigator.serviceWorker.register('service-worker.js').catch(()=>{/* ignore */});
      });
    }
  }catch(_){/* noop */}
})();

// ===== Utilities =====
function getFirstUnlockedId(){
  // First not-completed item that is unlocked; fallback to first item
  for (let i=0;i<LEARNING_PATH.length;i++){
    const id = LEARNING_PATH[i].id;
    if (isUnlocked(id) && !(state.completedList||[]).includes(id)) return id;
  }
  return null;
}
