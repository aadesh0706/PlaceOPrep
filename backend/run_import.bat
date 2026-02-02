@echo off
echo Starting question import...
cd /d "%~dp0"
node import_questions.js
echo Import completed!
pause