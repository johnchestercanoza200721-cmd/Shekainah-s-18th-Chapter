/**
 * Generate randomized flower particles for background and foreground (with collision detection)
 */
function generateFlowers() {
    const flowerTypes = ['images/flower1.png', 'images/flower2.png'];
    const flowerLayer = document.querySelector('.flower-layer');
    const foregroundLayer = document.querySelector('.foreground-flowers');
    const placedPositions = []; // Track flower positions to prevent overlap
    const minDistance = 15; // Minimum distance between flowers (% of viewport)

    function isPositionValid(top, left, size) {
        const flowerRadius = (size / window.innerWidth) * 100; // Convert size to % of viewport
        return !placedPositions.some(pos => {
            const dx = pos.left - left;
            const dy = pos.top - top;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < minDistance + pos.radius + flowerRadius;
        });
    }

    // Generate 2-4 background flowers (reduced count for better mobile performance)
    const bgFlowerCount = Math.floor(Math.random() * 3) + 2;
    let bgAttempts = 0;
    for (let i = 0; i < bgFlowerCount && bgAttempts < 20; i++, bgAttempts++) {
        const img = document.createElement('img');
        img.src = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
        img.className = 'flower';
        img.alt = 'Decorative flower';
        
        const size = Math.random() * 100 + 80; // 80-180px
        const rotation = Math.random() * 360 - 180; // -180 to 180 degrees
        const speed = Math.random() * 0.5 + 0.2; // 0.2 to 0.7
        let top = Math.random() * 100;
        let left = Math.random() * 120 - 20;
        
        // Prevent overlap
        if (!isPositionValid(top, left, size)) {
            i--; // Retry this flower
            continue;
        }
        
        const delay = Math.random() * 0.5; // 0 to 0.5s stagger
        
        img.setAttribute('data-speed', speed.toFixed(2));
        img.setAttribute('data-rotation', rotation);
        img.style.width = size + 'px';
        img.style.top = top + '%';
        img.style.left = left + '%';
        img.style.transform = `rotate(${rotation}deg)`;
        img.style.transitionDelay = delay + 's';
        
        placedPositions.push({ top, left, radius: (size / window.innerWidth) * 100 });
        flowerLayer.appendChild(img);
    }

    // Generate 2-3 foreground flowers (reduced count for better mobile performance)
    const fgFlowerCount = Math.floor(Math.random() * 2) + 2;
    let fgAttempts = 0;
    for (let i = 0; i < fgFlowerCount && fgAttempts < 20; i++, fgAttempts++) {
        const img = document.createElement('img');
        img.src = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
        img.className = 'foreground-flower';
        img.alt = 'Decorative foreground flower';
        
        const size = Math.random() * 60 + 80; // 80-140px
        const rotation = Math.random() * 360 - 180; // -180 to 180 degrees
        const speed = Math.random() * 0.4 + 0.8; // 0.8 to 1.2 (faster for depth)
        let top = Math.random() * 100;
        // Sprinkle on sides: mostly 0-5% and 95-100% left
        const leftSide = Math.random() * 4;
        const rightSide = 96 + Math.random() * 4;
        let left = Math.random() < 0.6 ? leftSide : rightSide;
        
        // Prevent overlap
        if (!isPositionValid(top, left, size)) {
            i--; // Retry this flower
            continue;
        }
        
        const delay = Math.random() * 0.6; // 0 to 0.6s stagger
        
        img.setAttribute('data-speed', speed.toFixed(2));
        img.setAttribute('data-rotation', rotation);
        img.style.width = size + 'px';
        img.style.top = top + '%';
        img.style.left = left + '%';
        img.style.transform = `rotate(${rotation}deg)`;
        img.style.transitionDelay = delay + 's';
        
        placedPositions.push({ top, left, radius: (size / window.innerWidth) * 100 });
        
        foregroundLayer.appendChild(img);
    }
}

function openInvite() {
    const overlay = document.getElementById('overlay');
    const body = document.body;
    const sealImg = document.querySelector('.seal-img');

    // Generate flowers on first open
    if (document.querySelector('.flower-layer').children.length === 0) {
        generateFlowers();
    }

    // Add breaking seal effect
    if (sealImg) {
        sealImg.style.animation = 'seal-spin-fast 0.5s ease-out forwards';
    }

    // Delay overlay disappearance for effect
    setTimeout(() => {
        overlay.classList.add('hide');
    }, 100);

    // Unlock scrolling and trigger internal animations
    body.classList.remove('locked');
    body.classList.add('is-open');

    // Initialize observers after content wrapper appears
    setTimeout(() => {
        initScrollObserver();
    }, 800);
}

/**
 * PARALLAX EFFECT for background and foreground flowers (throttled with requestAnimationFrame)
 */
let ticking = false;
let lastScrollY = 0;

function updateParallax() {
    if (!document.body.classList.contains('is-open')) return;

    const scrolled = lastScrollY;
    const backgroundFlowers = document.querySelectorAll('.flower');
    const foregroundFlowers = document.querySelectorAll('.foreground-flower');

    // Background flowers (slower parallax)
    backgroundFlowers.forEach(flower => {
        const speed = parseFloat(flower.getAttribute('data-speed')) || 0.5;
        const rotation = parseFloat(flower.getAttribute('data-rotation')) || 0;
        const yPos = scrolled * speed;
        const blurAmount = Math.max(0, (Math.abs(yPos) / 500) * 3);
        flower.style.transform = `translate3d(0, ${-yPos}px, 0) rotate(${rotation}deg)`;
        if (blurAmount > 0.5) {
            flower.style.filter = `blur(${blurAmount}px)`;
            flower.style.opacity = '0.15';
        }
    });

    // Foreground flowers (faster parallax for depth effect)
    foregroundFlowers.forEach(flower => {
        const speed = parseFloat(flower.getAttribute('data-speed')) || 0.9;
        const rotation = parseFloat(flower.getAttribute('data-rotation')) || 0;
        const yPos = scrolled * speed;
        const blurAmount = Math.max(0, (Math.abs(yPos) / 300) * 2);
        flower.style.transform = `translate3d(0, ${-yPos}px, 0) rotate(${rotation}deg)`;
        if (blurAmount > 0.3) {
            flower.style.filter = `blur(${blurAmount}px)`;
        } else {
            flower.style.filter = 'blur(0px)';
        }
    });
    
    ticking = false;
}

window.addEventListener('scroll', () => {
    lastScrollY = window.pageYOffset;
    if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
    }
}, { passive: true });

/**
 * FADE-IN OBSERVER for PNG sections on scroll
 */
function initScrollObserver() {
    const sections = document.querySelectorAll('.png-section, .music-player-section, .venue-location-section, .rsvp-button-section');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger animation for multiple sections
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 150);
            }
        });
    }, { threshold: 0.15 });

    sections.forEach(section => observer.observe(section));
}

/**
 * Initialize audio player controls
 */
function initAudioPlayer() {
    const audioPlayer = document.getElementById('audio-player');
    const playBtn = document.getElementById('play-btn');
    const playIcon = playBtn?.querySelector('.play-icon');
    const pauseIcon = playBtn?.querySelector('.pause-icon');
    const progressSlider = document.getElementById('progress-slider');
    const progressFill = document.getElementById('progress-fill');
    const currentTimeDisplay = document.getElementById('current-time');
    const durationTimeDisplay = document.getElementById('duration-time');

    if (!audioPlayer || !playBtn) return; // Exit if elements not found

    // Format time as MM:SS
    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Update duration when metadata loads
    audioPlayer.addEventListener('loadedmetadata', () => {
        progressSlider.max = audioPlayer.duration;
        durationTimeDisplay.textContent = formatTime(audioPlayer.duration);
    });

    // Play/Pause button click
    playBtn.addEventListener('click', () => {
        if (audioPlayer.paused) {
            audioPlayer.play();
        } else {
            audioPlayer.pause();
        }
    });

    // Update progress bar and time display while playing
    audioPlayer.addEventListener('timeupdate', () => {
        const percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressFill.style.width = percentage + '%';
        progressSlider.value = audioPlayer.currentTime;
        currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
    });

    // Allow seeking via slider
    progressSlider.addEventListener('change', (e) => {
        audioPlayer.currentTime = e.target.value;
    });

    // Update slider as user drags
    progressSlider.addEventListener('input', (e) => {
        const percentage = (e.target.value / audioPlayer.duration) * 100;
        progressFill.style.width = percentage + '%';
        currentTimeDisplay.textContent = formatTime(e.target.value);
    });

    // Update button icon and state on play
    audioPlayer.addEventListener('play', () => {
        if (playIcon && pauseIcon) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        }
        playBtn.classList.add('playing');
    });

    // Update button icon and state on pause
    audioPlayer.addEventListener('pause', () => {
        if (playIcon && pauseIcon) {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
        playBtn.classList.remove('playing');
    });

    // Reset button icon when audio ends
    audioPlayer.addEventListener('ended', () => {
        if (playIcon && pauseIcon) {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
        playBtn.classList.remove('playing');
    });
}

// Initialize player when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initAudioPlayer();
    initScrollObserver();
});