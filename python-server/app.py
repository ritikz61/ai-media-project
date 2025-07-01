# python-server/app.py
# The new Python backend for the AI Media Generator (Updated for CPU/GPU flexibility)

import os
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import torch
from diffusers import DiffusionPipeline
from PIL import Image
import io

# --- 1. SETUP ---
app = Flask(__name__)
# Allow requests from your frontend (running on a different port)
CORS(app) 

# --- 2. MODEL LOADING (with CPU fallback) ---
# This section will load the AI model into your computer's memory.
# It will try to use the GPU (cuda) if available, otherwise it will use the CPU.
pipeline = None
device = "cpu" # Default to CPU

try:
    print("Checking for compatible GPU...")
    if torch.cuda.is_available():
        print("CUDA (NVIDIA GPU) detected. Setting device to 'cuda'.")
        device = "cuda"
    else:
        print("No compatible NVIDIA GPU found. The model will run on the CPU, which will be slower.")

    print("Loading Stable Diffusion model...")
    model_id = "runwayml/stable-diffusion-v1-5"
    pipeline = DiffusionPipeline.from_pretrained(
        model_id, 
        torch_dtype=torch.float16, 
        use_safetensors=True
    )
    
    # Move the model to the detected device (GPU or CPU)
    pipeline.to(device)
    print(f"Model loaded successfully onto '{device}'.")

except Exception as e:
    print(f"!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    print(f"ERROR: Could not load the model.")
    print(f"This can happen if you are out of memory or there is an installation issue.")
    print(f"Error details: {e}")
    print(f"!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    pipeline = None

# --- 3. API ENDPOINTS ---

@app.route('/api/text-to-image', methods=['POST'])
def text_to_image():
    if pipeline is None:
        return jsonify({"message": "Model is not available. Please check server logs for errors."}), 500

    data = request.get_json()
    prompt = data.get('prompt')

    if not prompt:
        return jsonify({"message": "Prompt is required."}), 400

    print(f"Generating image for prompt: '{prompt}' on device: '{device}'")
    
    try:
        # Generate the image using the loaded pipeline on the correct device
        generator = torch.Generator(device).manual_seed(1024)
        image = pipeline(prompt, generator=generator, num_inference_steps=20).images[0]

        # Convert the image to a byte stream to send back to the frontend
        img_io = io.BytesIO()
        image.save(img_io, 'PNG')
        img_io.seek(0)

        print("Image generated successfully.")
        return send_file(img_io, mimetype='image/png')

    except Exception as e:
        print(f"Error during image generation: {e}")
        return jsonify({"message": f"An error occurred during image generation: {e}"}), 500

# --- 4. SERVER START ---
if __name__ == '__main__':
    # Note: The default Flask port is 5000.
    app.run(host='0.0.0.0', port=5000, debug=True)
