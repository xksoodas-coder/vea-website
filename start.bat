@echo off
title vea-website - dev server
cd /d "%~dp0"

echo Demarrage du serveur vea-website...
echo.
echo Le site sera sur : http://localhost:3000
echo Laisse cette fenetre OUVERTE. Ferme-la pour arreter le serveur.
echo.

if not exist "node_modules" (
  echo Installation des dependances...
  call npm install
)

start "" http://localhost:3000
call npm run dev

echo.
echo Le serveur s'est arrete.
pause
