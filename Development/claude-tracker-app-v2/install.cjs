#!/usr/bin/env node

/**
 * Claude Tracker v5.0.9 - PostInstall Script (CommonJS)
 * Fallback setup for npm install postinstall hook
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

async function setupClaudeTracker() {
  console.log('📦 Claude Tracker v5.0.9 - PostInstall Hook\n');
  console.log('💡 For reliable setup, use: claude-tracker init\n');

  try {
    // Step 1: Create claude-tracker directory
    const homeDir = os.homedir();
    const documentsDir = path.join(homeDir, 'Documents');
    const claudeTrackerDir = path.join(documentsDir, 'claude-tracker');

    console.log('📁 Creating claude-tracker directory...');
    
    if (!fs.existsSync(documentsDir)) {
      console.log('⚠️  Documents directory not found, skipping auto-setup');
      showManualInstructions();
      return;
    }

    if (!fs.existsSync(claudeTrackerDir)) {
      fs.mkdirSync(claudeTrackerDir, { recursive: true });
      console.log(`✅ Created: ${claudeTrackerDir}`);
    } else {
      console.log(`✅ Already exists: ${claudeTrackerDir}`);
    }

    // Step 2: Copy essential files
    console.log('\n📦 Copying project files...');
    
    const projectFiles = [
      'index.js',
      'manifest.json', 
      'package.json',
      'build-dxt.sh',
      'CHANGELOG.md'
    ];
    
    for (const file of projectFiles) {
      const sourcePath = path.join(__dirname, file);
      const destPath = path.join(claudeTrackerDir, file);
      
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`   ✅ Copied: ${file}`);
      } else {
        console.log(`   ⚠️  Not found: ${file}`);
      }
    }

    // Step 3: Make build-dxt.sh executable
    try {
      fs.chmodSync(path.join(claudeTrackerDir, 'build-dxt.sh'), 0o755);
      console.log('   ✅ Made build-dxt.sh executable');
    } catch (err) {
      console.log('   ⚠️  Could not make build-dxt.sh executable');
    }

    // Step 4: Record setup status
    const setupStatus = {
      version: '5.0.9',
      installed_at: new Date().toISOString(),
      claude_tracker_dir: claudeTrackerDir,
      setup_method: 'postinstall',
      setup_complete: true,
      note: 'For complete setup including DXT generation, use: claude-tracker init'
    };

    const statusFilePath = path.join(claudeTrackerDir, '.setup-status.json');
    fs.writeFileSync(statusFilePath, JSON.stringify(setupStatus, null, 2));

    console.log('\n✅ Basic setup complete!');
    console.log('\n🎯 Complete Setup Instructions:');
    console.log('   claude-tracker init    # Complete setup with DXT generation');
    console.log('   claude-tracker status  # Check installation status');
    console.log('   claude-tracker help    # Show all commands');

  } catch (error) {
    console.error('\n❌ PostInstall setup failed:', error.message);
    showManualInstructions();
  }
}

function showManualInstructions() {
  console.log('\n🔧 Manual Setup Instructions:');
  console.log('   1. npm install -g @peaske/claude-tracker');
  console.log('   2. claude-tracker init');
  console.log('   3. Follow the on-screen instructions');
  console.log('\n📖 Documentation: https://github.com/peaske/claude-tracker');
  console.log('🐦 Updates: @peaske_en on X');
}

// Only run if called directly (not when imported)
if (require.main === module) {
  setupClaudeTracker();
}

module.exports = setupClaudeTracker;
