const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Movie = require('../models/movie');
const Product = require('../models/product');
const Constraint = require('../models/constraint');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const filePath = path.join(__dirname, '../prompt/cinema_info.txt');
const fileContent = fs.readFileSync(filePath, 'utf8');

async function buildPrompt() {
    const nowPlayingMovies = await Movie.find({ status: "Now Playing" }).select('title');
    const comingSoonMovies = await Movie.find({ status: "Coming Soon" }).select('title');
    const products = await Product.find().select('name');
    const constraint = await Constraint.findOne();

    const allMovies = [...nowPlayingMovies, ...comingSoonMovies];
    const movieList = allMovies.map(m => `- ${m.title}`).join('\n');
    const productList = products.map(p => `- ${p.name}`).join('\n');

    let constraintInfo = '';
    if (constraint) {
        constraintInfo =
            `Giờ mở cửa: ${constraint.open_time}\n` +
            `Giờ đóng cửa: ${constraint.close_time}\n` +
            `Giá vé phim: từ ${constraint.min_ticket_price} đến ${constraint.max_ticket_price} VNĐ\n`;
    }

    return (
        fileContent +
        constraintInfo +
        `Danh sách phim:\n${movieList}\n\n` +
        `Danh sách đồ ăn:\n${productList}\n`
    );
}

const chatbot = async (req, res) => {
    try {
        // Fetch all movies with their titles, poster_url, and IDs
        const movies = await Movie.find({ status: { $in: ["Now Playing", "Coming Soon"] } }).select('title poster_url _id');

        const prompt = await buildPrompt();
        console.log('Prompt content:\n', prompt);

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'meta-llama/llama-3.3-8b-instruct:free',
            max_tokens: 1000,
            messages: [
                { role: 'system', content: prompt },
                { role: 'user', content: req.body.message }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'Chatbot Cinema Assistant'
            }
        });

        const reply = response.data.choices[0].message.content;

        // Find mentioned movies in the reply and include id, title, poster_url
        const mentionedMovies = movies
            .filter(m => reply.toLowerCase().includes(m.title.toLowerCase()))
            .map(m => ({
                id: m._id,
                title: m.title,
                poster_url: m.poster_url
            }));

        return res.json({
            reply,
            mentionedMovies
        });
    } catch (err) {
        console.error(err.response?.data || err.message);
        return res.status(500).json({ error: 'Lỗi xử lý yêu cầu AI' });
    }
};


module.exports = {
    chatbot
}