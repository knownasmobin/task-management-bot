// Simple script to verify which version is running
console.log('🔍 CHECKING DEPLOYED VERSION:');
console.log('📁 Current working directory:', process.cwd());
console.log('🕐 Script start time:', new Date().toISOString());

// Check if our changes are present
const fs = require('fs');
const path = require('path');

try {
    const appJs = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
    
    if (appJs.includes('DEBUG: LOCAL CHANGES APPLIED')) {
        console.log('✅ LOCAL CHANGES DETECTED in app.js');
    } else {
        console.log('❌ LOCAL CHANGES NOT FOUND in app.js');
    }
    
    if (appJs.includes('MainButton.hide()')) {
        console.log('✅ MainButton hide() fix DETECTED');
    } else {
        console.log('❌ MainButton hide() fix NOT FOUND');
    }
    
    const telegramBotJs = fs.readFileSync(path.join(__dirname, 'telegram-bot.js'), 'utf8');
    
    if (telegramBotJs.includes('Return empty keyboard')) {
        console.log('✅ Telegram bot keyboard removal DETECTED');
    } else {
        console.log('❌ Telegram bot keyboard removal NOT FOUND');
    }
    
    console.log('🏁 Verification complete');
    
} catch (error) {
    console.error('❌ Error reading files:', error.message);
}