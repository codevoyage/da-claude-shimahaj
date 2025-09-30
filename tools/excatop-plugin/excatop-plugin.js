import DA_SDK from 'https://da.live/nx/utils/sdk.js';

// Import aem2prose function from DA helpers
async function aem2prose(doc) {
  // Fix BRs
  const brs = doc.querySelectorAll('p br');
  brs.forEach((br) => {
    br.remove();
  });

  // Helper function to get table representation of blocks
  function getTable(block) {
    const getBlockName = (blk) => {
      const classes = blk.className.split(' ');
      const name = classes.shift();
      return classes.length > 0 ? `${name} (${classes.join(', ')})` : name;
    };

    const handleRow = (row, maxCols, table) => {
      const tr = document.createElement('tr');
      const cells = [...row.children];
      cells.forEach((cell, idx) => {
        const td = document.createElement('td');
        if (cells.length < maxCols && idx === cells.length - 1) {
          td.setAttribute('colspan', maxCols - idx);
        }
        td.innerHTML = cells[idx].innerHTML;
        tr.append(td);
      });
      table.append(tr);
    };

    const name = getBlockName(block);
    const rows = [...block.children];
    const maxCols = rows.reduce((cols, row) => (
      row.children.length > cols ? row.children.length : cols), 0);
    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    const td = document.createElement('td');
    td.setAttribute('colspan', maxCols);
    td.append(name);
    headerRow.append(td);
    table.append(headerRow);
    rows.forEach((row) => {
      handleRow(row, maxCols, table);
    });
    return table;
  }

  const para = () => document.createElement('p');

  // Fix blocks
  const blocks = doc.querySelectorAll('main > div > div, da-loc-deleted > div, da-loc-added > div, da-loc-deleted.da-group > div > div, da-loc-added.da-group > div > div');
  blocks.forEach((block) => {
    if (block.className?.includes('loc-')) return;
    const table = getTable(block);
    block.parentElement.replaceChild(table, block);
    table.insertAdjacentElement('beforebegin', para());
    table.insertAdjacentElement('afterend', para());
  });

  // Fix pictures
  const imgs = doc.querySelectorAll('picture img');
  imgs.forEach((img) => {
    const pic = img.closest('picture');
    pic.parentElement.replaceChild(img, pic);
  });

  // Fix three dashes
  const paras = doc.querySelectorAll('p');
  paras.forEach((p) => {
    if (p.textContent.trim() === '---') {
      const hr = document.createElement('hr');
      p.parentElement.replaceChild(hr, p);
    }
  });

  // Fix sections
  const sections = doc.body.querySelectorAll('main > div');
  return [...sections].map((section, idx) => {
    const fragment = new DocumentFragment();
    if (idx > 0) {
      const hr = document.createElement('hr');
      fragment.append(para(), hr, para());
    }
    fragment.append(...section.querySelectorAll(':scope > *'));
    return fragment;
  });
}

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
      return catalyzeData.result?.htmlOutput;
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

      // Process and send content to document
      if (generatedHtml) {
        try {
          // Parse HTML and process through aem2prose
          const doc = new DOMParser().parseFromString(generatedHtml, 'text/html');
          const fragments = await aem2prose(doc);

          // Convert fragments back to HTML
          const tempDiv = document.createElement('div');
          fragments.forEach((fragment) => {
            tempDiv.appendChild(fragment);
          });

          const processedHtml = tempDiv.innerHTML;
          actions.sendHTML(processedHtml);
          showStatus('Content inserted successfully!', 'success');
        } catch (error) {
          console.error('Error processing HTML:', error);
          // Fallback to original HTML if processing fails
          actions.sendHTML(generatedHtml);
          showStatus('Content inserted (processing failed, using original)', 'success');
        }

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
