class VideoPlayer {
  constructor() {
    this.slides = [
      { text: "Are you still paying a high EMI every month?", duration: 4000 },
      { text: "What if you could bring that down—without changing your home, your job, or your routine?", duration: 5000 },
      { text: "With NoBroker's Balance Transfer, you can shift your existing home loan to a new lender offering lower interest rates", duration: 5000 },
      { text: 'Starting at just <span class="highlight">7.35%</span>', duration: 3000 },
      { text: "That means: Lower monthly outflow. More savings in your hands. Extra cash for your needs.", duration: 5000 },
      { text: "Extra cash that could go towards your family, your future, or even that long-overdue renovation.", duration: 5000 },
      { text: "You don't have to run from bank to bank. We take care of everything—document collection, loan closure, and paperwork—right at your doorstep.", duration: 6000 },
      { text: "No hidden charges. No guesswork. Just a smarter way to manage your loan.", duration: 4000 },
      { text: "And if you're eligible, you could also unlock a top-up loan, giving you funds for anything that matters—education, emergencies, or your next big step.", duration: 6000 },
      { text: "You're already paying your loan. Now make it work better for you.", duration: 4000 },
      { text: "Get started with NoBroker Balance Transfer today", duration: 3000, isCta: true }
    ];
    this.currentSlide = 0;
    this.isPlaying = false;
    this.playbackSpeed = 1;
    this.slideTimeout = null;
    this.progressInterval = null;
    this.startTime = null;
    this.pausedAtTime = 0;
    this.totalDuration = this.slides.reduce((acc, s) => acc + s.duration, 0);

    // DOM
    this.allSlides = Array.from(document.querySelectorAll('.slide'));
    this.slideIndicators = document.getElementById('slideIndicators');
    this.progressFill = document.querySelector('.progress-fill');
    this.currentTimeEl = document.getElementById('currentTime');
    this.totalTimeEl = document.getElementById('totalTime');
    this.ctaButton = document.querySelector('.cta-button');
    this.audio = document.getElementById('backgroundMusic');

    // Controls
    this.playBtn = document.getElementById('playBtn');
    this.pauseBtn = document.getElementById('pauseBtn');
    this.stopBtn = document.getElementById('stopBtn');
    this.rewindBtn = document.getElementById('rewindBtn');
    this.forwardBtn = document.getElementById('forwardBtn');

    // Setup
    this.setupSlides();
    this.setupIndicators();
    this.attachEventListeners();
    this.showSlide(0);
    this.updateProgress(0);
    this.updateTimeDisplay();
  }

  setupSlides() {
    this.allSlides.forEach((slide, i) => {
      // Insert slide text as HTML (for .highlight)
      slide.querySelector('.slide-content').innerHTML = this.slides[i].text;
    });
  }

  setupIndicators() {
    this.slideIndicators.innerHTML = "";
    for (let i = 0; i < this.slides.length; i++) {
      const btn = document.createElement('button');
      btn.className = 'slide-indicator';
      btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
      if (i === 0) btn.classList.add('active');
      btn.addEventListener('click', () => this.goToSlide(i));
      this.slideIndicators.appendChild(btn);
    }
  }

  attachEventListeners() {
    this.playBtn.addEventListener('click', () => this.play());
    this.pauseBtn.addEventListener('click', () => this.pause());
    this.stopBtn.addEventListener('click', () => this.stop());
    this.rewindBtn.addEventListener('click', () => this.previousSlide());
    this.forwardBtn.addEventListener('click', () => this.nextSlide());
    if (this.ctaButton) {
      this.ctaButton.addEventListener('click', () => {
        window.location.href = 'tel:+919632321997';
      });
    }
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.code === 'ArrowRight') this.nextSlide();
      else if (e.code === 'ArrowLeft') this.previousSlide();
      else if (e.code === 'Space') {
        e.preventDefault();
        this.togglePlayPause();
      }
      else if (e.code === 'KeyR') this.restart();
    });
  }

  togglePlayPause() {
    this.isPlaying ? this.pause() : this.play();
  }

  play() {
    if (this.currentSlide >= this.slides.length) {
      this.restart();
      return;
    }
    this.isPlaying = true;
    if (this.startTime === null) {
      this.startTime = Date.now() - this.pausedAtTime;
    } else {
      this.startTime = Date.now() - this.pausedAtTime;
    }
    this.scheduleNextSlide();
    this.startProgressUpdate();
    if (this.audio) {
      try { this.audio.play(); } catch (e) {}
    }
  }

  pause() {
    this.isPlaying = false;
    if (this.startTime !== null) this.pausedAtTime = Date.now() - this.startTime;
    if (this.slideTimeout) clearTimeout(this.slideTimeout);
    if (this.progressInterval) clearInterval(this.progressInterval);
    if (this.audio) this.audio.pause();
  }

  stop() {
    this.pause();
    this.currentSlide = 0;
    this.startTime = null;
    this.pausedAtTime = 0;
    this.showSlide(0);
    this.updateProgress(0);
    this.updateTimeDisplay();
    this.updateIndicators();
    if (this.audio) {
      this.audio.currentTime = 0;
      this.audio.pause();
    }
  }

  restart() {
    this.stop();
    this.play();
  }

  nextSlide() {
    let wasPlaying = this.isPlaying;
    this.pause();
    if (this.currentSlide < this.slides.length - 1) {
      this.currentSlide++;
      this.showSlide(this.currentSlide);
      this.updateIndicators();
      this.pausedAtTime = this.elapsedTimeForSlide(this.currentSlide);
      if (wasPlaying) this.play();
    }
  }

  previousSlide() {
    let wasPlaying = this.isPlaying;
    this.pause();
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.showSlide(this.currentSlide);
      this.updateIndicators();
      this.pausedAtTime = this.elapsedTimeForSlide(this.currentSlide);
      if (wasPlaying) this.play();
    }
  }

  goToSlide(idx) {
    let wasPlaying = this.isPlaying;
    this.pause();
    this.currentSlide = idx;
    this.showSlide(idx);
    this.updateIndicators();
    this.pausedAtTime = this.elapsedTimeForSlide(idx);
    if (wasPlaying) this.play();
  }

  showSlide(index) {
    this.allSlides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
      slide.classList.toggle('previous', i < index);
    });
    // Hide CTA on all but last
    if (this.ctaButton) {
      this.ctaButton.style.display = (index === this.slides.length - 1) ? "inline-block" : "none";
    }
  }

  scheduleNextSlide() {
    if (this.slideTimeout) clearTimeout(this.slideTimeout);
    if (this.currentSlide < this.slides.length) {
      const slideDuration = this.slides[this.currentSlide].duration / this.playbackSpeed;
      this.slideTimeout = setTimeout(() => {
        if (this.isPlaying) {
          if (this.currentSlide < this.slides.length - 1) {
            this.currentSlide++;
            this.showSlide(this.currentSlide);
            this.updateIndicators();
            this.scheduleNextSlide();
          } else {
            // End: pause and optionally loop
            this.currentSlide = 0;
            this.showSlide(this.currentSlide);
            this.updateIndicators();
            this.startTime = null;
            this.pausedAtTime = 0;
            this.updateProgress(0);
            this.updateTimeDisplay();
            // Loop video and audio
            this.play();
            if (this.audio) {
              this.audio.currentTime = 0;
              this.audio.play();
            }
          }
        }
      }, slideDuration);
    }
  }

  startProgressUpdate() {
    if (this.progressInterval) clearInterval(this.progressInterval);
    this.progressInterval = setInterval(() => {
      const elapsed = (this.startTime !== null) ? Date.now() - this.startTime : this.pausedAtTime;
      let progress = elapsed / this.totalDuration;
      this.updateProgress(progress);
      this.updateTimeDisplay();
      if (progress >= 1) {
        clearInterval(this.progressInterval);
        this.pause();
      }
    }, 100);
  }

  updateProgress(progress) {
    this.progressFill.style.width = `${Math.max(0, Math.min(100, progress * 100))}%`;
  }

  elapsedTimeForSlide(idx) {
    return this.slides.slice(0, idx).reduce((sum, s) => sum + s.duration, 0);
  }

  updateTimeDisplay() {
    let elapsed = 0;
    if (this.startTime !== null) elapsed = Date.now() - this.startTime;
    else elapsed = this.pausedAtTime;
    let elapsedSeconds = Math.floor(elapsed / 1000);
    let totalSeconds = Math.floor(this.totalDuration / 1000);
    this.currentTimeEl.textContent = this.formatTime(elapsedSeconds);
    this.totalTimeEl.textContent = this.formatTime(totalSeconds);
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${mins}:${sec.toString().padStart(2, '0')}`;
  }

  updateIndicators() {
    const all = this.slideIndicators.querySelectorAll('.slide-indicator');
    all.forEach((btn, idx) => {
      btn.classList.toggle('active', idx === this.currentSlide);
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const player = new VideoPlayer();
  window.videoPlayer = player; // for debugging/console access
});
