# 1. Force-kill lingering Node, Vite, or Netlify processes holding folder locks
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

# 2. Delete the locked .netlify folder
Remove-Item -Path "D:\BrightBridgePWA\.netlify" -Recurse -Force -ErrorAction SilentlyContinue

# 3. Explicitly grant full read/write/create permissions on the project directory
#icacls "D:\BrightBridgePWA" /grant "$($env:USERNAME):(OI)(CI)F" /T

# 4. Restart Netlify Dev
netlify dev