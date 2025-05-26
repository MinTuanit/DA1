const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Movie = require('../models/movie');
const Product = require('../models/product');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const filePath = path.join(__dirname, '../prompt/cinema_info.txt');
const fileContent = fs.readFileSync(filePath, 'utf8');

async function buildPrompt() {
    const nowPlayingMovies = await Movie.find({ status: "Now Playing" }).select('title');
    const comingSoonMovies = await Movie.find({ status: "Coming Soon" }).select('title');
    const products = await Product.find().select('name');

    const allMovies = [...nowPlayingMovies, ...comingSoonMovies];
    const movieList = allMovies.map(m => `- ${m.title}`).join('\n');
    const productList = products.map(p => `- ${p.name}`).join('\n');

    return (
        fileContent +
        `Danh sách phim:\n${movieList}\n\n` +
        `Danh sách đồ ăn:\n${productList}\n`
    );
}

const chatbot = async (req, res) => {
    try {
        const userMessage = req.body.message;
        const prompt = await buildPrompt();
        console.log('Prompt content:\n', prompt);
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