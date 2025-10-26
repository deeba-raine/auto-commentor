const fs = require('fs').promises;
const path = require('path');

class FileManager {
    constructor() {
        this.uploadDir = path.join(__dirname, '../uploads');
        this.commentedDir = path.join(__dirname, '../commented');
        this.ensureDirectories();
    }

    async ensureDirectories() {
        try {
            await fs.mkdir(this.uploadDir, { recursive: true });
            await fs.mkdir(this.commentedDir, { recursive: true });
            console.log('Directories created successfully');
        } catch (error) {
            console.log('Directories already exist or error:', error.message);
        }
    }

    async saveUploadedFile(file) {
        const filePath = path.join(this.uploadDir, file.originalname);
        await fs.writeFile(filePath, file.buffer);
        return filePath;
    }

    async readFile(filePath) {
        return await fs.readFile(filePath, 'utf8');
    }

    async saveCommentedFile(originalFilename, commentedCode) {
        // Create a new filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const originalName = path.parse(originalFilename).name;
        const newFilename = `${originalName}_commented_${timestamp}.js`;
        const filePath = path.join(this.commentedDir, newFilename);
        
        await fs.writeFile(filePath, commentedCode);
        return {
            filename: newFilename,
            filePath: filePath,
            relativePath: `commented/${newFilename}`
        };
    }

    async listCommentedFiles() {
        try {
            const files = await fs.readdir(this.commentedDir);
            return files.filter(file => file.endsWith('.js'));
        } catch (error) {
            return [];
        }
    }

    async cleanupUploads() {
        try {
            const files = await fs.readdir(this.uploadDir);
            for (const file of files) {
                await fs.unlink(path.join(this.uploadDir, file));
            }
        } catch (error) {
            console.log('Cleanup error:', error.message);
        }
    }
}

module.exports = FileManager;