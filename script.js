document.addEventListener('DOMContentLoaded', () => {
    const playBtn = document.getElementById('play-btn');
    const startOverlay = document.getElementById('start-overlay');
    const audio = document.getElementById('bg-music');
    const scenes = document.querySelectorAll('.scene');

    // GSAP Timeline
    const tl = gsap.timeline({ paused: true });

    // Scene 1: Date Highlight
    tl.to('#scene-1', { duration: 0.5, autoAlpha: 1 })
        .from('.date-text', { duration: 3, scale: 0.8, opacity: 0, ease: 'power2.out' }, '+=0.5')
        .to('.glow-point', { duration: 2, scale: 1.5, opacity: 0.8, repeat: 1, yoyo: true }, '-=2')
        .to('#scene-1', { duration: 1, autoAlpha: 0, scale: 1.2, ease: 'power2.in' }, '+=1');

    // Scene 2: 16 Complete -> Level 17 Unlocked
    tl.to('#scene-2', { duration: 0.5, autoAlpha: 1 })
        .from('.old-age', { duration: 1.5, y: 30, opacity: 0, ease: 'power2.out' })
        .from('.new-age', { duration: 2, scale: 1.5, opacity: 0, ease: 'back.out(1.7)' }, '-=0.5')
        .to('.old-age', { duration: 1, opacity: 0.2, scale: 0.9 }, '+=0.5')
        .to('#scene-2', { duration: 1, autoAlpha: 0, filter: 'blur(20px)', scale: 1.1, ease: 'power2.in' }, '+=1');

    // Scene 3: Born to Shine
    tl.to('#scene-3', { duration: 0.5, autoAlpha: 1 })
        .from('.shine-text', { duration: 2.5, scale: 0.5, opacity: 0, rotationX: 45, ease: 'elastic.out(1, 0.5)' })
        .to('.flare', { duration: 2, left: '150%', ease: 'power1.inOut' }, '-=2')
        .to('#scene-3', { duration: 1, autoAlpha: 0, y: -100, ease: 'power2.in' }, '+=1.5');

    // Scene 4: Final Scene
    tl.to('#scene-4', { duration: 1, autoAlpha: 1 })
        .from('.gold-gradient-text', { duration: 2, y: 50, opacity: 0, ease: 'power3.out' })
        .add(() => createConfetti(), '-=1');

    function startExperience() {
        audio.play().catch(e => console.log('Audio play failed:', e));
        gsap.to(startOverlay, { duration: 1, opacity: 0, onComplete: () => startOverlay.style.display = 'none' });
        tl.play();
    }

    if (startOverlay) startOverlay.addEventListener('click', startExperience);
    if (playBtn) playBtn.addEventListener('click', startExperience);

    // Confetti System
    function createConfetti() {
        const container = document.getElementById('confetti');
        const pieces = 100;
        const colors = ['#D4AF37', '#FFD700', '#BD9731', '#FFF'];

        for (let i = 0; i < pieces; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            container.appendChild(piece);

            const size = Math.random() * 8 + 4;
            const x = Math.random() * 100;
            const y = -20;
            const color = colors[Math.floor(Math.random() * colors.length)];

            gsap.set(piece, {
                x: x + '%',
                y: y + '%',
                width: size,
                height: size,
                backgroundColor: color,
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
                opacity: 0.8,
                rotation: Math.random() * 360
            });

            gsap.to(piece, {
                duration: Math.random() * 4 + 2,
                y: '110%',
                x: '+=' + (Math.random() * 200 - 100),
                rotation: Math.random() * 720,
                opacity: 0,
                ease: 'power1.out',
                delay: Math.random() * 2
            });
        }
    }
});
