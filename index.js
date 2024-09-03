import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';


import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const port = 5000;
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

let generatedText = '';

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function run(userPrompt) {
  try {
    const model = await genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `${userPrompt}`;

    const result = await model.generateContent(prompt);
    generatedText = await result.response.text();
    generatedText = generatedText.replace(/\*/g, '');
    generatedText = generatedText.replace(/\#/g, '');
    
  } catch (error) {
    console.error('Error generating content:', error);
  }
}

// POST route to receive data and trigger content generation
app.post('/', async (req, res) => {
  const { data } = req.body;
  console.log("n");
  
  if (!data) {
    return res.status(400).send('Data is required');
  }

  try {
    await run(data);
    res.status(200).json({ message: 'Data received and processed successfully' });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).send('An internal server error occurred');
  }
});

// GET route to return the generated text
app.get('/', (req, res) => {
  res.json({ data: generatedText });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
