#!/bin/bash

# Claude Tracker v5.0.13 - DXT Build Script
echo "🚀 Building Claude Tracker DXT Extension..."

# Check if dxt CLI is available
if ! command -v dxt &> /dev/null; then
    echo "⚠️  DXT CLI not found. Installing @anthropic-ai/dxt..."
    npm install -g @anthropic-ai/dxt
    
    if ! command -v dxt &> /dev/null; then
        echo "❌ Failed to install DXT CLI. Installing locally..."
        npm install @anthropic-ai/dxt
        
        if [ -f "./node_modules/.bin/dxt" ]; then
            echo "✅ Using local DXT CLI"
            DXT_CMD="./node_modules/.bin/dxt"
        else
            echo "❌ DXT CLI installation failed. Cannot build DXT file."
            echo "   Please manually install: npm install -g @anthropic-ai/dxt"
            exit 1
        fi
    else
        DXT_CMD="dxt"
    fi
else
    DXT_CMD="dxt"
    echo "✅ DXT CLI found"
fi

# Clean old DXT files and temp directories
echo "🧹 Cleaning old DXT files..."
rm -f *.dxt
rm -rf dxt-build/

# Create proper DXT directory structure
echo "🏗️ Creating DXT directory structure..."
mkdir -p dxt-build/server

# Copy files to correct locations and convert ES modules
echo "📦 Copying and converting files for DXT structure..."
cp manifest.json dxt-build/
cp package.json dxt-build/
cp README.md dxt-build/ 2>/dev/null || echo "   README.md not found, skipping"

# Convert index.js from ES modules to CommonJS for DXT compatibility
echo "🔄 Converting index.js to CommonJS..."
node -e "
const fs = require('fs');
let content = fs.readFileSync('index.js', 'utf8');

// Convert ES module imports to CommonJS requires
content = content.replace(/import\s+{([^}]+)}\s+from\s+['\"]([^'\"]+)['\"]/g, 'const { \$1 } = require(\\'\$2\\');');
content = content.replace(/import\s+(\w+)\s+from\s+['\"]([^'\"]+)['\"]/g, 'const \$1 = require(\\'\$2\\');');
content = content.replace(/import\s+\*\s+as\s+(\w+)\s+from\s+['\"]([^'\"]+)['\"]/g, 'const \$1 = require(\\'\$2\\');');

// Remove export default lines
content = content.replace(/export default (.+);?/g, '');

// Ensure proper server startup
if (!content.includes('const server = new ClaudeTrackerEnvServer()')) {
    content += '\\n\\n// Start the server\\nconst server = new ClaudeTrackerEnvServer();\\nserver.run().catch(console.error);\\n';
}

fs.writeFileSync('dxt-build/server/index.js', content);
console.log('✅ Converted index.js to CommonJS format with server startup');
"

# Install dependencies in the build directory
echo "📦 Installing dependencies..."
cd dxt-build

# Create a temporary package.json without postinstall and type module to avoid ES modules issues
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
delete pkg.scripts.postinstall;
delete pkg.type; // Remove ES modules for DXT compatibility
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('✅ Removed postinstall and type:module for DXT compatibility');
"

npm install --production
cd ..

# Initialize DXT in the build directory
echo "🔄 Initializing DXT structure..."
cd dxt-build

# Update manifest.json for DXT structure
echo "🔧 Updating manifest for DXT structure..."
node -e "
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
manifest.server.entry_point = 'server/index.js';
manifest.server.mcp_config.args = ['\${__dirname}/server/index.js'];
fs.writeFileSync('manifest.json', JSON.stringify(manifest, null, 2));
console.log('✅ Updated entry_point and mcp_config.args for DXT structure');
"

# Validate manifest.json
echo "📋 Validating manifest.json..."
$DXT_CMD validate manifest.json
if [ $? -ne 0 ]; then
    echo "❌ Manifest validation failed"
    cd ..
    exit 1
fi
echo "✅ Manifest validation passed"

# Build DXT package
echo "📦 Building DXT package..."
$DXT_CMD pack

if [ $? -eq 0 ]; then
    echo "✅ DXT build successful!"
    
    # Move DXT file to parent directory with correct name
    cd ..
    
    # Look for any .dxt files in dxt-build directory and move them
    if ls dxt-build/*.dxt 1> /dev/null 2>&1; then
        mv dxt-build/*.dxt claude-tracker-app.dxt
        echo "✅ Moved DXT file to claude-tracker-app.dxt"
    else
        echo "❌ No .dxt files found in dxt-build directory"
        ls -la dxt-build/
    fi
    
    # Verify the DXT file exists
    if [ -f "claude-tracker-app.dxt" ]; then
        echo "📦 Claude Tracker DXT created successfully!"
        
        # Show file size
        size=$(du -h "claude-tracker-app.dxt" | cut -f1)
        echo "   📦 claude-tracker-app.dxt ($size)"
    else
        echo "❌ DXT file not found. Checking what was created..."
        ls -la *.dxt 2>/dev/null || echo "   No .dxt files found"
    fi
    
    # Copy to Documents directory if it exists
    if [ -d "$HOME/Documents/claude-tracker" ]; then
        echo "📋 Copying DXT to Documents directory..."
        if [ -f "claude-tracker-app.dxt" ]; then
            cp claude-tracker-app.dxt "$HOME/Documents/claude-tracker/"
            echo "✅ DXT file copied to ~/Documents/claude-tracker/"
        else
            echo "❌ No claude-tracker-app.dxt file to copy"
        fi
    fi
    
    echo ""
    echo "🎉 Claude Tracker DXT ready for distribution!"
    echo "   Install: Drag & drop the .dxt file to Claude Desktop"
    echo "   Settings > Extensions > Add Extension"
else
    echo "❌ DXT build failed"
    cd ..
    exit 1
fi

# Clean up build directory
echo "🧹 Cleaning up build directory..."
rm -rf dxt-build/
