<?php
$editorUrl = getenv('EMAIL_BUILDER_EDITOR_URL') ?: './email-builder/index.html';
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>EmailBuilder PHP bridge</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; color: #202124; }
    .layout { display: grid; grid-template-columns: 280px 1fr; min-height: 100vh; }
    aside { border-right: 1px solid #ddd; padding: 16px; background: #fafafa; }
    main { min-width: 0; }
    iframe { width: 100%; height: 100vh; border: 0; display: block; }
    button, input { font: inherit; }
    button { width: 100%; margin: 4px 0; padding: 8px 10px; border: 1px solid #ccc; background: white; cursor: pointer; text-align: left; }
    button.primary { background: #0b57d0; color: white; border-color: #0b57d0; text-align: center; }
    button:disabled { opacity: .55; cursor: not-allowed; }
    label { display: block; margin: 14px 0 6px; font-weight: 700; }
    .section { margin-bottom: 18px; }
    .status { min-height: 20px; color: #555; font-size: 13px; }
    .image-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .image-grid button { padding: 0; border: 0; background: transparent; }
    .image-grid img { width: 100%; aspect-ratio: 1; object-fit: cover; border: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="layout">
    <aside>
      <h1>Email templates</h1>

      <div class="section">
        <label for="templates">Templates</label>
        <div id="templates"></div>
      </div>

      <div class="section">
        <button class="primary" id="saveButton" disabled>Save JSON + HTML</button>
        <button id="previewButton" disabled>Send preview</button>
        <button id="htmlButton" disabled>Show HTML tab</button>
      </div>

      <div class="section">
        <label for="imageInput">Upload image</label>
        <input id="imageInput" type="file" accept="image/*">
        <p class="status">Select an image block in the editor, then upload or click an image.</p>
        <div class="image-grid" id="images"></div>
      </div>

      <p class="status" id="status">Loading templates...</p>
    </aside>

    <main>
      <iframe id="editor" src="<?php echo htmlspecialchars($editorUrl, ENT_QUOTES); ?>"></iframe>
    </main>
  </div>

  <script>
    const iframe = document.getElementById('editor');
    const templatesEl = document.getElementById('templates');
    const imagesEl = document.getElementById('images');
    const statusEl = document.getElementById('status');
    const saveButton = document.getElementById('saveButton');
    const previewButton = document.getElementById('previewButton');
    const htmlButton = document.getElementById('htmlButton');
    const imageInput = document.getElementById('imageInput');

    const state = {
      currentTemplate: null,
      document: null,
      html: '',
      editorReady: false,
    };

    function setStatus(message) {
      statusEl.textContent = message;
    }

    function postToEditor(message) {
      iframe.contentWindow.postMessage({ source: 'email-builder-host', ...message }, '*');
    }

    function setEditorState(payload) {
      state.document = payload.document;
      state.html = payload.html || '';
      saveButton.disabled = !state.document;
      previewButton.disabled = !state.html;
      htmlButton.disabled = !state.document;
    }

    async function loadTemplates() {
      const response = await fetch('api/templates.php');
      const templates = await response.json();
      templatesEl.innerHTML = '';

      templates.forEach((template) => {
        const button = document.createElement('button');
        button.textContent = template.title || template.id;
        button.addEventListener('click', () => {
          state.currentTemplate = template;
          postToEditor({ type: 'emailbuilder:load', document: template.document });
          setStatus(`Loaded ${button.textContent}`);
        });
        templatesEl.appendChild(button);
      });

      if (templates[0] && state.editorReady) {
        state.currentTemplate = templates[0];
        postToEditor({ type: 'emailbuilder:load', document: templates[0].document });
      }
    }

    async function saveTemplate() {
      if (!state.currentTemplate || !state.document) return;

      const response = await fetch('api/templates.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: state.currentTemplate.id,
          title: state.currentTemplate.title,
          document: state.document,
          html: state.html,
        }),
      });
      const result = await response.json();
      setStatus(result.ok ? 'Saved JSON and rendered HTML.' : result.error || 'Save failed.');
    }

    async function sendPreview() {
      const to = window.prompt('Preview email address');
      if (!to || !state.html) return;

      const response = await fetch('api/send-preview.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, html: state.html }),
      });
      const result = await response.json();
      setStatus(result.message || result.error || 'Preview request complete.');
    }

    async function uploadImage(file) {
      const body = new FormData();
      body.append('image', file);

      const response = await fetch('api/images.php', { method: 'POST', body });
      const result = await response.json();
      if (!result.url) {
        setStatus(result.error || 'Image upload failed.');
        return;
      }

      addImage(result.url);
      postToEditor({ type: 'emailbuilder:set-selected-image-url', url: result.url });
      setStatus('Image URL sent to selected image block.');
    }

    function addImage(url) {
      const button = document.createElement('button');
      const image = document.createElement('img');
      image.src = url;
      image.alt = '';
      button.appendChild(image);
      button.addEventListener('click', () => {
        postToEditor({ type: 'emailbuilder:set-selected-image-url', url });
        setStatus('Image URL sent to selected image block.');
      });
      imagesEl.prepend(button);
    }

    window.addEventListener('message', (event) => {
      const message = event.data;
      if (!message || message.source !== 'email-builder-js') return;

      if (message.type === 'emailbuilder:ready') {
        state.editorReady = true;
        setEditorState(message);
        loadTemplates().catch((error) => setStatus(error.message));
        return;
      }

      if (message.type === 'emailbuilder:change' || message.type === 'emailbuilder:loaded' || message.type === 'emailbuilder:state') {
        setEditorState(message);
        return;
      }

      if (message.type === 'emailbuilder:error') {
        setStatus(message.message || 'Editor bridge error.');
      }
    });

    saveButton.addEventListener('click', () => saveTemplate().catch((error) => setStatus(error.message)));
    previewButton.addEventListener('click', () => sendPreview().catch((error) => setStatus(error.message)));
    htmlButton.addEventListener('click', () => postToEditor({ type: 'emailbuilder:select-tab', tab: 'html' }));
    imageInput.addEventListener('change', () => {
      const file = imageInput.files && imageInput.files[0];
      if (file) uploadImage(file).catch((error) => setStatus(error.message));
    });
  </script>
</body>
</html>
