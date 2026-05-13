/**
 * AI Health Symptom Checker - Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    /* --- AUTHENTICATION MODULE --- */
    const authSection = document.getElementById('authSection');
    const appSection = document.getElementById('appSection');
    const welcomeHeader = document.getElementById('welcome-header');
    const logoutBtn = document.getElementById('logout-btn');

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const authTabBtns = document.querySelectorAll('.auth-tabs .tab-btn');
    const togglePassBtns = document.querySelectorAll('.toggle-pass');

    let usersDB = JSON.parse(localStorage.getItem('users')) || [];
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

    const profileAuthBtn = document.getElementById('profile-auth-btn');
    const authCloseBtn = document.getElementById('auth-close-btn');

    if (currentUser) {
        showApp();
    } else {
        // App defaults to visible, but logout button should be hidden
        logoutBtn.style.display = 'none';
        welcomeHeader.textContent = 'AI Medical Assistant';
    }

    function showApp() {
        authSection.classList.add('hidden');
        welcomeHeader.textContent = `Welcome, ${currentUser.name.split(' ')[0]}`;
        logoutBtn.style.display = 'flex';
    }

    function showAuth() {
        authSection.classList.remove('hidden');
        loginForm.reset();
        signupForm.reset();
        clearErrors();
    }

    authCloseBtn.addEventListener('click', () => {
        authSection.classList.add('hidden');
    });

    profileAuthBtn.addEventListener('click', () => {
        if (!currentUser) showAuth();
    });

    function clearErrors() {
        document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
        document.querySelectorAll('.auth-error-banner').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    }

    // Toggle Password Visibility
    togglePassBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const input = e.target.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                e.target.textContent = '🙈';
            } else {
                input.type = 'password';
                e.target.textContent = '👁️';
            }
        });
    });

    // Auth Tabs
    authTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            authTabBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            
            clearErrors();
            if (btn.dataset.authTab === 'login') {
                loginForm.classList.remove('hidden');
                signupForm.classList.add('hidden');
            } else {
                loginForm.classList.add('hidden');
                signupForm.classList.remove('hidden');
            }
        });
    });

    // Validation Helpers
    const isEmailOrPhone = (val) => val.includes('@') || /^\d{10}$/.test(val);
    const showError = (inputId, message) => {
        const input = document.getElementById(inputId);
        const errorSpan = document.getElementById(`${inputId}-error`);
        input.classList.add('input-error');
        if(errorSpan) {
            errorSpan.textContent = message;
        }
    };

    // Signup Logic
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearErrors();
        
        const name = document.getElementById('signup-name').value.trim();
        const id = document.getElementById('signup-id').value.trim();
        const pass = document.getElementById('signup-pass').value;
        const confirm = document.getElementById('signup-confirm').value;
        let isValid = true;

        if (!isEmailOrPhone(id)) {
            showError('signup-id', 'Must be a valid email or 10-digit phone.');
            isValid = false;
        }
        if (pass.length < 6) {
            showError('signup-pass', 'Password must be at least 6 characters.');
            isValid = false;
        }
        if (pass !== confirm) {
            showError('signup-confirm', 'Passwords do not match.');
            isValid = false;
        }
        
        if (usersDB.some(user => user.login === id)) {
            const mainErr = document.getElementById('signup-main-error');
            mainErr.textContent = 'Account with this email/phone already exists.';
            mainErr.classList.remove('hidden');
            isValid = false;
        }

        if (!isValid) return;

        // Save mock user
        const newUser = { name, login: id, password: pass };
        usersDB.push(newUser);
        localStorage.setItem('users', JSON.stringify(usersDB));
        
        // Auto login
        currentUser = { name: newUser.name, login: newUser.login };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        const loader = document.getElementById('signup-loader');
        loader.style.display = 'block';
        setTimeout(() => {
            loader.style.display = 'none';
            showApp();
        }, 800);
    });

    // Login Logic
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearErrors();
        
        const id = document.getElementById('login-id').value.trim();
        const pass = document.getElementById('login-pass').value;
        
        const user = usersDB.find(u => u.login === id && u.password === pass);
        
        if (user) {
            currentUser = { name: user.name, login: user.login };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            const loader = document.getElementById('login-loader');
            loader.style.display = 'block';
            setTimeout(() => {
                loader.style.display = 'none';
                showApp();
            }, 800);
        } else {
            const mainErr = document.getElementById('login-main-error');
            mainErr.textContent = 'Invalid email/phone or password.';
            mainErr.classList.remove('hidden');
            document.getElementById('login-id').classList.add('input-error');
        }
    });

    // Logout Logic
    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem('currentUser');
        showAuth();
        logoutBtn.style.display = 'none';
        welcomeHeader.textContent = 'AI Medical Assistant';
        if (window.innerWidth <= 768) closeSidebar();
        
        // clear current state
        symptomInput.value = '';
        analyzeBtn.disabled = true;
        if (!resultsSection.classList.contains('hidden')) {
            resultsSection.classList.add('hidden');
            inputSection.classList.remove('hidden');
        }
    });
    /* --- END AUTHENTICATION MODULE --- */

    // App Elements
    const symptomInput = document.getElementById('symptom-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const btnLoader = document.getElementById('btn-loader');
    const inputSection = document.getElementById('input-section');
    const resultsSection = document.getElementById('results-section');
    const resultBody = document.getElementById('result-body');
    const tipsList = document.getElementById('tips-list');
    const backBtn = document.getElementById('back-btn');
    const historyList = document.getElementById('history-list');
    const newChatBtn = document.getElementById('new-chat-btn');
    const riskLevel = document.getElementById('risk-level');
    const resultTitle = document.getElementById('result-title');

    // Mobile Elements
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileCloseBtn = document.getElementById('mobile-close-btn');

    // New Report Feature Elements
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const uploadArea = document.getElementById('upload-area');
    const reportUpload = document.getElementById('report-upload');
    const previewContainer = document.getElementById('preview-container');
    const reportPreview = document.getElementById('report-preview');
    const removeReport = document.getElementById('remove-report');
    const analyzeReportBtn = document.getElementById('analyze-report-btn');
    const reportLoader = document.getElementById('report-loader');

    // State
    let conversationHistory = JSON.parse(localStorage.getItem('health_history')) || [];
    let selectedReport = null;

    // Initialize
    updateHistoryUI();

    // Event Listeners
    analyzeBtn.addEventListener('click', handleAnalyze);
    analyzeReportBtn.addEventListener('click', handleAnalyzeReport);
    
    // Enable/disable analyze button dynamically
    symptomInput.addEventListener('input', (e) => {
        analyzeBtn.disabled = e.target.value.trim() === '';
    });

    // Tab Switching (with ARIA updates)
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
        });
    });

    // Mobile Sidebar Logic
    function openSidebar() {
        sidebar.classList.add('open');
        mobileOverlay.classList.add('show');
    }
    
    function closeSidebar() {
        sidebar.classList.remove('open');
        mobileOverlay.classList.remove('show');
    }

    hamburgerBtn.addEventListener('click', openSidebar);
    mobileCloseBtn.addEventListener('click', closeSidebar);
    mobileOverlay.addEventListener('click', closeSidebar);

    // Report Upload Logic
    function handleFile(file) {
        if (file && file.type.startsWith('image/')) {
            selectedReport = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                reportPreview.src = e.target.result;
                previewContainer.classList.remove('hidden');
                analyzeReportBtn.disabled = false;
            };
            reader.readAsDataURL(file);
        } else {
            alert('Please select a valid image file.');
        }
    }

    uploadArea.addEventListener('click', () => reportUpload.click());

    // Drag and Drop implementation
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('active-drag');
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('active-drag');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('active-drag');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    reportUpload.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    removeReport.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedReport = null;
        reportUpload.value = '';
        previewContainer.classList.add('hidden');
        analyzeReportBtn.disabled = true;
    });

    function showInputSection() {
        document.body.style.pointerEvents = 'none';
        resultsSection.classList.add('fade-out');
        setTimeout(() => {
            resultsSection.classList.add('hidden');
            resultsSection.classList.remove('fade-out');
            
            inputSection.classList.remove('hidden');
            inputSection.classList.add('fade-in');
            setTimeout(() => {
                inputSection.classList.remove('fade-in');
                document.body.style.pointerEvents = 'auto';
            }, 300);
        }, 300);
    }

    backBtn.addEventListener('click', showInputSection);
    newChatBtn.addEventListener('click', () => {
        symptomInput.value = '';
        analyzeBtn.disabled = true;
        if (!resultsSection.classList.contains('hidden')) {
            showInputSection();
        }
    });

    /**
     * Handles the symptom analysis process
     */
    async function handleAnalyze() {
        if (!currentUser) {
            showAuth();
            return;
        }

        const text = symptomInput.value.trim();
        if (!text) {
            alert('Please describe your symptoms first.');
            return;
        }

        // UI State: Loading
        analyzeBtn.disabled = true;
        btnLoader.style.display = 'block';
        analyzeBtn.querySelector('span').textContent = 'Analyzing...';

        try {
            // Simulate AI Processing Delay
            const response = await mockAiAnalysis(text);
            
            // Save to history
            const session = {
                id: Date.now(),
                date: new Date().toLocaleDateString(),
                input: text.substring(0, 30) + (text.length > 30 ? '...' : ''),
                fullInput: text,
                analysis: response
            };
            conversationHistory.unshift(session);
            localStorage.setItem('health_history', JSON.stringify(conversationHistory));

            // UI State: Show Results
            displayResults(response);
            updateHistoryUI();
            
        } catch (error) {
            console.error('Analysis failed:', error);
            alert('An error occurred during analysis. Please try again.');
        } finally {
            analyzeBtn.disabled = false;
            btnLoader.style.display = 'none';
            analyzeBtn.querySelector('span').textContent = 'Analyze Symptoms';
        }
    }

    /**
     * Mock AI Analysis Engine
     * Enhanced with more categories and detailed solutions
     */
    function mockAiAnalysis(input) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const lowerInput = input.toLowerCase();
                
                // Fallback Assessment
                let analysis = {
                    title: "Comprehensive Wellness Assessment",
                    risk: "Low Priority",
                    summary: "The data provided indicates symptoms that are currently sub-clinical and likely related to metabolic fatigue or minor environmental stressors.",
                    breakdown: [
                        { name: "General Discomfort", details: "Non-specific physiological feedback likely due to overexertion." },
                        { name: "Metabolic Status", details: "Current energy levels suggest a temporary dip in blood glucose or electrolyte balance." }
                    ],
                    pathophysiology: "Your body is currently in a state of 'allostatic load'—the wear and tear on the body which grows over time when exposed to repeated or chronic stress. This is not a disease state but a signal for recovery.",
                    causes: ["Acute Physiological Fatigue", "Minor Circadian Disruption", "Hydration Imbalance"],
                    nutrition: [
                        "Increase Magnesium-rich foods (spinach, almonds) for muscular relaxation",
                        "Optimize hydration: 2-3 liters of spring water with trace electrolytes",
                        "Avoid refined sugars for 48 hours to minimize systemic inflammation"
                    ],
                    lifestyle: [
                        "Prioritize 8 hours of restorative sleep with no screen time 1 hour before bed",
                        "Practice 'Box Breathing' (4-4-4-4 technique) to stabilize autonomic nervous system",
                        "Monitor your core temperature and resting heart rate daily"
                    ],
                    clinical: [
                        "Log all symptom occurrences in a 'Health Journal' for potential provider review",
                        "Schedule a baseline wellness screening if symptoms persist beyond 5 days"
                    ]
                };

                // Advanced Respiratory / Infection
                if (lowerInput.includes('fever') || lowerInput.includes('cough') || lowerInput.includes('throat')) {
                    const isSevere = lowerInput.includes('high') || lowerInput.includes('severe');
                    analysis = {
                        title: isSevere ? "Acute Viral/Bacterial Assessment Required" : "Upper Respiratory Viral Analysis",
                        risk: isSevere ? "Moderate Priority" : "Low Priority",
                        summary: "Your symptoms align with an upper respiratory response. The objective is to support your immune system's primary defense mechanisms.",
                        breakdown: [
                            { name: "Pyrexia (Fever)", details: "Your immune system is raising core temperature to inhibit viral replication." },
                            { name: "Tussis (Cough)", details: "A reflex action to clear the airways of irritants, mucus, or foreign particles." },
                            { name: "Pharyngitis", details: "Inflammation of the pharynx, causing pain and irritation in the throat region." }
                        ],
                        pathophysiology: "Viral particles have likely entered the mucosal membrane, triggering an inflammatory cascade. White blood cells (leukocytes) are actively migrating to the site of infection, causing the systemic symptoms you feel.",
                        causes: ["Viral Rhinopharyngitis", "Potential Influenza Alpha/Beta", "Post-nasal Drip Irritation"],
                        nutrition: [
                            "High-dose Vitamin C (via citrus or specialized supplements) and Zinc supports immune cells",
                            "Warm bone broths provide essential amino acids and anti-inflammatory hydration",
                            "Manuka honey (MGO 400+) can provide direct soothing for pharyngeal tissues"
                        ],
                        lifestyle: [
                            "Maintain 45-60% humidity in sleeping environments using a cool-mist humidifier",
                            "Absolute vocal rest and minimal physical exertion for 72 hours",
                            "Change bed linens frequently to maintain a sanitary recovery environment"
                        ],
                        clinical: [
                            "Consult a pharmacist regarding appropriate antitussives or antipyretics",
                            "Seek immediate clinic visit if sputum color changes to dark green/yellow or blood-tinged"
                        ]
                    };
                }

                // Advanced Cardiac / High Urgency
                if (lowerInput.includes('chest pain') || lowerInput.includes('breath') || lowerInput.includes('arm')) {
                    analysis = {
                        title: "Urgent Cardiovascular Protocol Initiated",
                        risk: "High Priority",
                        summary: "These symptoms indicate a potentially serious cardiovascular or pulmonary event.",
                        breakdown: [
                            { name: "Angina (Chest Pain)", details: "Potential signaling of reduced blood flow to the cardiac muscle." },
                            { name: "Dyspnea (Shortness of Breath)", details: "Inadequate oxygen exchange or impaired cardiac output." }
                        ],
                        pathophysiology: "The heart muscle may be experiencing 'ischemia' (lack of oxygen). This triggers a high-priority neurological warning signal (pain) and compensatory respiratory increases (shortness of breath).",
                        causes: ["Acute Myocardial Ischemia (Suspected)", "Pulmonary Embolism (Differential)", "Severe Intercostal Neuralgia"],
                        nutrition: [
                            "Nil per os (Nothing by mouth) until medical evaluation is completed"
                        ],
                        lifestyle: [
                            "Cease all physical activity immediately and sit in a supported upright position",
                            "Focus on slow, steady diaphragmatic breathing",
                            "Ensure immediate access to an AED and emergency contact person"
                        ],
                        clinical: [
                            "CALL EMERGENCY SERVICES (911/112) IMMEDIATELY",
                            "Notify responders of the exact time symptoms started and any current medications (especially blood thinners)"
                        ]
                    };
                }

                resolve(analysis);
            }, 1800);
        });
    }

    /**
     * Handles the medical report analysis process
     */
    async function handleAnalyzeReport() {
        if (!currentUser) {
            showAuth();
            return;
        }
        
        if (!selectedReport) return;

        // UI State: Loading
        analyzeReportBtn.disabled = true;
        reportLoader.style.display = 'block';
        analyzeReportBtn.querySelector('span').textContent = 'Analyzing Report...';

        try {
            // Simulate AI Processing Delay
            const response = await mockReportAnalysis(selectedReport.name);
            
            // Save to history
            const session = {
                id: Date.now(),
                date: new Date().toLocaleDateString(),
                input: `Report: ${selectedReport.name}`,
                fullInput: `Analyzed medical report: ${selectedReport.name}`,
                analysis: response,
                type: 'report'
            };
            conversationHistory.unshift(session);
            localStorage.setItem('health_history', JSON.stringify(conversationHistory));

            // UI State: Show Results
            displayResults(response);
            updateHistoryUI();
            
        } catch (error) {
            console.error('Report analysis failed:', error);
            alert('An error occurred during report analysis.');
        } finally {
            analyzeReportBtn.disabled = false;
            reportLoader.style.display = 'none';
            analyzeReportBtn.querySelector('span').textContent = 'Analyze Report';
        }
    }

    /**
     * Mock AI Report Analysis Engine
     */
    function mockReportAnalysis(fileName) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const name = fileName.toLowerCase();
                let analysis = {
                    title: "Medical Report Interpretation: Blood & Metabolic Panel",
                    risk: "Moderate Priority",
                    summary: "The data suggests an 'optimization gap' in your current metabolic profile, specifically regarding micronutrient synthesis and lipid balance.",
                    breakdown: [
                        { name: "Hematological Profile", details: "Red blood cell morphology indicates optimal oxygen transport capacity." },
                        { name: "Lipid Markers", details: "Minor elevation in non-HDL cholesterol, signifying a need for dietary adjustment." },
                        { name: "Micronutrient levels", details: "Serum Ferritin and Vitamin D3 show sub-optimal levels for peak physiological performance." }
                    ],
                    pathophysiology: "Your results indicate a mild 'metabolic drift'—a state where physiological markers begin to move away from optimal base-levels, often due to high oxidative stress or nutritional insufficiency, rather than acute disease.",
                    causes: ["Micronutrient malabsorption", "Insulin sensitivity fluctuation", "Oxidative stress markers"],
                    nutrition: [
                        "Adopt a Mediterranean-style protocol high in Omega-3 fatty acids",
                        "Supplement with CoQ10 (as directed by physician) to support mitochondrial health",
                        "Limit trans-fats and increase natural antioxidant intake (berries, dark cocoa)"
                    ],
                    lifestyle: [
                        "Include 150 minutes of zone-2 aerobic activity per week to optimize lipid clearance",
                        "Track resting HRV to monitor physiological stress and recovery",
                        "Limit alcohol consumption to maximize liver detoxification efficiency"
                    ],
                    clinical: [
                        "Verify 'HbA1c' and 'Lipid Profile' specifics with your endocrinologist",
                        "Consider a follow-up metabolic panel in 6-8 weeks after lifestyle adjustments",
                        "Ask for a specific Vitamin D3/K2 check to ensure bone and vascular health"
                    ]
                };

                resolve(analysis);
            }, 2200);
        });
    }

    /**
     * Core UI update functions
     */
    function displayResults(data) {
        resultTitle.textContent = data.title;
        riskLevel.textContent = data.risk;
        
        // Dynamic styling for risk level
        if (data.risk.includes('High')) {
            riskLevel.style.background = '#fee2e2';
            riskLevel.style.color = '#ef4444';
        } else if (data.risk.includes('Moderate')) {
            riskLevel.style.background = '#fef3c7';
            riskLevel.style.color = '#d97706';
        } else {
            riskLevel.style.background = '#ecfdf5';
            riskLevel.style.color = '#065f46';
        }

        resultBody.innerHTML = `<p>${data.summary}</p>`;
        
        // Render Symptom Breakdown
        const breakdownList = document.getElementById('symptom-details-list');
        if (breakdownList) {
            breakdownList.innerHTML = '';
            (data.breakdown || []).forEach(item => {
                const div = document.createElement('div');
                div.className = 'symptom-item';
                div.innerHTML = `
                    <span class="symptom-name">${item.name}</span>
                    <span class="symptom-desc">${item.details}</span>
                `;
                breakdownList.appendChild(div);
            });
        }

        // Render Pathophysiology (Condition Deep-Dive)
        const pathContent = document.getElementById('pathophysiology-content');
        if (pathContent) {
            pathContent.innerHTML = data.pathophysiology ? `<p>${data.pathophysiology}</p>` : '<p>No deep-dive data available for this assessment.</p>';
        }

        // Render Causes
        const causesContainer = document.getElementById('causes-tags');
        if (causesContainer) {
            causesContainer.innerHTML = '';
            (data.causes || []).forEach(cause => {
                const span = document.createElement('span');
                span.className = 'cause-tag';
                span.textContent = cause;
                causesContainer.appendChild(span);
            });
        }

        // Render Categorized Tips
        const tipsContainer = document.getElementById('categorized-tips');
        tipsContainer.innerHTML = '';

        const categories = [
            { id: 'nutrition', title: 'Nutritional Protocol', icon: '🍎', list: data.nutrition },
            { id: 'lifestyle', title: 'Lifestyle & Recovery', icon: '🌙', list: data.lifestyle },
            { id: 'clinical', title: 'Clinical Next Steps', icon: '🩺', list: data.clinical }
        ];

        categories.forEach(cat => {
            if (cat.list && cat.list.length > 0) {
                const section = document.createElement('div');
                section.className = `tip-category category-${cat.id}`;
                section.innerHTML = `
                    <div class="category-header">
                        <div class="category-icon">${cat.icon}</div>
                        <span>${cat.title}</span>
                    </div>
                    <ul>
                        ${cat.list.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                `;
                tipsContainer.appendChild(section);
            }
        });

        document.body.style.pointerEvents = 'none';
        inputSection.classList.add('fade-out');
        setTimeout(() => {
            inputSection.classList.add('hidden');
            inputSection.classList.remove('fade-out');
            
            resultsSection.classList.remove('hidden');
            resultsSection.classList.add('fade-in');
            setTimeout(() => {
                resultsSection.classList.remove('fade-in');
                document.body.style.pointerEvents = 'auto';
            }, 300);
        }, 300);
    }

    function updateHistoryUI() {
        if (conversationHistory.length === 0) {
            historyList.innerHTML = '<div class="empty-history">No past sessions</div>';
            return;
        }

        historyList.innerHTML = '';
        conversationHistory.slice(0, 10).forEach(session => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div class="history-date">${session.date}</div>
                <div class="history-text">${session.input}</div>
            `;
            div.onclick = () => {
                symptomInput.value = session.fullInput;
                displayResults(session.analysis);
                if (window.innerWidth <= 768) closeSidebar();
            };
            historyList.appendChild(div);
        });
    }
});
