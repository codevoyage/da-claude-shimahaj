import DA_SDK from 'https://da.live/nx/utils/sdk.js';

(async function init() {
  const { context, token, actions } = await DA_SDK;

  // Get form elements
  const form = document.getElementById('excatop-form');
  const sourceUrlInput = document.getElementById('source-url');
  const targetPathInput = document.getElementById('target-path');
  const catalyzeBtn = document.getElementById('catalyze-btn');
  const statusDiv = document.getElementById('status');

  // Set default target path from context if available
  if (context && context.pathname && !targetPathInput.value) {
    targetPathInput.placeholder = context.pathname;
  }

  // Show status message
  function showStatus(message, type = 'loading') {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
  }

  // Hide status message
  // eslint-disable-next-line no-unused-vars
  function hideStatus() {
    statusDiv.style.display = 'none';
  }

  // Create content in DA
  async function createContentInDA(html, targetPath) {
    try {
      // Use DA API to create content
      // Note: This is a simplified example - the actual DA API endpoints may vary
      const daApiUrl = 'https://da.live/api/v1/content';

      const response = undefined; /* await fetch(daApiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: targetPath,
          content: html,
          overwrite: true,
        }),
      }); */

      if (!response.ok) {
        throw new Error(`DA API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating content in DA:', error);
      throw error;
    }
  }

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const sourceUrl = sourceUrlInput.value;
    const targetPath = targetPathInput.value || context?.pathname || '/content/excatop-output';

    if (!sourceUrl) {
      showStatus('Please enter a source URL', 'error');
      return;
    }

    try {
      catalyzeBtn.disabled = true;
      catalyzeBtn.textContent = 'Catalyzing...';
      showStatus('Processing your request...', 'loading');

      // Step 1: Call the catalyze endpoint
      showStatus('Fetching content from source URL...', 'loading');

      // Note: Replace this with your actual catalyze endpoint
      const catalyzeEndpoint = 'https://your-catalyze-service.com/api/catalyze';

      const catalyzeResponse = undefined; /* await fetch(catalyzeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: sourceUrl,
        }),
      }); */

      if (!catalyzeResponse.ok) {
        throw new Error(`Catalyze service error: ${catalyzeResponse.status}`);
      }

      const catalyzeData = await catalyzeResponse.json();
      const generatedHtml = catalyzeData.html || catalyzeData.content || catalyzeData;

      // Step 2: Create content in DA
      showStatus('Creating content in DA...', 'loading');

      const daResult = await createContentInDA(generatedHtml, targetPath);

      // Step 3: Show success and open DA
      const daUrl = `https://da.live${targetPath}`;
      showStatus('', 'success');
      statusDiv.innerHTML = `
        <div>✅ Content successfully created in DA!</div>
        <a href="${daUrl}" target="_blank" class="result-link" id="open-da-link">
          Open in DA →
        </a>
      `;

      // Auto-open in new window
      window.open(daUrl, '_blank');
    } catch (error) {
      console.error('Catalyze error:', error);
      showStatus(`Error: ${error.message}`, 'error');
    } finally {
      catalyzeBtn.disabled = false;
      catalyzeBtn.textContent = 'Catalyze';
    }
  });

  // Log context for debugging
  console.log('DA Context:', context);
  console.log('DA Token available:', !!token);
}());
