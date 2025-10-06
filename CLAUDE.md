CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.



## Startup Files

At the start of each conversation, read the following files to understand the project context:

### Core Guides
- @./tools/eds-migration/docs/EXCAT__AEM_EDS.md - EDS development best practices and project structure
- @./tools/eds-migration/docs/EXCAT__AEM_DA.md - Document Authoring API interactions
- @./tools/eds-migration/docs/EXCAT__AGENTIC_WORKFLOW.md - Step-by-step migration workflow

### Reference Materials
- @./tools/eds-migration/config/sta-boilerplate-block-library-no-images.json - Available EDS blocks with examples
- @./tools/eds-migration/config/block-showcase.md - Complete block showcase with sample implementations (reusable template)
- @./tools/eds-migration/docs/EXCAT__DESIGN_TOKENS.md - Design tokens reference and adaptation guide
- @./tools/eds-migration/config/design-tokens-visual-reference.html - Visual mockup of all design tokens
- @./tools/eds-migration/docs/EXCAT__AUTOMATED_BLOCK_GENERATION.md - Automated block generation from web pages with code reuse strategy
- @./tools/eds-migration/docs/NAVIGATION.md - Navigation setup and troubleshooting
- @./tools/eds-migration/docs/EXCAT__IMAGE_TROUBLESHOOTING.md - Image handling issues and solutions
- @./tools/eds-migration/docs/EXCAT__DEBUGGING.md - General debugging techniques and common issues

### When to Reference
- **block-showcase.md**: Use as a template when creating new pages with block examples, or when needing markdown syntax for any implemented block
- **EXCAT__DESIGN_TOKENS.md**: Read when adapting EDS project to an existing design system, or when needing to understand/modify global styling tokens
- **design-tokens-visual-reference.html**: Open in browser to see visual examples of all design tokens (colors, typography, spacing, etc.)
- **EXCAT__AUTOMATED_BLOCK_GENERATION.md**: **CRITICAL for block generation** - Provides automated workflow with mandatory steps:
  - **Step 1.5: Visual Layout Analysis** - Count items per row BEFORE coding to prevent wrong layout patterns
  - **Step 8: Test-Verify-Refine Loop** - Iterative testing with exact content on proper EDS pages until pixel-perfect
  - **Critical Learnings section** - 7 key insights for high-fidelity blocks (box-sizing, test environment, measurement, etc.)
  - Code reuse strategy, naming conventions, CSS implementation patterns
- **EXCAT__IMAGE_TROUBLESHOOTING.md**: Read when encountering image rendering issues, "about:error" problems, or when implementing blocks with images
- **EXCAT__DEBUGGING.md**: Read when troubleshooting any EDS issues - provides systematic debugging approaches and CLI commands
- **NAVIGATION.md**: Read when working with site navigation or encountering link styling issues



## Quick Tools

### Adding Blocks from Official Repositories

Use the `tools/eds-migration/helpers/add-block.sh` script to quickly install blocks from Adobe's official repositories:

```bash
# Install from boilerplate (default)
./tools/eds-migration/helpers/add-block.sh <blockname>
./tools/eds-migration/helpers/add-block.sh <blockname> boilerplate

# Install from block collection
./tools/eds-migration/helpers/add-block.sh <blockname> collection

# Examples:
./tools/eds-migration/helpers/add-block.sh quote boilerplate
./tools/eds-migration/helpers/add-block.sh breadcrumbs collection
```

The script will:
- Create `blocks/<blockname>/` directory
- Download `<blockname>.js` and `<blockname>.css` from the specified repository
- Display success message with next steps
- Show file sizes and suggest git commands

**Available sources:**
- `boilerplate` - https://github.com/adobe/aem-boilerplate
- `collection` - https://github.com/adobe/aem-block-collection

## Global Rules

- Whenever you `cd` somewhere to do something, always navigate back to previous location so next steps are not lost!
- Stay concise and stick to any initial plan
- Whenever you have to write a file, do following:
  1. `echo "" > {file}`
  2. Read {file}
  3. Write content to {file}
