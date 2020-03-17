const electron = require('electron')
const url = require('url')
const path = require('path')

const {app, BrowserWindow, Menu, ipcMain, Tray} = electron

let top = {}

app.once('ready', (event) => {

    top.win = new BrowserWindow({
        title: 'Ya Search Parser',
        icon: path.join(__dirname, 'logo.ico'),
        width: 960,
        height: 480,
        minWidth: 960,
        minHeight: 480,
        minimizable: false,
        show: false
    })

    top.win.loadURL(url.format({
        pathname: path.join(__dirname, 'browser.html'),
        protocol: 'file',
        slashes: true
    }))

    top.win.on('close', (event) => {
        event.sender.hide()
        event.preventDefault()
    })

    top.win.once('ready-to-show', (event) => {
        top.win.show()
        top.win.toggleDevTools()
    })

    const mainMenu = Menu.buildFromTemplate([
        { label: 'Файл', submenu: [
            /*{
                label: 'Запустить',
                click: (item, window, event) => {

                }
            },*/
            {
                label: 'Выход',
                accelerator: process.platform == 'darwin' ? 'Command+Q' :
                'Ctrl+Q',
                click(){
                    app.quit()
                }
            }
        ]}
    ])
    Menu.setApplicationMenu(mainMenu)

    top.tray = new Tray(path.join(__dirname, 'logo.ico'))
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Открыть', click: (item, window, event) => {
            top.win.show()
        }},
        /*{ label: 'Приостановить', click: (item, window, event) => {
            
        }},*/
        { label: 'Выход', type: 'normal', role: 'quit'}
    ])
    top.tray.setToolTip('Ya Search Parser')
    top.tray.setContextMenu(contextMenu)

    top.tray.on('click', (event) => {
        top.win.show()
    })

})

app.on('before-quit', (event) => {
    top.win.removeAllListeners('close')
    top = null
})