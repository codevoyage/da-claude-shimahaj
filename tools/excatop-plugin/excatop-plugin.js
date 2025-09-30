import DA_SDK from 'https://da.live/nx/utils/sdk.js';

(async function init() {
  const { context, token, actions } = await DA_SDK;

  // Get form elements
  const form = document.getElementById('excatop-plugin-form');
  const sourceUrlInput = document.getElementById('plugin-source-url');
  const catalyzeBtn = document.getElementById('plugin-catalyze-btn');
  const catalyzeCloseBtn = document.getElementById('plugin-catalyze-close-btn');
  const statusDiv = document.getElementById('plugin-status');

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

  // Catalyze content from URL
  async function catalyzeContent(sourceUrl) {
    try {
      // Real catalyze endpoint
      const catalyzeEndpoint = 'https://excatop-fapp.azurewebsites.net/api/map';

      const catalyzeResponse = await fetch(catalyzeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: sourceUrl,
          model: 'claude-sonnet-4',
        }),
      });

      if (!catalyzeResponse.ok) {
        throw new Error(`Catalyze service error: ${catalyzeResponse.status}`);
      }

      const catalyzeData = await catalyzeResponse.json();
      return catalyzeData.html || catalyzeData.content || catalyzeData;
    } catch (error) {
      console.error('Catalyze error:', error);
      throw error;
    }
  }

  // Handle catalyze action
  async function handleCatalyze(shouldClose = false) {
    const sourceUrl = sourceUrlInput.value;

    if (!sourceUrl) {
      showStatus('Please enter a source URL', 'error');
      return;
    }

    try {
      // Disable buttons
      catalyzeBtn.disabled = true;
      catalyzeCloseBtn.disabled = true;
      catalyzeBtn.textContent = 'Processing...';
      catalyzeCloseBtn.textContent = 'Processing...';

      showStatus('Catalyzing content...', 'loading');

      // Get content from catalyze service
      const generatedHtml = await catalyzeContent(sourceUrl);

      // Send content to document
      if (generatedHtml) {
        actions.sendHTML(generatedHtml);
        showStatus('Content inserted successfully!', 'success');

        // Clear the input
        sourceUrlInput.value = '';

        // Close library if requested
        if (shouldClose && actions.closeLibrary) {
          setTimeout(() => {
            actions.closeLibrary();
          }, 1000); // Small delay to show success message
        }
      } else {
        throw new Error('No content received from catalyze service');
      }
    } catch (error) {
      console.error('Plugin catalyze error:', error);
      showStatus(`Error: ${error.message}`, 'error');
    } finally {
      // Re-enable buttons
      catalyzeBtn.disabled = false;
      catalyzeCloseBtn.disabled = false;
      catalyzeBtn.textContent = 'Insert';
      catalyzeCloseBtn.textContent = 'Insert & Close';
    }
  }

  // Handle form submission (Insert button)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleCatalyze(false);
  });

  // Handle Insert & Close button
  catalyzeCloseBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    await handleCatalyze(true);
  });

  // Log context for debugging
  console.log('DA Plugin Context:', context);
  console.log('DA Token available:', !!token);
  console.log('Available actions:', Object.keys(actions || {}));
}());
