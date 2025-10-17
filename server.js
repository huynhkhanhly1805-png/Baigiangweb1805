// server.js - Cấu hình cho Google Gemini API
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Import thư viện Gemini
const { GoogleGenAI } = require('@google/genai');

// ⚠️ THAY THẾ BẰNG KHÓA API GEMINI THẬT CỦA BẠN ⚠️
const ai = new GoogleGenAI({ 
    apiKey: 'AIzaSyC4vZ3riMznk-rIXktsktp--AiI_XENuLY' 
});

const app = express();
const port = 8000; 

app.use(cors()); 
app.use(bodyParser.json());

// API Endpoint để tạo bài giảng
app.post('/generate_lesson', async (req, res) => {
    const { title, grade, subject } = req.body;

    if (!title || !grade || !subject) {
        return res.status(400).json({ error: "Thiếu thông tin: title, grade, hoặc subject." });
    }

    const systemInstruction = `Bạn là một trợ lý giáo dục chuyên nghiệp, có nhiệm vụ tạo nội dung bài giảng chi tiết.
    - Cấu trúc phản hồi: Bắt buộc phải là một chuỗi văn bản lớn, mỗi slide bắt đầu bằng dấu gạch ngang (---) và dòng tiếp theo là Tiêu đề Slide.
    - Nội dung phải dễ hiểu, sử dụng ngôn ngữ học thuật, và phù hợp với học sinh ${grade} môn ${subject}.`;
    
    const userPrompt = `Hãy tạo một bài giảng chi tiết gồm tối thiểu 3 slide về chủ đề "${title}".`;

    console.log(`Đang tạo bài giảng bằng Gemini: ${title} (${subject} - ${grade})`);

    try {
        const response = await ai.models.generateContent({
            // Sử dụng mô hình Flash nhanh và miễn phí
            model: "gemini-2.5-flash",
            contents: [
                { role: "user", parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }] }
            ],
            config: {
                temperature: 0.7 
            }
        });

        const raw_text = response.text;

        res.json({ success: true, raw_text: raw_text });

    } catch (error) {
        console.error("Lỗi khi gọi Gemini API:", error.message);
        res.status(500).json({ 
            success: false, 
            error: "Lỗi Server hoặc Lỗi API Gemini. Kiểm tra lại Key.",
            detail: error.message 
        });
    }
});

app.listen(port, () => {
  console.log(`✅ Server Gemini đang chạy tại http://localhost:${port}. Giữ cửa sổ này mở.`);
});