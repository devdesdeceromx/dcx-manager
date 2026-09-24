import { app, BrowserWindow, ipcMain, Menu, nativeImage, Tray } from 'electron'
import { join } from 'node:path'

let window: BrowserWindow | null = null
let tray: Tray | null = null
let quitting = false

function createWindow() {
  window = new BrowserWindow({
    width: 390,
    height: 620,
    minWidth: 340,
    minHeight: 170,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: true,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })
  window.setAlwaysOnTop(true, 'floating')
  window.once('ready-to-show', () => window?.show())
  window.on('close', (event) => {
    if (!quitting) {
      event.preventDefault()
      window?.hide()
    }
  })
  if (process.env.ELECTRON_RENDERER_URL) void window.loadURL(process.env.ELECTRON_RENDERER_URL)
  else void window.loadFile(join(__dirname, '../../dist/index.html'))
}

function createTray() {
  const icon = nativeImage.createEmpty()
  tray = new Tray(icon)
  tray.setToolTip('DevDesdeCeroMx Timer')
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Mostrar cronometro', click: () => window?.show() },
    { label: 'Salir', click: () => { quitting = true; app.quit() } },
  ]))
  tray.on('double-click', () => window?.show())
}

app.whenReady().then(() => {
  createWindow()
  createTray()
  ipcMain.on('window:minimize', () => window?.hide())
  ipcMain.on('window:close', () => window?.hide())
  ipcMain.handle('window:toggle-pin', () => {
    const next = !window?.isAlwaysOnTop()
    window?.setAlwaysOnTop(next, 'floating')
    return next
  })
  ipcMain.handle('window:set-compact', (_event, compact: boolean) => {
    window?.setSize(390, compact ? 190 : 620, true)
    return compact
  })
})

app.on('window-all-closed', () => {
  // The tray keeps the timer available even when its window is hidden.
})
