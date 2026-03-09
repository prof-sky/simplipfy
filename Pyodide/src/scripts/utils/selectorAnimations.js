/** Displays animations that are used in {@link Selector} */
class SelectorAnimations{
    static showFinishedSelectorAnimation(identifier) {
        const container = document.createElement("div");
        container.style.position = "fixed";
        container.style.top = "50%";
        container.style.left = "50%";
        container.style.transform = "translate(-50%, -50%)";
        container.style.zIndex = "9999";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.alignItems = "center";
        container.style.pointerEvents = "none";
        container.style.opacity = "0";
        container.style.transition = "opacity 1s ease";
        container.style.padding = "100%"; // full screen blurred
        container.style.backdropFilter = "blur(10px)";

        const star = document.createElement("div");
        star.innerHTML = `<svg id="star-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="250px" viewBox="0 -0.5 33 33" version="1.1">
                            <!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
                            <title>star</title>
                            <desc>Created with Sketch.</desc>
                            <defs></defs>
                            <g id="Vivid.JS" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                <g id="Vivid-Icons" transform="translate(-903.000000, -411.000000)" fill="#FFC107">
                                    <g id="Icons" transform="translate(37.000000, 169.000000)">
                                        <g id="star" transform="translate(858.000000, 234.000000)">
                                            <g transform="translate(7.000000, 8.000000)" id="Shape">
                                                <polygon points="27.865 31.83 17.615 26.209 7.462 32.009 9.553 20.362 0.99 12.335 12.532 10.758 17.394 0 22.436 10.672 34 12.047 25.574 20.22"></polygon>
                                            </g>
                                        </g>
                                    </g>
                                </g>
                            </g>
                        </svg>`;

        const text = document.createElement("div");
        text.textContent = languageManager.currentLang.selector.selectorHeadings[identifier];
        text.style.fontSize = "48px";
        text.style.color = colors.current.headingForeground;
        text.style.fontWeight = "bold";
        text.style.marginTop = "20px";
        text.style.position = "absolute";
        text.style.top = "60%";

        // Append elements to container
        container.appendChild(star);
        container.appendChild(text);
        document.body.appendChild(container);

        // Fade in
        setTimeout(() => {
            container.style.opacity = "1";
        }, 250);

        // Fade out
        setTimeout(() => {
            container.style.opacity = "0";
        }, 3000);

        // Remove
        setTimeout(() => {
            container.remove();
        }, 4000);

        let duration = 3;

        let end = Date.now() + (duration * 1000 - 500); // Just a bit shorter :)
        let confettiColors = ['#ffc107', '#ffc107'];

        (function frame() {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: confettiColors
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: confettiColors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }

    static addSmoothStarsOverLogo() {
        const logo = document.getElementById("nav-logo");

        const wrapper = document.createElement("span");
        wrapper.id = "smooth-stars-wrapper";
        wrapper.style.position = "relative";
        wrapper.style.display = "inline-block";
        logo.parentNode.insertBefore(wrapper, logo);
        wrapper.appendChild(logo);

        function createStar() {
            const star = document.createElement("span");
            star.textContent = Math.random() > 0.5 ? "✦" : "★";

            const size = Math.random() * 6 + 6;
            const duration = Math.random() * 1000 + 1500;

            const x = Math.random() * wrapper.offsetWidth;
            const startY = wrapper.offsetHeight - 2;

            // horizontale Verschiebung zufällig ±10px
            const horizontalShift = (Math.random() - 0.5) * 20; // von -10 bis +10 px

            Object.assign(star.style, {
                position: "absolute",
                left: `${x}px`,
                top: `${startY}px`,
                fontSize: `${size}px`,
                color: "#ffc107",
                opacity: 0,
                pointerEvents: "none",
                zIndex: 0,
                transform: "translateX(0px) translateY(0px) scale(0.5)",
                transition: `opacity ${duration * 0.3}ms ease-in, transform ${duration}ms ease-out`
            });

            wrapper.appendChild(star);

            // Animation starten: opacity auf 1, vertikal + horizontal verschieben, skalieren
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    star.style.opacity = 1;
                    star.style.transform = `translateX(${horizontalShift}px) translateY(-40px) scale(1)`;
                });
            });

            // Fade-out starten kurz vor Ende, opacity runter, transform bleibt gleich
            setTimeout(() => {
                star.style.opacity = 0;
            }, duration * 0.8);

            // Entfernen
            setTimeout(() => {
                star.remove();
            }, duration);
        }

        setInterval(() => {
            createStar();
        }, 700);
    }
}