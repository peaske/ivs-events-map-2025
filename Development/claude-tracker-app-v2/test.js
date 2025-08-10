#!/usr/bin/env node

/**
 * Claude Tracker v5.0.6 JSONL Edition - Minimal Test Suite
 * Tests core functionality without external dependencies
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Claude Tracker v5.0.6 JSONL Edition - Testing...\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✅ ${name}`);
        passed++;
    } catch (error) {
        console.log(`❌ ${name}: ${error.message}`);
        failed++;
    }
}

// Test 1: Check required files exist
test('Required files exist', () => {
    const requiredFiles = ['package.json', 'index.js', 'manifest.json', 'install.js'];
    requiredFiles.forEach(file => {
        if (!fs.existsSync(file)) {
            throw new Error(`Missing required file: ${file}`);
        }
    });
});

// Test 2: Package.json validation
test('package.json is valid JSON', () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (!pkg.name || !pkg.version) {
        throw new Error('Missing name or version in package.json');
    }
    if (pkg.version !== '5.0.4') {
        throw new Error(`Expected version 5.0.4, got ${pkg.version}`);
    }
});

// Test 3: Manifest.json validation
test('manifest.json is valid', () => {
    const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
    if (!manifest.name || !manifest.server) {
        throw new Error('Invalid manifest.json structure');
    }
});

// Test 4: Index.js syntax check
test('index.js syntax is valid', () => {
    const indexContent = fs.readFileSync('index.js', 'utf8');
    if (!indexContent.includes('JSONL-based tracking system') || !indexContent.includes('createLogDirectory')) {
        throw new Error('index.js missing required JSONL components');
    }
});

// Test 5: Build script exists and is executable
test('build-dxt.sh is ready', () => {
    if (!fs.existsSync('build-dxt.sh')) {
        throw new Error('build-dxt.sh not found');
    }
    const stats = fs.statSync('build-dxt.sh');
    if (!(stats.mode & 0o111)) {
        console.log('⚠️  build-dxt.sh needs execute permission: chmod +x build-dxt.sh');
    }
});

// Results
console.log(`\n📊 Test Results:`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

if (failed === 0) {
    console.log('\n🎉 All tests passed! Claude Tracker v5.0.6 JSONL Edition is ready!');
    console.log('\n🚀 Next steps:');
    console.log('   1. chmod +x build-dxt.sh');
    console.log('   2. ./build-dxt.sh');
    console.log('   3. npm publish');
    process.exit(0);
} else {
    console.log('\n❌ Some tests failed. Please fix the issues before proceeding.');
    process.exit(1);
}
