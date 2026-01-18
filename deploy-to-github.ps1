# SystemInk - Push Code to GitHub
# This script helps you push your code to GitHub for deployment

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SystemInk - GitHub Deployment Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$repoUrl = "https://github.com/Sagar610/systemink.dev.git"
$currentDir = Get-Location

# Check if git is installed
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

Write-Host "Step 1: Checking Git repository status..." -ForegroundColor Yellow

# Check if .git exists
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Gray
    git init
    git branch -M main
} else {
    Write-Host "Git repository already initialized" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 2: Adding remote repository..." -ForegroundColor Yellow

# Check if remote exists
$remoteExists = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Remote 'origin' already exists: $remoteExists" -ForegroundColor Gray
    $updateRemote = Read-Host "Update remote to $repoUrl? (y/n)"
    if ($updateRemote -eq "y" -or $updateRemote -eq "Y") {
        git remote set-url origin $repoUrl
        Write-Host "Remote updated!" -ForegroundColor Green
    }
} else {
    git remote add origin $repoUrl
    Write-Host "Remote 'origin' added!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 3: Checking what will be committed..." -ForegroundColor Yellow

# Show git status
git status

Write-Host ""
Write-Host "Step 4: Staging all files..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "Step 5: Committing changes..." -ForegroundColor Yellow
$commitMessage = Read-Host "Enter commit message (or press Enter for default)"

if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Ready for deployment on Render.com"
}

git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Commit failed. Check if there are changes to commit." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 6: Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "You may be prompted for GitHub credentials" -ForegroundColor Gray
Write-Host ""

# Try to push
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  SUCCESS! Code pushed to GitHub!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Go to: https://render.com" -ForegroundColor White
    Write-Host "2. Sign up/login with GitHub" -ForegroundColor White
    Write-Host "3. Follow the SIMPLE_HOSTING_PLAN.md guide" -ForegroundColor White
    Write-Host ""
    Write-Host "Your repository: $repoUrl" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  PUSH FAILED" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "1. GitHub credentials not configured" -ForegroundColor White
    Write-Host "   - Use GitHub Personal Access Token" -ForegroundColor White
    Write-Host "   - Or use GitHub Desktop app" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Repository doesn't exist on GitHub" -ForegroundColor White
    Write-Host "   - Go to: https://github.com/new" -ForegroundColor White
    Write-Host "   - Create repository named: systemink.dev" -ForegroundColor White
    Write-Host "   - Don't initialize with README (it's already empty)" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Manual push:" -ForegroundColor White
    Write-Host "   git push -u origin main" -ForegroundColor Gray
}
