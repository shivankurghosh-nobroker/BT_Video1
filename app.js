class VideoPlayer {
    constructor() {
        this.slides = [
            { slide: 1, text: "Are you still paying a high EMI every month?", type: "hook", duration: 4000 },
            { slide: 2, text: "What if you could bring that down—without changing your home, your job, or your routine?", type: "problem_solution", duration: 5000 },
            { slide: 3, text: "With NoBroker's Balance Transfer, you can shift your existing home loan to a new lender offering lower interest rates", type: "solution_intro", duration: 5000 },
            { slide: 4, text: "Starting at just 7.35%", type: "key_benefit", highlight: "7.35%", duration: 3000 },
            { slide: 5, text: "That means: Lower monthly outflow. More savings in your hands. Extra cash for your needs.", type: "benefits", duration: 5000 },
            { slide: 6, text: "Extra cash that could go towards your family, your future, or even that long-overdue renovation.", type: "use_cases", duration: 5000 },
            { slide: 7, text: "You don't have to run from bank to bank. We take care of everything—document collection, loan closure, and paperwork—right at your doorstep.", type: "service_promise", duration: 6000 },
            { slide: 8, text: "No hidden charges. No guesswork. Just a smarter way to manage your loan.", type: "transparency", duration: 4000 },
            { slide: 9, text: "And if you're eligible, you could also unlock a top-up loan, giving you funds for anything that matters—education, emergencies, or your next big step.", type: "additional_benefit", duration: 6000 },
            { slide: 10, text: "You're already paying your loan. Now make it work better for you.", type: "closing", duration: 4000 },
            { slide: 11, text: "Get started with NoBroker Balance Transfer today", type: "cta", duration: 3000 }
        ];

        this.currentSlide = 0;
        this.isPlaying = false;
        this.playbackSpeed = 1;
        this.slideTimeout = null;
        this.progressInterval = null;
        this.startTime = null;
        this.pausedAtTime = 0;
        this.totalDuration = this.slides.reduce((total, slide) => total + slide.duration, 0);

        this.initializeElements();
        this.initializeIndicators();
        this.attachEventListeners();
        this.updateTimeDisplay();
        this.showSlide(this.currentSlide);
    }

    initializeElements() {
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.speedBtn = document.getElementById('speedBtn');
        this.speedMenu = document.getElementById('speedMenu');
        this.slideIndicators = document.getElementById('slideIndicators');
        this.progressFill = document.querySelector('.progress-fill');
        this.currentTimeEl = document.getElementById('currentTime');
        this.totalTimeEl = document.getElementById('totalTime');
        this.slidesContainer = document.querySelector('.slides-container');
        this.allSlides = document.querySelectorAll('.slide');
    }

    initializeIndicators() {
        this.slideIndicators.innerHTML = '';
        this.slides.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.className = `slide-indicator ${index === 0 ? 'active' : ''}`;
            indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
            indicator.addEventListener('click', () => this.goToSlide(index));
            this.slideIndicators.appendChild(indicator);
        });
    }

    attachEventListeners() {
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.restartBtn.addEventListener('click', () => this.restart());
        this.speedBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleSpeedMenu();
        });

        // Speed options
        document.querySelectorAll('.speed-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                this.setPlaybackSpeed(parseFloat(e.target.dataset.speed));
                this.hideSpeedMenu();
            });
        });

        // Hide speed menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.speed-control')) {
                this.hideSpeedMenu();
            }
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePlayPause();
            } else if (e.code === 'ArrowRight') {
                e.preventDefault();
                this.nextSlide();
            } else if (e.code === 'ArrowLeft') {
                e.preventDefault();
                this.previousSlide();
            } else if (e.code === 'KeyR') {
                e.preventDefault();
                this.restart();
            }
        });

        // CTA button
        // CTA button
        const ctaButton = document.querySelector('.cta-button');
        if (ctaButton) {
            ctaButton.addEventListener('click', () => {
                window.location.href = 'tel:+919632321997';
            });
        }
}

    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        if (this.currentSlide >= this.slides.length) {
            this.restart();
            return;
        }

        this.isPlaying = true;
        this.updatePlayPauseButton();

        if (this.startTime === null) {
            this.startTime = Date.now() - this.pausedAtTime;
        } else {
            this.startTime = Date.now() - this.pausedAtTime;
        }

        this.scheduleNextSlide();
        this.startProgressUpdate();
    }

    pause() {
        this.isPlaying = false;
        this.updatePlayPauseButton();
        
        if (this.startTime !== null) {
            this.pausedAtTime = Date.now() - this.startTime;
        }
        
        if (this.slideTimeout) {
            clearTimeout(this.slideTimeout);
            this.slideTimeout = null;
        }
        
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }

    restart() {
        this.pause();
        this.currentSlide = 0;
        this.startTime = null;
        this.pausedAtTime = 0;
        this.showSlide(0);
        this.updateProgress(0);
        this.updateTimeDisplay();
        this.updateIndicators();
    }

    nextSlide() {
        if (this.currentSlide < this.slides.length - 1) {
            this.currentSlide++;
            this.showSlide(this.currentSlide);
            this.updateIndicators();
            
            if (this.isPlaying) {
                this.scheduleNextSlide();
            }
        } else {
            // End of video
            this.pause();
        }
    }

    previousSlide() {
        if (this.currentSlide > 0) {
            this.currentSlide--;
            this.showSlide(this.currentSlide);
            this.updateIndicators();
            
            // Recalculate timing for previous slide
            let elapsedTime = 0;
            for (let i = 0; i < this.currentSlide; i++) {
                elapsedTime += this.slides[i].duration;
            }
            this.pausedAtTime = elapsedTime;
            this.startTime = Date.now() - this.pausedAtTime;
            
            if (this.isPlaying) {
                this.scheduleNextSlide();
            }
        }
    }

    goToSlide(index) {
        if (index >= 0 && index < this.slides.length && index !== this.currentSlide) {
            const wasPlaying = this.isPlaying;
            if (wasPlaying) {
                this.pause();
            }
            
            this.currentSlide = index;
            this.showSlide(index);
            this.updateIndicators();
            
            // Calculate elapsed time up to this slide
            let elapsedTime = 0;
            for (let i = 0; i < index; i++) {
                elapsedTime += this.slides[i].duration;
            }
            
            this.pausedAtTime = elapsedTime;
            this.startTime = Date.now() - this.pausedAtTime;
            this.updateProgress(elapsedTime / this.totalDuration);
            this.updateTimeDisplay();
            
            if (wasPlaying) {
                this.play();
            }
        }
    }

    showSlide(index) {
        this.allSlides.forEach((slide, i) => {
            slide.classList.remove('active', 'previous');
            if (i === index) {
                slide.classList.add('active');
            } else if (i < index) {
                slide.classList.add('previous');
            }
        });
    }

    scheduleNextSlide() {
        if (this.slideTimeout) {
            clearTimeout(this.slideTimeout);
        }

        if (this.currentSlide < this.slides.length) {
            const slideDuration = this.slides[this.currentSlide].duration / this.playbackSpeed;
            
            this.slideTimeout = setTimeout(() => {
                if (this.isPlaying) {
                    this.nextSlide();
                }
            }, slideDuration);
        }
    }

    startProgressUpdate() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }

        this.progressInterval = setInterval(() => {
            if (this.isPlaying && this.startTime !== null) {
                const elapsed = Date.now() - this.startTime;
                const progress = Math.min(elapsed / this.totalDuration, 1);
                this.updateProgress(progress);
                this.updateTimeDisplay();

                if (progress >= 1) {
                    this.pause();
                }
            }
        }, 100);
    }

    updateProgress(progress) {
        this.progressFill.style.width = `${Math.max(0, Math.min(progress * 100, 100))}%`;
    }

    updateTimeDisplay() {
        let elapsed = 0;
        if (this.startTime !== null) {
            elapsed = Date.now() - this.startTime;
        } else {
            elapsed = this.pausedAtTime;
        }
        
        const elapsedSeconds = Math.floor(elapsed / 1000);
        const totalSeconds = Math.floor(this.totalDuration / 1000);

        this.currentTimeEl.textContent = this.formatTime(Math.max(0, elapsedSeconds));
        this.totalTimeEl.textContent = this.formatTime(totalSeconds);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    updatePlayPauseButton() {
        const playIcon = this.playPauseBtn.querySelector('.play-icon');
        const pauseIcon = this.playPauseBtn.querySelector('.pause-icon');

        if (this.isPlaying) {
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
        } else {
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
        }
    }

    updateIndicators() {
        const indicators = this.slideIndicators.querySelectorAll('.slide-indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });
    }

    toggleSpeedMenu() {
        const isHidden = this.speedMenu.classList.contains('hidden');
        if (isHidden) {
            this.speedMenu.classList.remove('hidden');
        } else {
            this.speedMenu.classList.add('hidden');
        }
    }

    hideSpeedMenu() {
        this.speedMenu.classList.add('hidden');
    }

    setPlaybackSpeed(speed) {
        this.playbackSpeed = speed;
        this.speedBtn.textContent = `${speed}x`;
        
        // Update active speed option
        document.querySelectorAll('.speed-option').forEach(option => {
            option.classList.toggle('active', parseFloat(option.dataset.speed) === speed);
        });

        // If playing, restart the current slide with new speed
        if (this.isPlaying) {
            this.scheduleNextSlide();
        }
    }
}

// Initialize the video player when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const player = new VideoPlayer();
    
    // Make player globally accessible for debugging
    window.videoPlayer = player;
});

// Add keyboard navigation for slide indicators
document.addEventListener('keydown', (e) => {
    if (e.target.classList.contains('slide-indicator')) {
        const indicators = Array.from(document.querySelectorAll('.slide-indicator'));
        const currentIndex = indicators.indexOf(e.target);

        if (e.code === 'ArrowRight' && currentIndex < indicators.length - 1) {
            e.preventDefault();
            indicators[currentIndex + 1].focus();
        } else if (e.code === 'ArrowLeft' && currentIndex > 0) {
            e.preventDefault();
            indicators[currentIndex - 1].focus();
        } else if (e.code === 'Enter' || e.code === 'Space') {
            e.preventDefault();
            e.target.click();
        }
    }
});
