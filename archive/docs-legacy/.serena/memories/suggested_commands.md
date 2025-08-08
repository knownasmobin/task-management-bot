# Suggested Shell Commands for Windows

## Essential Windows Commands

### File Operations
- `dir` - List directory contents (equivalent to `ls`)
- `cd <path>` - Change directory
- `mkdir <name>` - Create directory
- `rmdir <name>` - Remove empty directory
- `del <file>` - Delete file
- `copy <source> <dest>` - Copy file
- `move <source> <dest>` - Move/rename file
- `type <file>` - Display file contents (equivalent to `cat`)

### Search and Find
- `findstr <pattern> <files>` - Search text in files (equivalent to `grep`)
- `where <command>` - Find command location (equivalent to `which`)
- `dir /s <pattern>` - Recursive search for files

### Process Management
- `tasklist` - List running processes (equivalent to `ps`)
- `taskkill /PID <pid>` - Kill process by PID
- `taskkill /IM <name>` - Kill process by name

## Project-Specific Commands

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start static development server
npm run dev:static

# Run tests
npm test

# Lint code
npm run lint
```

### Docker Operations
```bash
# Build and start services
npm run docker:compose
# or
./scripts/setup.sh start

# View logs
npm run docker:logs
# or
docker-compose logs -f

# Stop services
npm run docker:stop
# or
docker-compose down
```

### Git Operations
```bash
git status
git add .
git commit -m "message"
git push origin main
git pull origin main
```

### Environment Setup
```bash
# Copy environment template
copy .env.docker .env

# Edit environment file
notepad .env
```