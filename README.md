# Telegram Task Manager Mini App

A beautiful and intuitive task management mini app designed for Telegram teams.

## Features

### 📋 Task Management
- Create, edit, and delete tasks
- Set priority levels (High, Medium, Low)
- Assign tasks to team members
- Track task status (Pending, In Progress, Completed)
- Set due dates
- Filter tasks by status

### 👥 Team Collaboration
- Add team members
- View team member profiles
- Assign tasks to specific team members
- Invite new members via Telegram

### 📊 Statistics & Analytics
- View total tasks count
- Track completed vs pending tasks
- Monitor team size
- Weekly progress tracking
- Visual progress indicators

### 🎨 Beautiful UI
- Modern, clean design
- Responsive layout for mobile devices
- Dark mode support
- Smooth animations and transitions
- Telegram-native styling

## Getting Started

### For Development

1. **Clone/Download the project**
   ```bash
   # If you have the files locally, navigate to the directory
   cd task-management-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - The app will open at `http://localhost:8080`
   - For Telegram testing, you'll need to set up a Telegram Bot

### For Telegram Bot Setup

1. **Create a Telegram Bot**
   - Message @BotFather on Telegram
   - Use `/newbot` command
   - Follow the setup instructions
   - Save your bot token

2. **Set up Mini App**
   - Use `/newapp` command with @BotFather
   - Choose your bot
   - Set the app name and description
   - Provide your web app URL
   - Upload an icon (recommended: 512x512px)

3. **Configure Web App**
   - Set your domain URL where the app is hosted
   - Enable the mini app in your bot settings

### Hosting Options

#### Option 1: GitHub Pages (Free)
1. Push your code to a GitHub repository
2. Go to repository Settings > Pages
3. Select source branch (usually `main`)
4. Your app will be available at `https://yourusername.github.io/repository-name`

#### Option 2: Vercel (Free)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically
4. Get your custom URL

#### Option 3: Netlify (Free)
1. Drag and drop your project folder to Netlify
2. Get instant deployment
3. Custom domain available

## Project Structure

```
task-management-bot/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── app.js             # JavaScript functionality
├── manifest.json      # Web app manifest
├── package.json       # Node.js dependencies
└── README.md          # Project documentation
```

## Key Features Explained

### Task Management
- **Create Tasks**: Click the "Add Task" button or use the Telegram main button
- **Edit Tasks**: Click on any task to edit its details
- **Status Tracking**: Toggle between Pending → In Progress → Completed
- **Filtering**: Use filter buttons to view tasks by status
- **Priority System**: Visual priority indicators with color coding

### Team Features
- **Member Management**: Add team members with names and avatars
- **Task Assignment**: Assign tasks to specific team members
- **Role System**: Different roles for team organization

### Statistics
- **Real-time Updates**: Statistics update automatically as tasks change
- **Progress Tracking**: Visual progress bars and percentages
- **Team Metrics**: Track team size and task distribution

## Telegram Integration

The app uses the Telegram Web App SDK to:
- Integrate with Telegram's native UI
- Access user information
- Use Telegram's main button
- Show native popups and alerts
- Support Telegram's theming system

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers
- Telegram in-app browser
- Progressive Web App (PWA) support

## Data Storage

- Uses browser localStorage for data persistence
- Data includes tasks, team members, and settings
- Export functionality for data backup
- Import capability for data restoration

## Customization

### Colors and Theming
Edit the CSS variables in `styles.css`:
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --accent-color: #f093fb;
}
```

### Adding Features
The modular JavaScript structure makes it easy to add new features:
- Task categories
- File attachments
- Time tracking
- Notifications
- Calendar integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions:
1. Check the documentation
2. Review common issues in the code comments
3. Create an issue in the repository

## Future Enhancements

- [ ] Real-time synchronization
- [ ] File attachments
- [ ] Calendar integration
- [ ] Push notifications
- [ ] Task templates
- [ ] Time tracking
- [ ] Advanced analytics
- [ ] Export to different formats

---

Built with ❤️ for Telegram teams