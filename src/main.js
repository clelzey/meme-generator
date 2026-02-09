import '../styles/main.css'
import { createApp } from './app.js'

document.querySelector('#app').innerHTML = `
  <div class="appShell">
    <header class="topBar">
      <div class="brand">
        <div class="brandTitle">Meme Generator</div>
        <div class="brandSubtitle">Upload an image or grab a random template, add text, then export.</div>
      </div>

      <div class="topActions" role="group" aria-label="Main actions">
        <input id="imageUpload" class="srOnly" type="file" accept="image/*" />
        <button id="uploadBtn" class="btn" type="button">Upload image</button>
        <button id="randomBtn" class="btn" type="button">Random template</button>
        <button id="addTextBtn" class="btn" type="button">Add text</button>
        <button id="exportBtn" class="btnPrimary" type="button">Export PNG</button>
      </div>
    </header>

    <main class="mainGrid">
      <section class="canvasPane" aria-label="Canvas editor">
        <div class="canvasFrame">
          <canvas id="memeCanvas" class="memeCanvas" width="800" height="450"></canvas>
        </div>
        <div id="statusBar" class="statusBar" role="status" aria-live="polite"></div>
        <div class="hint">
          Tip: Click a text layer to select it, then drag to reposition on the image.
        </div>
      </section>

      <aside class="sidePane" aria-label="Text controls">
        <div class="panel">
          <div class="panelTitle">Text layers</div>
          <div id="layersEmpty" class="muted">No text layers yet. Click “Add text”.</div>
          <div id="layersList" class="layersList" role="listbox" aria-label="Text layer list"></div>
        </div>

        <div class="panel">
          <div class="panelTitle">Selected layer</div>
          <div id="noSelection" class="muted">Select a text layer to edit it.</div>

          <form id="layerForm" class="form" autocomplete="off">
            <label class="field">
              <span class="fieldLabel">Text</span>
              <textarea id="textValue" class="input textarea" rows="3" placeholder="Enter your meme text"></textarea>
            </label>

            <label class="field">
              <span class="fieldLabel">Font size</span>
              <input id="fontSize" class="input" type="range" min="10" max="120" step="1" />
            </label>

            <label class="field">
              <span class="fieldLabel">Font</span>
              <select id="fontFamily" class="input select">
                <option value="Impact, Arial Black, system-ui, sans-serif">Impact</option>
                <option value="Arial Black, Arial, system-ui, sans-serif">Arial Black</option>
                <option value="system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif">System</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="Courier New, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace">Courier New</option>
              </select>
            </label>

            <div class="twoCol">
              <label class="field">
                <span class="fieldLabel">Fill</span>
                <input id="fillColor" class="input color" type="color" />
              </label>
              <label class="field">
                <span class="fieldLabel">Outline</span>
                <input id="strokeColor" class="input color" type="color" />
              </label>
            </div>

            <label class="field">
              <span class="fieldLabel">Outline width</span>
              <input id="strokeWidth" class="input" type="range" min="0" max="16" step="1" />
            </label>

            <label class="field">
              <span class="fieldLabel">Align</span>
              <select id="textAlign" class="input select">
                <option value="left">Left</option>
                <option value="center" selected>Center</option>
                <option value="right">Right</option>
              </select>
            </label>

            <div class="formActions">
              <button id="deleteLayerBtn" class="btnDanger" type="button">Delete layer</button>
            </div>
          </form>
        </div>
      </aside>
    </main>
  </div>
`

createApp({
  canvas: document.querySelector('#memeCanvas'),
  statusBar: document.querySelector('#statusBar'),
  uploadInput: document.querySelector('#imageUpload'),
  uploadBtn: document.querySelector('#uploadBtn'),
  randomBtn: document.querySelector('#randomBtn'),
  addTextBtn: document.querySelector('#addTextBtn'),
  exportBtn: document.querySelector('#exportBtn'),
  layersList: document.querySelector('#layersList'),
  layersEmpty: document.querySelector('#layersEmpty'),
  noSelection: document.querySelector('#noSelection'),
  layerForm: document.querySelector('#layerForm'),
  fields: {
    textValue: document.querySelector('#textValue'),
    fontSize: document.querySelector('#fontSize'),
    fontFamily: document.querySelector('#fontFamily'),
    fillColor: document.querySelector('#fillColor'),
    strokeColor: document.querySelector('#strokeColor'),
    strokeWidth: document.querySelector('#strokeWidth'),
    textAlign: document.querySelector('#textAlign'),
  },
  deleteLayerBtn: document.querySelector('#deleteLayerBtn'),
})
