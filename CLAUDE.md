CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.



## Startup Files

At the start of each conversation, read the following files to understand the project context:
- @./tools/eds-migration/EXCAT__AEM_EDS.md
- @./tools/eds-migration/EXCAT__AEM_DA.md
- @./tools/eds-migration/EXCAT__AGENTIC_WORKFLOW.md
- @./tools/eds-migration/sta-boilerplate-block-library-no-images.json



## Global Rules

- Whenever you `cd` somewhere to do something, always navigate back to previous location so next steps are not lost!
- Stay concise and stick to any initial plan
- Whenever you have to write a file, do following:
  1. `echo "" > {file}`
  2. Read {file}
  3. Write content to {file}
