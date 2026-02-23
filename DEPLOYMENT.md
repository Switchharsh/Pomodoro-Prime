# Pomodoro Prime - GitHub Pages Deployment Guide

This guide will help you deploy the Pomodoro Prime webapp to GitHub Pages with full functionality.

## Prerequisites

- A GitHub account
- Git installed on your computer
- The Pomodoro Prime project files

## Step-by-Step Deployment Instructions

### 1. Initialize Git Repository

Open your terminal in the `Pomodoro-Prime` directory and run:

```bash
cd /home/mluser/Desktop/Projects/Pomodoro-Prime
git init
```

### 2. Create a `.gitignore` File

If not already created, ensure you have a `.gitignore` file with:

```
node_modules/
.DS_Store
*.log
```

### 3. Add All Files to Git

```bash
git add .
```

### 4. Create Initial Commit

```bash
git commit -m "Initial commit: Pomodoro Prime webapp"
```

### 5. Create a New GitHub Repository

1. Go to [GitHub](https://github.com) and log in
2. Click the **+** icon in the top-right corner
3. Select **New repository**
4. Name your repository (e.g., `pomodoro-prime`)
5. Make it **Public** (required for GitHub Pages free tier)
6. **Do not** initialize with README, .gitignore, or license
7. Click **Create repository**

### 6. Link Local Repository to GitHub

Copy the repository URL from GitHub (it looks like `https://github.com/yourusername/pomodoro-prime.git`) and run:

```bash
git remote add origin https://github.com/yourusername/pomodoro-prime.git
git branch -M main
git push -u origin main
```

Replace `yourusername` with your actual GitHub username.

### 7. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click the **Settings** tab
3. In the left sidebar, click **Pages**
4. Under **Build and deployment**, select **Source** as **Deploy from a branch**
5. Select **Branch** as `main` and folder as `/ (root)`
6. Click **Save**

### 8. Wait for Deployment

GitHub will deploy your site. This usually takes 1-2 minutes. You'll see a link like:

```
https://yourusername.github.io/pomodoro-prime/
```

### 9. Access Your Webapp

Once deployment is complete, visit the URL shown in the Pages settings. Your Pomodoro Prime webapp is now live!

## Full Functionality on GitHub Pages

The following features work perfectly on GitHub Pages:

✅ **Timer Functionality**
- Start/Pause/Reset timer
- Focus, Short Break, Long Break modes
- Timer presets (15min, 25min, 45min, 60min)

✅ **Visual Features**
- Day/night cycle with sunrise, sunset, moon, and stars
- Floating forest particles (fireflies and leaves)
- Animated sky gradients
- Progress ring animation

✅ **Audio Features**
- Multiple alarm sounds (Chime, Birds, Rain, Stream)
- Volume control
- Test sound button
- Vibration on mobile devices

✅ **Browser Notifications**
- Notifications when timer completes
- Different messages for focus sessions and breaks
- Permission request on first interaction

✅ **Statistics**
- Pomodoro counter
- Focus time tracker
- Day streak

✅ **Theme Options**
- Dark/Light mode toggle
- Keyboard shortcuts (Space, R, T)

## Troubleshooting

### Site Not Loading

- Check the **Pages** tab in GitHub Settings for deployment status
- Wait a few more minutes if it says "Deploying"
- Ensure your repository is **Public**

### Notifications Not Working

- Make sure you click the Start button first (permission is requested on first interaction)
- Check browser notification settings
- Some browsers block notifications until you grant permission

### Audio Not Playing

- Audio requires user interaction to work (browser security policy)
- Try clicking the "Test Sound" button
- Check volume slider is not at 0

### Day/Night Cycle Not Animating

- Ensure JavaScript is enabled in your browser
- Check browser console for any errors (F12 → Console)

## Customization

### Change Repository Name

If you want a different URL, you can rename your repository:

1. Go to repository **Settings**
2. Scroll to **Repository name**
3. Enter new name and click **Rename**
4. Update your local git remote:
   ```bash
   git remote set-url origin https://github.com/yourusername/new-name.git
   git push -u origin main
   ```

### Add Custom Domain

To use a custom domain (e.g., `pomodoro.yourdomain.com`):

1. Go to repository **Settings** → **Pages**
2. Under **Custom domain**, enter your domain
3. Follow GitHub's DNS configuration instructions

## Updating Your Webapp

To make changes and deploy updates:

```bash
# Make your changes to the files
git add .
git commit -m "Description of changes"
git push
```

GitHub will automatically redeploy your site within a few minutes.

## Enjoy Your Pomodoro Prime Webapp! 🌲

Your webapp is now live and accessible from anywhere with an internet connection. Happy focusing!
