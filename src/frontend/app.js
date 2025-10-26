const express = require('express');
const cors = require('cors');
// Commented out the requirements as these have been containerized/will be communicated with over network
// const AutoCommentor = require('../commentor/auto-commentor');
// const FileManager = require('../filemgr/file-manager');

const app = express();
// const commentor = new AutoCommentor();
// const fileManager = new FileManager();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from commented directory
// app.use('/commented', express.static('commented'));

// Simple HTML Interface
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Auto Commentor</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: Arial, sans-serif;
                background: #f0f2f5;
                padding: 20px;
                line-height: 1.6;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                height: calc(100vh - 40px);
            }
            
            .panel {
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                display: flex;
                flex-direction: column;
            }
            
            h1 {
                color: #333;
                margin-bottom: 20px;
                text-align: center;
                grid-column: 1 / -1;
            }
            
            h2 {
                color: #555;
                margin-bottom: 15px;
                font-size: 1.2em;
            }
            
            textarea {
                width: 100%;
                flex: 1;
                padding: 15px;
                border: 2px solid #ddd;
                border-radius: 8px;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                resize: none;
                background: #fafafa;
            }
            
            textarea:focus {
                outline: none;
                border-color: #007cba;
                background: white;
            }
            
            button {
                background: #007cba;
                color: white;
                padding: 12px 30px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
                margin-top: 15px;
                transition: background 0.3s;
            }
            
            button:hover {
                background: #005a87;
            }
            
            .stats {
                background: #e8f4f8;
                padding: 10px 15px;
                border-radius: 6px;
                margin-top: 15px;
                font-size: 14px;
            }
            
            .stats div {
                margin: 5px 0;
            }
            
            #outputCode {
                white-space: pre-wrap;
                word-wrap: break-word;
                background: #1e1e1e;
                padding: 15px;
                border-radius: 6px;
                border: 1px solid #333;
                flex: 1;
                overflow-y: auto;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                color: #d4d4d4;
                line-height: 1.5;
            }
            
            /* Green color for comments */
            .comment {
                color: #6a9955 !important;
                font-style: italic;
            }
            
            .header {
                grid-column: 1 / -1;
                text-align: center;
                margin-bottom: 10px;
            }
            
            .error {
                color: #ff4444;
                background: #ffeaea;
                padding: 10px;
                border-radius: 5px;
                margin-top: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 Auto Code Commentor</h1>
                <p>Paste your JavaScript code on the left, see commented version on the right</p>
            </div>
            
            <div class="panel">
                <h2>📝 Paste Your JavaScript Code</h2>
                <textarea id="inputCode" placeholder="Paste your JavaScript code here...">function greet(name, callback) {
    console.log("Hello, " + name);
    callback();
}

function sayBye() {
    console.log("Goodbye!");
}

greet("Ajay", sayBye);</textarea>
                <button onclick="processCode()">Generate Comments</button>
                <div id="errorMessage" class="error" style="display: none;"></div>
                <div class="stats" id="stats" style="display: none;">
                    <div id="statContent"></div>
                </div>
            </div>
            
            <div class="panel">
                <h2>💡 Commented Code</h2>
                <div id="outputCode">Commented code will appear here...</div>
            </div>
        </div>

        <script>
            function showError(message) {
                const errorDiv = document.getElementById('errorMessage');
                errorDiv.textContent = message;
                errorDiv.style.display = 'block';
                setTimeout(() => {
                    errorDiv.style.display = 'none';
                }, 5000);
            }

            function highlightComments(code) {
                // Convert comment lines to green spans
                return code.replace(/(\\/\\/[^\\n]*)/g, function(match) {
                    return '<span class="comment">' + match + '</span>';
                });
            }

            async function processCode() {
                console.log('Button clicked!');
                
                const inputCode = document.getElementById('inputCode').value;
                const outputCode = document.getElementById('outputCode');
                const stats = document.getElementById('stats');
                const statContent = document.getElementById('statContent');
                
                if (!inputCode.trim()) {
                    showError('Please enter some JavaScript code');
                    return;
                }

                try {
                    outputCode.innerHTML = 'Processing...';
                    console.log('Sending request to server...');
                    
                    const response = await fetch('/api/process', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({ code: inputCode })
                    });
                    
                    console.log('Response status:', response.status);
                    
                    if (!response.ok) {
                        throw new Error('Server error: ' + response.status);
                    }
                    
                    const result = await response.json();
                    console.log('Received result:', result);
                    
                    if (result.error) {
                        showError('Error: ' + result.error);
                        outputCode.innerHTML = 'Error processing code';
                        stats.style.display = 'none';
                    } else {
                        // Apply green highlighting to comments
                        const highlightedCode = highlightComments(result.commentedCode);
                        outputCode.innerHTML = highlightedCode;
                        
                        // Show statistics
                        statContent.innerHTML = 
                            '<strong>📊 Processing Complete:</strong>' +
                            '<div>✅ Functions: ' + result.stats.functions + '</div>' +
                            '<div>✅ Classes: ' + result.stats.classes + '</div>' +
                            '<div>✅ Variables: ' + result.stats.variables + '</div>' +
                            '<div>✅ Comments Added: ' + result.stats.commentsAdded + '</div>';
                        stats.style.display = 'block';
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showError('Error: ' + error.message);
                    outputCode.innerHTML = 'Error connecting to server';
                    stats.style.display = 'none';
                }
            }

            // Process code when user presses Ctrl+Enter in textarea
            document.getElementById('inputCode').addEventListener('keydown', function(e) {
                if (e.ctrlKey && e.key === 'Enter') {
                    processCode();
                }
            });

            // Auto-process the sample code on page load
            window.addEventListener('load', function() {
                console.log('Page loaded, auto-processing...');
                setTimeout(processCode, 1000);
            });
        </script>
    </body>
    </html>
    `);
});

// API Routes
app.post('/api/process', async (req, res) => {
    try {
        const { code } = req.body;

        console.log(' Received /api/process request with code length:', code?.length)

        // Commentor request
        const commentorResp = await fetch('http://commentor:5000/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });

        console.log('Commentor response status:', commentorResp.status);
        const commentorData = await commentorResp.json();
        console.log('Commentor response data:', commentorData);

        // File manager request
        const fileMgrResp = await fetch('http://filemgr:5001/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filename: 'commented_code.js',
                commentedCode: commentorData.commentedCode
            })
        });

        console.log('FileMgr response status:', fileMgrResp.status);
        const fileMgrData = await fileMgrResp.json();
        console.log('FileMgr raw response', fileMgrData);

        res.json({ ...commentorData, fileInfo: fileMgrData });
    } catch (error) {
        console.error('Error in /api/process:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/files', async (req, res) => {
    try {
        const files = await fileManager.listCommentedFiles();
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('🚀 Auto Commentor running on http://localhost:' + PORT);
});