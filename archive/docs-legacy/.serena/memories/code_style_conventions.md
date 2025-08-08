# Code Style and Conventions

## JavaScript Style
- **ES6+ Features**: Use modern JavaScript (classes, arrow functions, async/await)
- **Class-based Architecture**: Main functionality organized in classes (e.g., `TaskManager`, `AuthManager`)
- **Naming Conventions**:
  - Classes: PascalCase (`TaskManager`, `AuthManager`)
  - Variables/Functions: camelCase (`currentUser`, `showTaskModal`)
  - Constants: UPPER_SNAKE_CASE (`TELEGRAM_BOT_TOKEN`)
  - DOM IDs: camelCase (`taskModal`, `addTaskBtn`)

## Code Organization
- **Modular Structure**: Separate files for different concerns
  - `app.js` - Main task management logic
  - `auth.js` - Authentication handling
  - `config.js` - Configuration management
  - `realtime-sync.js` - Real-time synchronization
  - `push-notifications.js` - Notification services
- **Global Variables**: Minimal use, mainly for service instances
- **Event Handling**: Event delegation and clean separation of concerns

## HTML/CSS Conventions
- **Semantic HTML**: Proper use of semantic elements
- **BEM-like CSS**: Component-based class naming
- **Mobile-first**: Responsive design for Telegram mobile clients
- **CSS Custom Properties**: Used for theming and consistent styling

## Documentation Style
- **Inline Comments**: Explain complex logic and business rules
- **Function Documentation**: Brief descriptions for public methods
- **Configuration Comments**: Clear explanations in config files

## Error Handling
- **Graceful Degradation**: Fallbacks for missing Telegram features
- **User Feedback**: Toast notifications for user actions
- **Defensive Programming**: Check for null/undefined values