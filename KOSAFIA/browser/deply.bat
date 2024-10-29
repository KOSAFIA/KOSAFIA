@echo off
cd frontend
call npm run build
rd /s /q "..\applicationLayer\gameapp\src\main\resources\static"
mkdir "..\applicationLayer\gameapp\src\main\resources\static"
xcopy /s /e "build\*" "..\applicationLayer\gameapp\src\main\resources\static\"