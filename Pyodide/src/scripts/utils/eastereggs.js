// ######################################################################################
// The crumble page on shake Easter egg is only available if the gamification is enabled
// All other Easter eggs are available regardless of the gamification state
// Easter eggs:
// - multiple clicks on different elements on the page creating images
let clickLimit = 10;
// - shake the device to crumble the simplifier page
// - special netlist inputs triggering images
// ######################################################################################

function crumbleSimplifierPage() {
    const container = document.getElementById("content-col");
    const children = Array.from(container.children);

    // No timing necessary anymore
    stopSpeedModeTimer();
    // To avoid scrolling during the animation
    container.style.overflow = "hidden";
    container.style.height = "100vh";

    if (!document.getElementById("crumble-style")) {
        const style = document.createElement("style");
        style.id = "crumble-style";
        style.textContent = `
            @keyframes crumble-fall {
            to {
              transform: translateY(100vh) translateX(var(--x)) rotate(var(--r));
              opacity: 0;
            }
            }
            `;
        document.head.appendChild(style);
    }

    // Animate each child element randomly
    children.forEach((el) => {
        const randomX = `${(Math.random() - 0.5) * 300}px`; // ±150px
        const randomRotate = `${Math.floor(Math.random() * 720 - 360)}deg`;
        const duration = 0.8 + Math.random() * 1.5;
        const delay = Math.random();

        el.style.setProperty('--x', randomX);
        el.style.setProperty('--r', randomRotate);

        el.style.animation = `crumble-fall ${duration}s ease-in ${delay}s forwards`;
        el.style.willChange = 'transform';
        el.style.pointerEvents = 'none';
        el.style.zIndex = '1000';
    });

    // Clean after animation
    setTimeout(() => {
        // To not make trouble on "normal" circuits afterward
        container.innerHTML = "";
        container.style.height = "";
    }, 3000)
}

function setupShakeAnimation() {
    if (state.shakeAlreadySetup) return;
    state.shakeAlreadySetup = true; // only once
    let shakeThreshold = 40;
    let requiredCrossings = 5;
    let windowMs = 1000; // -> 5 crossings over 40 in 1 s

    let shakeWindowStart = 0;
    let shakeThresholdCrossings = 0;
    let shakeCooldown = 1500; // To avoid multiple triggers in a short time
    let lastShakeTime = 0;

    function handleMotion(event) {
        const acc = event.accelerationIncludingGravity;
        if (!acc) return;

        const x = acc.x || 0;
        const y = acc.y || 0;
        const z = acc.z || 0;

        const total = Math.sqrt(x * x + y * y + z * z);
        const now = Date.now();

        if (total > shakeThreshold) {
            if (now - shakeWindowStart > windowMs) {
                // Start again, time window has passed
                shakeWindowStart = now;
                shakeThresholdCrossings = 1;
            } else {
                shakeThresholdCrossings++;
            }

            if (shakeThresholdCrossings >= requiredCrossings && (now - lastShakeTime > shakeCooldown)) {
                lastShakeTime = now;
                shakeThresholdCrossings = 0;
                shakeWindowStart = 0;
                onShake(total);
            }
        }
    }

    function onShake(total) {
        if (state.gamification) {
            if (pageManager.simplifierPage.style.display === "block") {
                // If simplifier is visible, trigger the simplifier crumbling
                crumbleSimplifierPage();
            }
        }
    }

    window.addEventListener('devicemotion', handleMotion);
}

function setupSelectPageEasterEggs() {
    addResHeadingEasterEgg();
    addCapHeadingEasterEgg();
    addIndHeadingEasterEgg();
}

function fetchEasterEggImages() {
    // Preload images before they are shown
    return new Promise((resolve, reject) => {
        const images = [
            "./src/resources/eastereggs/unlimitedPower.gif",
            "./src/resources/eastereggs/hello.gif",
            "./src/resources/eastereggs/theofficeMeme.png",
            "./src/resources/eastereggs/resisthor.png",
            "./src/resources/eastereggs/capacithor.png",
            "./src/resources/eastereggs/inducthor.png"
        ];

        let loadedCount = 0;
        const totalImages = images.length;

        images.forEach((src) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalImages) {
                    resolve();
                }
            };
            img.onerror = () => {
            };
        });
    });
}

function setupLandingPageEasterEggs() {
    setupMascotEasterEgg();
    setupMemeViewer();
    setupSmoothStarsEasterEgg();
}

function setupMascotEasterEgg() {
    const img = document.getElementById("landing-page-image");
    const wrapper = document.getElementById("landing-image-wrapper");

    img.addEventListener("click", () => {
        const mascotImg = document.createElement("img");
        mascotImg.src = "./src/resources/mascot/smiling.svg";

        const randomRotation = Math.floor(Math.random() * 31) - 15;
        const randomBottom = Math.floor(Math.random() * 30) + 10;
        const randomLeft = Math.floor(Math.random() * 90);
        const rotateOnExit = Math.random() < 0.5; // 50% of images rotate on exit

        mascotImg.style.position = "absolute";
        mascotImg.style.left = `${randomLeft}%`;
        mascotImg.style.bottom = `${randomBottom}%`;
        mascotImg.style.transform = `rotate(${randomRotation}deg) scale(0.9)`;
        mascotImg.style.opacity = "0";
        mascotImg.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        mascotImg.style.zIndex = "10";
        mascotImg.style.pointerEvents = "none";
        mascotImg.style.maxWidth = "30%";

        wrapper.appendChild(mascotImg);

        requestAnimationFrame(() => {
            mascotImg.style.opacity = "1";
            mascotImg.style.transform = `rotate(${randomRotation}deg) scale(1)`;
        });

        setTimeout(() => {
            if (rotateOnExit) {
                mascotImg.style.transform = `rotate(${randomRotation + 720}deg) scale(0.8)`;
            } else {
                mascotImg.style.transform = `rotate(${randomRotation}deg) scale(0.8)`;
            }
            mascotImg.style.opacity = "0";
        }, 1500);

        // Entfernen nach 3s
        setTimeout(() => {
            mascotImg.remove();
        }, 2000);
    });
}

function setupMemeViewer() {
    let div = document.getElementById("feature-container2");
    setupHoldHandler(div, startMemeViewerHandler);
}

// Starting callback function after holdDuration
function setupHoldHandler(el, callback, holdDuration = 3000) {
    let holdTimeout = null;

    function startHold() {
        clearTimeout(holdTimeout);
        holdTimeout = setTimeout(() => {
            callback();
        }, holdDuration);
    }

    function cancelHold() {
        clearTimeout(holdTimeout);
    }

    el.addEventListener("mousedown", startHold);
    el.addEventListener("mouseup", cancelHold);
    el.addEventListener("mouseleave", cancelHold);

    // Touch events for mobile devices
    el.addEventListener("touchstart", startHold);
    el.addEventListener("touchend", cancelHold);
    el.addEventListener("touchcancel", cancelHold);
}

function startMemeViewerHandler() {
    const div = document.getElementById("feature-container2");
    console.log("Hold detected – unlock enabled");

    div.style.transition = "transform 0.2s ease";
    div.style.transform = "translateX(-20%)";

    setTimeout(() => {
        div.style.transform = "translateX(0px)";
    }, 250);

    enableDragToSlide(div);

    // after all containers gone, shown memes
    onAllContainersHidden(showMemeViewer);
}

// After 600ms, see allStyles.css, to make sure that the containers are gone before doing something else
// #bootstrap-overrides .feature-container {
//     height: 220px;
//     transition: transform 0.6s ease-in; // <- this one
function onAllContainersHidden(callback, delay=600) {
    const containers = [
        document.getElementById("feature-container1"),
        document.getElementById("feature-container2"),
        document.getElementById("feature-container3")
    ];

    let completed = 0;

    containers.forEach(container => {
        const handler = () => {
            if (container.classList.contains("slide-out")) {
                completed++;
                container.removeEventListener("transitionend", handler);

                if (completed === containers.length) {
                    setTimeout(callback, delay);
                }
            }
        };

        container.addEventListener("transitionend", handler);
    });
}

function showMemeViewer() {
    let combinedDiv = document.getElementById("combined-feature-wrapper");
    if (combinedDiv) return;
    combinedDiv = document.createElement("div");
    combinedDiv.id = "combined-feature-wrapper";
    combinedDiv.style.position = "absolute";
    combinedDiv.style.height = "660px";
    combinedDiv.style.width = "100%";
    combinedDiv.style.background = "#f0f0f0";
    combinedDiv.style.display = "flex";
    combinedDiv.style.alignItems = "center";
    combinedDiv.style.justifyContent = "center";

    combinedDiv.innerHTML = createMemeCarousel();

    const firstContainer = document.getElementById("feature-container1");
    if (firstContainer && firstContainer.parentNode) {
        firstContainer.parentNode.insertBefore(combinedDiv, firstContainer);
    }
}

function createMemeCarousel() {
    let memes = [
        "./src/resources/eastereggs/meme1.jpg",
        "./src/resources/eastereggs/meme2.jpeg",
        "./src/resources/eastereggs/meme3.jpg",
        "./src/resources/eastereggs/meme4.jpg",
        "./src/resources/eastereggs/meme6.jpg",
        "./src/resources/eastereggs/meme7.jpg",
        "./src/resources/eastereggs/meme8.jpg",
        "./src/resources/eastereggs/meme9.png",
    ];
    shuffleArray(memes);
    let html = `<div class="carousel-inner">`;
    memes.forEach((meme, index) => {
        html += `<div class="carousel-item align-items-center justify-content-center ${index === 0 ? 'active' : ''}">
                    <img src="${meme}" alt="Meme ${index + 1}" style="max-width:350px;">
                </div>`;
    });
    html += `</div>
            <button class="carousel-control-prev" type="button" data-bs-target="#memeCarousel" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true" style="background-color: #ffc107"></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#memeCarousel" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true" style="background-color: #ffc107"></span>
                <span class="visually-hidden">Next</span>
            </button>`;

    return `<div id="memeCarousel" class="carousel slide" data-bs-ride="carousel">${html}</div>`;
}

let isDragging = false;
let startX = 0;
let currentX = 0;

function enableDragToSlide(el) {
    function onStart(e) {
        isDragging = true;
        el.classList.add("dragging");
        startX = e.type.startsWith("touch") ? e.touches[0].clientX : e.clientX;

        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onEnd);
        document.addEventListener("touchmove", onMove, { passive: false });
        document.addEventListener("touchend", onEnd);
    }

    function onMove(e) {
        if (!isDragging) return;
        e.preventDefault();

        const clientX = e.type.startsWith("touch") ? e.touches[0].clientX : e.clientX;
        currentX = clientX - startX;
        if (currentX > 0) currentX = 0;

        const draggedRatio = Math.abs(currentX) / el.offsetWidth;

        if (draggedRatio > 0.3) {
            isDragging = false;
            el.classList.remove("dragging");
            el.classList.add("slide-out");
            el.style.transition = "";

            if (el.id === "feature-container2") {
                triggerSlideOutWithDelay();
            }

            // Cleanup
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onEnd);
            document.removeEventListener("touchmove", onMove);
            document.removeEventListener("touchend", onEnd);
            return;
        }

        el.style.transform = `translateX(${currentX}px)`;
    }

    function onEnd() {
        if (!isDragging) return;

        isDragging = false;
        el.classList.remove("dragging");

        const draggedRatio = Math.abs(currentX) / el.offsetWidth;

        if (draggedRatio > 0.3) {
            el.classList.add("slide-out");
            el.style.transition = "";
            el.style.transform = "";

            if (el.id === "feature-container2") {
                triggerSlideOutWithDelay();
            }
        } else {
            el.style.transition = "transform 0.2s ease";
            el.style.transform = `translateX(0px)`;
            setTimeout(() => {
                el.style.transition = "";
                el.style.transform = "";
            }, 200);
        }

        // Clean up
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onEnd);
        document.removeEventListener("touchmove", onMove);
        document.removeEventListener("touchend", onEnd);
    }

    el.addEventListener("mousedown", onStart);
    el.addEventListener("touchstart", onStart);
}

function triggerSlideOutWithDelay() {
    const container1 = document.getElementById("feature-container1");
    const container3 = document.getElementById("feature-container3");

    if (container1) {
        setTimeout(() => {
            container1.classList.add("slide-out");
        }, 200);
    }

    if (container3) {
        setTimeout(() => {
            container3.classList.add("slide-out");
        }, 400);
    }
}

function resetLandingPageContainers() {
    const containers = [
        document.getElementById("feature-container1"),
        document.getElementById("feature-container2"),
        document.getElementById("feature-container3")
    ];

    containers.forEach(el => {
        if (el) {
            el.classList.remove("slide-out");
            el.style.transition = "";
            el.style.transform = "";
        }
    });

    let combinedDiv = document.getElementById("combined-feature-wrapper");
    if (combinedDiv) {
        combinedDiv.remove();
    }

    const el = document.getElementById("feature-container2");
    if (el) {
        const newEl = el.cloneNode(true);
        el.replaceWith(newEl);
    }

    // Start hold handler again
    setupMemeViewer();
}

function setupCheatSheetEasterEggs() {
    addIDeclareMeme();
}

function addResHeadingEasterEgg() {
    const resHeading = document.getElementById("res-acc-btn");
    if (!resHeading) return;
    let resCounter = 0;
    let resTimer = null;
    resHeading.addEventListener("click", () => {
        if (resTimer) clearTimeout(resTimer);
        resCounter++;
        if (resCounter >= clickLimit) {
            resCounter = 0;
            ragingThor("./src/resources/eastereggs/resisthor.png");
        } else {
            resTimer = setTimeout(() => {
                resCounter = 0;
            }, 300); // time between clicks needs to be less than 300ms
        }
    });
}

function addCapHeadingEasterEgg() {
    const capHeading = document.getElementById("cap-acc-btn");
    if (!capHeading) return;
    let capCounter = 0;
    let capTimer = null;
    capHeading.addEventListener("click", () => {
        if (capTimer) clearTimeout(capTimer);
        capCounter++;
        if (capCounter >= clickLimit) {
            capCounter = 0;
            ragingThor("./src/resources/eastereggs/capacithor.png");
        } else {
            capTimer = setTimeout(() => {
                capCounter = 0;
            }, 300); // time between clicks needs to be less than 300ms
        }
    });
}

function addIndHeadingEasterEgg() {
    const indHeading = document.getElementById("ind-acc-btn");
    if (!indHeading) return;
    let indCounter = 0;
    let indTimer = null;
    indHeading.addEventListener("click", () => {
        if (indTimer) clearTimeout(indTimer);
        indCounter++;
        if (indCounter >= clickLimit) {
            indCounter = 0;
            ragingThor("./src/resources/eastereggs/inducthor.png");
        } else {
            indTimer = setTimeout(() => {
                indCounter = 0;
            }, 300); // time between clicks needs to be less than 300ms
        }
    });
}

function addIDeclareMeme() {
    const complexFormula = document.getElementById("pRX");
    if (!complexFormula) return;
    let memeCounter = 0;
    let memeTimer = null;
    complexFormula.addEventListener("click", () => {
        if (memeTimer) clearTimeout(memeTimer);
        memeCounter++;
        if (memeCounter >= clickLimit) {
            memeCounter = 0;
            showImage("./src/resources/eastereggs/theofficeMeme.png");
        } else {
            memeTimer = setTimeout(() => {
                memeCounter = 0;
            }, 300); // time between clicks needs to be less than 300ms
        }
    });
}

function showImage(imageSrc) {
    // only show image if not already shown
    if (document.getElementById("easter-egg-image")) return;

    const container = document.createElement("div");
    container.id = "easter-egg-image";
    container.style.position = "fixed";
    container.style.top = "50%";
    container.style.left = "50%";
    container.style.transform = "translate(-50%, -50%)";
    container.style.zIndex = "9999";

    const img = document.createElement("img");
    img.src = imageSrc;
    img.style.borderRadius = "12px";
    img.style.boxShadow = "0 0 60px 10px #666";
    img.style.transition = "transform 0.6s ease-out, opacity 0.5s";
    img.style.transform = "scale(0.8)";
    img.style.opacity = "0";
    img.style.display = "block";
    img.style.maxWidth = "90vw";
    img.style.maxHeight = "90vh";

    const closeBtn = document.createElement("div");
    closeBtn.textContent = "✕";
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "-10px";
    closeBtn.style.right = "-10px";
    closeBtn.style.background = "#000";
    closeBtn.style.color = "#fff";
    closeBtn.style.fontSize = "18px";
    closeBtn.style.width = "24px";
    closeBtn.style.height = "24px";
    closeBtn.style.borderRadius = "50%";
    closeBtn.style.display = "flex";
    closeBtn.style.justifyContent = "center";
    closeBtn.style.alignItems = "center";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
    closeBtn.style.userSelect = "none";

    function closeImage() {
        img.style.transform = "scale(0.8)";
        img.style.opacity = "0";
        setTimeout(() => container.remove(), 500);
    }

    closeBtn.addEventListener("click", closeImage);

    container.appendChild(img);
    container.appendChild(closeBtn);
    document.body.appendChild(container);

    requestAnimationFrame(() => {
        img.style.transform = "scale(1)";
        img.style.opacity = "1";
    });

    // Close after 20s automatically
    setTimeout(() => {
        container.remove();
    }, 20000);
}

function ragingThor(imageSrc) {
    let duration = 5;

    let end = Date.now() + (duration * 1000 - 500); // Just a bit shorter :)
    let colors = ['#ffc107', '#003ef8'];

    (function frame() {
        confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors
        });
        confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());

    const container = document.createElement("div");
    Object.assign(container.style, {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none"
    });

    const explosion1 = document.createElement("div");
    Object.assign(explosion1.style, {
        width: "300px",
        height: "300px",
        background: "radial-gradient(circle, yellow 30%, red 60%, darkred 100%)",
        clipPath: "polygon(50% 0%, 60% 30%, 90% 30%, 65% 50%, 90% 70%, 60% 70%, 50% 100%, 40% 70%, 10% 70%, 35% 50%, 10% 30%, 40% 30%)",
        position: "absolute",
        opacity: 0,
        zIndex: 0,
        animation: "rotateCW 6s linear infinite",
    });

    const explosion2 = document.createElement("div");
    Object.assign(explosion2.style, {
        width: "280px",
        height: "280px",
        background: "radial-gradient(circle, cyan 30%, blue 60%, darkblue 100%)",
        clipPath: "polygon(50% 0%, 60% 30%, 90% 30%, 65% 50%, 90% 70%, 60% 70%, 50% 100%, 40% 70%, 10% 70%, 35% 50%, 10% 30%, 40% 30%)",
        position: "absolute",
        opacity: 0,
        zIndex: 0,
        animation: "rotateCCW 8s linear infinite",
    });

    const img = document.createElement("img");
    img.src = imageSrc;
    Object.assign(img.style, {
        width: "200px",
        transform: "scale(0)",
        opacity: 0,
        borderRadius: "12px",
        boxShadow: "0 0 60px 10px #ffcc00",
        transition: "transform 0.6s ease-out, opacity 0.5s",
        zIndex: 1,
        position: "relative"
    });

    container.appendChild(explosion1);
    container.appendChild(explosion2);
    container.appendChild(img);
    document.body.appendChild(container);

    // Start Animation
    setTimeout(() => {
        explosion1.style.opacity = 1;
        explosion2.style.opacity = 1;
        img.style.opacity = 1;
        img.style.transform = "scale(1)";
    }, 100);

    // Blend out after 3 seconds
    setTimeout(() => {
        explosion1.style.opacity = 0;
        explosion2.style.opacity = 0;
        img.style.opacity = 0;
        img.style.transform = "scale(0)";

        setTimeout(() => {
            container.remove();
        }, duration * 1000);
    }, duration * 1000);
}

function checkNetlistEasterEgg(input) {
    input = input.replaceAll("\r", "").trim(); // Remove carriage returns

    let unlimitedPower1 = "V1 1 0; down\nW 1 2; right\nW 2 3; down\nW 3 0; left";
    let unlimitedPower2 = "V1 0 1; down\nW 0 2; right\nW 2 3; down\nW 3 1; left";
    let hello = "hello";

    if (input === unlimitedPower1 || input === unlimitedPower2) {
        showImage("./src/resources/eastereggs/unlimitedPower.gif");
    } else if (input === hello) {
        showImage("./src/resources/eastereggs/hello.gif");
    }
}

// ##############################################################################
// Keystroke counter for netlist input Easter egg
// ##############################################################################

let keystrokes = [];
let kpsInterval = null;
let keydownHandler = null;
let inputHandler = null;

function startKpsTracking(editor) {
    const wrapper = editor.getWrapperElement();
    let overLimitDuration = 0;

    const windowMs = 1000;
    const checkInterval = 250;
    const requiredDuration = 2000; // the time in which the kps must not fall below the limit to trigger the Easter egg

    keydownHandler = function (e) {
        if (e.key.length === 1) {
            keystrokes.push(performance.now());
        }
    };

    inputHandler = function (e) {
        // For touchscreen input
        keystrokes.push(performance.now());
    };

    wrapper.addEventListener("keydown", keydownHandler);
    wrapper.addEventListener("input", inputHandler);

    kpsInterval = setInterval(() => {
        const now = performance.now();
        keystrokes = keystrokes.filter(ts => now - ts <= windowMs);
        const kps = keystrokes.length / (windowMs / 1000);
        const kpsLimit = 10;

        if (kps > kpsLimit) {
            overLimitDuration += checkInterval;
            if (overLimitDuration >= requiredDuration) {
                showImage("./src/resources/eastereggs/kermitTyping.gif");
            }
        } else {
            overLimitDuration = 0; // reset if under limit
        }
    }, checkInterval);
}

function stopKpsTracking(editor) {
    const wrapper = editor.getWrapperElement();
    if (keydownHandler) {
        wrapper.removeEventListener("keydown", keydownHandler);
        keydownHandler = null;
    }
    if (inputHandler) {
        wrapper.removeEventListener("input", inputHandler);
        inputHandler = null;
    }
    clearInterval(kpsInterval);
    kpsInterval = null;
    keystrokes = [];
}

function setupKeystrokeCounter(editor) {
    let collapseEl  = document.getElementById("live-drawing-acc-collapse");
    collapseEl.addEventListener("shown.bs.collapse", () => {
        startKpsTracking(editor);
    });

    collapseEl.addEventListener("hidden.bs.collapse", () => {
        stopKpsTracking(editor);
    });
}

function setupSmoothStarsEasterEgg() {
    let clickLimit = 20;
    let clickCounter = 0;
    let clickTimer = null;
    let logo = document.getElementById("nav-logo");
    if (!logo) return;
    logo.addEventListener("click", () => {
        if (clickTimer) clearTimeout(clickTimer);
        clickCounter++;
        if (clickCounter >= clickLimit) {
            clickCounter = 0;
            selectorBuilder.addSmoothStarsOverLogo();
        } else {
            clickTimer = setTimeout(() => {
                clickCounter = 0;
            }, 300); // time between clicks needs to be less than 300ms
        }
    });
}
