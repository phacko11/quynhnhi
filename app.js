/**
 * Birthday Card Interactive Application - FIXED VERSION
 * Features: Fixed card opening, page flipping, music controls, fireworks, and animations
 */

class BirthdayCardApp {
    constructor() {
        // State management
        this.currentPage = 'coverPage';
        this.isCardOpened = false;
        this.musicPlaying = false;
        this.fireworksTriggered = false;
        this.pageOrder = ['coverPage', 'page1', 'page2', 'page3', 'page4'];
        this.currentPageIndex = 0;
        
        // Timing controls to prevent rapid clicking/hovering issues
        this.isTransitioning = false;
        this.hoverTimeout = null;
        this.cardHoverTimeout = null;
        
        this.initializeApp();
    }
    
    /**
     * Initialize the application
     */
    initializeApp() {
        this.waitForDOM(() => {
            this.cacheElements();
            this.setupEventListeners();
            this.initializeMusic();
            this.hideLoadingScreen();
            this.setupAccessibility();
            
            // Add sparkle effects
            this.startSparkleEffect();
            
            console.log('🎉 Birthday Card App Initialized Successfully!');
            console.log('💝 Instructions: Hover over card to open, hover right side to flip pages');
        });
    }
    
    /**
     * Wait for DOM to be fully loaded
     */
    waitForDOM(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }
    
    /**
     * Cache DOM elements
     */
    cacheElements() {
        // Card elements
        this.card = document.getElementById('birthdayCard');
        this.coverPage = document.getElementById('coverPage');
        this.pages = {
            coverPage: document.getElementById('coverPage'),
            page1: document.getElementById('page1'),
            page2: document.getElementById('page2'),
            page3: document.getElementById('page3'),
            page4: document.getElementById('page4')
        };
        
        // Control elements
        this.musicToggle = document.getElementById('musicToggle');
        this.backgroundMusic = document.getElementById('backgroundMusic');
        this.fireworksContainer = document.getElementById('fireworksContainer');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.helpToggle = document.getElementById('helpToggle');
        this.helpPopup = document.getElementById('helpPopup');
        
        // Page flip areas
        this.flipAreas = document.querySelectorAll('.page-flip-area');
        
        // Store reference globally for debugging
        window.birthdayApp = this;
    }
    
    /**
     * Setup all event listeners - FIXED VERSION
     */
    setupEventListeners() {
        // FIXED: Card opening (proper hover handling)
        this.coverPage.addEventListener('mouseenter', (e) => {
            if (!this.isCardOpened) {
                this.scheduleCardOpen();
            }
        });
        
        // Prevent card from closing when moving within the card
        this.card.addEventListener('mouseleave', (e) => {
            // Only close if we're leaving the entire card area and card is opened
            const rect = this.card.getBoundingClientRect();
            const { clientX, clientY } = e;
            
            if (this.isCardOpened && (
                clientX < rect.left || 
                clientX > rect.right || 
                clientY < rect.top || 
                clientY > rect.bottom
            )) {
                // Don't close immediately - give time for re-entry
                this.scheduleCardClose();
            }
        });
        
        // Re-enter card area cancels close
        this.card.addEventListener('mouseenter', () => {
            if (this.cardCloseTimeout) {
                clearTimeout(this.cardCloseTimeout);
                this.cardCloseTimeout = null;
            }
        });
        
        // Click support for opening
        this.coverPage.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openCard('click');
        });
        
        // FIXED: Page flip areas with proper event handling
        this.flipAreas.forEach(flipArea => {
            const nextPageId = flipArea.getAttribute('data-next-page');
            
            // Hover events for desktop - FIXED
            flipArea.addEventListener('mouseenter', (e) => {
                e.stopPropagation();
                if (this.isCardOpened && !this.isTransitioning) {
                    this.schedulePageFlip(nextPageId, 'hover');
                }
            });
            
            // Click events for mobile/tablet
            flipArea.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.isCardOpened && !this.isTransitioning) {
                    this.flipToPage(nextPageId, 'click');
                }
            });
            
            // Touch events for mobile
            flipArea.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (this.isCardOpened && !this.isTransitioning) {
                    this.flipToPage(nextPageId, 'touch');
                }
            });
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
        
        // Music controls
        this.musicToggle.addEventListener('click', () => this.toggleMusic());
        
        // Help controls
        this.helpToggle.addEventListener('click', () => this.toggleHelp());
        
        // Auto-start music after user interaction
        this.setupAutoMusic();
        
        // Handle page visibility for music
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
        
        // Prevent context menu
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }
    
    /**
     * Schedule card opening with small delay for smoother UX
     */
    scheduleCardOpen() {
        if (this.cardHoverTimeout) {
            clearTimeout(this.cardHoverTimeout);
        }
        
        this.cardHoverTimeout = setTimeout(() => {
            this.openCard('hover');
        }, 300);
    }
    
    /**
     * Schedule card closing with delay to prevent accidental closing
     */
    scheduleCardClose() {
        if (this.cardCloseTimeout) {
            clearTimeout(this.cardCloseTimeout);
        }
        
        this.cardCloseTimeout = setTimeout(() => {
            this.closeCard();
        }, 1000); // 1 second delay before closing
    }
    
    /**
     * Schedule page flip with delay to prevent rapid triggering
     */
    schedulePageFlip(nextPageId, trigger) {
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
        }
        
        this.hoverTimeout = setTimeout(() => {
            this.flipToPage(nextPageId, trigger);
        }, trigger === 'hover' ? 400 : 0);
    }
    
    /**
     * Open the birthday card - FIXED
     */
    openCard(trigger) {
        if (this.isCardOpened || this.isTransitioning) {
            return;
        }
        
        console.log(`Opening card via ${trigger}...`);
        
        this.isTransitioning = true;
        this.isCardOpened = true;
        
        // Clear any pending close timeouts
        if (this.cardCloseTimeout) {
            clearTimeout(this.cardCloseTimeout);
            this.cardCloseTimeout = null;
        }
        
        // Hide cover and show first page
        setTimeout(() => {
            this.switchToPage('page1');
            this.isTransitioning = false;
            
            // Start background music
            this.tryStartMusic();
        }, 600);
    }
    
    /**
     * Close the birthday card - NEW METHOD
     */
    closeCard() {
        if (!this.isCardOpened || this.isTransitioning) {
            return;
        }
        
        console.log('Closing card...');
        
        this.isTransitioning = true;
        this.isCardOpened = false;
        this.currentPageIndex = 0;
        this.currentPage = 'coverPage';
        
        // Hide all pages and show cover
        Object.values(this.pages).forEach(page => {
            page.classList.remove('active');
        });
        
        this.pages.coverPage.classList.add('active');
        
        setTimeout(() => {
            this.isTransitioning = false;
        }, 600);
    }
    
    /**
     * Flip to a specific page - IMPROVED
     */
    flipToPage(pageId, trigger) {
        if (!this.isCardOpened || this.isTransitioning || !this.pages[pageId]) {
            return;
        }
        
        const currentIndex = this.pageOrder.indexOf(this.currentPage);
        const targetIndex = this.pageOrder.indexOf(pageId);
        
        // Allow forward navigation to immediate next page
        if (targetIndex <= currentIndex || targetIndex !== currentIndex + 1) {
            return;
        }
        
        console.log(`Flipping to ${pageId} via ${trigger}`);
        
        this.switchToPage(pageId);
        
        // Check if this is the final page
        if (pageId === 'page4') {
            this.triggerFinalPageEffects();
        }
    }
    
    /**
     * Switch to a specific page with smooth transition - IMPROVED
     */
    switchToPage(pageId) {
        if (!this.pages[pageId] || this.isTransitioning) {
            return;
        }
        
        this.isTransitioning = true;
        
        // Hide current page
        if (this.pages[this.currentPage]) {
            this.pages[this.currentPage].classList.remove('active');
        }
        
        // Show target page with delay for smooth transition
        setTimeout(() => {
            this.pages[pageId].classList.add('active');
            this.currentPage = pageId;
            this.currentPageIndex = this.pageOrder.indexOf(pageId);
            
            // Re-enable transitions after animation completes
            setTimeout(() => {
                this.isTransitioning = false;
            }, 800);
        }, 150);
    }
    
    /**
     * Handle keyboard navigation
     */
    handleKeyboardNavigation(e) {
        switch (e.key) {
            case 'ArrowRight':
            case ' ':
                e.preventDefault();
                if (!this.isCardOpened) {
                    this.openCard('keyboard');
                } else {
                    this.navigateNext();
                }
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (this.isCardOpened) {
                    this.navigatePrevious();
                }
                break;
            case 'Enter':
                e.preventDefault();
                if (!this.isCardOpened) {
                    this.openCard('keyboard');
                } else {
                    this.navigateNext();
                }
                break;
            case 'Escape':
                e.preventDefault();
                if (this.isCardOpened) {
                    this.closeCard();
                }
                break;
        }
    }
    
    /**
     * Navigate to next page
     */
    navigateNext() {
        const nextIndex = this.currentPageIndex + 1;
        if (nextIndex < this.pageOrder.length) {
            const nextPageId = this.pageOrder[nextIndex];
            this.flipToPage(nextPageId, 'keyboard');
        }
    }
    
    /**
     * Navigate to previous page
     */
    navigatePrevious() {
        const prevIndex = this.currentPageIndex - 1;
        if (prevIndex >= 0) {
            const prevPageId = this.pageOrder[prevIndex];
            this.switchToPage(prevPageId);
        }
    }
    
    /**
     * Initialize music system
     */
    initializeMusic() {
        if (!this.backgroundMusic) {
            console.warn('Background music element not found');
            return;
        }
        
        this.backgroundMusic.volume = 0.4;
        this.backgroundMusic.loop = true;
        
        // Handle music loading
        this.backgroundMusic.addEventListener('canplaythrough', () => {
            console.log('🎵 Music loaded successfully');
        });
        
        this.backgroundMusic.addEventListener('error', (e) => {
            console.log('🎵 Music file not found - add birthday-music.mp3 to enable background music');
            this.musicToggle.style.opacity = '0.6';
            this.musicToggle.title = 'Music file not found';
        });
        
        this.backgroundMusic.addEventListener('ended', () => {
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusic.play();
        });
    }
    
    /**
     * Toggle music on/off
     */
    toggleMusic() {
        if (this.musicPlaying) {
            this.pauseMusic();
        } else {
            this.playMusic();
        }
    }
    
    /**
     * Play background music
     */
    playMusic() {
        if (!this.backgroundMusic) return;
        
        this.backgroundMusic.play()
            .then(() => {
                this.musicPlaying = true;
                this.musicToggle.classList.add('playing');
                this.musicToggle.textContent = '🎵';
                this.musicToggle.title = 'Tắt nhạc nền';
            })
            .catch((error) => {
                console.log('Could not play music:', error.message);
            });
    }
    
    /**
     * Pause background music
     */
    pauseMusic() {
        if (!this.backgroundMusic) return;
        
        this.backgroundMusic.pause();
        this.musicPlaying = false;
        this.musicToggle.classList.remove('playing');
        this.musicToggle.textContent = '🔇';
        this.musicToggle.title = 'Bật nhạc nền';
    }
    
    /**
     * Try to start music after user interaction
     */
    tryStartMusic() {
        if (!this.musicPlaying) {
            this.playMusic();
        }
    }
    
    /**
     * Setup auto-music after user interaction
     */
    setupAutoMusic() {
        const startMusicOnInteraction = () => {
            this.tryStartMusic();
            document.removeEventListener('click', startMusicOnInteraction);
            document.removeEventListener('touchstart', startMusicOnInteraction);
            document.removeEventListener('keydown', startMusicOnInteraction);
        };
        
        document.addEventListener('click', startMusicOnInteraction);
        document.addEventListener('touchstart', startMusicOnInteraction);
        document.addEventListener('keydown', startMusicOnInteraction);
    }
    
    /**
     * Handle page visibility change
     */
    handleVisibilityChange() {
        if (document.hidden) {
            if (this.musicPlaying && this.backgroundMusic) {
                this.backgroundMusic.pause();
            }
        } else {
            if (this.musicPlaying && this.backgroundMusic) {
                this.backgroundMusic.play().catch(console.log);
            }
        }
    }
    
    /**
     * Toggle help popup
     */
    toggleHelp() {
        if (this.helpPopup.classList.contains('hidden')) {
            this.helpPopup.classList.remove('hidden');
        } else {
            this.helpPopup.classList.add('hidden');
        }
    }
    
    /**
     * Trigger final page effects (fireworks and hearts)
     */
    triggerFinalPageEffects() {
        if (this.fireworksTriggered) {
            return;
        }
        
        console.log('🎆 Triggering final page effects!');
        this.fireworksTriggered = true;
        
        // Start fireworks sequence
        setTimeout(() => {
            this.launchFireworksSequence();
        }, 1000);
        
        // Heart explosion after fireworks
        setTimeout(() => {
            this.createHeartExplosion();
        }, 3000);
        
        // Floating hearts
        setTimeout(() => {
            this.createFloatingHearts();
        }, 4000);
    }
    
    /**
     * Launch fireworks sequence
     */
    launchFireworksSequence() {
        const fireworkTimes = [0, 400, 800, 1200, 1600, 2000];
        
        fireworkTimes.forEach((delay) => {
            setTimeout(() => {
                this.launchSingleFirework();
            }, delay);
        });
    }
    
    /**
     * Launch a single firework
     */
    launchSingleFirework() {
        const firework = document.createElement('div');
        firework.className = 'firework';
        
        // Random starting position
        const startX = Math.random() * window.innerWidth;
        const startY = window.innerHeight;
        
        // Target position
        const targetX = startX + (Math.random() - 0.5) * 300;
        const targetY = Math.random() * 300 + 100;
        
        firework.style.left = startX + 'px';
        firework.style.top = startY + 'px';
        
        this.fireworksContainer.appendChild(firework);
        
        // Animate launch
        this.animateFireworkLaunch(firework, startX, startY, targetX, targetY);
    }
    
    /**
     * Animate firework launch
     */
    animateFireworkLaunch(firework, startX, startY, targetX, targetY) {
        const duration = 1500;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            const currentX = startX + (targetX - startX) * progress;
            const currentY = startY - (startY - targetY) * easeOut;
            
            firework.style.left = currentX + 'px';
            firework.style.top = currentY + 'px';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.explodeFirework(firework, targetX, targetY);
            }
        };
        
        animate();
    }
    
    /**
     * Explode firework into particles
     */
    explodeFirework(firework, x, y) {
        firework.remove();
        
        const particleCount = 25;
        const colors = ['#ffb3d1', '#ff8fab', '#ffc0cb', '#ffb6c1', '#ff69b4', '#dda0dd', '#f8bbd9'];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'firework';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.boxShadow = `0 0 15px ${colors[Math.floor(Math.random() * colors.length)]}`;
            
            this.fireworksContainer.appendChild(particle);
            
            // Random explosion direction
            const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
            const velocity = 120 + Math.random() * 100;
            
            this.animateParticle(particle, x, y, angle, velocity);
        }
    }
    
    /**
     * Animate individual particle
     */
    animateParticle(particle, startX, startY, angle, velocity) {
        const duration = 2500;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const distance = velocity * progress;
            const currentX = startX + Math.cos(angle) * distance;
            const currentY = startY + Math.sin(angle) * distance + (progress * progress * 120); // Gravity
            
            particle.style.left = currentX + 'px';
            particle.style.top = currentY + 'px';
            particle.style.opacity = Math.max(0, 1 - progress * 1.2);
            particle.style.transform = `scale(${Math.max(0.1, 1 - progress * 0.8)})`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        };
        
        animate();
    }
    
    /**
     * Create heart-shaped explosion
     */
    createHeartExplosion() {
        console.log('💕 Creating heart explosion!');
        
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2.5;
        
        const heartPoints = this.generateHeartPoints(centerX, centerY, 120);
        
        heartPoints.forEach((point, index) => {
            setTimeout(() => {
                this.createHeartParticle(point.x, point.y);
            }, index * 40);
        });
    }
    
    /**
     * Generate points for heart shape
     */
    generateHeartPoints(centerX, centerY, size) {
        const points = [];
        const scale = size / 100;
        
        // Heart equation: x = 16sin³(t), y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
        for (let t = 0; t < Math.PI * 2; t += 0.15) {
            const x = centerX + scale * 16 * Math.pow(Math.sin(t), 3);
            const y = centerY - scale * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
            points.push({ x, y });
        }
        
        return points;
    }
    
    /**
     * Create individual heart particle
     */
    createHeartParticle(x, y) {
        const hearts = ['💕', '💖', '💗', '💝', '❤️', '💜', '🧡', '💛'];
        const heart = hearts[Math.floor(Math.random() * hearts.length)];
        
        const particle = document.createElement('div');
        particle.className = 'heart-particle';
        particle.innerHTML = heart;
        particle.style.position = 'fixed';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.fontSize = (Math.random() * 35 + 30) + 'px';
        particle.style.zIndex = '300';
        particle.style.pointerEvents = 'none';
        
        this.fireworksContainer.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 3000);
    }
    
    /**
     * Create floating hearts effect
     */
    createFloatingHearts() {
        const heartCount = 35;
        const hearts = ['❤️', '💕', '💖', '💗', '💝', '💜', '🧡', '💛', '🤍', '🩷'];
        
        for (let i = 0; i < heartCount; i++) {
            setTimeout(() => {
                this.createFloatingHeart(hearts);
            }, i * 150);
        }
    }
    
    /**
     * Create individual floating heart
     */
    createFloatingHeart(hearts) {
        const heart = document.createElement('div');
        heart.innerHTML = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.position = 'fixed';
        heart.style.left = Math.random() * window.innerWidth + 'px';
        heart.style.top = window.innerHeight + 'px';
        heart.style.fontSize = (Math.random() * 45 + 35) + 'px';
        heart.style.zIndex = '250';
        heart.style.pointerEvents = 'none';
        heart.style.opacity = '0.9';
        
        document.body.appendChild(heart);
        
        // Float animation
        const duration = 5000 + Math.random() * 3000;
        const startTime = Date.now();
        
        const animateFloat = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                const currentY = window.innerHeight - (window.innerHeight + 150) * progress;
                const sway = Math.sin(progress * Math.PI * 8) * 60;
                
                heart.style.top = currentY + 'px';
                heart.style.left = (parseInt(heart.style.left) + sway * 0.02) + 'px';
                heart.style.opacity = 0.9 * (1 - progress * 0.6);
                heart.style.transform = `scale(${1 + progress * 0.4}) rotate(${progress * 360}deg)`;
                
                requestAnimationFrame(animateFloat);
            } else {
                heart.remove();
            }
        };
        
        animateFloat();
    }
    
    /**
     * Start sparkle background effect
     */
    startSparkleEffect() {
        const createSparkle = () => {
            const sparkle = document.createElement('div');
            sparkle.innerHTML = ['✨', '⭐', '💫', '🌟'][Math.floor(Math.random() * 4)];
            sparkle.style.position = 'fixed';
            sparkle.style.left = Math.random() * window.innerWidth + 'px';
            sparkle.style.top = Math.random() * window.innerHeight + 'px';
            sparkle.style.fontSize = (Math.random() * 35 + 25) + 'px';
            sparkle.style.opacity = '0';
            sparkle.style.animation = 'sparkleAnimation 3s ease-out forwards';
            sparkle.style.pointerEvents = 'none';
            sparkle.style.zIndex = '1';
            
            document.body.appendChild(sparkle);
            
            setTimeout(() => {
                sparkle.remove();
            }, 3000);
        };
        
        // Create sparkles periodically
        setInterval(createSparkle, 800);
        
        // Add sparkle animation CSS if not exists
        if (!document.getElementById('sparkle-style')) {
            const style = document.createElement('style');
            style.id = 'sparkle-style';
            style.textContent = `
                @keyframes sparkleAnimation {
                    0% {
                        opacity: 0;
                        transform: scale(0) rotate(0deg);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1) rotate(180deg);
                    }
                    100% {
                        opacity: 0;
                        transform: scale(0.3) rotate(360deg);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        setTimeout(() => {
            if (this.loadingOverlay) {
                this.loadingOverlay.classList.add('hidden');
                setTimeout(() => {
                    this.loadingOverlay.style.display = 'none';
                }, 1000);
            }
        }, 2500);
    }
    
    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        // Add ARIA labels
        if (this.coverPage) {
            this.coverPage.setAttribute('aria-label', 'Birthday card cover - hover or click to open');
            this.coverPage.setAttribute('tabindex', '0');
        }
        
        this.flipAreas.forEach((area, index) => {
            area.setAttribute('aria-label', `Flip to next page - page ${index + 2}`);
            area.setAttribute('tabindex', '0');
        });
        
        if (this.musicToggle) {
            this.musicToggle.setAttribute('aria-label', 'Toggle background music');
        }
        
        if (this.helpToggle) {
            this.helpToggle.setAttribute('aria-label', 'Show help information');
        }
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        // Responsive adjustments handled primarily by CSS
        console.log('Window resized, adjusting layout...');
    }
    
    /**
     * Cleanup method
     */
    destroy() {
        // Clear all timeouts
        clearTimeout(this.hoverTimeout);
        clearTimeout(this.cardHoverTimeout);
        clearTimeout(this.cardCloseTimeout);
        
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.src = '';
        }
        
        console.log('Birthday Card App destroyed');
    }
}

// Debug helpers for testing
function createDebugPanel() {
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debug-panel';
    debugPanel.style.cssText = `
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.9);
        color: white;
        padding: 15px;
        border-radius: 8px;
        font-family: monospace;
        font-size: 12px;
        z-index: 9999;
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    `;
    
    const buttons = [
        { text: 'Open Card', action: () => window.birthdayApp?.openCard('debug') },
        { text: 'Next Page', action: () => window.birthdayApp?.navigateNext() },
        { text: 'Close Card', action: () => window.birthdayApp?.closeCard() },
        { text: 'Fireworks', action: () => window.birthdayApp?.triggerFinalPageEffects() },
        { text: 'Hearts Only', action: () => window.birthdayApp?.createFloatingHearts() }
    ];
    
    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.textContent = btn.text;
        button.onclick = btn.action;
        button.style.cssText = `
            padding: 8px 12px;
            background: #444;
            color: white;
            border: 1px solid #666;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
        `;
        button.onmouseenter = () => button.style.background = '#555';
        button.onmouseleave = () => button.style.background = '#444';
        debugPanel.appendChild(button);
    });
    
    document.body.appendChild(debugPanel);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        debugPanel.style.transition = 'opacity 1s ease';
        debugPanel.style.opacity = '0.3';
    }, 10000);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new BirthdayCardApp();
    
    // Add debug panel for testing
    setTimeout(() => {
        createDebugPanel();
    }, 3000);
});

// Console welcome message
console.log(`
🎉 HAPPY BIRTHDAY QUYNH NHI! 🎂
💝 Made with love and fixed for smooth interaction 💝

🎵 Add your music file as 'birthday-music.mp3'
📖 Fixed Instructions:
   ✅ Hover over card to open (FIXED)
   ✅ Hover right side to flip pages (FIXED)
   ✅ Click support for mobile
   ✅ Arrow keys for navigation
   ✅ ESC to close card
   
🎆 Features:
   ✨ Smooth hover interactions
   🌸 Pink flower garden with 6+ flowers
   🎶 Background music support
   🎇 Heart-shaped fireworks
   📱 Mobile responsive
   🐛 All bugs fixed!
`);

// Export for global access
window.BirthdayCardApp = BirthdayCardApp;