// Time Jump Game - Comprehensive JavaScript

// Game State Management
class GameState {
    constructor() {
        this.currentScreen = 'main-menu';
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.distance = 0;
        this.round = 1;
        this.speed = 1;
        this.coins = 0;
        this.crystals = 0;
        this.energy = 0;
        this.highScore = 0;
        this.playerLevel = 1;
        this.selectedCharacter = 'default';
        this.characterStats = {
            default: { jumpHeight: 1, speed: 1, timeStopDuration: 1, energyBonus: 1 },
            ninja: { jumpHeight: 1.2, speed: 1.15, timeStopDuration: 1, energyBonus: 1 },
            wizard: { jumpHeight: 1, speed: 1, timeStopDuration: 1.3, energyBonus: 1.25 },
            robot: { jumpHeight: 1, speed: 1.2, timeStopDuration: 1, energyBonus: 1 }
        };
        this.questProgress = {
            distance: 0,
            crystals: 0,
            abilities: 0,
            weeklyScore: 0
        };
        this.onlineStats = {
            gamesPlayed: 0,
            wins: 0,
            winRate: 0
        };
        this.settings = {
            musicVolume: 70,
            sfxVolume: 80,
            particleEffects: true,
            backgroundEffects: true,
            autoRun: true,
            difficulty: 'normal'
        };
    }

    loadFromStorage() {
        const saved = localStorage.getItem('timeJumpGame');
        if (saved) {
            const data = JSON.parse(saved);
            this.highScore = data.highScore || 0;
            this.coins = data.coins || 0;
            this.playerLevel = data.playerLevel || 1;
            this.selectedCharacter = data.selectedCharacter || 'default';
            this.questProgress = data.questProgress || this.questProgress;
            this.onlineStats = data.onlineStats || this.onlineStats;
            this.settings = { ...this.settings, ...data.settings };
        }
    }

    saveToStorage() {
        const data = {
            highScore: this.highScore,
            coins: this.coins,
            playerLevel: this.playerLevel,
            selectedCharacter: this.selectedCharacter,
            questProgress: this.questProgress,
            onlineStats: this.onlineStats,
            settings: this.settings
        };
        localStorage.setItem('timeJumpGame', JSON.stringify(data));
    }

    updateScore(points) {
        this.score += points;
        this.updateUI();
        this.checkLevelUp();
    }

    updateDistance(meters) {
        this.distance += meters;
        this.questProgress.distance += meters;
        this.updateUI();
        this.checkRoundProgress();
    }

    collectCrystal() {
        this.crystals++;
        this.energy += 2;
        this.questProgress.crystals++;
        this.updateUI();
        this.checkQuestCompletion();
    }

    collectCoin() {
        this.coins++;
        this.updateUI();
    }

    useAbility() {
        this.questProgress.abilities++;
        this.checkQuestCompletion();
    }

    checkLevelUp() {
        const newLevel = Math.floor(this.score / 10000) + 1;
        if (newLevel > this.playerLevel) {
            this.playerLevel = newLevel;
            this.showNotification(`Level Up! You are now level ${this.playerLevel}`, 'success');
            this.saveToStorage();
        }
    }

    checkRoundProgress() {
        const newRound = Math.floor(this.distance / 1000) + 1;
        if (newRound > this.round) {
            this.round = newRound;
            this.speed = Math.min(3, 1 + (this.round - 1) * 0.2);
            this.showNotification(`Round ${this.round}! Speed increased!`, 'warning');
            this.updateUI();
        }
    }

    checkQuestCompletion() {
        // Check daily quests
        if (this.questProgress.distance >= 5000) {
            this.completeQuest('distance', 100);
        }
        if (this.questProgress.crystals >= 50) {
            this.completeQuest('crystals', 75);
        }
        if (this.questProgress.abilities >= 20) {
            this.completeQuest('abilities', 150);
        }

        // Check weekly quests
        if (this.score >= 100000) {
            this.completeQuest('weekly-score', 500);
        }
    }

    completeQuest(questType, reward) {
        this.coins += reward;
        this.showNotification(`Quest completed! +${reward} coins`, 'success');
        this.saveToStorage();
    }

    updateUI() {
        // Update score displays
        document.getElementById('current-score').textContent = this.score.toLocaleString();
        document.getElementById('distance').textContent = `${Math.floor(this.distance)}m`;
        document.getElementById('current-speed').textContent = `${this.speed.toFixed(1)}x`;
        document.getElementById('current-round').textContent = this.round;
        
        // Update resource displays
        document.getElementById('crystal-count').textContent = this.crystals;
        document.getElementById('energy-count').textContent = this.energy;
        document.getElementById('coin-count').textContent = this.coins;

        // Update main menu stats
        document.getElementById('high-score').textContent = this.highScore.toLocaleString();
        document.getElementById('total-coins').textContent = this.coins.toLocaleString();
        document.getElementById('player-level').textContent = this.playerLevel;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        const container = document.getElementById('notification-container');
        container.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => container.removeChild(notification), 300);
        }, 3000);
    }
}

// Game Engine
class GameEngine {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = new GameState();
        this.player = null;
        this.obstacles = [];
        this.collectibles = [];
        this.particles = [];
        this.timeStopActive = false;
        this.timeStopCooldown = 0;
        this.futureJumpCooldown = 0;
        this.randomEvents = [];
        this.lastFrameTime = 0;
        this.animationId = null;
        
        this.init();
    }

    init() {
        this.gameState.loadFromStorage();
        this.setupEventListeners();
        this.setupScreens();
        this.updateUI();
        this.hideLoadingScreen();
    }

    setupEventListeners() {
        // Main menu buttons
        document.getElementById('play-btn').addEventListener('click', () => this.startGame());
        document.getElementById('online-btn').addEventListener('click', () => this.showScreen('online-screen'));
        document.getElementById('shop-btn').addEventListener('click', () => this.showScreen('shop-screen'));
        document.getElementById('quests-btn').addEventListener('click', () => this.showScreen('quests-screen'));
        document.getElementById('leaderboard-btn').addEventListener('click', () => this.showScreen('leaderboard-screen'));
        document.getElementById('settings-btn').addEventListener('click', () => this.showScreen('settings-screen'));

        // Game controls
        document.getElementById('time-stop-btn').addEventListener('click', () => this.activateTimeStop());
        document.getElementById('future-jump-btn').addEventListener('click', () => this.activateFutureJump());

        // Pause menu
        document.getElementById('resume-btn').addEventListener('click', () => this.resumeGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('main-menu-btn').addEventListener('click', () => this.returnToMainMenu());

        // Game over buttons
        document.getElementById('continue-btn').addEventListener('click', () => this.showAd('continue'));
        document.getElementById('double-coins-btn').addEventListener('click', () => this.showAd('double-coins'));
        document.getElementById('play-again-btn').addEventListener('click', () => this.startGame());
        document.getElementById('main-menu-game-over-btn').addEventListener('click', () => this.returnToMainMenu());

        // Close buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const screen = e.target.closest('.screen');
                if (screen) {
                    this.hideScreen(screen.id);
                }
            });
        });

        // Character selection
        document.querySelectorAll('.select-char-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const character = e.target.dataset.character;
                this.selectCharacter(character);
            });
        });

        // Settings
        this.setupSettingsListeners();

        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Pause on visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.gameState.gameRunning) {
                this.pauseGame();
            }
        });
    }

    setupSettingsListeners() {
        const musicVolume = document.getElementById('music-volume');
        const sfxVolume = document.getElementById('sfx-volume');
        const particleEffects = document.getElementById('particle-effects');
        const backgroundEffects = document.getElementById('background-effects');
        const autoRun = document.getElementById('auto-run');
        const difficulty = document.getElementById('difficulty');

        musicVolume.addEventListener('input', (e) => {
            this.gameState.settings.musicVolume = e.target.value;
            document.querySelector('#music-volume + .volume-value').textContent = `${e.target.value}%`;
            this.gameState.saveToStorage();
        });

        sfxVolume.addEventListener('input', (e) => {
            this.gameState.settings.sfxVolume = e.target.value;
            document.querySelector('#sfx-volume + .volume-value').textContent = `${e.target.value}%`;
            this.gameState.saveToStorage();
        });

        particleEffects.addEventListener('change', (e) => {
            this.gameState.settings.particleEffects = e.target.checked;
            this.gameState.saveToStorage();
        });

        backgroundEffects.addEventListener('change', (e) => {
            this.gameState.settings.backgroundEffects = e.target.checked;
            this.gameState.saveToStorage();
        });

        autoRun.addEventListener('change', (e) => {
            this.gameState.settings.autoRun = e.target.checked;
            this.gameState.saveToStorage();
        });

        difficulty.addEventListener('change', (e) => {
            this.gameState.settings.difficulty = e.target.value;
            this.gameState.saveToStorage();
        });
    }

    setupScreens() {
        // Initialize all screens
        const screens = [
            'main-menu', 'game-screen', 'pause-menu', 'game-over-screen',
            'shop-screen', 'quests-screen', 'online-screen', 'leaderboard-screen', 'settings-screen'
        ];

        screens.forEach(screenId => {
            const screen = document.getElementById(screenId);
            if (screen) {
                screen.classList.remove('active');
            }
        });

        // Show main menu by default
        this.showScreen('main-menu');
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.gameState.currentScreen = screenId;
        }
    }

    hideScreen(screenId) {
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.remove('active');
        }
        this.showScreen('main-menu');
    }

    startGame() {
        this.gameState.gameRunning = true;
        this.gameState.gamePaused = false;
        this.gameState.score = 0;
        this.gameState.distance = 0;
        this.gameState.round = 1;
        this.gameState.speed = 1;
        this.gameState.crystals = 0;
        this.gameState.energy = 0;
        this.gameState.obstacles = [];
        this.gameState.collectibles = [];
        this.gameState.particles = [];
        this.gameState.randomEvents = [];
        this.gameState.timeStopActive = false;
        this.gameState.timeStopCooldown = 0;
        this.gameState.futureJumpCooldown = 0;

        this.showScreen('game-screen');
        this.initializeGame();
        this.gameLoop();
    }

    initializeGame() {
        // Initialize player
        this.player = {
            x: 100,
            y: this.canvas.height - 100,
            width: 40,
            height: 60,
            velocityY: 0,
            onGround: true,
            jumping: false,
            character: this.gameState.selectedCharacter
        };

        // Initialize obstacles and collectibles
        this.obstacles = [];
        this.collectibles = [];
        this.particles = [];
        this.randomEvents = [];

        // Start spawning
        this.spawnObstacles();
        this.spawnCollectibles();
        this.spawnRandomEvents();

        // Enable controls
        this.updateControls();
    }

    gameLoop(currentTime = 0) {
        if (!this.gameState.gameRunning || this.gameState.gamePaused) {
            return;
        }

        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;

        this.update(deltaTime);
        this.render();

        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        if (this.timeStopActive) {
            return; // Time is stopped
        }

        const dt = deltaTime / 16.67; // Normalize to 60fps

        // Update player
        this.updatePlayer(dt);

        // Update obstacles
        this.updateObstacles(dt);

        // Update collectibles
        this.updateCollectibles(dt);

        // Update particles
        this.updateParticles(dt);

        // Update random events
        this.updateRandomEvents(dt);

        // Update cooldowns
        this.updateCooldowns(dt);

        // Check collisions
        this.checkCollisions();

        // Update game state
        this.gameState.updateDistance(this.gameState.speed * 2 * dt);
        this.gameState.updateScore(10 * dt);
    }

    updatePlayer(dt) {
        // Apply gravity
        if (!this.player.onGround) {
            this.player.velocityY += 0.8 * dt;
        }

        // Update position
        this.player.y += this.player.velocityY * dt;

        // Ground collision
        if (this.player.y >= this.canvas.height - 100) {
            this.player.y = this.canvas.height - 100;
            this.player.velocityY = 0;
            this.player.onGround = true;
            this.player.jumping = false;
        }

        // Jump input
        if (this.gameState.settings.autoRun && this.player.onGround && !this.player.jumping) {
            this.player.jump();
        }
    }

    updateObstacles(dt) {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.x -= this.gameState.speed * 3 * dt;

            // Remove off-screen obstacles
            if (obstacle.x + obstacle.width < 0) {
                this.obstacles.splice(i, 1);
            }
        }
    }

    updateCollectibles(dt) {
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const collectible = this.collectibles[i];
            collectible.x -= this.gameState.speed * 3 * dt;

            // Remove off-screen collectibles
            if (collectible.x + collectible.width < 0) {
                this.collectibles.splice(i, 1);
            }
        }
    }

    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.velocityX * dt;
            particle.y += particle.velocityY * dt;
            particle.life -= dt;

            // Remove dead particles
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    updateRandomEvents(dt) {
        for (let i = this.randomEvents.length - 1; i >= 0; i--) {
            const event = this.randomEvents[i];
            event.duration -= dt;

            if (event.duration <= 0) {
                this.randomEvents.splice(i, 1);
                this.endRandomEvent(event);
            }
        }
    }

    updateCooldowns(dt) {
        if (this.timeStopCooldown > 0) {
            this.timeStopCooldown -= dt;
            this.updateTimeStopCooldown();
        }

        if (this.futureJumpCooldown > 0) {
            this.futureJumpCooldown -= dt;
            this.updateFutureJumpCooldown();
        }
    }

    checkCollisions() {
        // Check obstacle collisions
        for (const obstacle of this.obstacles) {
            if (this.checkCollision(this.player, obstacle)) {
                this.gameOver();
                return;
            }
        }

        // Check collectible collisions
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const collectible = this.collectibles[i];
            if (this.checkCollision(this.player, collectible)) {
                if (collectible.type === 'crystal') {
                    this.gameState.collectCrystal();
                    this.createParticles(collectible.x, collectible.y, '#00ffff');
                } else if (collectible.type === 'coin') {
                    this.gameState.collectCoin();
                    this.createParticles(collectible.x, collectible.y, '#ffff00');
                }
                this.collectibles.splice(i, 1);
            }
        }
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    spawnObstacles() {
        const spawnObstacle = () => {
            if (!this.gameState.gameRunning) return;

            const obstacleTypes = ['spike', 'block', 'flying'];
            const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
            
            let obstacle;
            switch (type) {
                case 'spike':
                    obstacle = {
                        x: this.canvas.width + Math.random() * 200,
                        y: this.canvas.height - 60,
                        width: 30,
                        height: 40,
                        type: 'spike'
                    };
                    break;
                case 'block':
                    obstacle = {
                        x: this.canvas.width + Math.random() * 200,
                        y: this.canvas.height - 80,
                        width: 60,
                        height: 80,
                        type: 'block'
                    };
                    break;
                case 'flying':
                    obstacle = {
                        x: this.canvas.width + Math.random() * 200,
                        y: this.canvas.height - 200 - Math.random() * 100,
                        width: 50,
                        height: 30,
                        type: 'flying'
                    };
                    break;
            }

            this.obstacles.push(obstacle);
            
            // Schedule next spawn
            const nextSpawn = Math.max(1000, 3000 - this.gameState.round * 200);
            setTimeout(spawnObstacle, nextSpawn);
        };

        spawnObstacle();
    }

    spawnCollectibles() {
        const spawnCollectible = () => {
            if (!this.gameState.gameRunning) return;

            const types = ['crystal', 'coin'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            const collectible = {
                x: this.canvas.width + Math.random() * 300,
                y: this.canvas.height - 100 - Math.random() * 200,
                width: 30,
                height: 30,
                type: type
            };

            this.collectibles.push(collectible);
            
            // Schedule next spawn
            setTimeout(spawnCollectible, 2000 + Math.random() * 3000);
        };

        spawnCollectible();
    }

    spawnRandomEvents() {
        const spawnEvent = () => {
            if (!this.gameState.gameRunning) return;

            const events = ['gold-rain', 'fireballs', 'terrain-change'];
            const event = events[Math.floor(Math.random() * events.length)];
            
            this.triggerRandomEvent(event);
            
            // Schedule next event
            setTimeout(spawnEvent, 15000 + Math.random() * 30000);
        };

        spawnEvent();
    }

    triggerRandomEvent(eventType) {
        const event = {
            type: eventType,
            duration: 5000,
            active: true
        };

        this.randomEvents.push(event);
        this.startRandomEvent(event);
    }

    startRandomEvent(event) {
        switch (event.type) {
            case 'gold-rain':
                this.showGameMessage('GOLD RAIN!', 'Collect extra coins!');
                this.spawnGoldRain();
                break;
            case 'fireballs':
                this.showGameMessage('FIREBALLS!', 'Dodge the incoming fire!');
                this.spawnFireballs();
                break;
            case 'terrain-change':
                this.showGameMessage('TERRAIN CHANGE!', 'Watch out for new obstacles!');
                this.changeTerrain();
                break;
        }
    }

    endRandomEvent(event) {
        this.hideGameMessage();
        this.hideRandomEvent();
    }

    spawnGoldRain() {
        const spawnCoin = () => {
            if (!this.randomEvents.find(e => e.type === 'gold-rain' && e.active)) return;

            const coin = {
                x: Math.random() * this.canvas.width,
                y: -50,
                width: 25,
                height: 25,
                type: 'coin',
                velocityY: 2 + Math.random() * 3
            };

            this.collectibles.push(coin);
            setTimeout(spawnCoin, 200);
        };

        spawnCoin();
    }

    spawnFireballs() {
        const spawnFireball = () => {
            if (!this.randomEvents.find(e => e.type === 'fireballs' && e.active)) return;

            const fireball = {
                x: this.canvas.width + 50,
                y: Math.random() * (this.canvas.height - 100),
                width: 40,
                height: 40,
                type: 'fireball',
                velocityX: -4 - Math.random() * 2
            };

            this.obstacles.push(fireball);
            setTimeout(spawnFireball, 800);
        };

        spawnFireball();
    }

    changeTerrain() {
        // Temporarily increase obstacle spawn rate
        const originalSpawnRate = this.obstacleSpawnRate;
        this.obstacleSpawnRate = this.obstacleSpawnRate * 0.5;
        
        setTimeout(() => {
            this.obstacleSpawnRate = originalSpawnRate;
        }, 5000);
    }

    activateTimeStop() {
        if (this.timeStopCooldown > 0 || this.gameState.energy < 2) return;

        this.timeStopActive = true;
        this.timeStopCooldown = 50; // 5 seconds at 60fps
        this.gameState.energy -= 2;
        this.gameState.useAbility();

        this.showGameMessage('TIME STOP!', 'Obstacles frozen!');
        
        // Visual effect
        this.canvas.style.filter = 'hue-rotate(180deg) brightness(1.5)';
        
        setTimeout(() => {
            this.timeStopActive = false;
            this.canvas.style.filter = 'none';
            this.hideGameMessage();
        }, 2000);

        this.updateControls();
    }

    activateFutureJump() {
        if (this.futureJumpCooldown > 0 || this.gameState.energy < 3) return;

        this.futureJumpCooldown = 30; // 3 seconds at 60fps
        this.gameState.energy -= 3;
        this.gameState.useAbility();

        // Jump forward in time (skip some obstacles)
        this.player.x += 200;
        this.gameState.updateDistance(100);

        this.showGameMessage('FUTURE JUMP!', 'Skipped ahead!');
        
        setTimeout(() => {
            this.hideGameMessage();
        }, 1500);

        this.updateControls();
    }

    updateTimeStopCooldown() {
        const cooldownElement = document.getElementById('time-stop-cooldown');
        if (cooldownElement) {
            const seconds = Math.ceil(this.timeStopCooldown / 10);
            cooldownElement.textContent = `${seconds}s`;
        }
    }

    updateFutureJumpCooldown() {
        // Future jump doesn't show cooldown, just energy cost
    }

    updateControls() {
        const timeStopBtn = document.getElementById('time-stop-btn');
        const futureJumpBtn = document.getElementById('future-jump-btn');

        timeStopBtn.disabled = this.timeStopCooldown > 0 || this.gameState.energy < 2;
        futureJumpBtn.disabled = this.futureJumpCooldown > 0 || this.gameState.energy < 3;
    }

    showGameMessage(message, subtitle = '') {
        const gameMessage = document.getElementById('game-message');
        const randomEvent = document.getElementById('random-event');
        
        if (gameMessage) {
            gameMessage.textContent = message;
            gameMessage.classList.add('show');
        }
        
        if (randomEvent && subtitle) {
            randomEvent.textContent = subtitle;
            randomEvent.classList.add('show');
        }
    }

    hideGameMessage() {
        const gameMessage = document.getElementById('game-message');
        const randomEvent = document.getElementById('random-event');
        
        if (gameMessage) gameMessage.classList.remove('show');
        if (randomEvent) randomEvent.classList.remove('show');
    }

    hideRandomEvent() {
        const randomEvent = document.getElementById('random-event');
        if (randomEvent) randomEvent.classList.remove('show');
    }

    createParticles(x, y, color) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x + Math.random() * 40 - 20,
                y: y + Math.random() * 40 - 20,
                velocityX: (Math.random() - 0.5) * 4,
                velocityY: (Math.random() - 0.5) * 4,
                life: 30,
                color: color,
                size: 3 + Math.random() * 3
            });
        }
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background
        this.drawBackground();

        // Draw game elements
        this.drawPlayer();
        this.drawObstacles();
        this.drawCollectibles();
        this.drawParticles();

        // Draw UI elements
        this.drawUI();
    }

    drawBackground() {
        // Draw ground
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.fillRect(0, this.canvas.height - 40, this.canvas.width, 40);

        // Draw grid lines
        if (this.gameState.settings.backgroundEffects) {
            this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
            this.ctx.lineWidth = 1;
            
            for (let x = 0; x < this.canvas.width; x += 50) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, 0);
                this.ctx.lineTo(x, this.canvas.height);
                this.ctx.stroke();
            }
        }
    }

    drawPlayer() {
        this.ctx.fillStyle = '#00ffff';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Draw player details
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(this.player.x + 5, this.player.y + 10, 30, 20);
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(this.player.x + 10, this.player.y + 15, 20, 10);
    }

    drawObstacles() {
        this.ctx.fillStyle = '#ff6b6b';
        
        for (const obstacle of this.obstacles) {
            switch (obstacle.type) {
                case 'spike':
                    this.drawSpike(obstacle);
                    break;
                case 'block':
                    this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                    break;
                case 'flying':
                    this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                    break;
                case 'fireball':
                    this.drawFireball(obstacle);
                    break;
            }
        }
    }

    drawSpike(obstacle) {
        this.ctx.beginPath();
        this.ctx.moveTo(obstacle.x, obstacle.y + obstacle.height);
        this.ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y);
        this.ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawFireball(obstacle) {
        // Draw fire effect
        this.ctx.fillStyle = '#ff6600';
        this.ctx.beginPath();
        this.ctx.arc(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, obstacle.width / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#ffff00';
        this.ctx.beginPath();
        this.ctx.arc(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, obstacle.width / 3, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawCollectibles() {
        for (const collectible of this.collectibles) {
            switch (collectible.type) {
                case 'crystal':
                    this.drawCrystal(collectible);
                    break;
                case 'coin':
                    this.drawCoin(collectible);
                    break;
            }
        }
    }

    drawCrystal(collectible) {
        this.ctx.fillStyle = '#00ffff';
        this.ctx.beginPath();
        this.ctx.moveTo(collectible.x + collectible.width / 2, collectible.y);
        this.ctx.lineTo(collectible.x + collectible.width, collectible.y + collectible.height / 2);
        this.ctx.lineTo(collectible.x + collectible.width / 2, collectible.y + collectible.height);
        this.ctx.lineTo(collectible.x, collectible.y + collectible.height / 2);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawCoin(collectible) {
        this.ctx.fillStyle = '#ffff00';
        this.ctx.beginPath();
        this.ctx.arc(collectible.x + collectible.width / 2, collectible.y + collectible.height / 2, collectible.width / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#ffaa00';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('$', collectible.x + collectible.width / 2, collectible.y + collectible.height / 2 + 6);
    }

    drawParticles() {
        if (!this.gameState.settings.particleEffects) return;
        
        for (const particle of this.particles) {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.life / 30;
            this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        }
        this.ctx.globalAlpha = 1;
    }

    drawUI() {
        // Draw time stop effect overlay
        if (this.timeStopActive) {
            this.ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    gameOver() {
        this.gameState.gameRunning = false;
        
        // Update high score
        if (this.gameState.score > this.gameState.highScore) {
            this.gameState.highScore = this.gameState.score;
            this.gameState.showNotification('New High Score!', 'success');
        }

        // Update final stats
        document.getElementById('final-score').textContent = this.gameState.score.toLocaleString();
        document.getElementById('final-distance').textContent = `${Math.floor(this.gameState.distance)}m`;
        document.getElementById('coins-earned').textContent = this.gameState.crystals * 5;

        // Save game state
        this.gameState.saveToStorage();

        // Stop game loop
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        // Show game over screen
        this.showScreen('game-over-screen');
    }

    pauseGame() {
        if (!this.gameState.gameRunning) return;
        
        this.gameState.gamePaused = true;
        this.showScreen('pause-menu');
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    resumeGame() {
        this.gameState.gamePaused = false;
        this.showScreen('game-screen');
        this.gameLoop();
    }

    restartGame() {
        this.showScreen('game-screen');
        this.startGame();
    }

    returnToMainMenu() {
        this.gameState.gameRunning = false;
        this.gameState.gamePaused = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.showScreen('main-menu');
    }

    selectCharacter(character) {
        if (character === 'default' || this.gameState.coins >= this.getCharacterPrice(character)) {
            this.gameState.selectedCharacter = character;
            if (character !== 'default') {
                this.gameState.coins -= this.getCharacterPrice(character);
            }
            this.gameState.saveToStorage();
            this.gameState.showNotification(`Character ${character} selected!`, 'success');
            this.hideScreen('shop-screen');
        } else {
            this.gameState.showNotification('Not enough coins!', 'error');
        }
    }

    getCharacterPrice(character) {
        const prices = {
            ninja: 500,
            wizard: 1000,
            robot: 2000
        };
        return prices[character] || 0;
    }

    showAd(type) {
        const adOverlay = document.getElementById('ad-overlay');
        const skipTimer = document.getElementById('skip-timer');
        const skipBtn = document.getElementById('skip-ad-btn');
        
        adOverlay.classList.add('show');
        
        let timeLeft = 5;
        const countdown = setInterval(() => {
            timeLeft--;
            skipTimer.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(countdown);
                skipBtn.disabled = false;
                skipBtn.textContent = 'SKIP AD';
            }
        }, 1000);

        skipBtn.addEventListener('click', () => {
            adOverlay.classList.remove('show');
            this.handleAdCompletion(type);
        });
    }

    handleAdCompletion(type) {
        switch (type) {
            case 'continue':
                this.gameState.showNotification('Continue playing!', 'success');
                this.startGame();
                break;
            case 'double-coins':
                this.gameState.coins += this.gameState.crystals * 5;
                this.gameState.showNotification('Coins doubled!', 'success');
                this.gameState.saveToStorage();
                this.returnToMainMenu();
                break;
        }
    }

    handleKeyPress(e) {
        if (!this.gameState.gameRunning) return;

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                if (this.player.onGround) {
                    this.player.jump();
                }
                break;
            case 'KeyP':
                e.preventDefault();
                this.pauseGame();
                break;
            case 'KeyT':
                e.preventDefault();
                this.activateTimeStop();
                break;
            case 'KeyF':
                e.preventDefault();
                this.activateFutureJump();
                break;
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    updateUI() {
        this.gameState.updateUI();
    }
}

// Player class extension
class Player {
    constructor(x, y, character) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 60;
        this.velocityY = 0;
        this.onGround = true;
        this.jumping = false;
        this.character = character;
    }

    jump() {
        if (this.onGround && !this.jumping) {
            this.velocityY = -15;
            this.onGround = false;
            this.jumping = true;
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new GameEngine();
    
    // Make game globally accessible for debugging
    window.game = game;
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
