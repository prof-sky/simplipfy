async function generateMultipleChoiceEquations(eqs) {
    let nextElementList = document.querySelector('#nextElementsContainer ul');
    nextElementList.innerHTML = languageManager.currentLang.kirchhoff.chooseCorrectEquation;

    eqs = eqs.map((eq, index) => ({
        equation: eq,
        isCorrect: index === 0 // always the correct equation at position 0
    }));

    shuffleArray(eqs);

    for (let [i, {equation, isCorrect}] of eqs.entries()) {
        let choice = document.createElement('li');
        choice.innerHTML = `
        <div class="form-check d-flex justify-content-center" style="gap: 5px">
            <input class="form-check-input" type="radio" id="option${i}" value="${isCorrect ? '1' : '0'}">
            <label class="form-check-label equation" for="option${i}">\\(${equation}\\)</label>
        </div>`;
        nextElementList.appendChild(choice);
    }
    await MathJax.typesetPromise();
}

function subtract1Live() {
    /*
    if (!state.gamification) return;

    let lives = document.getElementById("lives");
    state.lives = state.lives - 1;
    showBrokenHeart();
    lives.innerHTML = state.lives.toString();

    if (state.lives === 0) {
        setTimeout(() => {
            let msg = document.getElementById("alert-msg");
            if (msg !== null) {
                // for the error message that created the live subtraction
                msg.remove();
                document.removeEventListener("click", removeMsgHandler);
            }
            if (state.extraLiveUsed) {
                let modal = document.getElementById("gameOverModal");
                let modalInstance = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
                modalInstance.show();
            } else {
                setupModalQuestions();
                let modal = document.getElementById("extraLiveModal");
                let modalInstance = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
                modalInstance.show();
            }
        },0);

        document.getElementById("check-btn").classList.add("disabled");
        let cb1 = document.getElementById("option0");
        let cb2 = document.getElementById("option1");
        let cb3 = document.getElementById("option2");
        for (let cb of [cb1, cb2, cb3]) {
            if (cb !== null) cb.disabled = true;
        }
        let resetBtn = document.getElementById("reset-btn");
        if (resetBtn.classList.contains("disabled")) {
            resetBtn.classList.remove("disabled");
        }
    }
    */
}

function setupModalQuestions() {
    let questionParagraph = document.getElementById("extra-live-question");
    // Choose question
    // TODO random question
    let set = languageManager.currentLang.q1;

    let question = set.q;
    let answers = set.a;
    shuffleArray(answers);

    questionParagraph.innerHTML = question;

    let answerBox1 = document.getElementById("saveLive1");
    let answerBox2 = document.getElementById("saveLive2");
    let answerBox3 = document.getElementById("saveLive3");
    let answerBox4 = document.getElementById("saveLive4");
    for (let [i, eq] of [answerBox1, answerBox2, answerBox3, answerBox4].entries()) {
        eq.style.margin = "5px";
        eq.style.padding = "10px";
        eq.style.border = `1px solid ${colors.current.foreground}`;
        eq.style.borderRadius = "5px";
        eq.style.color = colors.current.foreground;
        eq.innerHTML = answers[i][0];
        eq.value = answers[i][1];

        eq.addEventListener("click", () => {
            if (eq.value === 1) {
                eq.style.border = `1px solid ${colors.definitions.keyYellow}`;
                eq.style.backgroundColor = colors.definitions.keyYellow;
                eq.style.color = colors.current.background;
                let img = document.getElementById("extra-live-mascot-img");
                img.src = "./src/resources/mascot/smiling.svg";
                img.style.transform = "rotate(-6deg)";
                let lives = document.getElementById("lives");
                state.lives = 1;
                lives.innerHTML = state.lives.toString();
                let modal = document.getElementById("extraLiveModal");
                let modalInstance = bootstrap.Modal.getInstance(modal);
                setTimeout(() => {
                    modalInstance.hide();
                }, 750);
                let checkBtnParallel = document.getElementById("check-btn-parallel");
                if (checkBtnParallel.classList.contains("disabled")) {
                    checkBtnParallel.classList.remove("disabled");
                }
                let checkBtnSeries = document.getElementById("check-btn-series");
                if (checkBtnSeries.classList.contains("disabled")) {
                    checkBtnSeries.classList.remove("disabled");
                }
                let checkBtn = document.getElementById("check-btn");
                if (checkBtn.classList.contains("disabled")) {
                    checkBtn.classList.remove("disabled");
                }
                state.extraLiveUsed = true;
            } else {
                eq.style.border = "1px solid #888";
                eq.style.color = "#888";
            }
        }, { once : true});
    }
}

function addLivesField() {
    let live = document.getElementById("lives");
    if (live === null) {
        let logo = document.getElementById("nav-logo");
        logo.hidden = true;
        let nav = document.getElementById("navbarSupportedContent");
        let heartDiv = document.createElement("div");
        heartDiv.id = "heart-container";
        heartDiv.innerHTML = `<svg id='hearts' xmlns=\"http://www.w3.org/2000/svg\" shape-rendering=\"geometricPrecision\" text-rendering=\"geometricPrecision\" image-rendering=\"optimizeQuality\" fill-rule=\"evenodd\" clip-rule=\"evenodd\" viewBox=\"0 0 512 456.079\"><path fill=\"${colors.definitions.keyYellow}\" d=\"M253.647 83.481c130.392-219.054 509.908 65.493-.512 372.598-514.787-328.94-101.874-598.694.512-372.598z\"/><path fill=\"#F4B34A\" d=\"M344.488 10.579c146.33-39.079 316.839 185.127-65.021 429.133C561.646 215.547 470.393 36.15 344.488 10.579zM121.413.645C170.08-4.2 221.438 18.567 250.749 77.574a201.544 201.544 0 013.537 11.587c10.541 34.29.093 49.643-12.872 50.552-18.137 1.271-20.216-14.851-24.967-27.643C192.689 48.096 158.774 12.621 116.43 1.862c1.653-.434 3.315-.84 4.983-1.217z\"/><path fill=\"#FBE393\" d=\"M130.558 35.501c-42.657-4.246-87.652 23.898-99.173 66.067-7.868 25.593-.07 37.052 9.607 37.73 13.537.949 15.088-11.084 18.635-20.632 17.732-47.748 43.045-74.226 74.65-82.256a107.173 107.173 0 00-3.719-.909z\"/></svg>`;
        let heart = heartDiv.firstChild;
        heart.style.height = "15px";
        let lives = document.createElement("span");
        lives.id = "lives";
        lives.style.color = colors.current.foreground;
        lives.innerHTML = state.lives.toString();
        lives.style.fontFamily = "Roboto Condensed";
        lives.style.fontSize = "large";
        lives.style.fontWeight = "bold";
        lives.style.paddingLeft = "5px";
        lives.style.paddingTop = "5px";
        heartDiv.appendChild(lives);
        nav.insertAdjacentElement("beforebegin", heartDiv);
    } else {
        live.innerHTML = state.lives.toString();
    }
}

function showBrokenHeart() {
    // Create overlay in middle of the visible screen
    let hearts = document.getElementById("hearts");
    let overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = hearts.getBoundingClientRect().top + "px";
    overlay.style.left = hearts.getBoundingClientRect().left + "px";
    overlay.style.zIndex = "2000";
    overlay.innerHTML = `<svg xmlns=\"http://www.w3.org/2000/svg\" shape-rendering=\"geometricPrecision\" text-rendering=\"geometricPrecision\" image-rendering=\"optimizeQuality\" fill-rule=\"evenodd\" clip-rule=\"evenodd\" viewBox=\"0 0 512 446.552\"><path fill=\"${colors.definitions.keyYellow}\" d=\"M274.352 55.023c142.916-160.902 456.84 102.665-4.677 390.935l3.115-65.418 31.764-47.077c2.92-4.337 3.598-10.039 1.291-15.155L258.8 214.786l45.415-56.166c3.296-4.106 4.434-9.784 2.507-15.098l-32.37-88.499zm-35.95 391.529c-481.053-317.395-103.859-575.206 7.958-377.206l27.999 76.552-45.933 56.8c-3.805 4.734-4.398 11.011-2.078 16.201l47.41 104.324-29.303 43.414a15.556 15.556 0 00-2.671 8.917l-3.382 70.998z\"/><path fill=\"#F4B34A\" d=\"M121.349.632c46.356-4.613 95.153 15.818 125.022 68.746l9.84 26.902 17.709 48.533c-34.378 2.414-53.845-26.353-65.657-52.676-23.124-51.495-54.164-80.699-91.898-90.285 1.654-.435 3.316-.841 4.984-1.22zM344.485 10.57c146.37-39.089 316.925 185.178-65.038 429.25C561.702 215.594 470.424 36.148 344.485 10.57z\"/><path fill=\"#FBE393\" d=\"M130.498 35.5c-42.67-4.248-87.676 23.904-99.2 66.084-7.87 25.6-.07 37.062 9.609 37.741 13.541.948 15.093-11.087 18.64-20.638 17.737-47.761 43.057-74.246 74.671-82.279a108.342 108.342 0 00-3.72-.908z\"/></svg>`;
    let svg = overlay.querySelector("svg");
    svg.style.height = "17px";
    // Ease in display of overlay
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 0.1s ease-in, transform 1s ease-in-out, scale 1s ease-in-out";
    document.body.appendChild(overlay);
    // Fade-in-Effect
    setTimeout(() => {
        overlay.style.opacity = "1";
    }, 50);

    setTimeout(() => {
        overlay.style.transition = "opacity 1s ease-in, transform 1s ease-in-out, scale 1s ease-in-out";
        overlay.style.transform = "translate(-400%, 400%) scale(5)";
        overlay.style.opacity = "0";
    }, 250);

    setTimeout(() => {
        overlay.remove();
    }, 2500);
}

function shuffleArray(array) {
    let currentIndex = array.length;
    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
}

// The idea behind the variation is Skinner's variable ratio reinforcement which should make
// the whole process more exciting and less predictable.
// definitelyShowConfetti allows to disable the variation, e.g. for testing purposes or the tutorial
function showVariableConfetti(definitelyShowConfetti = true) {
    // Only show confetti about 30% of the time
    if (!definitelyShowConfetti && (Math.random() > 0.3)) return;
    confetti({
        particleCount: 150,
        angle: 90,
        spread: 60,
        scalar: 0.8,
        origin: { x: 0.5, y: 1}
    });
}

function speedModeTimeoutHandler() {
    // disable check btn
    let checkBtnParallel = document.getElementById("check-btn-parallel");
    checkBtnParallel?.classList.add("disabled");
    let checkBtnSeries = document.getElementById("check-btn-series");
    checkBtnSeries?.classList.add("disabled");
    let checkBtn = document.getElementById("check-btn");
    checkBtn?.classList.add("disabled");
    // Show message
    UserMessage.warning(languageManager.currentLang.alerts.speedModeTooSlow);
    let speedModeBar = document.getElementById("speedModeBar");
    speedModeBar?.remove();
    setTimeout(() => {
        state.selectedElements = [];
        SimplifierPage.clear();
        SimplifierPage.resetSolvers()
        if (state.currentCircuitMap.selectorGroup === window.definitions.selectorIDs.kirchhoff) {
            pageManager.pages.kirchhoffPage.reset();
            state.solvers.kirchhoff.reset();
        }
        pageManager.changePage(pageManager.pages.selectPage)
    }, 1000);

}

function addSpeedModeTimeBar(duration, onComplete) {
    const contentCol = document.getElementById("content-col");
    const div = document.createElement("div");
    div.id = "speedModeBar";
    div.style.height = "5px";
    div.style.position = "fixed";
    div.style.zIndex = "5000";
    div.style.width = "100%";
    div.style.left = "50%";
    div.style.top = "56px"; // Directly beneath fixed navbar
    div.style.transform = "translateX(-50%)";
    div.style.backgroundColor = colors.definitions.keyYellow;
    let navbar = document.getElementById("navbar");
    navbar.insertAdjacentElement("beforebegin", div);

    const containerWidth = contentCol.offsetWidth;
    const start = performance.now();

    state.speedMode = {
        startTime: start,
        duration: duration,
        div: div,
        requestId: null,
        onComplete: onComplete
    };

    function animate(now) {
        const elapsed = now - state.speedMode.startTime;
        const progress = Math.min(elapsed / state.speedMode.duration, 1);
        const newWidth = containerWidth * (1 - progress);
        state.speedMode.div.style.width = newWidth + "px";

        if (progress < 1) {
            state.speedMode.requestId = requestAnimationFrame(animate);
        } else {
            state.speedMode.requestId = null;
            if (state.speedMode.onComplete) state.speedMode.onComplete();
        }

        const timeLeft = state.speedMode.duration - elapsed;
        if (timeLeft <= 2750) {
            const cycleTime = 1000;
            const redPhase = 250;
            const cyclePosition = timeLeft % cycleTime;

            const isRed = cyclePosition <= redPhase;
            state.speedMode.div.style.backgroundColor = isRed ? "#ff3333" : colors.definitions.keyYellow;
        } else {
            state.speedMode.div.style.backgroundColor = colors.definitions.keyYellow;
        }
    }

    state.speedMode.requestId = requestAnimationFrame(animate);
}

function stopSpeedModeTimer() {
    if (state.speedMode?.requestId) {
        cancelAnimationFrame(state.speedMode.requestId);
        state.speedMode.requestId = null;
    }

    if (state.speedMode?.div) {
        state.speedMode.div.remove();
        state.speedMode.div = null;
    }

    state.speedMode = null;
}

function pauseSpeedMode() {
    if (!state.speedMode || state.speedMode.paused) return;

    state.speedMode.paused = true;
    cancelAnimationFrame(state.speedMode.requestId);

    const now = performance.now();
    return now - state.speedMode.startTime;
}

function resumeSpeedMode() {
    if (!state.speedMode || !state.speedMode.paused) return;

    const containerWidth = document.getElementById("content-col").offsetWidth;
    state.speedMode.startTime = performance.now();
    state.speedMode.paused = false;

    function animate(now) {
        if (state.speedMode.paused) return;

        const elapsed = now - state.speedMode.startTime;
        const progress = Math.min(elapsed / state.speedMode.remaining, 1);
        const newWidth = containerWidth * (1 - progress);
        state.speedMode.div.style.width = newWidth + "px";

        if (progress < 1) {
            state.speedMode.requestId = requestAnimationFrame(animate);
        } else {
            state.speedMode.requestId = null;
            if (state.speedMode.onComplete) state.speedMode.onComplete();
        }

        const timeLeft = state.speedMode.remaining - elapsed;
        if (timeLeft <= 2750) {
            const cycleTime = 1000;
            const redPhase = 250;
            const cyclePosition = timeLeft % cycleTime;
            const isRed = cyclePosition <= redPhase;
            state.speedMode.div.style.backgroundColor = isRed ? "#ff3333" : colors.definitions.keyYellow;
        } else {
            state.speedMode.div.style.backgroundColor = colors.definitions.keyYellow;
        }
    }

    state.speedMode.requestId = requestAnimationFrame(animate);
}

function resetLives() {
    if (!state.gamification) return;

    state.lives = 3;
    state.extraLiveUsed = false;
    let lives = document.getElementById("lives");
    if (lives !== null) {
        lives.innerHTML = state.lives.toString();
    }
}

function resetExtraLiveModal() {
    if (state.gamification) {
        let img = document.getElementById("extra-live-mascot-img");
        img.src = "./src/resources/mascot/sad.svg";
        img.style.transform = "rotate(6deg) scale(0.5)";
        let eq1 = document.getElementById("saveLive1");
        let eq2 = document.getElementById("saveLive2");
        let eq3 = document.getElementById("saveLive3");
        let eq4 = document.getElementById("saveLive4");
        for (let eq of [eq1, eq2, eq3, eq4]) {
            eq.style.border = `1px solid ${colors.current.foreground}`;
            eq.style.backgroundColor = "transparent";
            eq.style.color = colors.current.foreground;
            eq.value = 0;
        }
    }
}


