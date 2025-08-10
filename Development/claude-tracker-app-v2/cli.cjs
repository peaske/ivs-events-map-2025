#!/usr/bin/env node

/**
 * Claude Tracker v5.0.13 - CLI Command
 * Proper CLI interface for setup and management
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const commands = {
  'init': initClaudeTracker,
  'status': showStatus,
  'build-dxt': buildDXT,
  'help': showHelp
};

function showHelp() {
  console.log(`
🎯 Claude Tracker v5.0.13 - CLI Commands

📋 Available Commands:
   claude-tracker init      Setup claude-tracker in ~/Documents/claude-tracker
   claude-tracker build-dxt Generate DXT file for Claude Desktop
   claude-tracker status    Show installation status
   claude-tracker help      Show this help message

🚀 Quick Start:
   1. claude-tracker init
   2. Drag ~/Documents/claude-tracker/claude-tracker-app.dxt to Claude Desktop
   3. Enable extension and start tracking!

📖 Documentation: https://github.com/peaske/claude-tracker
🐦 Updates: @peaske_en on X
`);
}

async function initClaudeTracker() {
  console.log('🚀 Claude Tracker v5.0.13 - Initialization Starting...\n');

  try {
    // Step 1: Create claude-tracker directory
    const homeDir = os.homedir();
    const documentsDir = path.join(homeDir, 'Documents');
    const claudeTrackerDir = path.join(documentsDir, 'claude-tracker');

    console.log('📁 Step 1: Creating claude-tracker directory...');
    
    if (!fs.existsSync(documentsDir)) {
      throw new Error(`Documents directory not found: ${documentsDir}`);
    }

    if (!fs.existsSync(claudeTrackerDir)) {
      fs.mkdirSync(claudeTrackerDir, { recursive: true });
      console.log(`✅ Created: ${claudeTrackerDir}`);
    } else {
      console.log(`✅ Already exists: ${claudeTrackerDir}`);
    }

    // Step 2: Copy project files
    console.log('\n📦 Step 2: Copying project files...');
    
    const packageDir = __dirname;
    const projectFiles = [
      'index.js',
      'manifest.json', 
      'package.json',
      'build-dxt.sh',
      'CHANGELOG.md'
    ];
    
    for (const file of projectFiles) {
      const sourcePath = path.join(packageDir, file);
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

    // Step 4: Generate DXT file
    console.log('\n🔨 Step 3: Generating DXT file...');
    
    try {
      // Change to claude-tracker directory
      process.chdir(claudeTrackerDir);
      
      // Execute build-dxt.sh
      console.log('   🔄 Running build-dxt.sh...');
      const buildResult = execSync('./build-dxt.sh', { encoding: 'utf8' });
      
      // Verify DXT file exists
      const dxtFiles = fs.readdirSync('.').filter(f => f.endsWith('.dxt'));
      if (dxtFiles.length > 0) {
        console.log(`   ✅ DXT Generated: ${dxtFiles[0]}`);
        
        const stats = fs.statSync(dxtFiles[0]);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
        console.log(`   📏 Size: ${sizeMB}MB`);
      } else {
        throw new Error('No .dxt file found after build');
      }
    } catch (error) {
      console.log('   ❌ DXT generation failed!');
      console.log(`   Error: ${error.message}`);
      console.log('\n🔧 Manual DXT Generation:');
      console.log('   cd ~/Documents/claude-tracker');
      console.log('   ./build-dxt.sh');
      return;
    }

    // Step 5: Create setup status
    const setupStatus = {
      version: '5.0.13',
      installed_at: new Date().toISOString(),
      claude_tracker_dir: claudeTrackerDir,
      dxt_generated: true,
      setup_complete: true
    };

    const statusFilePath = path.join(claudeTrackerDir, '.setup-status.json');
    fs.writeFileSync(statusFilePath, JSON.stringify(setupStatus, null, 2));

    // Success message
    console.log('\n🎉 Claude Tracker v5.0.13 Setup Complete!\n');
    console.log('📋 What was created:');
    console.log(`   📁 Directory: ${claudeTrackerDir}`);
    console.log(`   📦 DXT file: Ready for Claude Desktop`);
    console.log(`   ⚙️  Status: ${statusFilePath}`);
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Open Claude Desktop → Settings → Extensions');
    console.log('   2. Drag & drop: ~/Documents/claude-tracker/claude-tracker-app.dxt');
    console.log('   3. Click "Install" → "Enable"');
    console.log('   4. Start tracking: start_env_tracking Development/your-project');
    
    console.log('\n✨ Follow updates: @peaske_en on X');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\n🛠️  Troubleshooting:');
    console.error('   1. Ensure write permissions to Documents folder');
    console.error('   2. Check Node.js version >= 18.0.0');
    console.error('   3. Verify Claude Desktop is installed');
    console.error('\n📖 Documentation: https://github.com/peaske/claude-tracker');
    process.exit(1);
  }
}

function showStatus() {
  const homeDir = os.homedir();
  const claudeTrackerDir = path.join(homeDir, 'Documents', 'claude-tracker');
  const statusFile = path.join(claudeTrackerDir, '.setup-status.json');

  console.log('📊 Claude Tracker Status:\n');

  if (!fs.existsSync(claudeTrackerDir)) {
    console.log('❌ Not installed. Run: claude-tracker init');
    return;
  }

  console.log(`✅ Directory: ${claudeTrackerDir}`);

  if (fs.existsSync(statusFile)) {
    const status = JSON.parse(fs.readFileSync(statusFile, 'utf8'));
    console.log(`✅ Version: ${status.version}`);
    console.log(`✅ Installed: ${status.installed_at}`);
  }

  const dxtFiles = fs.readdirSync(claudeTrackerDir).filter(f => f.endsWith('.dxt'));
  if (dxtFiles.length > 0) {
    console.log(`✅ DXT File: ${dxtFiles[0]}`);
  } else {
    console.log('❌ No DXT file found. Run: claude-tracker build-dxt');
  }
}

function buildDXT() {
  const homeDir = os.homedir();
  const claudeTrackerDir = path.join(homeDir, 'Documents', 'claude-tracker');

  if (!fs.existsSync(claudeTrackerDir)) {
    console.log('❌ Claude Tracker not initialized. Run: claude-tracker init');
    return;
  }

  console.log('🔨 Building DXT file...');

  try {
    process.chdir(claudeTrackerDir);
    execSync('./build-dxt.sh', { stdio: 'inherit' });
    console.log('✅ DXT build complete!');
  } catch (error) {
    console.error('❌ DXT build failed:', error.message);
  }
}

// Main execution
const command = process.argv[2] || 'help';

if (commands[command]) {
  commands[command]();
} else {
  console.log(`❌ Unknown command: ${command}`);
  showHelp();
}
