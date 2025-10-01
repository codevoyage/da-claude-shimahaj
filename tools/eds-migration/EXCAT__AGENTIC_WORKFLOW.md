# Agentic Web Content Processing Workflow

## Overview
This workflow transforms web pages into structured content using Adobe Edge Delivery Services (EDS) block library. It processes web content through multiple AI agents to extract, analyze, map, and convert content into various formats.

## Workflow Steps

### 1. Web Scraping Agent
**Purpose**: Extract HTML content and visual context from web pages. Do not try to do any analysis on the content for now, you just need to extract the HTML.

**Actions**:
- Navigate to the target URL using a headless browser (Playwright/Puppeteer)
- Wait for page to fully load (networkidle2)
- Scroll through the page to trigger lazy-loaded content
- Capture screenshot of the full page
- Remove all useless DOM elements (script, style, ...)
- Extract the complete HTML body content
- Always close the browser at the end

**Output**: 
- RAW HTML content (unmodified) => content-raw.html
- Full page screenshot taken by Playwright

### 2. Content Analysis Agent
**Purpose**: Convert HTML into structured JSON representation

**Actions**:
- Look at file ./tools/eds-migration/eds-content-zod-mapping.js to get a precise representation of the expected content in an EDS project
- Analyze the RAW HTML content and the screenshot of the webpage (using AI vision capabilities)
- Extract all text content without modification
- Exclude header and footer elements
- Preserve exact text content without adding or removing any content
- Include media URLs for images and videos (including SVGs and videos)

**Output**: Structured JSON representation of page content => content-raw.json

### 3. EDS Mapping Agent
**Purpose**: Map the content from the json structure in Markdown format structuring content in tables as described in the block library json structure. Use block descriptions to find the best match and example structures to represent the content in tables like in the examples. Put free content that is not part of content structures as free content not in tables.
For the format of the tables, use the exact format shown in the block library examples

**Actions**:
- Have a look at tools/eds-migration/sta-boilerplate-block-library-no-images.json file as it contains a set of EDS blocks you have to use for the mapping. The JSON structure contains description and examples for each block so you better understand how to map the content.
- Analyze the JSON representation of the webpage and the screenshot against available block types
- Map content sections to appropriate EDS blocks
- Ensure proper block hierarchy and relationships
- Handle complex content structures and nested elements
- Generate markdown representation using EDS block syntax

**Important Rules**:
- Use + and - characters for table borders
- Use | characters for column separators
- Follow the exact format pattern from the examples in the block library
- The header row should be bold and merged (if multiple columns)
- The header section is delimited by section delimiters (=)
- Blocks can not be nested in other blocks.
- The content in cells can be a full Markdown document again. note, that the cell boundaries (|) need to exactly match with the column markers (+) in the row delimiters, if the cell content contains |, otherwise the correct layout of the table can't be guaranteed.

**Example of block table format**:
+-----------------------------------------------+
| **Block Name**                                |
+===============================================+
| Content in first cell                         |
+-----------------------------------------------+
| Content in second cell                        |
+-----------------------------------------------+

**Output**: Markdown content using EDS block syntax => content.md 

### 4. HTML Conversion Agent
**Purpose**: Convert EDS markdown to semantic HTML

**Actions**:
- Process the EDS markdown through Adobe Helix HTML Pipeline
- Apply proper HTML structure and semantics
- Handle URL processing (make relative URLs absolute)
- Generate clean, semantic HTML output
- Ensure proper accessibility and structure

**CLI Tool Available**: `tools/eds-migration/cli.js convert-html`
```bash
# Convert markdown to HTML with URL processing and saves it to content.html
node tools/eds-migration/cli.js convert-html ./content.md --url https://example.com > ./content.html
```

**Output**: Semantic HTML content => content.html

### 5. Document Authoring Upload Agent (Optional)
**Purpose**: Upload converted content to Adobe Document Authoring

**Actions**:
- Generate upload path from original URL
- Upload HTML content to Document Authoring platform
- Handle authentication and API calls
- Provide upload confirmation and URL

**CLI Tool Available**: `tools/eds-migration/cli.js upload-da`
```bash
# Upload HTML to Adobe Document Authoring
node tools/eds-migration/cli.js upload-da ./content.html --owner myorg --repo myrepo --prefix content --url https://example.com
```

**Output**: Upload confirmation and URL

### 6. Document Authoring Download Agent (Optional)
**Purpose**: Download content from Adobe Document Authoring for review or further processing

**Actions**:
- Fetch content from Document Authoring using bearer token authentication
- Save content to local file or output to console
- Support for environment variable or command-line token

**CLI Tool Available**: `tools/eds-migration/cli.js dl-da`
```bash
# Download content from DA to console (requires DA_BEARER_TOKEN in .env)
node tools/eds-migration/cli.js dl-da https://admin.da.live/source/aemysites/excatop/cl-code/stryker-com/ch/en/index.html

# Download and save to file
node tools/eds-migration/cli.js dl-da https://admin.da.live/source/aemysites/excatop/cl-code/stryker-com/ch/en/index.html --output downloaded.html

# Provide token via command line
node tools/eds-migration/cli.js dl-da https://admin.da.live/source/aemysites/excatop/cl-code/stryker-com/ch/en/index.html --token YOUR_BEARER_TOKEN --output content.html
```

**Output**: Downloaded HTML content

**Authentication**:
- Token can be provided via `--token` flag or `DA_BEARER_TOKEN` environment variable
- Store your DA bearer token in `.env` file:
  ```
  DA_BEARER_TOKEN="your_token_here"
  ```

## Key Features

### Multi-Model Support
- Support for multiple AI models (Azure OpenAI, AWS Bedrock)
- Model selection via command line or API
- Fallback to environment-configured models

### Error Handling
- Robust error handling at each step
- Graceful degradation (e.g., continue with HTML if screenshot fails)
- Detailed error reporting and logging

### Content Processing
- Handles dynamic/lazy-loaded content
- Preserves exact text content
- Maintains structural relationships
- Processes media content (images, videos, SVGs)

### Output Formats
- Structured JSON
- EDS Markdown
- Semantic HTML
- Optional Document Authoring upload

## Usage Context for Claude

When executing this workflow, you would:

1. **Use web scraping tools** (like Playwright) to extract HTML and screenshots
2. **Apply AI vision capabilities** to analyze both text and visual content
3. **Reference the EDS block library** to understand available block types
4. **Map content systematically** to appropriate EDS blocks
5. **Use CLI tools for final processing**:

   ```bash
   # Fix any table formatting issues
   node tools/eds-migration/cli.js fix-tables ./content.md > ./fixed-content.md

   # Convert to HTML with URL processing
   node tools/eds-migration/cli.js convert-html ./fixed-content.md --url https://example.com > content.html

   # Upload to Document Authoring (optional)
   node tools/eds-migration/cli.js upload-da ./content.html --owner myorg --repo myrepo --prefix pages

   # Download from Document Authoring for review (optional)
   node tools/eds-migration/cli.js dl-da https://admin.da.live/source/myorg/myrepo/pages/content.html --output downloaded.html
   ```

6. **Generate clean outputs** in the requested formats

### Best Practices for Tool Usage

- **Never ever run `npm install`** in `tools/eds-migration/`! Never try to do `cd tools/eds-migration/`
- **Use absolute paths**
- **Use the help command** (`node tools/eds-migration/cli.js help`) when unsure about syntax

The workflow is designed to be modular, allowing each step to be executed independently or as part of the complete pipeline.
