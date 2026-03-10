/**
 * ThreatSense | main.js
 * Handles Global Header, Navigation, Footer, and Interactive Constellation Galaxy.
 */

let currentScale = 1;
let isReading = false; 

// --- GALAXY CONSTELLATION SYSTEM ---
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
let stars = [];
let mouse = { x: null, y: null, radius: 150 };

function initStars() {
    const container = document.getElementById('canvas-container');
    if (!container) return;
    container.appendChild(canvas);
    resizeCanvas();
    stars = [];
    const density = (canvas.width * canvas.height) / 9000;
    for (let i = 0; i < density; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        stars.push({
            x: x, y: y, size: Math.random() * 2 + 1,
            baseX: x, baseY: y, density: (Math.random() * 30) + 1
        });
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function animateGalaxy() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const isDark = document.documentElement.classList.contains('dark');
    const starColor = isDark ? '224, 215, 255' : '99, 102, 241';

    for (let i = 0; i < stars.length; i++) {
        let s = stars[i];
        let dx = mouse.x - s.x;
        let dy = mouse.y - s.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
            let force = (mouse.radius - distance) / mouse.radius;
            s.x -= (dx / distance) * force * s.density;
            s.y -= (dy / distance) * force * s.density;
        } else {
            if (s.x !== s.baseX) s.x -= (s.x - s.baseX) / 10;
            if (s.y !== s.baseY) s.y -= (s.y - s.baseY) / 10;
        }

        ctx.fillStyle = `rgb(${starColor})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i; j < stars.length; j++) {
            let s2 = stars[j];
            let dxLine = s.x - s2.x;
            let dyLine = s.y - s2.y;
            let distLine = Math.sqrt(dxLine * dxLine + dyLine * dyLine);
            if (distLine < 120) {
                let opacity = 1 - (distLine / 120);
                ctx.strokeStyle = `rgba(${starColor}, ${opacity * 0.3})`;
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(s2.x, s2.y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateGalaxy);
}

// --- GLOBAL HEADER INJECTION ---
function injectHeader() {
    const header = document.querySelector('header');
    if (!header) return;
    header.className = "sticky top-0 z-50 backdrop-blur-md bg-white/30 dark:bg-darkbg/80 border-b border-indigo-200 dark:border-white/10 transition-all duration-300";
    header.innerHTML = `
        <div class="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center text-slate-900 dark:text-white">
            <div class="flex items-center gap-4 cursor-pointer" onclick="window.location.href='home.html'">
                <img src="../assets/logo.png" alt="ThreatSense Logo" class="w-16 h-16 rounded-full object-cover border-2 border-primary/40 shadow-2xl logo-glow">
                <span class="font-bold text-3xl tracking-tighter uppercase">ThreatSense</span>
            </div>
            <nav id="navLinks" class="flex gap-8 items-center text-sm font-bold uppercase tracking-widest"></nav>
        </div>
    `;
}

// --- GLOBAL FOOTER INJECTION ---
function injectFooter() {
    const footer = document.querySelector('footer');
    if (!footer) return;
    footer.className = "py-16 px-6 border-t border-primary/30 bg-slate-100/80 dark:bg-[#1a244d] backdrop-blur-xl mt-20 shadow-[0_-20px_50px_-20px_rgba(99,102,241,0.2)]";
    footer.innerHTML = `
        <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-center text-slate-900 dark:text-white">
            <div class="space-y-2">
                <div class="flex items-center gap-3">
                    <img src="../assets/logo.png" alt="TS Logo" class="w-12 h-12 rounded-full border border-primary/30">
                    <h2 class="font-black text-2xl tracking-tighter uppercase leading-none">ThreatSense</h2>
                </div>
                <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Autonomous Cyber Threat Prediction & Self-Healing Defense System</p>
            </div>
            <div class="flex flex-col items-center justify-center">
                <div class="text-center">
                    <p class="text-[10px] uppercase tracking-[0.4em] opacity-30 font-black">ALL RIGHTS RESERVED GLOBALLY</p>
                </div>
            </div>
            <div class="flex flex-col md:items-end space-y-2">
                <div class="text-right">
                    <h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">Developed By</h4>
                    <p class="text-xl font-black uppercase tracking-tighter">Ms. Kermeen Deboo</p>
                </div>
                <div class="space-y-1 md:text-right">
                    <p class="text-xs font-bold flex items-center md:justify-end gap-2 opacity-80">
                        📧<span class="text-primary">kermeendeboo@gmail.com</span>
                    </p>
                    <p class="text-xs font-bold flex items-center md:justify-end gap-2 opacity-80">
                        📍<span class="text-primary">Mumbai, India </span>
                    </p>
                </div>
            </div>
        </div>
    `;
}

async function checkLoginStatus() {
    const nav = document.getElementById('navLinks');
    if (!nav) return;

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    let userName = "Profile";
    let userAvatar = "🛡️";

    if (isLoggedIn) {
        const storedUser = JSON.parse(localStorage.getItem('registeredUser'));
        if (storedUser?.username) {
            try {
                const res = await fetch(`${API_BASE}/current_user/${storedUser.username}`);
                if (res.ok) {
                    const user = await res.json();
                    userName = user.username;
                    userAvatar = user.avatar || "🛡️";
                }
            } catch (err) {
                console.error("Failed to fetch user from backend:", err);
            }
        }
    }

    const a11yBtn = `
        <div class="relative inline-block ml-2">
            <button onclick="toggleA11yMenu()" class="flex items-center gap-3 p-3.5 bg-primary text-white rounded-2xl shadow-lg hover:scale-105 transition-all">
                <span class="text-lg">⚙️</span>
                <span class="hidden sm:inline text-xs font-black uppercase tracking-widest">Accessibility</span>
            </button>
            <div id="a11yMenu" class="hidden absolute right-0 top-16 w-64 bg-white dark:bg-navycard border border-indigo-100 dark:border-white/10 rounded-2xl shadow-2xl p-5 z-[60]">
                <button onclick="toggleTheme()" class="w-full p-3 mb-2 bg-slate-100 dark:bg-white/5 rounded-xl text-xs font-bold uppercase text-slate-900 dark:text-white flex justify-between items-center">
                    Dark/Light Theme 🌓
                </button>
                
                <button onclick="toggleLargeCursor()" class="w-full p-3 mb-2 bg-slate-100 dark:bg-white/5 rounded-xl text-xs font-bold uppercase text-slate-900 dark:text-white flex justify-between items-center">
                    <span id="cursorBtnText">Large Cursor: OFF</span> 🖱️
                </button>

                <div class="flex items-center justify-between p-3 mb-2 bg-slate-100 dark:bg-white/5 rounded-xl text-xs font-bold uppercase text-slate-900 dark:text-white">
                    <span>Text Size</span>
                    <div class="flex gap-2">
                        <button onclick="changeTextSize(-0.1)" class="px-2 bg-primary/20 rounded-md">-</button>
                        <button onclick="changeTextSize(0.1)" class="px-2 bg-primary/20 rounded-md">+</button>
                    </div>
                </div>
                
                <button id="ttsToggleBtn" onclick="toggleReadPage()" class="w-full p-3 mb-2 bg-slate-100 dark:bg-white/5 rounded-xl text-xs font-bold uppercase text-slate-900 dark:text-white flex justify-between items-center">
                    <span id="ttsBtnText">Read Page: OFF</span> 🔊
                </button>
                <button onclick="resetAll()" class="w-full p-3 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase">Reset All</button>
            </div>
        </div>
    `;

    if (isLoggedIn) {
        nav.innerHTML = `
            <a href="home.html" class="hover:text-primary transition-colors">Home</a>
            <a href="dashboard.html" class="hover:text-primary transition-colors">Dashboard</a>
            <a href="about.html" class="hover:text-primary transition-colors">About</a>
            <a href="profile.html" class="flex items-center gap-3 px-5 py-2.5 bg-primary/10 rounded-2xl border border-primary/20 hover:bg-primary/20 transition-all">
                <span class="text-xl">${userAvatar}</span>
                <span class="font-black text-primary tracking-tight">${userName}</span>
            </a>
            <button onclick="logout()" class="px-6 py-3 bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Logout</button>
            ${a11yBtn}
        `;
    } else {
        nav.innerHTML = `
            <a href="home.html" class="hover:text-primary transition-colors">Home</a>
            <a href="about.html" class="hover:text-primary transition-colors">About</a>
            <a href="auth.html" class="px-8 py-3.5 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg">Login</a>
            ${a11yBtn}
        `;
    }
}

// --- ACCESSIBILITY TOOLS LOGIC ---
function toggleA11yMenu() { 
    document.getElementById('a11yMenu')?.classList.toggle('hidden'); 
}

function toggleTheme() { 
    const isDark = document.documentElement.classList.toggle('dark'); 
    localStorage.setItem('themePref', isDark ? 'dark' : 'light'); 
}

// UPDATED: TOGGLE LARGE CURSOR WITH ON/OFF TEXT
function toggleLargeCursor() {
    document.body.classList.toggle('large-cursor');
    const isLarge = document.body.classList.contains('large-cursor');
    const btnText = document.getElementById('cursorBtnText');
    
    document.body.style.cursor = isLarge ? 'url("https://cur.cursors-4u.net/others/oth-9/oth819.cur"), auto' : 'default';
    if (btnText) btnText.innerText = `Large Cursor: ${isLarge ? 'ON' : 'OFF'}`;
}

function changeTextSize(delta) {
    currentScale = Math.min(Math.max(0.8, currentScale + delta), 1.4);
    document.documentElement.style.fontSize = `${currentScale * 100}%`;
}

function toggleReadPage() {
    const btnText = document.getElementById('ttsBtnText');
    if (!isReading) {
        const text = document.body.innerText;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {
            isReading = false;
            if (btnText) btnText.innerText = "Read Page: OFF";
        };
        window.speechSynthesis.speak(utterance);
        isReading = true;
        if (btnText) btnText.innerText = "Read Page: ON";
    } else {
        window.speechSynthesis.cancel();
        isReading = false;
        if (btnText) btnText.innerText = "Read Page: OFF";
    }
}

function logout() { localStorage.setItem('isLoggedIn', 'false'); window.location.href = 'home.html'; }
function resetAll() { 
    localStorage.clear(); 
    document.documentElement.style.fontSize = '100%'; 
    document.body.style.cursor = 'default';
    window.speechSynthesis.cancel();
    location.reload(); 
}

window.addEventListener('DOMContentLoaded', () => {
    initStars(); animateGalaxy(); injectHeader(); injectFooter(); checkLoginStatus();
});

window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('resize', () => { resizeCanvas(); initStars(); });
// ===============================
// BACKEND API INTEGRATION (Flask)
// ===============================

const API_BASE = "http://127.0.0.1:5000";

// 🔹 Get All Threats From Backend
async function fetchThreats() {
    try {
        const response = await fetch(`${API_BASE}/threats`);
        const data = await response.json();
        console.log("Threats from Backend:", data);

        // OPTIONAL: If dashboard page exists, auto render
        const threatContainer = document.getElementById("threatContainer");
        if (threatContainer) {
            threatContainer.innerHTML = "";
            data.forEach(threat => {
                const div = document.createElement("div");
                div.className = "p-4 mb-3 bg-white/10 rounded-xl border border-primary/20";
                div.innerHTML = `
                    <h3 class="font-bold text-primary">${threat.name}</h3>
                    <p class="text-xs uppercase">${threat.type}</p>
                    <p class="text-xs">Severity: ${threat.severity}</p>
                    <p class="text-xs opacity-70">${threat.timestamp}</p>
                `;
                threatContainer.appendChild(div);
            });
        }

    } catch (error) {
        console.error("Error fetching threats:", error);
    }
}

// 🔹 Add New Threat To Backend
async function addThreat(threatData) {
    try {
        const response = await fetch(`${API_BASE}/threats`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(threatData)
        });

        const result = await response.json();
        console.log(result);

        // Refresh threats after adding
        fetchThreats();

    } catch (error) {
        console.error("Error adding threat:", error);
    }
}

// 🔹 Download User History from MongoDB to Local CSV
// 🔹 Download User History from MongoDB to Local CSV
async function downloadUserHistory() {
    // 1. Robustly check login state
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    let currentUsername = "Guest_User"; // Safe fallback

    if (isLoggedIn) {
        try {
            const storedUserStr = localStorage.getItem('registeredUser');
            if (storedUserStr) {
                const storedUser = JSON.parse(storedUserStr);
                // Try to get username, fallback to name, or default string
                currentUsername = storedUser.username || storedUser.name || "Unknown_User";
            }
        } catch (e) {
            // If JSON fails to parse, maybe it was saved as a raw string
            currentUsername = localStorage.getItem('registeredUser') || "Unknown_User";
        }
    } else {
        alert("Authentication Error: Please log in to download your history.");
        return; // Stop execution if not logged in at all
    }

    try {
        // Show loading state on button (optional but good UX)
        console.log(`Fetching history for: ${currentUsername}`);

        // 2. Fetch the user's specific history from MongoDB
        const response = await fetch(`${API_BASE}/get_user_history/${currentUsername}`);
        
        if (!response.ok) throw new Error("Backend connection failed.");
        
        const data = await response.json();

        if (!data || data.length === 0) {
            alert(`No history logs found in the database for user: ${currentUsername}`);
            return;
        }

        // 3. Format the data into CSV structure
        const headers = ["Timestamp", "Username", "Prediction Result", "AI Confidence Score"];
        const csvRows = [headers.join(",")];

        data.forEach(row => {
            const values = [
                row.timestamp || "N/A",
                row.username || "N/A",
                row.prediction || "N/A",
                row.confidence ? `${(row.confidence * 100).toFixed(1)}%` : "N/A"
            ];
            csvRows.push(values.join(","));
        });

        const csvString = csvRows.join("\n");

        // 4. Force Local Browser Download
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        const dateStr = new Date().toISOString().split('T')[0];
        a.setAttribute('href', url);
        a.setAttribute('download', `ThreatSense_${currentUsername}_History_${dateStr}.csv`);
        
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error("CSV Generation Failed:", error);
        alert("Failed to download CSV. Check the console and ensure Flask is running.");
    }
}

// 🔹 Auto-load threats only on dashboard page
window.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("dashboard.html")) {
        fetchThreats();
    }
});