const express = require('express');
const FileManager = require('./file-manager');
const app = express();
const fm = new FileManager();

app.use(express.json());

app.post('/save', async (req, res) => {
    try {
        const { filename, commentedCode } = req.body;
        if (!filename || !commentedCode)
            return res.status(400).json({ error: 'Missing data' });

        const result = await fm.saveCommentedFile(filename, commentedCode);
        res.json(result);
    } catch (e) {
        console.error('Error in /save:', e);
        res.status(500).json({ error: e.message });
    }
});

app.listen(5001, () => console.log('File manager service on port 5001'));
