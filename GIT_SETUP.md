# Git Setup & Push Guide

Since `git` is not in your system PATH, here's how to set it up and push to GitHub:

## 1. Install Git

- **Windows**: Download from https://git-scm.com/download/win
- During installation, select "Use Git from Windows Command Prompt" or "Git Bash"
- Restart your terminal/VS Code after installation

## 2. Configure Git

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 3. Initialize & Push

From the project root (`C:\Users\Aryan\Desktop\Sports reconnect`):

```bash
# Initialize git repo
git init

# Add all files
git add .

# Create initial commit
git commit -m "feat: initial project setup with frontend scaffolding"

# Add remote (your GitHub repo)
git remote add origin https://github.com/ASK120305/Sports-reconnect.git

# Push to main branch
git branch -M main
git push -u origin main
```

## 4. Verify

Check your GitHub repo to confirm all files are pushed.

## Future Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes, stage, and commit
git add .
git commit -m "feat: description"

# Push branch
git push -u origin feature/your-feature

# Open PR on GitHub
# After review & approval, merge to main
```

---

**Note**: Instructions follow the structure we just set up with `frontend/`, `backend/`, and root-level docs for team clarity.
