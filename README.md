# Time Jump - Endless Runner Adventure

A thrilling endless runner game where you control a character with time manipulation abilities in a futuristic world.

## 🎮 Game Features

### Core Gameplay
- **Auto-running character** that continuously moves forward
- **Time Stop ability**: Freeze all obstacles for 2 seconds (5-second cooldown)
- **Future Jump ability**: Skip forward 3 seconds using energy from crystals
- **Progressive difficulty** with increasing speed and obstacle complexity
- **Random events** including gold rain, fireballs, and terrain changes

### Game Modes
- **Single Player**: Classic endless runner experience
- **Online Mode**: Compete against other players on the same course
- **Daily Quests**: Complete challenges for rewards
- **Weekly Challenges**: Long-term goals with bigger rewards

### Character System
- **Time Runner** (Free): Balanced starter character
- **Shadow Ninja** (500 coins): +20% jump height, +15% speed
- **Time Wizard** (1000 coins): +30% time stop duration, +25% energy
- **Cyber Runner** (2000 coins): +40% future jump distance, +20% speed

### Monetization
- **Ad to continue** after losing
- **Ad to double coins** after completing a round
- **Character shop** with premium characters

## 🎯 How to Play

### Controls
- **Spacebar**: Jump (when auto-run is disabled)
- **T Key**: Activate Time Stop ability
- **F Key**: Activate Future Jump ability
- **P Key**: Pause game
- **Mouse/Touch**: Click buttons for abilities and navigation

### Objectives
1. **Survive** as long as possible by avoiding obstacles
2. **Collect crystals** to gain energy for abilities
3. **Collect coins** to unlock new characters
4. **Complete quests** for bonus rewards
5. **Achieve high scores** and compete on leaderboards

### Scoring System
- **Distance**: Primary score based on meters traveled
- **Crystals**: Energy source for abilities
- **Coins**: Currency for character shop
- **Levels**: Unlock new abilities as you progress

## 🚀 Getting Started

### Prerequisites
- Modern web browser with HTML5 Canvas support
- JavaScript enabled
- Touch device or mouse for controls

### Installation
1. Clone or download the repository
2. Open `index.html` in your web browser
3. Start playing immediately - no additional setup required!

### Development Setup
```bash
# Clone the repository
git clone [repository-url]

# Navigate to project directory
cd time-jump-game

# Open in browser
open index.html
```

## 🏗️ Technical Architecture

### Frontend Technologies
- **HTML5**: Semantic structure and accessibility
- **CSS3**: Modern styling with animations and responsive design
- **JavaScript ES6+**: Game logic and state management
- **Canvas API**: 2D graphics rendering
- **Service Workers**: Offline support and caching

### Game Engine Features
- **60 FPS game loop** with smooth animations
- **Collision detection** system
- **Particle effects** and visual feedback
- **State management** with local storage persistence
- **Responsive design** for all screen sizes

### Performance Optimizations
- **RequestAnimationFrame** for smooth rendering
- **Object pooling** for particles and effects
- **Efficient collision detection** algorithms
- **Lazy loading** of game assets
- **Memory management** for long gaming sessions

## 🎨 Customization

### Visual Settings
- **Particle effects** toggle
- **Background effects** toggle
- **Music and sound effect** volume controls
- **Difficulty levels** (Easy, Normal, Hard)

### Gameplay Settings
- **Auto-run** toggle
- **Control sensitivity** adjustments
- **Accessibility options** for different player needs

## 📱 Platform Support

### Web Browsers
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Mobile Devices
- iOS Safari 13+
- Android Chrome 80+
- Responsive touch controls
- PWA installation support

### Progressive Web App
- **Offline play** capability
- **App-like experience** when installed
- **Push notifications** for game events
- **Background sync** for progress

## 🎯 Game Balance

### Difficulty Progression
- **Round 1-5**: Learning phase with basic obstacles
- **Round 6-10**: Introduction of flying obstacles
- **Round 11+**: Complex obstacle patterns and increased speed
- **Maximum speed**: 3x normal speed

### Economy Balance
- **Crystal spawn rate**: 1 every 2-5 seconds
- **Coin conversion**: 1 crystal = 5 coins
- **Character prices**: Balanced for 2-4 hours of gameplay
- **Quest rewards**: Daily quests provide 75-150 coins

## 🔧 Development

### Project Structure
```
time-jump-game/
├── index.html          # Main game interface
├── style.css           # Game styling and animations
├── script.js           # Game logic and engine
├── manifest.json       # PWA configuration
├── sw.js              # Service worker
├── icons/             # Game icons and assets
└── README.md          # This file
```

### Key Classes
- **GameState**: Manages game data and persistence
- **GameEngine**: Core game loop and rendering
- **Player**: Character physics and controls
- **ObstacleManager**: Spawns and manages obstacles
- **CollectibleManager**: Handles crystals and coins

### Adding New Features
1. **New abilities**: Extend the ability system in `script.js`
2. **New characters**: Add to character stats and shop
3. **New obstacles**: Implement in obstacle spawning system
4. **New events**: Extend random event system

## 🐛 Troubleshooting

### Common Issues
- **Game not loading**: Check JavaScript console for errors
- **Performance issues**: Reduce particle effects in settings
- **Touch controls not working**: Ensure touch events are enabled
- **Save data lost**: Check browser storage permissions

### Browser Compatibility
- **Canvas not supported**: Update to modern browser
- **Service worker issues**: Check HTTPS/localhost requirement
- **Audio problems**: Verify browser audio permissions

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

### Development Guidelines
- Follow existing code style and structure
- Add comments for complex game logic
- Test on multiple devices and browsers
- Update documentation for new features

## 📞 Support

For support, questions, or feedback:
- Create an issue in the repository
- Check the troubleshooting section above
- Review browser compatibility requirements

## 🎉 Acknowledgments

- **HTML5 Canvas API** for graphics rendering
- **Modern CSS** for animations and effects
- **ES6+ JavaScript** for clean, maintainable code
- **PWA standards** for app-like experience

---

**Enjoy your temporal adventure in Time Jump!** ⏰✨
