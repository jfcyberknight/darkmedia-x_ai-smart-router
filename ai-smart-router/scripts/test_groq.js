const fetch = require('node-fetch');
require('dotenv').config({ path: __dirname + '/../.env' });

async function testGroq() {
    console.log("🚀 Testing GROQ Integration...");
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.error("❌ GROQ_API_KEY NOT FOUND in .env");
        return;
    }

    const payload = {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: "Dis-moi quelque chose d'horrifique sur le phare de Rimouski en une phrase." }]
    };

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.choices) {
            console.log("✅ GROQ SUCCESS!");
            console.log("💬 Response:", data.choices[0].message.content);
        } else {
            console.error("❌ Unexpected response:", data);
        }
    } catch (err) {
        console.error("❌ ERROR:", err.message);
    }
}

testGroq();
