// Time Jump Game - UI and Menu Management
// Handles all user interface interactions and menu navigation

class TimeJumpApp {
    constructor() {
        this.currentScreen = 'loading';
        this.game = null;
        this.characters = [];
        this.dailyQuests = [];
        this.onlineStats = {
            wins: 0,
            losses: 0,
            winRate: 0
        };
        this.leaderboardData = {
            global: [],
            friends: [],
            weekly: []
        };
        this.settings = {
            musicVolume: 70,
            sfxVolume: 80,
            particleEffects: true,
            backgroundEffects: true,
            difficulty: 'normal',
            autoSave: true
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadGameData();
        this.initializeCharacters();
        this.initializeDailyQuests();
        this.initializeLeaderboard();
        this.loadSettings();
    }
    
    setupEventListeners() {
        // Main menu buttons
        document.getElementById('play-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('online-btn').addEventListener('click', () => {
            this.showOnlineMode();
        });
        
        document.getElementById('shop-btn').addEventListener('click', () => {
            this.showCharacterShop();
        });
        
        document.getElementById('quests-btn').addEventListener('click', () => {
            this.showDailyQuests();
        });
        
        document.getElementById('leaderboard-btn').addEventListener('click', () => {
            this.showLeaderboard();
        });
        
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.showSettings();
        });
        
        // Game control buttons
        document.getElementById('resume-btn').addEventListener('click', () => {
            this.resumeGame();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('main-menu-btn').addEventListener('click', () => {
            this.returnToMainMenu();
        });
        
        // Game over buttons
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.playAgain();
        });
        
        document.getElementById('double-coins-btn').addEventListener('click', () => {
            this.showAd('doubleCoins');
        });
        
        document.getElementById('continue-btn').addEventListener('click', () => {
            this.showAd('continue');
        });
        
        document.getElementById('main-menu-game-over-btn').addEventListener('click', () => {
            this.returnToMainMenuFromGameOver();
        });
        
        // Modal close buttons
        document.getElementById('close-shop-btn').addEventListener('click', () => {
            this.hideCharacterShop();
        });
        
        document.getElementById('close-quests-btn').addEventListener('click', () => {
            this.hideDailyQuests();
        });
        
        document.getElementById('close-online-btn').addEventListener('click', () => {
            this.hideOnlineMode();
        });
        
        document.getElementById('close-leaderboard-btn').addEventListener('click', () => {
            this.hideLeaderboard();
        });
        
        document.getElementById('close-settings-btn').addEventListener('click', () => {
            this.hideSettings();
        });
        
        // Online mode buttons
        document.getElementById('find-match-btn').addEventListener('click', () => {
            this.findMatch();
        });
        
        // Leaderboard tabs
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchLeaderboardTab(e.target.dataset.tab);
            });
        });
        
        // Settings controls
        document.getElementById('music-volume').addEventListener('input', (e) => {
            this.updateMusicVolume(e.target.value);
        });
        
        document.getElementById('sfx-volume').addEventListener('input', (e) => {
            this.updateSfxVolume(e.target.value);
        });
        
        document.getElementById('particle-effects').addEventListener('change', (e) => {
            this.updateParticleEffects(e.target.checked);
        });
        
        document.getElementById('background-effects').addEventListener('change', (e) => {
            this.updateBackgroundEffects(e.target.checked);
        });
        
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.updateDifficulty(e.target.value);
        });
        
        document.getElementById('auto-save').addEventListener('change', (e) => {
            this.updateAutoSave(e.target.checked);
        });
        
        // Ad close button
        document.getElementById('close-ad-btn').addEventListener('click', () => {
            this.closeAd();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }
    
    handleKeyboardShortcuts(e) {
        switch (e.code) {
            case 'Escape':
                if (this.currentScreen === 'game') {
                    this.pauseGame();
                } else if (this.currentScreen !== 'menu') {
                    this.returnToMainMenu();
                }
                break;
            case 'Enter':
                if (this.currentScreen === 'menu') {
                    this.startGame();
                }
                break;
        }
    }
    
    loadGameData() {
        // Load saved game data from localStorage
        const savedData = localStorage.getItem('timeJumpGameData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.onlineStats = data.onlineStats || this.onlineStats;
                this.settings = { ...this.settings, ...data.settings };
            } catch (error) {
                console.error('Error loading game data:', error);
            }
        }
    }
    
    saveGameData() {
        // Save game data to localStorage
        const gameData = {
            onlineStats: this.onlineStats,
            settings: this.settings,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem('timeJumpGameData', JSON.stringify(gameData));
        } catch (error) {
            console.error('Error saving game data:', error);
        }
    }
    
    initializeCharacters() {
        this.characters = [
            {
                id: 1,
                name: 'Time Runner',
                avatar: '🏃',
                price: 0,
                owned: true,
                selected: true,
                abilities: ['Basic Jump', 'Standard Speed'],
                rarity: 'common'
            },
            {
                id: 2,
                name: 'Quantum Leaper',
                avatar: '⚡',
                price: 1000,
                owned: false,
                selected: false,
                abilities: ['Enhanced Jump', 'Faster Movement', 'Energy Boost'],
                rarity: 'rare'
            },
            {
                id: 3,
                name: 'Chrono Master',
                avatar: '⏰',
                price: 2500,
                owned: false,
                selected: false,
                abilities: ['Time Manipulation', 'Slow Motion', 'Temporal Shield'],
                rarity: 'epic'
            },
            {
                id: 4,
                name: 'Dimension Walker',
                avatar: '🌌',
                price: 5000,
                owned: false,
                selected: false,
                abilities: ['Phase Through Obstacles', 'Multi-Dimensional Jump', 'Reality Warp'],
                rarity: 'legendary'
            },
            {
                id: 5,
                name: 'Eternal Guardian',
                avatar: '🛡️',
                price: 10000,
                owned: false,
                selected: false,
                abilities: ['Immortality', 'Time Reversal', 'Cosmic Powers'],
                rarity: 'mythic'
            }
        ];
    }
    
    initializeDailyQuests() {
        this.dailyQuests = [
            {
                id: 1,
                title: 'Distance Runner',
                description: 'Travel 5000 meters in a single run',
                progress: 0,
                target: 5000,
                reward: 100,
                type: 'distance',
                completed: false
            },
            {
                id: 2,
                title: 'Crystal Collector',
                description: 'Collect 50 crystals in a single run',
                progress: 0,
                target: 50,
                reward: 75,
                type: 'crystals',
                completed: false
            },
            {
                id: 3,
                title: 'Ability Master',
                description: 'Use Time Stop 3 times in a single run',
                progress: 0,
                target: 3,
                reward: 150,
                type: 'abilities',
                completed: false
            }
        ];
        
        // Load quest progress
        this.loadQuestProgress();
    }
    
    loadQuestProgress() {
        const savedProgress = localStorage.getItem('timeJumpQuestProgress');
        if (savedProgress) {
            try {
                const progress = JSON.parse(savedProgress);
                const today = new Date().toDateString();
                
                if (progress.date === today) {
                    this.dailyQuests.forEach(quest => {
                        if (progress.quests[quest.id]) {
                            quest.progress = progress.quests[quest.id].progress;
                            quest.completed = progress.quests[quest.id].completed;
                        }
                    });
                }
            } catch (error) {
                console.error('Error loading quest progress:', error);
            }
        }
    }
    
    saveQuestProgress() {
        const progress = {
            date: new Date().toDateString(),
            quests: {}
        };
        
        this.dailyQuests.forEach(quest => {
            progress.quests[quest.id] = {
                progress: quest.progress,
                completed: quest.completed
            };
        });
        
        try {
            localStorage.setItem('timeJumpQuestProgress', JSON.stringify(progress));
        } catch (error) {
            console.error('Error saving quest progress:', error);
        }
    }
    
    initializeLeaderboard() {
        // Generate sample leaderboard data
        this.leaderboardData.global = this.generateLeaderboardEntries(20);
        this.leaderboardData.friends = this.generateLeaderboardEntries(10);
        this.leaderboardData.weekly = this.generateLeaderboardEntries(15);
    }
    
    generateLeaderboardEntries(count) {
        const entries = [];
        for (let i = 1; i <= count; i++) {
            entries.push({
                rank: i,
                name: `Player${Math.floor(Math.random() * 9999)}`,
                score: Math.floor(Math.random() * 100000) + 10000,
                level: Math.floor(Math.random() * 50) + 1
            });
        }
        
        // Sort by score (descending)
        return entries.sort((a, b) => b.score - a.score);
    }
    
    loadSettings() {
        const savedSettings = localStorage.getItem('timeJumpSettings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                this.settings = { ...this.settings, ...settings };
                this.applySettings();
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        }
    }
    
    applySettings() {
        // Apply volume settings
        document.getElementById('music-volume').value = this.settings.musicVolume;
        document.getElementById('music-volume-value').textContent = this.settings.musicVolume + '%';
        
        document.getElementById('sfx-volume').value = this.settings.sfxVolume;
        document.getElementById('sfx-volume-value').textContent = this.settings.sfxVolume + '%';
        
        // Apply checkbox settings
        document.getElementById('particle-effects').checked = this.settings.particleEffects;
        document.getElementById('background-effects').checked = this.settings.backgroundEffects;
        document.getElementById('auto-save').checked = this.settings.autoSave;
        
        // Apply difficulty setting
        document.getElementById('difficulty').value = this.settings.difficulty;
    }
    
    startGame() {
        this.currentScreen = 'game';
        this.game = window.timeJumpGame;
        
        if (this.game) {
            this.game.startGame();
        }
    }
    
    pauseGame() {
        if (this.game && this.game.gameState === 'playing') {
            this.game.pauseGame();
        }
    }
    
    resumeGame() {
        if (this.game && this.game.gameState === 'paused') {
            this.game.resumeGame();
        }
    }
    
    restartGame() {
        if (this.game) {
            this.game.restartGame();
        }
    }
    
    returnToMainMenu() {
        this.currentScreen = 'menu';
        
        if (this.game) {
            this.game.returnToMainMenu();
        }
        
        // Hide all game-related screens
        document.getElementById('game-container').classList.add('hidden');
        document.getElementById('pause-menu').classList.add('hidden');
        document.getElementById('game-over').classList.add('hidden');
        
        // Show main menu
        document.getElementById('main-menu').classList.remove('hidden');
        
        // Update player stats
        this.updatePlayerStats();
    }
    
    returnToMainMenuFromGameOver() {
        this.returnToMainMenu();
    }
    
    playAgain() {
        if (this.game) {
            this.game.restartGame();
        }
    }
    
    showAd(type) {
        if (this.game) {
            this.game.showAd(type);
        }
    }
    
    closeAd() {
        if (this.game) {
            this.game.closeAd();
        }
    }
    
    showCharacterShop() {
        this.currentScreen = 'shop';
        document.getElementById('character-shop').classList.remove('hidden');
        this.populateCharacterShop();
    }
    
    hideCharacterShop() {
        this.currentScreen = 'menu';
        document.getElementById('character-shop').classList.add('hidden');
    }
    
    populateCharacterShop() {
        const characterGrid = document.getElementById('character-grid');
        const currentCharacterPreview = document.getElementById('current-character-preview');
        const purchaseInfo = document.getElementById('purchase-info');
        
        // Clear existing content
        characterGrid.innerHTML = '';
        
        // Populate character grid
        this.characters.forEach(character => {
            const characterItem = document.createElement('div');
            characterItem.className = `character-item ${character.selected ? 'selected' : ''}`;
            characterItem.dataset.characterId = character.id;
            
            characterItem.innerHTML = `
                <div class="character-avatar">${character.avatar}</div>
                <div class="character-name">${character.name}</div>
                <div class="character-abilities">
                    ${character.abilities.map(ability => `<div class="ability">${ability}</div>`).join('')}
                </div>
                ${character.owned ? 
                    '<div class="character-owned">OWNED</div>' : 
                    `<div class="character-price">${character.price} Coins</div>`
                }
            `;
            
            characterItem.addEventListener('click', () => {
                this.selectCharacter(character.id);
            });
            
            characterGrid.appendChild(characterItem);
        });
        
        // Show current character
        const currentCharacter = this.characters.find(c => c.selected);
        if (currentCharacter) {
            currentCharacterPreview.innerHTML = `
                <div class="character-avatar large">${currentCharacter.avatar}</div>
                <div class="character-name">${currentCharacter.name}</div>
                <div class="character-abilities">
                    ${currentCharacter.abilities.map(ability => `<div class="ability">${ability}</div>`).join('')}
                </div>
            `;
        }
        
        // Show purchase info
        purchaseInfo.innerHTML = `
            <h4>Character Shop</h4>
            <p>Unlock new characters with unique abilities to enhance your gameplay experience!</p>
            <div class="shop-tips">
                <div class="tip">💡 Rare characters have enhanced abilities</div>
                <div class="tip">💡 Epic characters unlock special powers</div>
                <div class="tip">💡 Legendary characters change the game</div>
            </div>
        `;
    }
    
    selectCharacter(characterId) {
        // Update character selection
        this.characters.forEach(character => {
            character.selected = character.id === characterId;
        });
        
        // Update UI
        this.populateCharacterShop();
        
        // Save selection
        localStorage.setItem('timeJumpSelectedCharacter', characterId);
    }
    
    showDailyQuests() {
        this.currentScreen = 'quests';
        document.getElementById('daily-quests').classList.remove('hidden');
        this.populateDailyQuests();
    }
    
    hideDailyQuests() {
        this.currentScreen = 'menu';
        document.getElementById('daily-quests').classList.add('hidden');
    }
    
    populateDailyQuests() {
        const questList = document.getElementById('quest-list');
        const progressFill = document.getElementById('quests-progress-fill');
        const progressText = document.getElementById('quests-progress-text');
        
        // Clear existing content
        questList.innerHTML = '';
        
        // Populate quests
        this.dailyQuests.forEach(quest => {
            const questItem = document.createElement('div');
            questItem.className = 'quest-item';
            
            const progressPercent = Math.min((quest.progress / quest.target) * 100, 100);
            
            questItem.innerHTML = `
                <div class="quest-header">
                    <div class="quest-title">${quest.title}</div>
                    <div class="quest-reward">+${quest.reward} Coins</div>
                </div>
                <div class="quest-description">${quest.description}</div>
                <div class="quest-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="progress-text">${quest.progress}/${quest.target}</div>
                </div>
                ${quest.completed ? '<div class="quest-completed">✓ COMPLETED</div>' : ''}
            `;
            
            questList.appendChild(questItem);
        });
        
        // Update overall progress
        const completedQuests = this.dailyQuests.filter(q => q.completed).length;
        const totalQuests = this.dailyQuests.length;
        const overallProgress = (completedQuests / totalQuests) * 100;
        
        progressFill.style.width = overallProgress + '%';
        progressText.textContent = `${completedQuests}/${totalQuests}`;
    }
    
    updateQuestProgress(questType, value) {
        this.dailyQuests.forEach(quest => {
            if (quest.type === questType && !quest.completed) {
                quest.progress = Math.min(quest.progress + value, quest.target);
                
                if (quest.progress >= quest.target) {
                    quest.completed = true;
                    this.completeQuest(quest);
                }
            }
        });
        
        this.saveQuestProgress();
    }
    
    completeQuest(quest) {
        // Award coins
        const currentCoins = parseInt(localStorage.getItem('timeJumpTotalCoins') || 0);
        localStorage.setItem('timeJumpTotalCoins', currentCoins + quest.reward);
        
        // Show notification
        this.showNotification(`Quest Completed: ${quest.title}! +${quest.reward} Coins`, 'success');
        
        // Update UI
        this.updatePlayerStats();
    }
    
    showOnlineMode() {
        this.currentScreen = 'online';
        document.getElementById('online-mode').classList.remove('hidden');
        this.populateOnlineMode();
    }
    
    hideOnlineMode() {
        this.currentScreen = 'menu';
        document.getElementById('online-mode').classList.add('hidden');
    }
    
    populateOnlineMode() {
        // Update online statistics
        document.getElementById('online-wins').textContent = this.onlineStats.wins;
        document.getElementById('online-losses').textContent = this.onlineStats.losses;
        document.getElementById('win-rate').textContent = this.onlineStats.winRate + '%';
    }
    
    findMatch() {
        const findMatchBtn = document.getElementById('find-match-btn');
        const matchmakingStatus = document.getElementById('matchmaking-status');
        
        findMatchBtn.disabled = true;
        findMatchBtn.textContent = 'SEARCHING...';
        matchmakingStatus.textContent = 'Searching for opponent...';
        
        // Simulate matchmaking
        setTimeout(() => {
            if (Math.random() > 0.5) {
                this.startOnlineMatch();
            } else {
                this.showNoMatchFound();
            }
        }, 3000);
    }
    
    startOnlineMatch() {
        const findMatchBtn = document.getElementById('find-match-btn');
        const matchmakingStatus = document.getElementById('matchmaking-status');
        
        findMatchBtn.disabled = false;
        findMatchBtn.textContent = 'FIND MATCH';
        matchmakingStatus.textContent = 'Match found! Starting game...';
        
        // Start online match (placeholder)
        setTimeout(() => {
            this.showNotification('Online match starting...', 'info');
            this.hideOnlineMode();
        }, 2000);
    }
    
    showNoMatchFound() {
        const findMatchBtn = document.getElementById('find-match-btn');
        const matchmakingStatus = document.getElementById('matchmaking-status');
        
        findMatchBtn.disabled = false;
        findMatchBtn.textContent = 'FIND MATCH';
        matchmakingStatus.textContent = 'No opponents found. Try again later.';
    }
    
    showLeaderboard() {
        this.currentScreen = 'leaderboard';
        document.getElementById('leaderboard').classList.remove('hidden');
        this.populateLeaderboard('global');
    }
    
    hideLeaderboard() {
        this.currentScreen = 'menu';
        document.getElementById('leaderboard').classList.add('hidden');
    }
    
    switchLeaderboardTab(tab) {
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        // Populate leaderboard data
        this.populateLeaderboard(tab);
    }
    
    populateLeaderboard(tab) {
        const leaderboardList = document.getElementById('leaderboard-list');
        
        // Clear existing content
        leaderboardList.innerHTML = '';
        
        // Get data for selected tab
        const entries = this.leaderboardData[tab] || [];
        
        // Populate entries
        entries.forEach(entry => {
            const entryElement = document.createElement('div');
            entryElement.className = 'leaderboard-entry';
            
            entryElement.innerHTML = `
                <div class="entry-rank">#${entry.rank}</div>
                <div class="entry-name">${entry.name}</div>
                <div class="entry-score">${entry.score.toLocaleString()}</div>
            `;
            
            leaderboardList.appendChild(entryElement);
        });
    }
    
    showSettings() {
        this.currentScreen = 'settings';
        document.getElementById('settings').classList.remove('hidden');
    }
    
    hideSettings() {
        this.currentScreen = 'menu';
        document.getElementById('settings').classList.add('hidden');
        this.saveSettings();
    }
    
    updateMusicVolume(value) {
        this.settings.musicVolume = parseInt(value);
        document.getElementById('music-volume-value').textContent = value + '%';
    }
    
    updateSfxVolume(value) {
        this.settings.sfxVolume = parseInt(value);
        document.getElementById('sfx-volume-value').textContent = value + '%';
    }
    
    updateParticleEffects(checked) {
        this.settings.particleEffects = checked;
    }
    
    updateBackgroundEffects(checked) {
        this.settings.backgroundEffects = checked;
    }
    
    updateDifficulty(value) {
        this.settings.difficulty = value;
    }
    
    updateAutoSave(checked) {
        this.settings.autoSave = checked;
    }
    
    saveSettings() {
        try {
            localStorage.setItem('timeJumpSettings', JSON.stringify(this.settings));
            this.saveGameData();
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }
    
    updatePlayerStats() {
        // Update main menu stats
        const highScore = localStorage.getItem('timeJumpHighScore') || 0;
        const totalCoins = localStorage.getItem('timeJumpTotalCoins') || 0;
        const playerLevel = localStorage.getItem('timeJumpPlayerLevel') || 1;
        
        document.getElementById('high-score').textContent = highScore;
        document.getElementById('total-coins').textContent = totalCoins;
        document.getElementById('player-level').textContent = playerLevel;
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
    
    // Game event handlers
    onGameStart() {
        this.currentScreen = 'game';
    }
    
    onGamePause() {
        // Handle game pause
    }
    
    onGameResume() {
        // Handle game resume
    }
    
    onGameOver(score, distance, coins) {
        // Update quest progress based on game results
        this.updateQuestProgress('distance', Math.floor(distance));
        this.updateQuestProgress('crystals', Math.floor(coins / 5)); // Approximate crystal count
        
        // Save game data
        this.saveGameData();
    }
    
    onAbilityUsed(abilityType) {
        if (abilityType === 'timeStop') {
            this.updateQuestProgress('abilities', 1);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.timeJumpApp = new TimeJumpApp();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimeJumpApp;
}
