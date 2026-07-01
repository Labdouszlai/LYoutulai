const { app, nativeImage } = require('electron');

// Set custom AppUserModelId so Windows uses our window icon in the taskbar
app.setAppUserModelId('com.labdouszlai.lyoutulai');

// Also try to set the app icon via dock/taskbar API
if (app.dock) {
  try {
    app.dock.setIcon(nativeImage.createFromPath(require('path').join(__dirname, '../../runtime/resources/ytmd.png')));
  } catch (e) {}
}

// Load the original app
require('./app.js');