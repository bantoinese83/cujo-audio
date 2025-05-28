# <img src="/public/images/cujo-dog-logo.png" alt="Cujo Audio Logo" width="48" style="vertical-align:middle;"/> Cujo Audio

**AI Music Generator – Real-Time, Creative, and Fun**

---

Cujo Audio is a modern web app for generating unique music tracks using AI. Powered by the Gemini API (Lyria RealTime), it lets you create, stream, and customize music in real time from simple text prompts. Enjoy a beautiful, interactive UI, advanced prompt builder, and instant playback.

## ✨ Features

- 🎵 **Text-to-Music**: Generate original music from your ideas and prompts
- ⚡ **Real-Time Streaming**: Hear your track as it's created, with low latency
- 🧠 **Prompt Builder**: Build complex prompts with genres, moods, instruments, and more
- 🎚️ **Fine-Tune Controls**: Adjust temperature, guidance, BPM, and more
- 🖼️ **Modern UI**: Glassy, animated, and mobile-friendly design
- 🦴 **Branding**: Custom Cujo logo, vibrant gradients, and smooth animations
- 🔒 **Privacy**: Your music is never stored or shared without your permission

## 📸 Screenshots

> _Add screenshots/gifs here!_

---

## 🚀 Getting Started

1. **Clone the repo:**
   ```bash
   git clone https://github.com/bantoinese83/cujo-audio.git
   cd cujo-audio
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env.local` and add your Gemini API key:
     ```env
     GEMINI_API_KEY=your_gemini_api_key_here
     # or
     NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
     ```
4. **Run the app locally:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```
5. **Open in browser:**
   Visit [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Environment Variables

- `GEMINI_API_KEY` or `NEXT_PUBLIC_GEMINI_API_KEY`: Your Google Gemini API key for music generation

---

## 📁 Folder Structure

- `app/` – Next.js app routes and pages
- `components/` – UI components (PromptBuilder, MusicGenerator, etc.)
- `hooks/` – Custom React hooks
- `lib/` – Utilities, types, and design system
- `store/` – Global state management
- `public/` – Static assets (logo, images)
- `services/` – API and Gemini integration

---

## 🛠️ Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Google Gemini API (Lyria RealTime)](https://ai.google.dev/)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)
- TypeScript, Vercel Analytics, and more

---

## 🙏 Credits & License

- Logo: Custom Cujo dog logo
- Music generation: Google Gemini API (Lyria)
- UI: Inspired by modern music and AI apps

MIT License. See [LICENSE](LICENSE) for details.

---

## 📬 Contact & Links

- [GitHub Issues](https://github.com/your-username/cujo-audio/issues)
- [Project Website](https://cujo-audio.vercel.app/)
- [Google Gemini API](https://ai.google.dev/)

---

> Made with ❤️ by the Cujo Audio team 