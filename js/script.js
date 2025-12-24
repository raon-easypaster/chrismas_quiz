document.addEventListener('DOMContentLoaded', () => {
    // State
    const state = {
        teams: [], // { name: "Team A", score: 0 }
        currentQuestion: null,
        usedQuestions: new Set(),
        quizData: [], // Store current quiz data here
        churchName: "열방위에서는교회" // Default church name
    };

    // DOM Elements
    const screens = {
        intro: document.getElementById('intro-screen'),
        board: document.getElementById('board-screen'),
        question: document.getElementById('question-screen'),
        result: document.getElementById('result-screen'),
        editor: document.getElementById('editor-screen')
    };

    const teamInputsContainer = document.getElementById('team-inputs');
    const startBtn = document.getElementById('start-game-btn');
    const addTeamBtn = document.getElementById('add-team-btn');
    const editQuizBtn = document.getElementById('edit-quiz-btn');
    const gameBoard = document.getElementById('game-board');
    const scoreTicker = document.getElementById('score-ticker');

    // Church Name Elements
    const churchNameInput = document.getElementById('church-name-input');
    const titleMain = document.getElementById('title-main');
    const titleHeader = document.getElementById('title-header');
    const pageTitle = document.getElementById('page-title');

    // Editor Elements
    const editorContainer = document.getElementById('editor-container');
    const saveDataBtn = document.getElementById('save-data-btn');
    const resetDataBtn = document.getElementById('reset-data-btn');
    const exportDataBtn = document.getElementById('export-data-btn');

    // Question Modal Elements
    const qCategory = document.getElementById('q-category');
    const qPoints = document.getElementById('q-points');
    const qText = document.getElementById('question-text');
    const mediaArea = document.getElementById('media-area');
    const showAnswerBtn = document.getElementById('show-answer-btn');
    const closeQuestionBtn = document.getElementById('close-question-btn');
    const answerArea = document.getElementById('answer-area');
    const answerText = document.getElementById('answer-text');
    const scoringArea = document.getElementById('scoring-area');
    const teamScoringButtons = document.getElementById('team-scoring-buttons');

    // Audio
    const sfxCorrect = document.getElementById('sfx-correct');

    // --- init ---
    function init() {
        // Load Data
        loadQuizData();
        loadChurchName();

        // Create 2 default team inputs
        addTeamInput();
        addTeamInput();

        addTeamBtn.addEventListener('click', addTeamInput);
        startBtn.addEventListener('click', startGame);
        editQuizBtn.addEventListener('click', openEditor);

        showAnswerBtn.addEventListener('click', revealAnswer);
        closeQuestionBtn.addEventListener('click', closeQuestion);
        document.getElementById('restart-btn').addEventListener('click', () => location.reload());

        // Church Name Listener
        churchNameInput.addEventListener('input', (e) => {
            updateChurchName(e.target.value);
        });

        // Editor Listeners
        saveDataBtn.addEventListener('click', saveEditorData);
        resetDataBtn.addEventListener('click', resetQuizData);
        exportDataBtn.addEventListener('click', exportQuizData);
    }

    // --- Data Management ---
    function loadQuizData() {
        const stored = localStorage.getItem('christmasQuizData');
        if (stored) {
            try {
                // Ensure deep copy to avoid reference issues if modifying
                state.quizData = JSON.parse(stored);
                console.log("Loaded data from localStorage");
            } catch (e) {
                console.error("Failed to parse stored data", e);
                state.quizData = JSON.parse(JSON.stringify(QUIZ_DATA));
            }
        } else {
            // Fallback to default in data.js
            // Important: Use deep copy so we don't mutate original const if we reload
            state.quizData = JSON.parse(JSON.stringify(QUIZ_DATA));
        }
    }

    function loadChurchName() {
        const storedName = localStorage.getItem('christmasChurchName');
        if (storedName) {
            state.churchName = storedName;
        } else {
            state.churchName = "열방위에서는교회";
        }

        // Sync Inputs and DOM
        churchNameInput.value = state.churchName;
        renderChurchName();
    }

    function updateChurchName(newName) {
        state.churchName = newName || "열방위에서는교회"; // Fallback if empty
        localStorage.setItem('christmasChurchName', state.churchName);
        renderChurchName();
    }

    function renderChurchName() {
        const name = state.churchName;
        if (titleMain) titleMain.textContent = name;
        if (titleHeader) titleHeader.textContent = name;
        if (pageTitle) pageTitle.textContent = `선물 가득한 ${name} 퀴즈대회`;
    }

    function saveQuizData() {
        localStorage.setItem('christmasQuizData', JSON.stringify(state.quizData));
        alert("퀴즈 데이터가 저장되었습니다!");
    }

    function resetQuizData() {
        if (confirm("정말로 모든 데이터를 초기 상태로 되돌리겠습니까?")) {
            localStorage.removeItem('christmasQuizData');
            localStorage.removeItem('christmasChurchName');
            state.quizData = JSON.parse(JSON.stringify(QUIZ_DATA));

            // Reset Church Name
            state.churchName = "열방위에서는교회";
            churchNameInput.value = state.churchName;
            renderChurchName();

            renderEditor(); // Refresh editor view
            alert("데이터가 초기화되었습니다.");
        }
    }

    function exportQuizData() {
        const dataStr = JSON.stringify(state.quizData, null, 2);
        prompt("아래 텍스트를 전체 복사(Ctrl+A -> Ctrl+C) 해주세요:", dataStr);
    }

    // --- Editor Logic ---
    function openEditor() {
        switchScreen('editor');
        renderEditor();
    }

    function renderEditor() {
        editorContainer.innerHTML = '';

        state.quizData.forEach((catData, catIndex) => {
            const catBlock = document.createElement('div');
            catBlock.style.border = "1px solid #ccc";
            catBlock.style.padding = "20px";
            catBlock.style.borderRadius = "10px";
            catBlock.style.background = "#f9f9f9";

            // Category Title Edit
            const catTitleGroup = document.createElement('div');
            catTitleGroup.innerHTML = `<label style="font-weight:bold; display:block; margin-bottom:5px;">카테고리 제목 (Category ${catIndex + 1})</label>`;
            const catInput = document.createElement('input');
            catInput.type = "text";
            catInput.value = catData.category;
            catInput.style.width = "100%";
            catInput.style.padding = "10px";
            catInput.style.fontSize = "1.2rem";
            catInput.style.marginBottom = "15px";
            catInput.onchange = (e) => { state.quizData[catIndex].category = e.target.value; };
            catTitleGroup.appendChild(catInput);
            catBlock.appendChild(catTitleGroup);

            // Questions
            const qList = document.createElement('div');
            qList.style.display = "flex";
            qList.style.flexDirection = "column";
            qList.style.gap = "15px";

            catData.questions.forEach((q, qIndex) => {
                const qRow = document.createElement('div');
                qRow.style.display = "grid";
                qRow.style.gridTemplateColumns = "50px 1fr 1fr";
                qRow.style.gap = "10px";
                qRow.style.alignItems = "center";
                qRow.style.padding = "10px";
                qRow.style.background = "white";
                qRow.style.border = "1px solid #eee";

                // Point Label
                const pLabel = document.createElement('div');
                pLabel.textContent = `${q.points}점`;
                pLabel.style.fontWeight = "bold";
                pLabel.style.textAlign = "center";

                // Question Input

                // Answer Input
                const aInput = document.createElement('textarea');
                aInput.placeholder = "정답을 입력하세요";
                aInput.value = q.a;
                aInput.rows = 2;
                aInput.style.padding = "5px";
                aInput.onchange = (e) => { state.quizData[catIndex].questions[qIndex].a = e.target.value; };

                qRow.appendChild(pLabel);

                // Container for Question + Image URL
                const qContainer = document.createElement('div');
                qContainer.style.display = 'flex';
                qContainer.style.flexDirection = 'column';
                qContainer.style.gap = '5px';

                const qInput = document.createElement('textarea');
                qInput.placeholder = "문제 내용을 입력하세요";
                qInput.value = q.q;
                qInput.rows = 2;
                qInput.style.padding = "5px";
                qInput.onchange = (e) => { state.quizData[catIndex].questions[qIndex].q = e.target.value; };

                const imgInput = document.createElement('input');
                imgInput.type = "text";
                imgInput.placeholder = "이미지 URL (선택)";
                imgInput.value = q.img || ""; // Handle undefined
                imgInput.style.padding = "5px";
                imgInput.style.fontSize = "0.8rem";
                imgInput.onchange = (e) => { state.quizData[catIndex].questions[qIndex].img = e.target.value; };

                qContainer.appendChild(qInput);
                qContainer.appendChild(imgInput);

                qRow.appendChild(qContainer);
                qRow.appendChild(aInput);
                qList.appendChild(qRow);
            });

            catBlock.appendChild(qList);
            editorContainer.appendChild(catBlock);
        });
    }

    function saveEditorData() {
        // state.quizData is already updated via onchange events
        saveQuizData();
        switchScreen('intro');
    }


    // --- Team Setup ---
    function addTeamInput() {
        const count = teamInputsContainer.children.length + 1;
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `팀 ${count} 이름`;
        input.value = `팀 ${count}`; // Default value
        teamInputsContainer.appendChild(input);
    }

    function startGame() {
        // Collect team names
        const inputs = teamInputsContainer.querySelectorAll('input');
        state.teams = [];
        inputs.forEach(input => {
            if (input.value.trim()) {
                state.teams.push({ name: input.value.trim(), score: 0 });
            }
        });

        if (state.teams.length < 1) {
            alert("최소 1팀 이상 필요합니다!");
            return;
        }

        switchScreen('board');
        renderBoard();
        updateScoreTicker();
    }

    // --- Board Logic ---
    function renderBoard() {
        gameBoard.innerHTML = '';

        // Uses state.quizData now instead of global QUIZ_DATA
        const dataToRender = state.quizData;

        // Set CSS grid columns based on category count
        gameBoard.style.gridTemplateColumns = `repeat(${dataToRender.length}, 1fr)`;

        // 1. Render Headers
        dataToRender.forEach(categoryData => {
            const header = document.createElement('div');
            header.className = 'category-header';
            header.textContent = categoryData.category;
            gameBoard.appendChild(header);
        });

        // 2. Render Question Grid (Row by Row)
        const maxQuestions = Math.max(...dataToRender.map(c => c.questions.length));

        for (let i = 0; i < maxQuestions; i++) {
            dataToRender.forEach(categoryData => {
                const q = categoryData.questions[i];
                const card = document.createElement('div');
                card.className = 'question-card';

                if (q) {
                    card.textContent = q.points;
                    card.dataset.id = q.id;
                    if (state.usedQuestions.has(q.id)) {
                        card.classList.add('used');
                        card.textContent = ''; // Hide points if used
                    } else {
                        card.onclick = () => openQuestion(q, categoryData.category);
                    }
                }
                gameBoard.appendChild(card);
            });
        }
    }

    function updateScoreTicker() {
        scoreTicker.textContent = state.teams.map(t => `${t.name}: ${t.score}`).join('  |  ');
    }

    // --- Question Logic ---
    function openQuestion(question, categoryName) {
        state.currentQuestion = question;

        // UI Updates
        qCategory.textContent = categoryName;
        qPoints.textContent = `${question.points} 점`;
        qText.textContent = question.q;

        // Image Handling
        mediaArea.innerHTML = '';
        if (question.img && question.img.trim() !== '') {
            const img = document.createElement('img');
            img.src = question.img;
            img.alt = "Question Image";
            img.style.maxWidth = "100%";
            img.style.maxHeight = "400px";
            img.style.borderRadius = "15px";
            img.style.marginTop = "15px";
            img.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
            mediaArea.appendChild(img);
        }

        answerText.textContent = question.a;

        // Reset states
        answerArea.classList.add('hidden');
        answerArea.style.display = 'none'; // Force hide

        scoringArea.classList.add('hidden');
        showAnswerBtn.classList.remove('hidden');
        closeQuestionBtn.classList.add('hidden');

        // Render Scoring Buttons
        renderScoringButtons();

        switchScreen('question');
    }

    function revealAnswer() {
        answerArea.classList.remove('hidden');
        answerArea.style.display = 'block'; // Force show
        showAnswerBtn.classList.add('hidden');
        scoringArea.classList.remove('hidden');

        // Allow pure closing without scoring (for pass)
        closeQuestionBtn.classList.remove('hidden');
    }

    function renderScoringButtons() {
        teamScoringButtons.innerHTML = '';
        state.teams.forEach((team, index) => {
            const btn = document.createElement('button');
            btn.className = 'score-btn';
            btn.textContent = `${team.name} (+${state.currentQuestion.points})`;
            btn.onclick = () => awardPoints(index);
            teamScoringButtons.appendChild(btn);
        });
    }

    function awardPoints(teamIndex) {
        // Add points
        state.teams[teamIndex].score += state.currentQuestion.points;
        playCorrectSound();

        // Close
        closeQuestion();
    }

    function closeQuestion() {
        if (state.currentQuestion) {
            state.usedQuestions.add(state.currentQuestion.id);
        }
        updateScoreTicker();
        switchScreen('board');
        renderBoard(); // Re-render to show used status
    }

    // --- Utility ---
    function switchScreen(screenName) {
        Object.values(screens).forEach(el => el.classList.add('hidden'));
        screens[screenName].classList.remove('hidden');
    }

    function playCorrectSound() {
        if (sfxCorrect) {
            sfxCorrect.currentTime = 0;
            sfxCorrect.play().catch(e => console.log('Audio play failed', e));
        }
    }

    // Run init
    init();
});
