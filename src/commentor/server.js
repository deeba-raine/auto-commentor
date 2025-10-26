const express = require("express");
const AutoCommentor = require("./auto-commentor");

const app = express();
const commentor = new AutoCommentor();

app.use(express.json());

app.post("/process", (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ error: "No code provided" });
        }
        
        const result = commentor.processCode(code);
        res.json(result);
    } catch (e) {
        console.error("Error processing code:", e);
        res.status(500).json({ error: e.message });
    }
});

app.listen(5000, () => console.log('Commentor service on port 5000'));