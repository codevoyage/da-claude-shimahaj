# Agentic Web Content Processing Workflow

## Overview
This workflow transforms web pages into structured content using Adobe Edge Delivery Services (EDS) block library. It processes web content through multiple AI agents to extract, analyze, map, convert content into various formats and upload to Adobe AEM DA.
In case you are being asked to migrate multiple page, just execute that workflow in sequence for each URL.

## Workflow Steps

### 1. Web Scraping Agent
**Purpose**: Extract HTML content and visual context from web pages. Do not try to do any analysis on the content for now, you just need to extract the HTML.

**Actions**:
- Get the body HTML and a screenshot of the full page

### 2. Content Analysis Agent
**Purpose**: Convert page state YAML into structured JSON representation

**Actions**:
- Analyze the Page State YAML content and the screenshot of the webpage (using AI vision capabilities)
- Extract all text content without modification
- Exclude header and footer elements
- Preserve exact text content without adding or removing any content
- Include media URLs for images and videos (including SVGs and videos)

**Output**: Structured JSON representation of page content, keep it in memory, do not save it to disk

### 3. EDS Mapping Agent
**Purpose**: Map the content from the json structure in Markdown format structuring content in tables as described in the block library json structure. Use block descriptions to find the best match and example structures to represent the content in tables like in the examples. Put free content that is not part of content structures as free content not in tables.
For the format of the tables, use the exact format shown in the block library examples

**Actions**:
- Analyze the JSON representation of the webpage and the screenshot against available block types
- Map content sections to appropriate EDS blocks
- Ensure proper block hierarchy and relationships
- Handle complex content structures and nested elements
- Generate markdown representation using EDS block syntax

**Important Rules**:
- file @./tools/eds-migration/sta-boilerplate-block-library-no-images.json contains a set of EDS blocks you have to use for the mapping. The JSON structure contains description and examples for each block so you better understand how to map the content.
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

**Output**: Markdown content using EDS block syntax => save it to ./content.md (just overwrites if file already exists)

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

### 5. Upload to Document Authoring Agent
**Purpose**: Upload converted content to Adobe Document Authoring

**Actions**:
- Generate upload path from git repository information (organization + repo) and from original URL
- Upload HTML content to Document Authoring platform
- Handle authentication and API calls
- Provide upload confirmation and URL

**CLI Tool Available**: `tools/eds-migration/cli.js upload-da`
```bash
# Upload HTML to Adobe Document Authoring
node tools/eds-migration/cli.js upload-da ./content.html --owner myorg --repo myrepo --prefix content --url https://example.com
```

**Output**: Upload confirmation and URL

### 6. Style Analysis Agent
**Purpose**: Extract and analyze visual styles from the original webpage to replicate in EDS

**Actions**:
- Use Playwright MCP to navigate to the original URL
- Identify key UI elements (buttons, links, headings, etc.)
- Use `mcp__playwright__browser_evaluate` to extract computed styles from primary elements
- Focus on button styles as they are critical for brand consistency:
  - Extract computed styles for primary buttons (padding, colors, borders, shadows, typography, transitions)
  - Extract styles for secondary/variant buttons if present
  - Document hover and focus states
- Update `./styles/styles.css` with the extracted styles
- Maintain EDS CSS structure while applying brand-specific styling

**Important Notes**:
- Look for distinctive visual features like box-shadows, border-radius, color schemes
- Pay attention to transitions and animations
- Preserve the existing EDS structure in styles.css while updating values
- Test button variants (primary, secondary, disabled states)

**Output**: Updated `./styles/styles.css` file with brand-consistent button styles

### 7. Header Content Extraction Agent
**Purpose**: Extract header/navigation structure and create nav document for EDS

**Actions**:
- Analyze the original page header structure using the extracted HTML and screenshot
- Identify the three main sections of the header:
  1. **Brand section**: Logo image and/or brand text with link to homepage
  2. **Main navigation**: Menu items, dropdowns with nested links
  3. **Tools section**: Action buttons (Subscribe, Search, Login, etc.)
- Create `nav.md` following the EDS 3-section pattern:
  - First section (before first `---`): Brand logo/link
  - Second section (between `---` separators): Navigation menu with nested lists for dropdowns
  - Third section (after second `---`): Tool buttons
- Ensure logo uses image markdown with link: `[![Alt Text](image-url)](link-url)`
- Structure dropdown menus as nested unordered lists
- Convert to HTML using CLI tool
- Upload to DA as `nav.html`

**CLI Tools Available**:
```bash
# Convert nav markdown to HTML
node tools/eds-migration/cli.js convert-html ./nav.md --url https://example.com > ./nav.html

# Upload nav to Document Authoring
node tools/eds-migration/cli.js upload-da ./nav.html --owner myorg --repo myrepo --path nav.html
```

**Important Notes**:
- Reference the example at `https://main--aem-boilerplate--adobe.aem.page/nav.md` for structure
- The header block automatically loads `/nav` by default
- Preserve the exact link structure from the original navigation
- Keep dropdown hierarchies clear with proper indentation

**Example nav.md structure**:
```markdown
[![Brand](logo.png)](/)

---

- Products
  - [Product A](#)
  - [Product B](#)
- [About](/about)
- [Contact](/contact)

---

[Subscribe](#)
```

**Output**: Nav document uploaded to DA at `nav.html`

### 8. Header Styling Agent
**Purpose**: Extract and apply visual styles from the original header to match brand aesthetics

**Actions**:
- Use Playwright MCP to navigate to the original URL
- Extract computed styles from header elements:
  - Nav container (background, height, padding, positioning)
  - Brand/logo section (sizing, spacing)
  - Navigation links (colors, padding, font-size, hover states)
  - Dropdown menus (background, borders, shadows, positioning)
  - Tool buttons (if they need special styling beyond global)
- Update `blocks/header/header.css` with brand-specific styling
- **Critical**: Handle button auto-styling correctly:
  - Nav section links may get auto-converted to `.button` class
  - Add specific CSS to remove button styling from nav section links
  - Keep global button styles for tools section buttons
  - Use more specific selectors like `header nav .nav-sections a.button:any-link`

**Important CSS Specificity Rules**:
```css
/* Remove button styling from nav section links */
header nav .nav-sections a.button:any-link {
  box-shadow: none;
  background-color: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
  margin: 0;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  text-align: left;
  display: inline;
  white-space: normal;
}

/* Tools section buttons use global styles - no override needed */
```

**Testing**:
- Verify navigation links don't have button styling (no box-shadow, rounded borders)
- Verify tools section buttons (Subscribe, etc.) have proper global button styling
- Check dropdown menus display correctly with proper backgrounds and shadows
- Test responsive behavior on mobile

**Key Style Areas**:
1. **Layout**: Transparent/solid background, positioning, spacing
2. **Brand**: Logo sizing, alignment
3. **Navigation**: Link colors, hover effects, dropdown positioning
4. **Dropdowns**: Background colors, shadows, borders, arrow indicators
5. **Mobile**: Hamburger menu, collapsible navigation

**Output**: Updated `blocks/header/header.css` file with brand-consistent header styles

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

1. **Use web scraping tools** to extract HTML and screenshots
2. **Apply AI vision capabilities** to analyze both text and visual content
3. **Reference the EDS block library** to understand available block types
4. **Map content systematically** to appropriate EDS blocks
5. **Use CLI tools for content processing**:

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
7. **Upload the content to DA**
8. **Extract and apply visual styles** using Playwright MCP to analyze button and UI element styles, then update styles.css
9. **Extract header/navigation content** and create nav.md with 3-section structure, then upload to DA
10. **Apply header-specific styles** with proper CSS specificity to handle button auto-styling in navigation

### Best Practices for Tool Usage

- **Never ever run `npm install`** in `tools/eds-migration/`! Never try to do `cd tools/eds-migration/`
- **Use absolute paths**
- **Use the help command** (`node tools/eds-migration/cli.js help`) when unsure about syntax

The workflow is designed to be modular, allowing each step to be executed independently or as part of the complete pipeline.
