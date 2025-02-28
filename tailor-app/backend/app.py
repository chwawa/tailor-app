from flask import Flask, request, jsonify
from flask_cors import CORS
import cohere
import os
from dotenv import load_dotenv
from azure.storage.blob import BlobServiceClient

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for development

# Initialize Cohere client
co = cohere.ClientV2(
    api_key=os.getenv('COHERE_API_KEY'))
CHAT_MODEL = "command-r-08-2024"

# Prompt templates
TEMPLATES = {
    'basic_chat': {
        'system_prompt': "You are a helpful fashion assistant.",
        'temperature': 0.7,
        'max_tokens': 300
    },
    'expert_mode': {
        'system_prompt': "You are an expert programmer focused on providing technical solutions.",
        'temperature': 0.3,
        'max_tokens': 500
    }
}

@app.route('/', methods=['GET'])
def home():
    return "Hello, World!"

@app.route('/api/generate', methods=['POST'])
def generate_response():
    data = request.json
    user_prompt = data.get('prompt', '')
    template_name = data.get('template', 'basic_chat')
    
    try:
        template = TEMPLATES[template_name]
        
        response = co.chat(
            model=CHAT_MODEL,
            messages=[
                {"role": "system", "content": template['system_prompt']},
                {"role": "user", "content": user_prompt}
            ],
            temperature=template['temperature'],
            max_tokens=template['max_tokens']
        )
        
        return jsonify({
            'response': response.message.content[0].text
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host='0.0.0.0', port=port)