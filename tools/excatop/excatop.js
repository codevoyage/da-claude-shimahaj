import DA_SDK from 'https://da.live/nx/utils/sdk.js';

(async function init() {
  const { context, token } = await DA_SDK;

  // Get form elements
  const form = document.getElementById('excatop-form');
  const sourceUrlInput = document.getElementById('source-url');
  const catalyzeBtn = document.getElementById('catalyze-btn');
  const statusDiv = document.getElementById('status');

  /**
   * Generate upload path from URL
   * @param {string} url - Original URL to extract path from
   * @returns {string} - Upload path based on hostname and URL path
   */
  function generateUploadPathFromUrl(url) {
    try {
      const urlObj = new URL(url);
      let { hostname } = urlObj;
      let { pathname } = urlObj;

      // Remove 'www.' prefix if present
      hostname = hostname.replace(/^www\./, '');

      // Remove leading slash from pathname
      pathname = pathname.replace(/^\/+/, '');

      // If pathname is empty or just '/', use 'index.html'
      if (!pathname || pathname === '') {
        pathname = 'index.html';
      } else if (pathname.endsWith('/')) {
        // If pathname ends with '/', it's a directory - convert to index.html
        pathname += 'index.html';
      } else if (!pathname.endsWith('.html')) {
        // If pathname doesn't end with .html, add it
        // Check if there's already an extension
        const lastDot = pathname.lastIndexOf('.');
        const lastSlash = pathname.lastIndexOf('/');

        // If no extension or extension is before the last slash (directory), add .html
        if (lastDot === -1 || lastDot < lastSlash) {
          pathname += '.html';
        }
      }

      // Replace dots with hyphens for DA compatibility (except .html extension)
      // First handle the hostname - replace all dots with hyphens
      let daCompatibleHostname = hostname.replace(/\./g, '-');

      // Handle pathname - replace dots with hyphens but preserve .html extension
      let daCompatiblePathname = pathname;
      if (pathname.endsWith('.html')) {
        // Remove .html, replace dots, then add .html back
        const withoutExtension = pathname.slice(0, -5); // Remove '.html'
        let cleanedPath = withoutExtension.replace(/\./g, '-');

        // Collapse multiple consecutive hyphens and remove trailing hyphens
        cleanedPath = cleanedPath.replace(/-+/g, '-').replace(/-+$/, '');

        daCompatiblePathname = `${cleanedPath}.html`;
      } else {
        // No .html extension, replace all dots
        daCompatiblePathname = pathname.replace(/\./g, '-');

        // Collapse multiple consecutive hyphens and remove trailing hyphens
        daCompatiblePathname = daCompatiblePathname.replace(/-+/g, '-').replace(/-+$/, '');
      }

      // Collapse multiple consecutive hyphens into single hyphens for hostname (DA doesn't like --)
      daCompatibleHostname = daCompatibleHostname.replace(/-+/g, '-');

      // Combine with prefix and hostname and pathname
      return `/aemysites/excatop/${daCompatibleHostname}/${daCompatiblePathname}`;
    } catch (error) {
      console.warn(`Failed to generate upload path from URL: ${url}`, error);
      return null;
    }
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

  // Create content in DA using FormData approach
  async function createContentInDA(html, targetPath) {
    try {
      // Use DA's admin source API with FormData (based on DA documentation)
      // Ensure the path ends with .html for documents
      const fullPath = targetPath.endsWith('.html') ? targetPath : `${targetPath}.html`;
      const daApiUrl = `https://admin.da.live/source${fullPath}`;

      // Create HTML blob and FormData as per DA documentation
      const htmlBlob = new Blob([html], { type: 'text/html' });
      const formData = new FormData();
      formData.append('data', htmlBlob);

      const response = await fetch(daApiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - let browser set it for FormData
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`DA API error: ${response.status} ${response.statusText}`);
      }

      return { success: true, path: fullPath };
    } catch (error) {
      console.error('Error creating content in DA:', error);
      throw error;
    }
  }

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const sourceUrl = sourceUrlInput.value;
    // Generate target path from URL
    const targetPath = generateUploadPathFromUrl(sourceUrl) || '/aemysites/excatop/excatop-output';

    if (!sourceUrl) {
      showStatus('Please enter a source URL', 'error');
      return;
    }

    try {
      catalyzeBtn.disabled = true;
      catalyzeBtn.textContent = 'Catalyzing...';
      showStatus(`Processing your request... Target: ${targetPath}`, 'loading');

      // Step 1: Call the catalyze endpoint
      showStatus('Fetching content from source URL...', 'loading');

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
      const generatedHtml = catalyzeData.result?.htmlOutput;

      if (!generatedHtml) {
        showStatus('No HTML output from catalyze service', 'error');
        return;
      }

      // Step 2: Create content in DA
      showStatus('Creating content in DA...', 'loading');

      await createContentInDA(generatedHtml, targetPath);

      // Step 3: Show success and open DA
      const daUrlPath = targetPath.endsWith('.html') ? targetPath.slice(0, -5) : targetPath;
      const daUrl = `https://da.live/edit#${daUrlPath}`;
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
