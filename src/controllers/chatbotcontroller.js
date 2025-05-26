const fs = require('fs');
const path = require('path');
const axios = require('axios');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const filePath = path.join(__dirname, '../datas/cinema_info.txt');
const fileContent = fs.readFileSync(filePath, 'utf8');


const chatbot = async (req, res) => {
    try {
        const userMessage = req.body.message;
        const prompt = `${fileContent}`;
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'anthropic/claude-3-haiku:beta',
            messages: [
                { role: 'system', content: prompt },
                { role: 'user', content: userMessage }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'Chatbot Cinema Assistant'
            }
        });

        const reply = response.data.choices[0].message.content;
        return res.json({ reply });

    } catch (err) {
        console.error(err.response?.data || err.message);
        return res.status(500).json({ error: 'Lỗi xử lý yêu cầu AI' });
    }
};

module.exports = {
    chatbot
}