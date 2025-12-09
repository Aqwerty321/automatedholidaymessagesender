# Contributing to Holiday Email Orchestrator

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- n8n (local or hosted)
- Git

### Setup

1. **Fork the repository** on GitHub

2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/AutomatedHolidayMessageSender.git
   cd AutomatedHolidayMessageSender
   ```

3. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   ```

4. **Configure environment:**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your webhook URL
   ```

5. **Start development:**
   ```bash
   npm run dev
   ```

## 📝 Development Workflow

1. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

3. **Test your changes:**
   - Ensure `npm run build` succeeds
   - Test the UI manually
   - Check for TypeScript errors

4. **Commit your changes:**
   ```bash
   git commit -m "feat: add your feature description"
   ```

5. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request** on GitHub

## 📁 Project Structure

```
├── frontend/           # React + Vite frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── lib/        # Utilities
│   │   ├── App.tsx     # Main app
│   │   └── config.ts   # Configuration
│   └── package.json
├── backend/            # Backend services
├── docs/               # Documentation
└── README.md
```

## 🎨 Code Style

- Use TypeScript for type safety
- Use functional React components with hooks
- Follow existing code patterns
- Use TailwindCSS for styling
- Keep components small and focused

## 📋 Commit Messages

Use conventional commit format:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

## 🐛 Reporting Bugs

1. Check if the issue already exists
2. Create a new issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details

## 💡 Feature Requests

1. Check existing issues/discussions
2. Create a new issue describing:
   - The feature you'd like
   - Why it would be useful
   - Possible implementation approach

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.
