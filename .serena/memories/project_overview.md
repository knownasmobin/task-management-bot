# Task Management Bot - Project Overview

## Purpose
A **Telegram Mini App** for team task management that integrates directly with Telegram's ecosystem. Users can create, assign, and track tasks while collaborating with team members through Telegram's native interface.

## Key Features
- **Task Management**: Create, edit, delete, and track tasks with priorities and due dates
- **Team Collaboration**: Add team members, assign tasks, track progress
- **Telegram Integration**: Uses Telegram Web App SDK, contact sharing for authentication
- **Real-time Sync**: Live updates across team members using WebSocket connections
- **Push Notifications**: Native Telegram notifications for task updates
- **Admin Dashboard**: User approval system and administrative controls
- **Statistics**: Progress tracking and team analytics

## Architecture
- **Frontend**: Telegram Mini App (vanilla HTML/CSS/JavaScript)
- **Backend**: Node.js/Express server with webhook handling
- **Authentication**: Telegram contact sharing + admin approval
- **Data Storage**: localStorage (client-side) + optional PostgreSQL
- **Deployment**: Docker containerization with Nginx reverse proxy
- **Monitoring**: Optional Grafana/Prometheus stack

## Target Users
Teams using Telegram for communication who want integrated task management without leaving the Telegram ecosystem.