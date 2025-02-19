const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../middleware/authMiddleware');

// Use the free instruction-following model.
const MODEL_URL = "https://api-inference.huggingface.co/models/google/flan-t5-base";

// Refined prompt definitions:
const getPrompts = {
  // Tip remains mostly the same.
  tip: (tasks) => {
    const taskInfo = tasks.map(t => {
      const daysDue = Math.ceil((new Date(t.deadline) - new Date()) / (1000 * 60 * 60 * 24));
      return `- ${t.title} (due in ${daysDue} days)`;
    }).join('\n');
    const randomSeed = Math.floor(Math.random() * 10000);
    return `You are a creative productivity coach. Based on the following tasks:
  ${taskInfo}
  Generate one unique, concise, and actionable motivational tip that is original, in exactly one sentence. Do not include any extra text or the random seed in your answer. (Random seed for internal reference: ${randomSeed})`;
  },

  // Analysis: Assign priority based on deadline and provide an actionable recommendation.
  analysis: (tasks) => {
    const taskInfo = tasks.map(t => {
      const dueDate = new Date(t.deadline).toLocaleDateString('en-US');
      return `${t.title} (Due: ${dueDate}, Type: ${t.type || 'general'})`;
    }).join('\n');
    return `You are a task management expert. For each task listed below, output exactly one bullet point formatted exactly as follows and nothing else:
  
  Example:
  • Finish Report - Due: 02/27/2025; Priority: High; Recommendation: Complete the final revisions immediately.
  
  Now, for the tasks provided, output one bullet per task in the same format:
  • [Task Title] - Due: [Due Date]; Priority: [High/Medium/Low/Overdue]; Recommendation: [One actionable recommendation].
  
  Do not include any additional text or labels.
  
  Tasks:
  ${taskInfo}`;
  },
  
  
  // Reminders: Generate reminders for tasks overdue or due within 2 days.
  reminders: (tasks) => {
    // Filter tasks that are overdue or due within 2 days.
    const filtered = tasks.filter(t => {
      const deadline = new Date(t.deadline);
      const now = new Date();
      const diffDays = (deadline - now) / (1000 * 60 * 60 * 24);
      return diffDays < 0 || diffDays <= 2;
    });
    
    if (filtered.length === 0) {
      return `No tasks are overdue or due within the next 2 days.`;
    }
    
    const taskInfo = filtered.map(t => {
      const dueDate = new Date(t.deadline).toLocaleDateString();
      return `- ${t.title} (Due: ${dueDate})`;
    }).join('\n');
    
    return `You are a smart reminder assistant. Based on the following tasks:
${taskInfo}
Generate clear, actionable, and distinct reminders for each task. Each reminder should be a short sentence that includes the task title and emphasizes the urgency. Format your answer as bullet points.`;
  }
};

// Helper function with retry logic remains similar.
async function queryHuggingFace(prompt, retries = 3, delay = 5000) {
  const headers = { 
    "Authorization": `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
    "Content-Type": "application/json"
  };

  let attemptCount = 0;
  let lastError = null;
  while (attemptCount < retries) {
    attemptCount++;
    try {
      const response = await axios.post(
        MODEL_URL, 
        { 
          inputs: prompt,
          parameters: {
            max_new_tokens: 150,
            temperature: 1.0,    // High temperature for more diversity.
            top_p: 0.9,
            do_sample: true,
            no_repeat_ngram_size: 2
          }
        },
        { headers, timeout: 15000 }
      );
      if (Array.isArray(response.data)) {
        return { generated_text: response.data[0]?.generated_text || "", attempts: attemptCount };
      }
      return { generated_text: "", attempts: attemptCount };
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attemptCount} failed:`, error.response?.data?.error || error.message);
      if (attemptCount < retries) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(res => setTimeout(res, delay));
      }
    }
  }
  throw lastError;
}

// Endpoint for quick motivational tip.
router.post('/quick-tip', authMiddleware, async (req, res) => {
  try {
    const { tasks } = req.body;
    if (!tasks?.length) {
      return res.json({ tip: "Add tasks to get AI tips!" });
    }
    const prompt = getPrompts.tip(tasks);
    console.log("Quick Tip Prompt:", prompt);
    const result = await queryHuggingFace(prompt);
    let tip = result.generated_text.split('\n')[0]
      .replace(/^["']|["']$/g, '')
      .replace(/^(tip:|hint:|note:)/i, '')
      .trim();
    res.json({ tip, attempts: result.attempts });
  } catch (error) {
    console.error('Tip generation error:', error);
    res.status(500).json({ error: 'AI service temporarily unavailable' });
  }
});

// Endpoint for task analysis and prioritization.
router.post('/suggest', authMiddleware, async (req, res) => {
  try {
    const { tasks } = req.body;
    if (!tasks?.length) {
      return res.json({ analysis: "Add tasks for AI analysis." });
    }
    const prompt = getPrompts.analysis(tasks);
    console.log("Analysis Prompt:", prompt);
    const result = await queryHuggingFace(prompt);
    res.json({ analysis: result.generated_text.trim(), attempts: result.attempts });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'AI analysis temporarily unavailable' });
  }
});

// Endpoint for smart reminders.
router.post('/reminders', authMiddleware, async (req, res) => {
  try {
    const { tasks } = req.body;
    if (!tasks?.length) {
      return res.json({ reminders: "Add tasks for AI reminders." });
    }
    const prompt = getPrompts.reminders(tasks);
    console.log("Reminders Prompt:", prompt);
    const result = await queryHuggingFace(prompt);
    res.json({ reminders: result.generated_text.trim(), attempts: result.attempts });
  } catch (error) {
    console.error('Reminders error:', error);
    res.status(500).json({ error: 'AI reminders temporarily unavailable' });
  }
});

module.exports = router;
