

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    showModal('welcomeModal');
    
    initializeMusic();
    
    setupEventListeners();
    
    createMoreStars();
    try { localStorage.removeItem('readLetters'); } catch (e) {}
}

// Background Music Management
function initializeMusic() {
    const music = document.getElementById('backgroundMusic');
    const audioBtn = document.getElementById('audioBtn');
    
    if (music) {
        music.play().catch(function(error) {
            console.log('Auto-play was prevented:', error);
            audioBtn.textContent = '🔇';
            audioBtn.classList.add('muted');
        });
        
        music.volume = 0.3;
    }

}

// Event Listeners Setup
function setupEventListeners() {
    // Welcome Modal - Fixed event listeners
    const welcomeClose = document.getElementById('welcomeClose');
    const startExploring = document.getElementById('startExploring');
    
    if (welcomeClose) {
        welcomeClose.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            hideModal('welcomeModal');
            addLetterBoxAnimations();
        });
    }
    
    if (startExploring) {
        startExploring.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            hideModal('welcomeModal');
            addLetterBoxAnimations();
        });
    }
    
    // Letter boxes - Fixed event listeners
    const letterBoxes = document.querySelectorAll('.letter-box');
    letterBoxes.forEach(box => {
        box.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const letterNumber = box.getAttribute('data-letter');
            openLetter(letterNumber);
        });
    });
    
    // Letter modal close button - Fixed
    const letterClose = document.getElementById('letterClose');
    if (letterClose) {
        letterClose.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            hideModal('letterModal');
        });
    }
    
    // Control buttons - Fixed to open correct modals
    const qrBtn = document.getElementById('qrBtn');
    const audioBtn = document.getElementById('audioBtn');
    const giftBtn = document.getElementById('giftBtn');
    
    if (qrBtn) {
        qrBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            showModal('qrModal');
        });
    }
    
    if (audioBtn) {
        audioBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMusic();
        });
    }
    
    if (giftBtn) {
        giftBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            showModal('giftModal');
            setTimeout(showHearts, 500);
        });
    }
    
    // Other modal close buttons - Fixed
    const qrClose = document.getElementById('qrClose');
    const giftClose = document.getElementById('giftClose');
    const finalClose = document.getElementById('finalClose');
    const heartClose = document.getElementById('heartClose');
    
    if (qrClose) {
        qrClose.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            hideModal('qrModal');
        });
    }
    
    if (giftClose) {
        giftClose.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            hideModal('giftModal');
        });
    }
    
    if (finalClose) {
        finalClose.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            hideModal('finalModal');
        });
    }
    
    if (heartClose) {
        heartClose.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            hideModal('heartModal');
        });
    }
    
    // Close modal when clicking outside - Fixed
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            const modalId = event.target.id;
            hideModal(modalId);
        }
    });
    
    // Keyboard navigation - Fixed
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            hideAllModals();
        }
    });
}

// Modal Management - Fixed
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('show');
        // Force reflow
        modal.offsetHeight;
        // Add smooth entrance animation
        modal.style.opacity = '1';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

function hideAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (modal.classList.contains('show')) {
            hideModal(modal.id);
        }
    });
}

// Letter Functionality - Fixed
function openLetter(letterNumber) {
    const letterModal = document.getElementById('letterModal');
    const letterTitle = document.getElementById('letterTitle');
    const letterImage = document.getElementById('letterImage');
    
    if (!letterModal || !letterTitle || !letterImage) {
        console.error('Letter modal elements not found');
        return;
    }
    
    // Update letter title
    letterTitle.textContent = `Bức thư tình số ${letterNumber} 💖`;
    
    loadLetterImage(letterImage, letterNumber);
    
    // Add some animation effects
    letterImage.style.opacity = '0';
    letterImage.style.transition = 'opacity 0.5s ease';
    
    showModal('letterModal');
    
    // Fade in the image
    setTimeout(() => {
        letterImage.style.opacity = '1';
    }, 100);
    
    addSparkleEffect();

    markLetterAsRead(letterNumber);
}

function loadLetterImage(imgElement, letterNumber) {
    const candidates = [
        `images/${letterNumber}.jpg`,
        `images/${letterNumber}.png`,
    ];
    let index = 0;

    const tryLoad = () => {
        if (index >= candidates.length) {
            imgElement.src = generateLetterPlaceholder(letterNumber);
            return;
        }
        const src = candidates[index];
        const probe = new Image();
        probe.onload = () => {
            imgElement.src = src;
        };
        probe.onerror = () => {
            index += 1;
            tryLoad();
        };
        probe.src = src;
    };

    tryLoad();
}

function generateLetterPlaceholder(letterNumber) {
    const svg = `
        <svg width="595" height="842" viewBox="0 0 595 842" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="595" height="842" fill="#FFFFFF" stroke="#E5E7EB"/>
            <text x="297.5" y="200" text-anchor="middle" fill="#ff6b9d" font-family="Arial, sans-serif" font-size="24" font-weight="bold">
                Thư tình số ${letterNumber}
            </text>
            <text x="297.5" y="250" text-anchor="middle" fill="#666" font-family="Arial, sans-serif" font-size="18">
                Gửi em yêu của anh 💕
            </text>
            <text x="297.5" y="400" text-anchor="middle" fill="#ccc" font-family="Arial, sans-serif" font-size="12">
                Để thay đổi: đặt file ảnh tên letter-${letterNumber}.jpg
            </text>
        </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

function toggleMusic() {
    const music = document.getElementById('backgroundMusic');
    const audioBtn = document.getElementById('audioBtn');
    
    if (!music || !audioBtn) {
        console.error('Music elements not found');
        return;
    }
    
    if (music.paused) {
        music.play().then(() => {
            audioBtn.textContent = '🔊';
            audioBtn.classList.remove('muted');
            showMusicFeedback('Đã bật nhạc 🎵');
        }).catch(error => {
            console.log('Could not play music:', error);
            showMusicFeedback('Không thể phát nhạc');
        });
    } else {
        music.pause();
        audioBtn.textContent = '🔇';
        audioBtn.classList.add('muted');
        showMusicFeedback('Đã tắt nhạc 🔇');
    }
}

function showMusicFeedback(message) {
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 107, 157, 0.9);
        color: white;
        padding: 10px 20px;
        border-radius: 25px;
        z-index: 9999;
        font-size: 14px;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
    `;
    
    document.body.appendChild(feedback);
    
    // Animate in
    setTimeout(() => {
        feedback.style.opacity = '1';
    }, 10);
    
    // Remove after 2 seconds
    setTimeout(() => {
        feedback.style.opacity = '0';
        setTimeout(() => {
            if (feedback.parentNode) {
                document.body.removeChild(feedback);
            }
        }, 300);
    }, 2000);
}

// Visual Effects - Fixed
function addSparkleEffect() {
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            createSparkle();
        }, i * 200);
    }
}

function createSparkle() {
    const sparkle = document.createElement('div');
    sparkle.innerHTML = '✨';
    sparkle.style.cssText = `
        position: fixed;
        pointer-events: none;
        font-size: 20px;
        z-index: 9999;
        opacity: 0;
        animation: sparkleFloat 2s ease-out forwards;
    `;
    
    // Random position around the screen center
    sparkle.style.left = (Math.random() * (window.innerWidth - 100) + 50) + 'px';
    sparkle.style.top = (Math.random() * (window.innerHeight - 100) + 50) + 'px';
    
    document.body.appendChild(sparkle);
    
    // Remove after animation
    setTimeout(() => {
        if (sparkle.parentNode) {
            sparkle.parentNode.removeChild(sparkle);
        }
    }, 2000);
}

// Create more stars in the background - Fixed
function createMoreStars() {
    const nightSky = document.querySelector('.night-sky');
    
    if (!nightSky) {
        console.error('Night sky element not found');
        return;
    }
    
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'dynamic-star';
        star.style.cssText = `
            position: absolute;
            width: ${Math.random() * 3 + 1}px;
            height: ${Math.random() * 3 + 1}px;
            background: white;
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            opacity: ${Math.random() * 0.8 + 0.2};
            animation: twinkle ${Math.random() * 3 + 2}s infinite;
            pointer-events: none;
        `;
        nightSky.appendChild(star);
    }
}


function getReadLetters() {
    try {
        const raw = localStorage.getItem('readLetters');
        if (!raw) return new Set();
        const arr = JSON.parse(raw);
        return new Set(Array.isArray(arr) ? arr : []);
    } catch (e) {
        return new Set();
    }
}

function saveReadLetters(setOfNumbers) {
    try {
        localStorage.setItem('readLetters', JSON.stringify(Array.from(setOfNumbers)));
    } catch (e) {
        // ignore
    }
}

function markLetterAsRead(letterNumber) {
    // Update UI
    const selector = `.letter-box[data-letter="${letterNumber}"]`;
    const box = document.querySelector(selector);
    if (box) {
        box.classList.add('read');
    }
    // Persist
    const set = getReadLetters();
    set.add(Number(letterNumber));
    saveReadLetters(set);

    // Kiểm tra nếu đã đọc hết 18 thư
    if (set.size >= 18) {
        setTimeout(() => {
            transformMoonToHeart();
        }, 1000);
    }
}

function restoreReadLettersState() {
    const set = getReadLetters();
    if (set.size === 0) return;
    set.forEach(num => {
        const box = document.querySelector(`.letter-box[data-letter="${num}"]`);
        if (box) box.classList.add('read');
    });
}

// Chuyển moon thành trái tim sau khi đọc hết thư
function transformMoonToHeart() {
    const moon = document.querySelector('.moon');
    if (!moon) {
        console.log('Không tìm thấy moon element');
        return;
    }
    
    console.log('Đang chuyển moon thành trái tim...');
    
    // Ẩn moon cũ
    moon.style.display = 'none';
    
    // Tạo trái tim mới
    const heartElement = document.createElement('div');
    heartElement.id = 'clickable-heart';
    heartElement.className = 'clickable-heart';
    heartElement.innerHTML = `
        <div class="heart-container">
            <div class="heart">💖</div>
        </div>
    `;
    
    // Thêm vào body
    document.body.appendChild(heartElement);
    
    // Thêm event listener
    heartElement.addEventListener('click', function(e) {
        console.log('Trái tim được bấm!');
        e.preventDefault();
        e.stopPropagation();
        showFinalMessage();
    });
    
    heartElement.addEventListener('touchstart', function(e) {
        console.log('Trái tim được touch!');
        e.preventDefault();
        showFinalMessage();
    });
    
}

function showFinalMessage() {
    console.log('Đang mở heart modal...');
    const heartModal = document.getElementById('heartModal');
    if (heartModal) {
        showModal('heartModal');
        showHearts();
        console.log('Đã mở heart modal thành công!');
    } else {
        console.log('Không tìm thấy heartModal element');
    }
}

function addLetterBoxAnimations() {
    const letterBoxes = document.querySelectorAll('.letter-box');
    
    letterBoxes.forEach((box, index) => {
        // Staggered entrance animation
        box.style.opacity = '0';
        box.style.transform = 'translateY(50px)';
        
        setTimeout(() => {
            box.style.transition = 'all 0.6s ease';
            box.style.opacity = '1';
            box.style.transform = 'translateY(0)';
        }, index * 100 + 500);
    });
}

function showHearts() {
    const hearts = ['💕', '💖', '💗', '💝', '💘'];
    
    for (let i = 0; i < 50; i++) {
        const heart = document.createElement('div');
        heart.innerHTML = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.cssText = `
            position: fixed;
            pointer-events: none;
            font-size: ${Math.random() * 20 + 15}px;
            z-index: 9999;
            opacity: 0;
            left: ${Math.random() * 100}%;
            top: 100%;
            animation: heartsFloat 3s ease-out forwards;
        `;
        
        document.body.appendChild(heart);
        
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, 3000);
    }

}

function addDynamicStyles() {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes sparkleFloat {
            0% {
                opacity: 0;
                transform: translateY(0px) scale(0);
            }
            50% {
                opacity: 1;
                transform: translateY(-50px) scale(1);
            }
            100% {
                opacity: 0;
                transform: translateY(-100px) scale(0);
            }
        }
        
        @keyframes heartsFloat {
            0% {
                opacity: 0;
                transform: translateY(0px) rotate(0deg);
            }
            50% {
                opacity: 1;
            }
            100% {
                opacity: 0;
                transform: translateY(-200px) rotate(360deg);
            }
        }
        
        .dynamic-star {
            animation: twinkle 3s infinite !important;
        }
        
        @keyframes twinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
        }
    `;
    document.head.appendChild(styleSheet);
}

addDynamicStyles();

function getRandomPosition() {
    return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight
    };
}

