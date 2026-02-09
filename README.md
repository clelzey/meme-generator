# Meme Generator

A browser-based meme generator built with vanilla JavaScript and [Vite](https://vite.dev). Upload your own image or pick a random template, add customizable text layers, then export your meme as a PNG.

## Features

- **Image source**: Upload an image from your device or load a random meme template from the [Memegen API](https://memegen.link/).
- **Text layers**: Add multiple text overlays with drag-to-reposition on the canvas.
- **Customization**: For each layer, adjust:
  - Text content
  - Font (Impact, Arial Black, System, Georgia, Courier New)
  - Font size (10–120px)
  - Fill and outline (stroke) colors
  - Outline width and text alignment
- **Export**: Download the final composition as a PNG file.

## Prerequisites

- **Node.js** (v18 or later recommended) — [Download](https://nodejs.org/)
- A modern browser (Chrome, Firefox, Edge, Safari)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/meme-generator.git
cd meme-generator
```

Replace `YOUR_USERNAME` with your GitHub username or your repo URL.

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

Vite will start a local server (usually at `http://localhost:5173`) and open the app in your browser. You can edit the code and see changes with hot reload.

### 4. Build for production (optional)

To create an optimized build for deployment:

```bash
npm run build
```

Output will be in the `dist/` folder. To preview the production build locally:

```bash
npm run preview
```

## Project structure

```
meme-generator/
├── index.html          # Entry HTML
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
├── public/             # Static assets
├── src/
│   ├── main.js         # App shell and DOM setup
│   ├── app.js          # Main app logic and UI wiring
│   ├── canvas.js       # Canvas drawing and image handling
│   ├── textOverlay.js  # Text overlay layout and hit-testing
│   ├── api.js          # Memegen API and image fetching
│   └── export.js       # PNG export
└── styles/
    └── main.css        # Styles
```

## Scripts

| Command           | Description                    |
|-------------------|--------------------------------|
| `npm run dev`     | Start dev server with HMR      |
| `npm run build`   | Build for production           |
| `npm run preview` | Preview production build      |

## Publishing with GitHub Pages

The repo includes a GitHub Actions workflow that builds and deploys the app to GitHub Pages whenever you push to the `master` branch.

### One-time setup

1. **Push the repo to GitHub** (if you haven’t already).

2. **Turn on GitHub Pages** and use the new deployment flow:
   - Open your repo on GitHub → **Settings** → **Pages**.
   - Under **Build and deployment**:
     - **Source**: select **GitHub Actions**.

3. **Trigger a deploy**  
   Push a commit to `master` (or run the workflow from the **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**).  
   The first run may need a few minutes; later runs run on each push to `master`.

4. **Open your site**  
   After the workflow completes, the site will be at:
   ```text
   https://<your-username>.github.io/<repo-name>/
   ```
   Example: if your repo is `https://github.com/jane/meme-generator`, the app is at `https://jane.github.io/meme-generator/`.

### Local production build with the same base (optional)

To preview the same paths as GitHub Pages locally (e.g. at `http://localhost:4173/meme-generator/`):

```bash
npm run build -- --base=/meme-generator/
npm run preview
```

Use your actual repo name instead of `meme-generator` if it’s different.

## License

See the [LICENSE](LICENSE) file in the repository, if present.
