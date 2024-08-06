import express from 'express';
import pkg from 'body-parser';
const { json } = pkg;
import cors from 'cors';
import { Ollama } from 'ollama-node';

const app = express();
const port = 5001;

// Enable CORS
app.use(cors());

app.use(json());

let chatConfig = {
  model: "llama2",
  role: "user"
};

app.post('/generate-story', async (req, res) => {
  const prompt = req.body.prompt;
  if (!prompt) {
    return res.json("Empty prompt !!")
  }

  try {
    console.log(`Processing prompt: ${prompt}`);

    const ollama = new Ollama();
    await ollama.setModel("llama2");
    await ollama.setJSONFormat(true);

    const template = `As a project manager, I need an jira story estimation of project days and a list of stories and epics for a project with the following title and details: '${prompt}'. Please provide the response strictly in the JSON format below, ensuring that each epic contains multiple stories. Each story should include a title, description, acceptance criteria, and estimated days. The response should strictly adhere to the following JSON structure:
    {
  "epics": [
    {
      "title": "string",
      "stories": [
        {
          "title": "string",
          "description": "string",
          "acceptance_criteria": "string",
          "estimated_days": "number"
        }
      ]
    }
  ],
  "total_estimated_days": "number"
}

Note - try to create number of story more by breaking points estimate maximum 3 days and break in epics 
`;

    const response = await ollama.generate(template);

    res.json(JSON.parse(response.output) || 'Output is empty!');
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({ error: 'Query failed!' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});