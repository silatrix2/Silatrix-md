#!/bin/bash

# Your email for GitHub
EMAIL="silatrix22@gmail.com"

# Folder ya bot
BOTDIR=~/silatrix-bot-full

# Navigate to bot folder
cd $BOTDIR

echo "🔹 Generating SSH key..."
ssh-keygen -t ed25519 -C "$EMAIL" -f ~/.ssh/id_ed25519 -N ""

echo "🔹 Starting ssh-agent..."
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

echo "🔹 Copy the following SSH key and add it to your GitHub account:"
cat ~/.ssh/id_ed25519.pub

echo "🔹 Updating remote to SSH..."
git remote set-url origin git@github.com:silatrix2/Silatrix-md.git

echo "🔹 Adding all files..."
git add .

echo "🔹 Committing files..."
git commit -m "Initial commit - SILATRIX BOT full setup"

echo "🔹 Pushing to GitHub..."
git push -u origin main

echo "✅ Done! Check your GitHub repo: https://github.com/silatrix2/Silatrix-md"
