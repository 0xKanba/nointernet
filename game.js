// Time Jump Game - Core Game Logic
// A comprehensive endless runner game with time manipulation abilities

class TimeJumpGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'loading'; // loading, menu, playing, paused, gameOver
        
        // Game settings
        this.gameSpeed = 5;
        this.baseSpeed = 5;
        this.speedIncrement = 0.1;
        this.maxSpeed = 15;
        
        // Player properties
        this.player = {
            x: 100,
            y: 400,
            width: 40,
            height: 60,
            velocityY: 0,
            isJumping: false,
            isGrounded: true,
            gravity: 0.8,
            jumpPower: -15,
            groundY: 400,
            sprite: '🚀'
        };
        
        // Game objects
        this.obstacles = [];
        this.crystals = [];
        this.particles = [];
        this.backgrounds = [];
        
        // Game mechanics
        this.score = 0;
        this.distance = 0;
        this.coins = 0;
        this.level = 1;
        this.round = 1;
        
        // Abilities
        this.abilities = {
            timeStop: {
                active: false,
                cooldown: 0,
                maxCooldown: 300, // 5 seconds at 60fps
                duration: 120, // 2 seconds at 60fps
                remainingDuration: 0
            },
            futureJump: {
                active: false,
                energy: 0,
                maxEnergy: 100,
                cost: 30,
                duration: 180, // 3 seconds at 60fps
                remainingDuration: 0
            }
        };
        
        // Random events
        this.randomEvents = {
            goldRain: { active: false, duration: 0, maxDuration: 300 },
            fireballs: { active: false, duration: 0, maxDuration: 240 },
            terrainChange: { active: false, duration: 0, maxDuration: 600 }
        };
        
        // Obstacle patterns
        this.obstaclePatterns = [
            { type: 'spike', width: 30, height: 40, gap: 200 },
            { type: 'wall', width: 50, height: 80, gap: 300 },
            { type: 'laser', width: 20, height: 200, gap: 250 },
            { type: 'mine', width: 40, height: 40, gap: 180 }
        ];
        
        // Crystal patterns
        this.crystalPatterns = [
            { type: 'energy', value: 10, width: 25, height: 25, gap: 150 },
            { type: 'coin', value: 5, width: 20, height: 20, gap: 100 },
            { type: 'bonus', value: 25, width: 30, height: 30, gap: 400 }
        ];
        
        // Animation frames
        this.frameCount = 0;
        this.lastTime = 0;
        
        // Input handling
        this.keys = {};
        this.touchActive = false;
        
        // Sound effects (placeholder)
        this.sounds = {
            jump: null,
            collect: null,
            hit: null,
            ability: null
        };
        
        // Initialize the game
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.loadAssets();
        this.startGameLoop();
    }
    
    setupCanvas() {
        // Set canvas size to match display size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Store original dimensions for scaling
        this.originalWidth = 1200;
        this.originalHeight = 600;
        
        // Handle resize
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'Space' && this.gameState === 'playing') {
                e.preventDefault();
                this.jump();
            }
            
            if (e.code === 'KeyP' && this.gameState === 'playing') {
                this.pauseGame();
            }
            
            if (e.code === 'KeyT' && this.gameState === 'playing') {
                this.activateTimeStop();
            }
            
            if (e.code === 'KeyF' && this.gameState === 'playing') {
                this.activateFutureJump();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchActive = true;
            
            if (this.gameState === 'playing') {
                this.jump();
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchActive = false;
        });
        
        // Button events
        document.getElementById('jump-btn').addEventListener('click', () => {
            if (this.gameState === 'playing') {
                this.jump();
            }
        });
        
        document.getElementById('pause-btn').addEventListener('click', () => {
            if (this.gameState === 'playing') {
                this.pauseGame();
            }
        });
        
        document.getElementById('time-stop-btn').addEventListener('click', () => {
            if (this.gameState === 'playing') {
                this.activateTimeStop();
            }
        });
        
        document.getElementById('future-jump-btn').addEventListener('click', () => {
            if (this.gameState === 'playing') {
                this.activateFutureJump();
            }
        });
    }
    
    loadAssets() {
        // Simulate loading assets
        let progress = 0;
        const loadingInterval = setInterval(() => {
            progress += Math.random() * 20;
            if (progress >= 100) {
                progress = 100;
                clearInterval(loadingInterval);
                setTimeout(() => {
                    this.showMainMenu();
                }, 500);
            }
            
            document.getElementById('loading-progress').style.width = progress + '%';
        }, 100);
    }
    
    showMainMenu() {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('main-menu').classList.remove('hidden');
        this.gameState = 'menu';
        
        // Update player stats
        this.updatePlayerStats();
    }
    
    startGame() {
        this.gameState = 'playing';
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('game-container').classList.remove('hidden');
        
        // Reset game state
        this.resetGame();
        
        // Start game loop
        this.gameLoop();
    }
    
    resetGame() {
        this.score = 0;
        this.distance = 0;
        this.coins = 0;
        this.level = 1;
        this.round = 1;
        this.gameSpeed = this.baseSpeed;
        
        // Reset player
        this.player.y = this.player.groundY;
        this.player.velocityY = 0;
        this.player.isJumping = false;
        this.player.isGrounded = true;
        
        // Reset abilities
        this.abilities.timeStop.cooldown = 0;
        this.abilities.timeStop.active = false;
        this.abilities.timeStop.remainingDuration = 0;
        this.abilities.futureJump.energy = 0;
        this.abilities.futureJump.active = false;
        this.abilities.futureJump.remainingDuration = 0;
        
        // Clear objects
        this.obstacles = [];
        this.crystals = [];
        this.particles = [];
        
        // Reset random events
        Object.keys(this.randomEvents).forEach(key => {
            this.randomEvents[key].active = false;
            this.randomEvents[key].duration = 0;
        });
        
        // Update UI
        this.updateGameUI();
        this.updateAbilityUI();
    }
    
    gameLoop(currentTime = 0) {
        if (this.gameState !== 'playing') return;
        
        // Calculate delta time
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update game state
        this.update(deltaTime);
        
        // Render game
        this.render();
        
        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        this.frameCount++;
        
        // Update player
        this.updatePlayer(deltaTime);
        
        // Update obstacles
        this.updateObstacles(deltaTime);
        
        // Update crystals
        this.updateCrystals(deltaTime);
        
        // Update particles
        this.updateParticles(deltaTime);
        
        // Update abilities
        this.updateAbilities(deltaTime);
        
        // Update random events
        this.updateRandomEvents(deltaTime);
        
        // Update game progression
        this.updateGameProgression(deltaTime);
        
        // Check collisions
        this.checkCollisions();
        
        // Update UI
        this.updateGameUI();
        this.updateAbilityUI();
    }
    
    updatePlayer(deltaTime) {
        // Apply gravity
        if (!this.player.isGrounded) {
            this.player.velocityY += this.player.gravity;
        }
        
        // Update position
        this.player.y += this.player.velocityY;
        
        // Check ground collision
        if (this.player.y >= this.player.groundY) {
            this.player.y = this.player.groundY;
            this.player.velocityY = 0;
            this.player.isJumping = false;
            this.player.isGrounded = true;
        }
        
        // Update player sprite based on state
        if (this.player.isJumping) {
            this.player.sprite = '🚀';
        } else if (this.abilities.futureJump.active) {
            this.player.sprite = '⚡';
        } else if (this.abilities.timeStop.active) {
            this.player.sprite = '⏸️';
        } else {
            this.player.sprite = '🏃';
        }
    }
    
    updateObstacles(deltaTime) {
        // Move obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            
            if (!this.abilities.timeStop.active) {
                obstacle.x -= this.gameSpeed;
            }
            
            // Remove off-screen obstacles
            if (obstacle.x + obstacle.width < 0) {
                this.obstacles.splice(i, 1);
                this.score += 10;
            }
        }
        
        // Generate new obstacles
        if (this.frameCount % Math.floor(100 / this.gameSpeed) === 0) {
            this.generateObstacle();
        }
    }
    
    updateCrystals(deltaTime) {
        // Move crystals
        for (let i = this.crystals.length - 1; i >= 0; i--) {
            const crystal = this.crystals[i];
            
            if (!this.abilities.timeStop.active) {
                crystal.x -= this.gameSpeed;
            }
            
            // Remove off-screen crystals
            if (crystal.x + crystal.width < 0) {
                this.crystals.splice(i, 1);
            }
        }
        
        // Generate new crystals
        if (this.frameCount % Math.floor(80 / this.gameSpeed) === 0) {
            this.generateCrystal();
        }
    }
    
    updateParticles(deltaTime) {
        // Update particle effects
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.life -= 1;
            
            // Remove dead particles
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    updateAbilities(deltaTime) {
        // Update Time Stop ability
        if (this.abilities.timeStop.cooldown > 0) {
            this.abilities.timeStop.cooldown--;
        }
        
        if (this.abilities.timeStop.active) {
            this.abilities.timeStop.remainingDuration--;
            if (this.abilities.timeStop.remainingDuration <= 0) {
                this.abilities.timeStop.active = false;
            }
        }
        
        // Update Future Jump ability
        if (this.abilities.futureJump.active) {
            this.abilities.futureJump.remainingDuration--;
            if (this.abilities.futureJump.remainingDuration <= 0) {
                this.abilities.futureJump.active = false;
            }
        }
        
        // Update ability buttons
        this.updateAbilityButtons();
    }
    
    updateRandomEvents(deltaTime) {
        // Random event triggers
        if (this.frameCount % 1800 === 0 && Math.random() < 0.3) { // Every 30 seconds
            this.triggerRandomEvent();
        }
        
        // Update active events
        Object.keys(this.randomEvents).forEach(key => {
            const event = this.randomEvents[key];
            if (event.active) {
                event.duration++;
                if (event.duration >= event.maxDuration) {
                    event.active = false;
                    event.duration = 0;
                }
            }
        });
    }
    
    updateGameProgression(deltaTime) {
        // Increase distance
        if (!this.abilities.timeStop.active) {
            this.distance += this.gameSpeed * 0.1;
        }
        
        // Level up every 1000 distance
        const newLevel = Math.floor(this.distance / 1000) + 1;
        if (newLevel > this.level) {
            this.levelUp(newLevel);
        }
        
        // Increase speed gradually
        if (this.gameSpeed < this.maxSpeed) {
            this.gameSpeed += this.speedIncrement * 0.01;
        }
    }
    
    generateObstacle() {
        const pattern = this.obstaclePatterns[Math.floor(Math.random() * this.obstaclePatterns.length)];
        const obstacle = {
            x: this.canvas.width + Math.random() * 100,
            y: this.player.groundY - pattern.height,
            width: pattern.width,
            height: pattern.height,
            type: pattern.type,
            gap: pattern.gap
        };
        
        this.obstacles.push(obstacle);
    }
    
    generateCrystal() {
        const pattern = this.crystalPatterns[Math.floor(Math.random() * this.crystalPatterns.length)];
        const crystal = {
            x: this.canvas.width + Math.random() * 100,
            y: this.player.groundY - pattern.height - Math.random() * 100,
            width: pattern.width,
            height: pattern.height,
            type: pattern.type,
            value: pattern.value,
            gap: pattern.gap
        };
        
        this.crystals.push(crystal);
    }
    
    triggerRandomEvent() {
        const events = Object.keys(this.randomEvents);
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        
        if (!this.randomEvents[randomEvent].active) {
            this.randomEvents[randomEvent].active = true;
            this.randomEvents[randomEvent].duration = 0;
            
            // Apply event effects
            this.applyRandomEvent(randomEvent);
            
            // Show notification
            this.showNotification(`Random Event: ${randomEvent.replace(/([A-Z])/g, ' $1')}`, 'warning');
        }
    }
    
    applyRandomEvent(eventType) {
        switch (eventType) {
            case 'goldRain':
                // Generate extra crystals
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => {
                        this.generateCrystal();
                    }, i * 200);
                }
                break;
                
            case 'fireballs':
                // Generate fireball obstacles
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        const fireball = {
                            x: this.canvas.width + Math.random() * 200,
                            y: this.player.groundY - 200 - Math.random() * 100,
                            width: 30,
                            height: 30,
                            type: 'fireball',
                            velocityX: -8 - Math.random() * 4
                        };
                        this.obstacles.push(fireball);
                    }, i * 500);
                }
                break;
                
            case 'terrainChange':
                // Change ground level temporarily
                const originalGroundY = this.player.groundY;
                this.player.groundY = 350 + Math.random() * 100;
                
                setTimeout(() => {
                    this.player.groundY = originalGroundY;
                }, 5000);
                break;
        }
    }
    
    checkCollisions() {
        // Check obstacle collisions
        for (let obstacle of this.obstacles) {
            if (this.isColliding(this.player, obstacle)) {
                this.gameOver();
                return;
            }
        }
        
        // Check crystal collisions
        for (let i = this.crystals.length - 1; i >= 0; i--) {
            const crystal = this.crystals[i];
            if (this.isColliding(this.player, crystal)) {
                this.collectCrystal(crystal);
                this.crystals.splice(i, 1);
            }
        }
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    collectCrystal(crystal) {
        switch (crystal.type) {
            case 'energy':
                this.abilities.futureJump.energy = Math.min(
                    this.abilities.futureJump.energy + crystal.value,
                    this.abilities.futureJump.maxEnergy
                );
                this.createParticles(crystal.x, crystal.y, '#4ecdc4');
                break;
                
            case 'coin':
                this.coins += crystal.value;
                this.createParticles(crystal.x, crystal.y, '#ffd700');
                break;
                
            case 'bonus':
                this.score += crystal.value * 10;
                this.createParticles(crystal.x, crystal.y, '#ff6b6b');
                break;
        }
        
        // Play sound effect
        this.playSound('collect');
    }
    
    createParticles(x, y, color) {
        for (let i = 0; i < 8; i++) {
            const particle = {
                x: x + Math.random() * 20,
                y: y + Math.random() * 20,
                velocityX: (Math.random() - 0.5) * 4,
                velocityY: (Math.random() - 0.5) * 4,
                life: 30,
                color: color,
                size: Math.random() * 3 + 2
            };
            this.particles.push(particle);
        }
    }
    
    jump() {
        if (this.player.isGrounded && !this.player.isJumping) {
            this.player.velocityY = this.player.jumpPower;
            this.player.isJumping = true;
            this.player.isGrounded = false;
            
            // Play sound effect
            this.playSound('jump');
            
            // Create jump particles
            this.createParticles(this.player.x, this.player.y + this.player.height, '#4ecdc4');
        }
    }
    
    activateTimeStop() {
        if (this.abilities.timeStop.cooldown <= 0 && !this.abilities.timeStop.active) {
            this.abilities.timeStop.active = true;
            this.abilities.timeStop.remainingDuration = this.abilities.timeStop.duration;
            this.abilities.timeStop.cooldown = this.abilities.timeStop.maxCooldown;
            
            // Play sound effect
            this.playSound('ability');
            
            // Create time stop effect
            this.createTimeStopEffect();
            
            // Show notification
            this.showNotification('Time Stop Activated!', 'success');
        }
    }
    
    activateFutureJump() {
        if (this.abilities.futureJump.energy >= this.abilities.futureJump.cost && 
            !this.abilities.futureJump.active) {
            this.abilities.futureJump.active = true;
            this.abilities.futureJump.remainingDuration = this.abilities.futureJump.duration;
            this.abilities.futureJump.energy -= this.abilities.futureJump.cost;
            
            // Play sound effect
            this.playSound('ability');
            
            // Create future jump effect
            this.createFutureJumpEffect();
            
            // Show notification
            this.showNotification('Future Jump Activated!', 'success');
        }
    }
    
    createTimeStopEffect() {
        // Create visual effect for time stop
        for (let i = 0; i < 20; i++) {
            const particle = {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                velocityX: 0,
                velocityY: 0,
                life: 60,
                color: '#00d4ff',
                size: Math.random() * 4 + 2
            };
            this.particles.push(particle);
        }
    }
    
    createFutureJumpEffect() {
        // Create visual effect for future jump
        for (let i = 0; i < 15; i++) {
            const particle = {
                x: this.player.x + Math.random() * this.player.width,
                y: this.player.y + Math.random() * this.player.height,
                velocityX: (Math.random() - 0.5) * 6,
                velocityY: (Math.random() - 0.5) * 6,
                life: 45,
                color: '#ff6b6b',
                size: Math.random() * 3 + 1
            };
            this.particles.push(particle);
        }
    }
    
    updateAbilityButtons() {
        const timeStopBtn = document.getElementById('time-stop-btn');
        const futureJumpBtn = document.getElementById('future-jump-btn');
        
        // Update Time Stop button
        if (this.abilities.timeStop.cooldown > 0) {
            timeStopBtn.disabled = true;
            const cooldownPercent = (this.abilities.timeStop.cooldown / this.abilities.timeStop.maxCooldown) * 100;
            document.getElementById('time-stop-cooldown').style.width = cooldownPercent + '%';
        } else {
            timeStopBtn.disabled = false;
            document.getElementById('time-stop-cooldown').style.width = '0%';
        }
        
        // Update Future Jump button
        if (this.abilities.futureJump.energy < this.abilities.futureJump.cost) {
            futureJumpBtn.disabled = true;
        } else {
            futureJumpBtn.disabled = false;
        }
        
        const energyPercent = (this.abilities.futureJump.energy / this.abilities.futureJump.maxEnergy) * 100;
        document.getElementById('future-jump-energy').style.width = energyPercent + '%';
    }
    
    updateGameUI() {
        document.getElementById('current-score').textContent = Math.floor(this.score);
        document.getElementById('distance-traveled').textContent = Math.floor(this.distance) + 'm';
        document.getElementById('coins-collected').textContent = this.coins;
    }
    
    updateAbilityUI() {
        // Update ability button states
        this.updateAbilityButtons();
    }
    
    updatePlayerStats() {
        // Load from localStorage or use defaults
        const highScore = localStorage.getItem('timeJumpHighScore') || 0;
        const totalCoins = localStorage.getItem('timeJumpTotalCoins') || 0;
        const playerLevel = localStorage.getItem('timeJumpPlayerLevel') || 1;
        
        document.getElementById('high-score').textContent = highScore;
        document.getElementById('total-coins').textContent = totalCoins;
        document.getElementById('player-level').textContent = playerLevel;
    }
    
    levelUp(newLevel) {
        this.level = newLevel;
        
        // Increase difficulty
        this.speedIncrement += 0.02;
        
        // Show level up notification
        this.showNotification(`Level ${this.level} Reached!`, 'success');
        
        // Create level up effect
        this.createLevelUpEffect();
        
        // Play sound effect
        this.playSound('levelup');
    }
    
    createLevelUpEffect() {
        // Create level up particles
        for (let i = 0; i < 30; i++) {
            const particle = {
                x: this.canvas.width / 2,
                y: this.canvas.height / 2,
                velocityX: (Math.random() - 0.5) * 8,
                velocityY: (Math.random() - 0.5) * 8,
                life: 90,
                color: '#ffd700',
                size: Math.random() * 5 + 3
            };
            this.particles.push(particle);
        }
    }
    
    pauseGame() {
        this.gameState = 'paused';
        document.getElementById('pause-menu').classList.remove('hidden');
    }
    
    resumeGame() {
        this.gameState = 'playing';
        document.getElementById('pause-menu').classList.add('hidden');
        this.gameLoop();
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        
        // Update final stats
        document.getElementById('final-score').textContent = Math.floor(this.score);
        document.getElementById('final-distance').textContent = Math.floor(this.distance) + 'm';
        document.getElementById('final-coins').textContent = this.coins;
        
        // Check for high score
        const currentHighScore = localStorage.getItem('timeJumpHighScore') || 0;
        if (this.score > currentHighScore) {
            localStorage.setItem('timeJumpHighScore', this.score);
            this.showNotification('New High Score!', 'success');
        }
        
        // Update total coins
        const currentTotalCoins = parseInt(localStorage.getItem('timeJumpTotalCoins') || 0);
        localStorage.setItem('timeJumpTotalCoins', currentTotalCoins + this.coins);
        
        // Show game over screen
        document.getElementById('game-over').classList.remove('hidden');
        
        // Play sound effect
        this.playSound('hit');
    }
    
    restartGame() {
        document.getElementById('game-over').classList.add('hidden');
        this.resetGame();
        this.gameState = 'playing';
        this.gameLoop();
    }
    
    returnToMainMenu() {
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('game-container').classList.add('hidden');
        document.getElementById('main-menu').classList.remove('hidden');
        this.gameState = 'menu';
        this.updatePlayerStats();
    }
    
    showAd(type) {
        // Simulate ad display
        const adContainer = document.getElementById('ad-container');
        const adTimer = document.getElementById('ad-timer');
        
        adContainer.classList.remove('hidden');
        
        let timeLeft = 5;
        const countdown = setInterval(() => {
            timeLeft--;
            adTimer.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(countdown);
                this.closeAd();
                
                // Apply ad reward
                if (type === 'doubleCoins') {
                    this.coins *= 2;
                    this.showNotification('Coins Doubled!', 'success');
                } else if (type === 'continue') {
                    this.continueGame();
                }
            }
        }, 1000);
    }
    
    closeAd() {
        document.getElementById('ad-container').classList.add('hidden');
    }
    
    continueGame() {
        // Reset player position and continue
        this.player.y = this.player.groundY;
        this.player.velocityY = 0;
        this.player.isJumping = false;
        this.player.isGrounded = true;
        
        // Clear obstacles near player
        this.obstacles = this.obstacles.filter(obstacle => 
            obstacle.x > this.player.x + 200
        );
        
        // Resume game
        this.gameState = 'playing';
        document.getElementById('game-over').classList.add('hidden');
        this.gameLoop();
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        const container = document.getElementById('notification-container');
        container.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    playSound(soundName) {
        // Placeholder for sound effects
        // In a real implementation, you would play actual audio files
        console.log(`Playing sound: ${soundName}`);
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw game objects
        this.drawObstacles();
        this.drawCrystals();
        this.drawParticles();
        this.drawPlayer();
        
        // Draw UI elements
        this.drawUI();
    }
    
    drawBackground() {
        // Draw gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(0.5, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw stars
        this.drawStars();
        
        // Draw ground
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.fillRect(0, this.player.groundY + this.player.height, this.canvas.width, this.canvas.height - this.player.groundY - this.player.height);
    }
    
    drawStars() {
        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 100; i++) {
            const x = (i * 37) % this.canvas.width;
            const y = (i * 73) % this.canvas.height;
            const size = (i % 3) + 1;
            
            this.ctx.fillRect(x, y, size, size);
        }
    }
    
    drawPlayer() {
        // Draw player shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(this.player.x + 5, this.player.groundY + this.player.height, this.player.width - 10, 10);
        
        // Draw player
        this.ctx.font = `${this.player.height}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.player.sprite, this.player.x + this.player.width / 2, this.player.y + this.player.height);
        
        // Draw ability effects
        if (this.abilities.timeStop.active) {
            this.drawTimeStopEffect();
        }
        
        if (this.abilities.futureJump.active) {
            this.drawFutureJumpEffect();
        }
    }
    
    drawTimeStopEffect() {
        // Draw time stop aura
        this.ctx.strokeStyle = '#00d4ff';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, 
                     this.player.width + 20, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    drawFutureJumpEffect() {
        // Draw future jump trail
        this.ctx.strokeStyle = '#ff6b6b';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
        this.ctx.lineTo(this.player.x + this.player.width / 2 + 30, this.player.y + this.player.height / 2);
        this.ctx.stroke();
    }
    
    drawObstacles() {
        this.ctx.fillStyle = '#ff6b6b';
        
        for (let obstacle of this.obstacles) {
            switch (obstacle.type) {
                case 'spike':
                    this.drawSpike(obstacle);
                    break;
                case 'wall':
                    this.drawWall(obstacle);
                    break;
                case 'laser':
                    this.drawLaser(obstacle);
                    break;
                case 'mine':
                    this.drawMine(obstacle);
                    break;
                case 'fireball':
                    this.drawFireball(obstacle);
                    break;
                default:
                    this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            }
        }
    }
    
    drawSpike(obstacle) {
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.beginPath();
        this.ctx.moveTo(obstacle.x, obstacle.y + obstacle.height);
        this.ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y);
        this.ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawWall(obstacle) {
        this.ctx.fillStyle = '#8b4513';
        this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Draw wall texture
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < obstacle.height; i += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(obstacle.x, obstacle.y + i);
            this.ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + i);
            this.ctx.stroke();
        }
    }
    
    drawLaser(obstacle) {
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = obstacle.width;
        this.ctx.beginPath();
        this.ctx.moveTo(obstacle.x, obstacle.y);
        this.ctx.lineTo(obstacle.x, obstacle.y + obstacle.height);
        this.ctx.stroke();
        
        // Draw laser glow
        this.ctx.shadowColor = '#ff0000';
        this.ctx.shadowBlur = 10;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }
    
    drawMine(obstacle) {
        this.ctx.fillStyle = '#333333';
        this.ctx.beginPath();
        this.ctx.arc(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, 
                     obstacle.width / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw mine spikes
        this.ctx.fillStyle = '#ff6b6b';
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = obstacle.x + obstacle.width / 2 + Math.cos(angle) * (obstacle.width / 2 + 5);
            const y = obstacle.y + obstacle.height / 2 + Math.sin(angle) * (obstacle.height / 2 + 5);
            this.ctx.fillRect(x - 2, y - 2, 4, 4);
        }
    }
    
    drawFireball(obstacle) {
        // Draw fireball glow
        const gradient = this.ctx.createRadialGradient(
            obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, 0,
            obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, obstacle.width / 2
        );
        gradient.addColorStop(0, '#ffff00');
        gradient.addColorStop(0.5, '#ff6600');
        gradient.addColorStop(1, '#ff0000');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, 
                     obstacle.width / 2, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawCrystals() {
        for (let crystal of this.crystals) {
            switch (crystal.type) {
                case 'energy':
                    this.drawEnergyCrystal(crystal);
                    break;
                case 'coin':
                    this.drawCoinCrystal(crystal);
                    break;
                case 'bonus':
                    this.drawBonusCrystal(crystal);
                    break;
            }
        }
    }
    
    drawEnergyCrystal(crystal) {
        this.ctx.fillStyle = '#4ecdc4';
        this.ctx.beginPath();
        this.ctx.moveTo(crystal.x + crystal.width / 2, crystal.y);
        this.ctx.lineTo(crystal.x + crystal.width, crystal.y + crystal.height / 2);
        this.ctx.lineTo(crystal.x + crystal.width / 2, crystal.y + crystal.height);
        this.ctx.lineTo(crystal.x, crystal.y + crystal.height / 2);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw energy glow
        this.ctx.shadowColor = '#4ecdc4';
        this.ctx.shadowBlur = 15;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }
    
    drawCoinCrystal(crystal) {
        this.ctx.fillStyle = '#ffd700';
        this.ctx.beginPath();
        this.ctx.arc(crystal.x + crystal.width / 2, crystal.y + crystal.height / 2, 
                     crystal.width / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw coin symbol
        this.ctx.fillStyle = '#b8860b';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('$', crystal.x + crystal.width / 2, crystal.y + crystal.height / 2 + 6);
    }
    
    drawBonusCrystal(crystal) {
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.beginPath();
        this.ctx.moveTo(crystal.x + crystal.width / 2, crystal.y);
        this.ctx.lineTo(crystal.x + crystal.width, crystal.y + crystal.height / 3);
        this.ctx.lineTo(crystal.x + crystal.width, crystal.y + crystal.height * 2 / 3);
        this.ctx.lineTo(crystal.x + crystal.width / 2, crystal.y + crystal.height);
        this.ctx.lineTo(crystal.x, crystal.y + crystal.height * 2 / 3);
        this.ctx.lineTo(crystal.x, crystal.y + crystal.height / 3);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw bonus glow
        this.ctx.shadowColor = '#ff6b6b';
        this.ctx.shadowBlur = 20;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }
    
    drawParticles() {
        for (let particle of this.particles) {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.life / 30;
            this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        }
        this.ctx.globalAlpha = 1;
    }
    
    drawUI() {
        // Draw distance markers
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        
        for (let i = 0; i < 10; i++) {
            const x = (i * 200) % this.canvas.width;
            const distance = Math.floor(this.distance) + (i * 200);
            this.ctx.fillText(`${distance}m`, x, this.canvas.height - 20);
        }
        
        // Draw random event indicators
        if (this.randomEvents.goldRain.active) {
            this.drawEventIndicator('Gold Rain', '#ffd700', 50);
        }
        
        if (this.randomEvents.fireballs.active) {
            this.drawEventIndicator('Fireballs', '#ff6b6b', 100);
        }
        
        if (this.randomEvents.terrainChange.active) {
            this.drawEventIndicator('Terrain Change', '#4ecdc4', 150);
        }
    }
    
    drawEventIndicator(text, color, y) {
        this.ctx.fillStyle = color;
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, this.canvas.width - 100, y);
        
        // Draw indicator bar
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fillRect(this.canvas.width - 120, y + 20, 40, 4);
        
        this.ctx.fillStyle = color;
        const progress = this.randomEvents[text.toLowerCase().replace(' ', '')].duration / 
                        this.randomEvents[text.toLowerCase().replace(' ', '')].maxDuration;
        this.ctx.fillRect(this.canvas.width - 120, y + 20, 40 * progress, 4);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.timeJumpGame = new TimeJumpGame();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimeJumpGame;
}