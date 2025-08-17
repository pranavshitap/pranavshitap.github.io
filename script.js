// ===============================
// PARTICLE BACKGROUND ANIMATION
// ===============================

const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#06b6d4'];
let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let animationId;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

document.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

function Particle() {
  this.x = Math.random() * canvas.width;
  this.y = Math.random() * canvas.height;
  this.radius = Math.random() * 3 + 1;
  this.color = colors[Math.floor(Math.random() * colors.length)];
  this.vx = (Math.random() - 0.5) * 0.8;
  this.vy = (Math.random() - 0.5) * 0.8;
  this.opacity = Math.random() * 0.5 + 0.3;
}

Particle.prototype.draw = function () {
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
  ctx.fillStyle = this.color;
  ctx.globalAlpha = this.opacity;
  ctx.fill();
  ctx.globalAlpha = 1;
};

Particle.prototype.update = function () {
  this.x += this.vx;
  this.y += this.vy;
  
  // Bounce off edges
  if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
  if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  
  // Mouse interaction
  const dx = mouse.x - this.x;
  const dy = mouse.y - this.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist < 150) {
    const force = (150 - dist) / 150;
    this.x -= dx * force * 0.02;
    this.y -= dy * force * 0.02;
  }
  
  // Subtle pulsing effect
  this.opacity = Math.sin(Date.now() * 0.001 + this.x * 0.01) * 0.2 + 0.4;
};

function createParticles(num) {
  particles = [];
  for (let i = 0; i < num; i++) {
    particles.push(new Particle());
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw connections between nearby particles
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 100) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = particles[i].color;
        ctx.globalAlpha = (100 - dist) / 100 * 0.3;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }
  
  // Update and draw particles
  for (let p of particles) {
    p.update();
    p.draw();
  }
  
  animationId = requestAnimationFrame(animate);
}

// Create particles based on screen size
const particleCount = window.innerWidth < 768 ? 30 : window.innerWidth < 1200 ? 50 : 70;
createParticles(particleCount);
animate();

// ===============================
// THEME TOGGLE FUNCTIONALITY
// ===============================

const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('theme-icon');
const htmlElement = document.documentElement;

// Detect system preference
const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

function applyTheme(theme) {
  htmlElement.setAttribute('data-bs-theme', theme);
  
  // Update theme icon
  if (theme === 'dark') {
    themeIcon.className = 'bi bi-moon-fill';
  } else {
    themeIcon.className = 'bi bi-sun-fill';
  }
  
  // Update particle colors based on theme
  if (theme === 'dark') {
    colors.splice(0, colors.length, '#818cf8', '#a78bfa', '#f472b6', '#34d399', '#22d3ee');
  } else {
    colors.splice(0, colors.length, '#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#06b6d4');
  }
}

function toggleTheme() {
  const currentTheme = htmlElement.getAttribute('data-bs-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  applyTheme(newTheme);
  
  // Add a nice animation effect
  themeToggle.style.transform = 'scale(0.8)';
  setTimeout(() => {
    themeToggle.style.transform = 'scale(1)';
  }, 150);
}

// Initialize theme to system preference
applyTheme(darkModeQuery.matches ? 'dark' : 'light');

// Listen for system theme changes
darkModeQuery.addEventListener('change', (e) => {
  applyTheme(e.matches ? 'dark' : 'light');
});

// Add event listener for button
themeToggle.addEventListener('click', toggleTheme);


// ===============================
// SMOOTH SCROLLING NAVIGATION
// ===============================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offsetTop = target.offsetTop - 80; // Account for fixed navbar
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  });
});

// ===============================
// NAVBAR SCROLL EFFECT
// ===============================

const navbar = document.querySelector('.navbar');
let lastScrollTop = 0;

window.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  // Add/remove background blur based on scroll position
  if (scrollTop > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  
  lastScrollTop = scrollTop;
});

// ===============================
// CHATBOT FUNCTIONALITY
// ===============================

const chatbotFab = document.getElementById('chatbotFab');
const chatbotBtn = document.getElementById('chatbotBtn');
const chatbotModal = new bootstrap.Modal(document.getElementById('chatbotModal'));
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatLog = document.getElementById('chat-log');
const chatAccess = document.getElementById('chat-access');

// Store chat history as an array of message objects
let chatHistory = [
  // Optionally, you can initialize with a system prompt or leave empty
  // { role: "system", content: "You are Pranav, a helpful assistant." }
];

// Open chatbot modal
function openChatbot() {
  chatbotModal.show();
  // Focus on input when modal opens
  setTimeout(() => {
    chatInput.focus();
  }, 300);
}

// Event listeners for opening chatbot
chatbotFab.addEventListener('click', openChatbot);
chatbotBtn.addEventListener('click', openChatbot);

// SSE Chat functionality
async function sendChatMessage(messages, onStreamChunk) {
  try {
    console.log('Sending messages:', messages);
    const response = await fetch('https://stolen-on-unusual-heath.trycloudflare.com/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ messages }), // Send the full messages array
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('ReadableStream not supported');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let reply = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      reply += chunk;

      if (onStreamChunk) {
        onStreamChunk(chunk);
      }
    }

    return reply;
  } catch (error) {
    console.error('Chat error:', error);
    throw error;
  }
}

function addChatMessage(sender, message, isStreaming = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${sender === 'You' ? 'user' : 'bot'}`;

  const bubbleDiv = document.createElement('div');
  bubbleDiv.className = 'chat-bubble';

  if (sender === 'You') {
    bubbleDiv.innerHTML = `<strong></strong> ${escapeHtml(message)}`;
  } else {
    bubbleDiv.innerHTML = `<strong></strong> <span class="bot-reply">${isStreaming ? '' : escapeHtml(message)}</span>`;
  }

  messageDiv.appendChild(bubbleDiv);
  chatLog.appendChild(messageDiv);
  chatLog.scrollTop = chatLog.scrollHeight;

  return isStreaming ? bubbleDiv.querySelector('.bot-reply') : null;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function checkSessionAccess() {
  // Check if session cookie exists
  if (document.cookie.includes('session')) {
    chatAccess.classList.remove('d-none');
  }
}

function showTypingIndicator() {
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-message bot typing-indicator';
  typingDiv.innerHTML = `
    <div class="chat-bubble">
      <strong></strong> 
      <span class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </span>
    </div>
  `;
  chatLog.appendChild(typingDiv);
  chatLog.scrollTop = chatLog.scrollHeight;
  return typingDiv;
}

// Chat form submission
chatForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  // Add user message to UI and history
  addChatMessage('You', userMessage);
  chatHistory.push({ role: "user", content: userMessage });
  chatInput.value = '';

  // Show typing indicator
  const typingIndicator = showTypingIndicator();

  try {
    // Remove typing indicator and add bot message
    chatLog.removeChild(typingIndicator);
    const botReplyElement = addChatMessage('Assistant', '', true);

    // Stream the response
    let botReply = '';
    await sendChatMessage(chatHistory, (chunk) => {
      botReply += chunk;
      botReplyElement.textContent += chunk;
      chatLog.scrollTop = chatLog.scrollHeight;
    });

    // Add assistant's reply to history
    chatHistory.push({ role: "model", content: botReply });

    // Check for session access after successful message
    checkSessionAccess();

  } catch (error) {
    // Remove typing indicator and show error
    if (typingIndicator.parentNode) {
      chatLog.removeChild(typingIndicator);
    }

    addChatMessage('System', 'Sorry, I\'m having trouble connecting right now. Please try again later.');
    console.error('Chat error:', error);
  }
});

// Add typing dots CSS animation
const typingStyle = document.createElement('style');
typingStyle.textContent = `
  .typing-dots {
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }
  
  .typing-dots span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    animation: typing 1.4s infinite ease-in-out;
  }
  
  .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
  .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
  
  @keyframes typing {
    0%, 80%, 100% {
      opacity: 0.3;
      transform: scale(0.8);
    }
    40% {
      opacity: 1;
      transform: scale(1);
    }
  }
`;
document.head.appendChild(typingStyle);

// ===============================
// INTERSECTION OBSERVER ANIMATIONS
// ===============================

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe all sections for animations
document.querySelectorAll('.skill-card, .project-card, .contact-card, .glass-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// ===============================
// PERFORMANCE OPTIMIZATIONS
// ===============================

// Throttle scroll events
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// Apply throttling to scroll events
window.addEventListener('scroll', throttle(() => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  if (scrollTop > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, 16)); // ~60fps

// ===============================
// ACCESSIBILITY IMPROVEMENTS
// ===============================

// Keyboard navigation for cards
document.querySelectorAll('.skill-card, .project-card, .contact-card').forEach(card => {
  card.setAttribute('tabindex', '0');
  
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });
});

// Focus management for modal
document.getElementById('chatbotModal').addEventListener('shown.bs.modal', () => {
  chatInput.focus();
});

// ===============================
// INITIALIZATION
// ===============================

document.addEventListener('DOMContentLoaded', () => {
  // Check session access on page load
  checkSessionAccess();
  
  // Add a welcome message to chat
  setTimeout(() => {
    if (chatLog.children.length === 0) {
      addChatMessage('Assistant', 'Hi there! 👋 Feel free to ask me anything about Pranav\'s work, projects, or just say hello!');
    }
  }, 1000);
  
  // Preload some particle positions for smoother animation
  setTimeout(() => {
    for (let p of particles) {
      p.update();
    }
  }, 100);
});

// ===============================
// ERROR HANDLING
// ===============================

window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});

// ===============================
// UTILITY FUNCTIONS
// ===============================

// Debounce function for performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Random utility for animations
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// Check if element is in viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
