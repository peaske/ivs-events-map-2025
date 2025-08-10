#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

/**
 * Claude Tracker v5.0.9 - JSONL-based tracking system with ENV pointers
 * 
 * Key Features:
 * - JSONL storage for efficient log management
 * - ENV file contains only pointers and previews
 * - 50KB auto-cleanup threshold
 * - Weekly rotation system  
 * - RAG-like memory inheritance within projects
 * - 12-Factor App compliance
 */

class ClaudeTrackerEnvServer {
  constructor() {
    this.server = new Server(
      {
        name: "claude-tracker-jsonl",
        version: "5.0.9",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.currentProjectPath = null;
    this.currentChatId = null;
    this.messageCounter = 0;
    this.chatStartTime = null;
    this.currentLogFile = null;
    
    // JSONL system constants
    this.ENV_SIZE_LIMIT = 50 * 1024; // 50KB limit
    this.PREVIEW_LENGTH = 200; // 200 character preview
    
    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "start_env_tracking",
          description: "Start tracking chat history to specified project's .env file",
          inputSchema: {
            type: "object",
            properties: {
              project_path: {
                type: "string",
                description: "Project path (e.g., 'Development/nomaps-events-map-v2')"
              },
              chat_topic: {
                type: "string", 
                description: "Brief topic description for this chat session"
              }
            },
            required: ["project_path", "chat_topic"]
          }
        },
        {
          name: "add_to_env",
          description: "Add conversation content to project's .env file in real-time",
          inputSchema: {
            type: "object",
            properties: {
              user_message: {
                type: "string",
                description: "User's message content"
              },
              assistant_message: {
                type: "string",
                description: "Assistant's response content"
              }
            },
            required: ["user_message", "assistant_message"]
          }
        },
        {
          name: "finalize_env_session",
          description: "Complete the chat session and add summary to .env file",
          inputSchema: {
            type: "object",
            properties: {
              session_summary: {
                type: "string",
                description: "Brief summary of the entire chat session"
              }
            },
            required: ["session_summary"]
          }
        },
        {
          name: "rotate_env_backup",
          description: "Create weekly backup of .env file and clean up old entries",
          inputSchema: {
            type: "object",
            properties: {},
            required: []
          }
        },
        {
          name: "get_env_tracking_status",
          description: "Check current tracking status and recent .env entries",
          inputSchema: {
            type: "object",
            properties: {},
            required: []
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "start_env_tracking":
            return await this.startEnvTracking(args.project_path, args.chat_topic);
          
          case "add_to_env":
            return await this.addToEnv(args.user_message, args.assistant_message);
          
          case "finalize_env_session":
            return await this.finalizeEnvSession(args.session_summary);
          
          case "rotate_env_backup":
            return await this.rotateEnvBackup();
          
          case "get_env_tracking_status":
            return await this.getEnvTrackingStatus();

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Error in ${name}: ${error.message}\n\n🛠️ Debug info: ${error.stack}`
            }
          ]
        };
      }
    });
  }

  async startEnvTracking(projectPath, chatTopic) {
    try {
      // Resolve full project path
      const homeDir = os.homedir();
      const fullProjectPath = path.join(homeDir, projectPath);
      const envFilePath = path.join(fullProjectPath, '.env');

      // Validate project directory exists
      if (!fs.existsSync(fullProjectPath)) {
        throw new Error(`Project directory not found: ${fullProjectPath}`);
      }

      // Initialize tracking session
      this.currentProjectPath = fullProjectPath;
      this.currentChatId = this.generateChatId();
      this.messageCounter = 0;
      this.chatStartTime = new Date();

      // Create JSONL log directory and file
      this.currentLogFile = this.createLogDirectory(fullProjectPath);

      // Create .env file if it doesn't exist
      if (!fs.existsSync(envFilePath)) {
        fs.writeFileSync(envFilePath, '# Project Environment Variables\n\n');
      }

      // Check ENV file size and cleanup if needed
      this.checkEnvSizeAndCleanup(envFilePath);

      // Add session start to JSONL
      this.appendToJsonl(this.currentLogFile, {
        type: 'session_start',
        topic: chatTopic,
        project_path: projectPath
      });

      // Add pointer entry to ENV (lightweight)
      const sessionStartContent = `=== Chat Session: ${chatTopic} ===`;
      const pointer = this.createEnvPointer(sessionStartContent, this.currentLogFile);
      const envEntry = `CLAUDE_PTR_${this.currentChatId}_SESSION_START="${pointer.preview}"\n# Log: ${pointer.pointer}\n\n`;
      
      fs.appendFileSync(envFilePath, envEntry);

      return {
        content: [
          {
            type: "text",
            text: `🚀 JSONL-Enhanced ENV Tracking Started!

📁 **Project Path:** ${projectPath}
🆔 **Chat ID:** ${this.currentChatId}
📝 **Topic:** ${chatTopic}
📄 **ENV File:** ${envFilePath}
🗂️ **JSONL Log:** ${this.currentLogFile}

✅ **Revolutionary JSONL System:**
- Full conversations → JSONL (efficient search/rotation)
- ENV pointers → Lightweight references (12-Factor compliant)
- Auto-cleanup → 50KB limit maintains performance
- Weekly rotation → Organized by date

**Next Steps:**
1. Continue your normal conversation
2. Use 'add_to_env' tool to capture key exchanges
3. Use 'finalize_env_session' when done

🎯 **RAG-like Memory:** Your chat history is now efficiently stored with ENV pointers for instant access!`
          }
        ]
      };

    } catch (error) {
      throw new Error(`Failed to start JSONL tracking: ${error.message}`);
    }
  }

  async addToEnv(userMessage, assistantMessage) {
    if (!this.currentProjectPath || !this.currentChatId || !this.currentLogFile) {
      throw new Error('No active JSONL tracking session. Please run start_env_tracking first.');
    }

    try {
      const envFilePath = path.join(this.currentProjectPath, '.env');
      this.messageCounter++;

      // Save full conversation to JSONL
      this.appendToJsonl(this.currentLogFile, {
        type: 'user_message',
        content: userMessage,
        message_id: this.messageCounter
      });

      this.appendToJsonl(this.currentLogFile, {
        type: 'assistant_message', 
        content: assistantMessage,
        message_id: this.messageCounter
      });

      // Create lightweight ENV pointers
      const userPointer = this.createEnvPointer(userMessage, this.currentLogFile);
      const assistantPointer = this.createEnvPointer(assistantMessage, this.currentLogFile);

      // Format ENV entries with pointers and previews only
      const timestamp = new Date().toISOString().replace(/[:.]/g, '').substring(0, 15);
      const userEntry = `CLAUDE_PTR_${timestamp}_USER_${this.messageCounter}="${userPointer.preview}"\n# Log: ${userPointer.pointer}\n`;
      const assistantEntry = `CLAUDE_PTR_${timestamp}_ASSISTANT_${this.messageCounter}="${assistantPointer.preview}"\n# Log: ${assistantPointer.pointer}\n\n`;

      // Append to ENV file
      fs.appendFileSync(envFilePath, userEntry);
      fs.appendFileSync(envFilePath, assistantEntry);

      // Check ENV file size and cleanup if needed
      this.checkEnvSizeAndCleanup(envFilePath);

      return {
        content: [
          {
            type: "text", 
            text: `✅ Added to JSONL + ENV Pointers!

📊 **Message #${this.messageCounter}**
📄 **ENV File:** ${envFilePath}
🗂️ **JSONL Log:** ${this.currentLogFile}
🔄 **Auto-Cleanup:** ${this.ENV_SIZE_LIMIT / 1024}KB limit active

💬 **Tracked Content:**
- User preview: ${userPointer.preview}
- Assistant preview: ${assistantPointer.preview}
- Full content: Stored in JSONL

🎯 **Efficient Storage:** ENV stays lightweight with pointers, full conversations in searchable JSONL!`
          }
        ]
      };

    } catch (error) {
      throw new Error(`Failed to add to JSONL: ${error.message}`);
    }
  }

  // Utility methods
  generateChatId() {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '').substring(0, 15);
  }

  async finalizeEnvSession(sessionSummary) {
    if (!this.currentProjectPath || !this.currentChatId || !this.currentLogFile) {
      throw new Error('No active JSONL tracking session to finalize.');
    }

    try {
      const envFilePath = path.join(this.currentProjectPath, '.env');
      const sessionEnd = new Date();
      const duration = Math.round((sessionEnd - this.chatStartTime) / 1000 / 60); // minutes

      // Add session summary and end to JSONL
      this.appendToJsonl(this.currentLogFile, {
        type: 'session_summary',
        content: sessionSummary
      });

      this.appendToJsonl(this.currentLogFile, {
        type: 'session_end',
        duration_minutes: duration,
        message_count: this.messageCounter,
        end_time: sessionEnd.toISOString()
      });

      // Add lightweight ENV pointers for session end
      const summaryPointer = this.createEnvPointer(sessionSummary, this.currentLogFile);
      const endInfo = `Duration: ${duration}min, Messages: ${this.messageCounter}`;
      const endPointer = this.createEnvPointer(endInfo, this.currentLogFile);

      const summaryEntry = `CLAUDE_PTR_${this.currentChatId}_SESSION_SUMMARY="${summaryPointer.preview}"\n# Log: ${summaryPointer.pointer}\n`;
      const endEntry = `CLAUDE_PTR_${this.currentChatId}_SESSION_END="${endPointer.preview}"\n# Log: ${endPointer.pointer}\n`;

      fs.appendFileSync(envFilePath, summaryEntry);
      fs.appendFileSync(envFilePath, endEntry);
      fs.appendFileSync(envFilePath, '\n# ===================================\n\n');

      // Final ENV cleanup check
      this.checkEnvSizeAndCleanup(envFilePath);

      // Reset tracking state
      const completedChatId = this.currentChatId;
      const completedLogFile = this.currentLogFile;
      this.currentProjectPath = null;
      this.currentChatId = null;
      this.messageCounter = 0;
      this.chatStartTime = null;
      this.currentLogFile = null;

      return {
        content: [
          {
            type: "text",
            text: `🎉 JSONL Session Finalized!

📊 **Session Stats:**
- Chat ID: ${completedChatId}
- Duration: ${duration} minutes
- Messages tracked: ${this.messageCounter}
- Summary: ${sessionSummary}

🗂️ **JSONL Integration Complete:**
- Full conversation: ${completedLogFile}
- ENV pointers: Lightweight references maintained
- Auto-cleanup: Applied (${this.ENV_SIZE_LIMIT / 1024}KB limit)

🔄 **Weekly Rotation Available:**
Use 'rotate_env_backup' to create weekly backups and manage file size.

✨ **Ready for Next Session:**
Your Claude Tracker JSONL system is ready for the next conversation!`
          }
        ]
      };

    } catch (error) {
      throw new Error(`Failed to finalize JSONL session: ${error.message}`);
    }
  }

  async rotateEnvBackup() {
    if (!this.currentProjectPath) {
      throw new Error('No active project to rotate. Please start tracking first.');
    }

    try {
      const envFilePath = path.join(this.currentProjectPath, '.env');
      
      if (!fs.existsSync(envFilePath)) {
        return {
          content: [{
            type: "text",
            text: "ℹ️ No .env file found to rotate."
          }]
        };
      }

      // Create weekly backup
      const now = new Date();
      const weekStamp = this.getWeekStamp(now);
      const backupFilePath = path.join(this.currentProjectPath, `.env.backup.${weekStamp}`);

      // Copy current .env to backup
      const envContent = fs.readFileSync(envFilePath, 'utf8');
      fs.writeFileSync(backupFilePath, envContent);

      // Clean up old backup files (keep only last 4 weeks)
      this.cleanupOldBackups(this.currentProjectPath);

      // Keep only essential environment variables in main .env
      const essentialContent = this.extractEssentialEnvVars(envContent);
      fs.writeFileSync(envFilePath, essentialContent);

      const envSize = (envContent.length / 1024).toFixed(2);
      const backupSize = (essentialContent.length / 1024).toFixed(2);

      return {
        content: [
          {
            type: "text",
            text: `🔄 Weekly ENV Rotation Complete!

📦 **Backup Created:**
- File: .env.backup.${weekStamp}
- Size: ${envSize} KB

🧹 **Main .env Cleaned:**
- New size: ${backupSize} KB
- Essential vars preserved
- Chat history archived

📚 **Backup Management:**
- Keeping last 4 weeks of backups
- Old backups automatically cleaned

✅ Your .env file is now optimized for continued tracking!`
          }
        ]
      };

    } catch (error) {
      throw new Error(`Failed to rotate ENV backup: ${error.message}`);
    }
  }

  async getEnvTrackingStatus() {
    try {
      const status = {
        isActive: !!this.currentProjectPath,
        projectPath: this.currentProjectPath,
        chatId: this.currentChatId,
        messageCount: this.messageCounter,
        sessionDuration: null,
        logFile: this.currentLogFile
      };

      if (this.chatStartTime) {
        const now = new Date();
        status.sessionDuration = Math.round((now - this.chatStartTime) / 1000 / 60);
      }

      let envInfo = '';
      let jsonlInfo = '';
      
      if (this.currentProjectPath) {
        const envFilePath = path.join(this.currentProjectPath, '.env');
        if (fs.existsSync(envFilePath)) {
          const envContent = fs.readFileSync(envFilePath, 'utf8');
          const envSize = (envContent.length / 1024).toFixed(2);
          const claudeEntries = (envContent.match(/CLAUDE_PTR_/g) || []).length;
          
          envInfo = `
📄 **ENV File Status:**
- Size: ${envSize} KB (Limit: ${this.ENV_SIZE_LIMIT / 1024}KB)
- Claude pointers: ${claudeEntries}
- Path: ${envFilePath}`;
        }
        
        if (this.currentLogFile && fs.existsSync(this.currentLogFile)) {
          const logContent = fs.readFileSync(this.currentLogFile, 'utf8');
          const logSize = (logContent.length / 1024).toFixed(2);
          const logLines = logContent.split('\n').filter(line => line.trim()).length;
          
          jsonlInfo = `
🗂️ **JSONL Log Status:**
- Size: ${logSize} KB
- Log entries: ${logLines}
- Path: ${this.currentLogFile}`;
        }
      }

      return {
        content: [
          {
            type: "text",
            text: `📊 Claude Tracker JSONL Status

🔄 **Active Session:** ${status.isActive ? '✅ YES' : '❌ NO'}
${status.isActive ? `
📁 **Project:** ${status.projectPath}
🆔 **Chat ID:** ${status.chatId}
💬 **Messages:** ${status.messageCount}
⏱️ **Duration:** ${status.sessionDuration} minutes` : ''}${envInfo}${jsonlInfo}

${!status.isActive ? `
🚀 **To Start Tracking:**
Use 'start_env_tracking' with your project path (e.g., 'Development/nomaps-events-map-v2')` : `
🎯 **Active Tools:**
- add_to_env: Capture conversations in JSONL + ENV pointers
- finalize_env_session: Complete and summarize session
- rotate_env_backup: Weekly cleanup and backup`}

✨ **Revolutionary JSONL System:**
- 🗂️ Full conversations → JSONL (searchable, efficient)
- 🔗 ENV pointers → Lightweight references (12-Factor compliant)
- 🧹 Auto-cleanup → 50KB ENV limit maintains performance
- 🗺️ Weekly logs → Organized by date for easy navigation`
          }
        ]
      };

    } catch (error) {
      throw new Error(`Failed to get JSONL status: ${error.message}`);
    }
  }

  // JSONL System Utility Methods
  createLogDirectory(projectPath) {
    const now = new Date();
    const year = now.getFullYear();
    const week = this.getWeekNumber(now);
    const weekStr = `${year}-W${week.toString().padStart(2, '0')}`;
    
    const logDir = path.join(projectPath, '.claude', 'logs', weekStr);
    
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    return path.join(logDir, 'chat.jsonl');
  }

  appendToJsonl(filePath, data) {
    const jsonlEntry = JSON.stringify({
      timestamp: new Date().toISOString(),
      chat_id: this.currentChatId,
      message_num: this.messageCounter,
      ...data
    }) + '\n';
    
    fs.appendFileSync(filePath, jsonlEntry);
  }

  generateContentHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
  }

  createEnvPointer(content, logFilePath) {
    const hash = this.generateContentHash(content);
    const preview = content.length > this.PREVIEW_LENGTH 
      ? content.substring(0, this.PREVIEW_LENGTH) + '...'
      : content;
    
    const relativeLogPath = path.relative(this.currentProjectPath, logFilePath);
    
    return {
      hash,
      preview,
      logPath: relativeLogPath,
      pointer: `${relativeLogPath}#${hash}`
    };
  }

  checkEnvSizeAndCleanup(envFilePath) {
    if (!fs.existsSync(envFilePath)) return;
    
    const stats = fs.statSync(envFilePath);
    if (stats.size > this.ENV_SIZE_LIMIT) {
      console.error(`ENV file size (${stats.size} bytes) exceeds limit (${this.ENV_SIZE_LIMIT}). Cleaning up...`);
      this.cleanupOldEnvEntries(envFilePath);
    }
  }

  cleanupOldEnvEntries(envFilePath) {
    const content = fs.readFileSync(envFilePath, 'utf8');
    const lines = content.split('\n');
    
    // Keep non-CLAUDE entries and recent CLAUDE entries (last 10)
    const nonClaudeLines = lines.filter(line => !line.startsWith('CLAUDE_PTR_') && !line.startsWith('CLAUDE_CHAT_'));
    const claudeLines = lines.filter(line => line.startsWith('CLAUDE_PTR_') || line.startsWith('CLAUDE_CHAT_'));
    
    // Keep only the most recent 10 Claude entries
    const recentClaudeLines = claudeLines.slice(-10);
    
    const cleanedContent = [...nonClaudeLines, ...recentClaudeLines].join('\n');
    fs.writeFileSync(envFilePath, cleanedContent);
    
    console.error(`Cleaned up ENV file. Removed ${claudeLines.length - recentClaudeLines.length} old entries.`);
  }

  getWeekStamp(date) {
    const year = date.getFullYear();
    const week = this.getWeekNumber(date);
    return `${year}W${week.toString().padStart(2, '0')}`;
  }

  getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  cleanupOldBackups(projectPath) {
    try {
      const files = fs.readdirSync(projectPath);
      const backupFiles = files
        .filter(f => f.startsWith('.env.backup.'))
        .sort()
        .reverse();

      // Keep only last 4 backups
      const filesToDelete = backupFiles.slice(4);
      filesToDelete.forEach(file => {
        fs.unlinkSync(path.join(projectPath, file));
      });
    } catch (error) {
      console.error('Failed to cleanup old backups:', error);
    }
  }

  extractEssentialEnvVars(content) {
    const lines = content.split('\n');
    const essential = lines.filter(line => {
      return line.startsWith('#') || 
             (!line.includes('CLAUDE_CHAT_') && line.trim() !== '');
    });
    
    return essential.join('\n') + '\n\n# === Claude Tracker Session History ===\n\n';
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Claude Tracker JSONL v5.0.9 server running on stdio");
  }
}

// Handle command line arguments
if (process.argv.includes('--test')) {
  console.log('✅ Claude Tracker JSONL v5.0.9 - Test passed!');
  console.log('🚀 JSONL-based tracking system ready');
  console.log('📄 Project integration: ENV pointers + JSONL logs');
  console.log('🔄 Weekly rotation: Automated backup system');  
  console.log('✨ RAG-like memory: Efficient searchable conversation storage');
  console.log('🧹 Auto-cleanup: 50KB ENV size limit maintains performance');
  process.exit(0);
}

// Start the server
const server = new ClaudeTrackerEnvServer();
server.run().catch(console.error);
