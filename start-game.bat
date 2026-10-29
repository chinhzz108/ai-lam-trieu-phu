@echo off
setlocal EnableExtensions
chcp 65001 >nul 2>&1
title Who Wants To Be A Millionaire - Ai La Trieu Phu
cd /d "%~dp0"

echo.
echo  =======================================================
echo     AI LA TRIEU PHU - WHO WANTS TO BE A MILLIONAIRE
echo  =======================================================
echo   Thu muc game: %CD%
echo.

REM --- 1. Kiem tra file game ---
if not exist "index.html" (
  echo  [LOI] Khong tim thay file index.html trong thu muc nay!
  echo  Vui long chay start-game.bat ben trong thu muc game.
  echo.
  pause
  exit /b 1
)

REM --- 2. Tim Python kha dung tren may ---
set "PY_CMD="
py -3 -c "import sys" >nul 2>&1 && set "PY_CMD=py -3"
if not defined PY_CMD python -c "import sys" >nul 2>&1 && set "PY_CMD=python"
if not defined PY_CMD py -c "import sys" >nul 2>&1 && set "PY_CMD=py"
if not defined PY_CMD python3 -c "import sys" >nul 2>&1 && set "PY_CMD=python3"

REM --- 3. Neu co Python: khoi chay qua server.py hoac python http.server ---
if defined PY_CMD (
  if exist "%~dp0server.py" (
    %PY_CMD% "%~dp0server.py"
    goto :done
  ) else (
    set "PORT=5500"
    set "URL=http://localhost:5500"
    echo  Dang khoi dong server qua Python tai: http://localhost:5500
    start "" "http://localhost:5500"
    %PY_CMD% -m http.server 5500 -b 127.0.0.1
    goto :done
  )
)

REM --- 4. Neu khong co Python, kiem tra Node.js ---
where node >nul 2>&1
if "%ERRORLEVEL%"=="0" (
  echo  [THONG BAO] Khong tim thay Python, dang khoi dong bang Node.js...
  start "" "http://localhost:5500"
  node -e "const http=require('http'),fs=require('fs'),path=require('path');const mime={'.html':'text/html','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.mp3':'audio/mpeg','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]);if(p==='/'||!p)p='/index.html';let f=path.join(process.cwd(),p);fs.readFile(f,(err,data)=>{if(err){res.writeHead(404);res.end('Not Found');return;}res.writeHead(200,{'Content-Type':mime[path.extname(f).toLowerCase()]||'application/octet-stream','Cache-Control':'no-cache, no-store, must-revalidate'});res.end(data);});}).listen(5500,'127.0.0.1',()=>{console.log('Server dang chay tai http://localhost:5500');});"
  goto :done
)

REM --- 5. Neu khong co ca Python lan Node.js ---
echo  [LOI] May cua ban chua co Python (hoac Node.js).
echo.
echo  De chay game, ban hay cai Python (mien phi, rat nhanh):
echo    1. Truy cap: https://www.python.org/downloads/
echo    2. Tai ban cai dat Python moi nhat cho Windows
echo    3. Khi cai, BAT BUOC TICK CHON: "Add python.exe to PATH"
echo    4. Cai xong, mo lai file start-game.bat nay.
echo.
pause
exit /b 1

:done
endlocal
