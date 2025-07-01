# 🤖 AI Media Generator

A full-stack AI-powered media generation web app built using **React (Vite)** for the frontend and **Flask + Diffusers** for the backend. Users can generate images and videos from text and image prompts using state-of-the-art AI models.

---

## 🌐 Live Demo

🔗 [https://yashdhanani.github.io/ai-media-project/](https://yashdhanani.github.io/ai-media-project/)

---

## 🧠 Features

| Tool | Description |
|------|-------------|
| 🎨 **Text-to-Image (T2I)** | Create stunning images from text descriptions |
| 🎥 **Text-to-Video (T2V)** | Generate video clips from a simple text prompt *(planned)* |
| 🎞️ **Image-to-Video (I2V)** | Animate a static image to create a short video *(planned)* |
| 🎵 **Image-to-Video + Audio (I2V+A)** | Animate an image and add a soundtrack *(planned)* |
| ✨ **Text + Image to Video (T+I2V)** | Use a prompt to guide the animation of an image *(planned)* |
| 🔊 **Text + Image to Video + Audio (T+I2V+A)** | Guide the animation and add a narrated soundtrack *(planned)* |

---

## 🖼️ Text-to-Image Backend (Python)

The Python backend uses 🤗 Hugging Face's `diffusers` library with `Stable Diffusion v1.5`. It supports both CPU and GPU execution.

### 📂 Backend Directory: `python-server/`

#### 📦 Dependencies

Install with:

```bash
pip install -r requirements.txt

requirements.txt:

nginx

Flask
Flask-Cors
torch
diffusers
transformers
accelerate
safetensors

🚀 Run the Flask Server

cd python-server
python app.py
The server will start on http://localhost:5000

🔄 API Endpoint
POST /api/text-to-image

json

{
  "prompt": "a cyberpunk city at night with glowing lights"
}
Returns: image/png (generated AI image)

⚙️ Frontend (React + Vite)
📂 Frontend Directory: client/

📦 Setup

cd client
npm install

🚀 Run Locally

npm run dev
The frontend will start on http://localhost:5173

Make sure the backend is also running at http://localhost:5000 or change the API URL in your React app.

🌐 GitHub Pages Deployment

Vite is configured to deploy to GitHub Pages with:

js

// vite.config.js
export default defineConfig({
  base: '/ai-media-project/',
});

📦 Deployment via GitHub Actions

.github/workflows/deploy.yml handles automatic CI/CD:

Builds React app

Uploads artifact

Deploys to GitHub Pages

🗂️ Project Structure
csharp

ai-media-project/
├── client/                   # Frontend (React + Vite)
│   ├── public/
│   ├── src/
│   └── vite.config.js
│
├── python-server/            # Backend (Flask API)
│   ├── app.py
│   └── requirements.txt
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
└── README.md

🔐 Environment Notes

Backend supports CPU by default, but will use GPU if available (torch.cuda.is_available()).

Uses the Hugging Face model: runwayml/stable-diffusion-v1-5.

Port configuration: Flask runs on 5000, Vite runs on 5173.

🎯 Roadmap
✅ Text-to-Image (T2I) working via Flask + Diffusers

🚧 Add other AI tools (T2V, I2V, etc.)

🚧 Upload image/audio support

🚧 Media download button

🚧 User account and project save

🧑‍💻 Developed By Yash Dhanani

🔗 GitHub

💼 Founder of AppyGrowth

🧠 AI, Web & Full-Stack Developer

📄 License
© 2025 Yash Dhanani. All Rights Reserved.

This project is intended for learning, experimentation, and demo purposes only.
