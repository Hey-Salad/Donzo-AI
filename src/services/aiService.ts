import { OpenAIClient, AzureKeyCredential } from '@azure/openai';

class AzureAIService {
  private client: OpenAIClient;

  constructor() {
    const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
    const key = import.meta.env.VITE_AZURE_OPENAI_KEY;

    this.client = new OpenAIClient(endpoint, new AzureKeyCredential(key));
  }

  async generateResponse(prompt: string) {
    try {
      const deploymentId = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT;
      const response = await this.client.getChatCompletions(deploymentId, [
        { role: 'user', content: prompt }
      ]);

      return response.choices[0].message?.content || '';
    } catch (error) {
      console.error('Azure AI generation failed', error);
      throw error;
    }
  }
}

export default new AzureAIService();
