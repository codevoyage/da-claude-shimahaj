# UPS to Edge Delivery Services Migration Framework

## Overview
This framework provides a reusable foundation for migrating UPS pages to Edge Delivery Services. It establishes patterns, blocks, and templates identified from the UPS homepage that can be applied to other UPS corporate pages.

---

## Artifact Structure

```
ups-migration/
├── blocks/                      # Reusable UI components
│   ├── hero-banner/            # Hero section with tagline + featured content
│   │   ├── hero-banner.js
│   │   └── hero-banner.css
│   ├── stats-grid/             # Statistics display grid
│   │   ├── stats-grid.js
│   │   └── stats-grid.css
│   └── content-section/        # General content with CTA
│       ├── content-section.js
│       └── content-section.css
├── config/                      # Block definitions and brand guidelines
│   └── block-registry.json     # Block catalog with variants
├── templates/                   # Page templates for reuse
│   └── corporate-homepage.json # Corporate storytelling template
└── content/                     # Migrated page content
    └── home.md                 # Homepage in EDS document format
```

---

## Block Library

### 1. Hero Banner
**Purpose:** Large hero section with company tagline and featured content card
**Use Cases:** Homepage heroes, campaign landing pages, feature announcements
**Variants:**
- `default` - Centered tagline with content card below
- `centered` - All content centered
- `with-background` - Includes background image

**Content Structure (home.md):**
```markdown
## Hero Banner
| Tagline | Content |
|---------|---------|
| Your main message | |

| Theme | Headline |
|-------|----------|
| THEME TAG | Your featured headline |
```

---

### 2. Stats Grid
**Purpose:** Display key metrics and statistics in a responsive grid
**Use Cases:** Company stats, performance metrics, impact numbers
**Variants:**
- `2-column` - Mobile-friendly
- `3-column` - Standard layout
- `4-column` - Wide screens (default)

**Content Structure:**
```markdown
## Stats Grid
| Value | Label |
|-------|-------|
| 500K | Metric 1 |
| 200+ | Metric 2 |
```

---

### 3. Content Section
**Purpose:** Text content blocks with optional CTA button
**Use Cases:** About sections, value propositions, general content
**Variants:**
- `centered` - Center-aligned text (default)
- `left-aligned` - Left-aligned for longer copy
- `with-image` - Includes supporting image

**Content Structure:**
```markdown
## Content Section
| Heading | Text | CTA |
|---------|------|-----|
| Section Title | Body text here | [Button Text](url) |
```

---

## How to Migrate New UPS Pages

### Step 1: Analyze the Page
Identify which blocks from the library match the page structure:
- Does it have a hero? → Use `hero-banner`
- Statistics or metrics? → Use `stats-grid`
- Text sections with CTAs? → Use `content-section`

### Step 2: Create Content Document
Create a new `.md` file in `content/` directory:

```markdown
# Page Title

## [Block Name]
[Block table structure]

---

## [Next Block]
[Block table structure]

---

## Metadata
- Title: Page title for SEO
- Description: Meta description
- Template: corporate-homepage
```

### Step 3: Choose or Create Template
- **Existing pages similar to homepage?** → Use `corporate-homepage` template
- **New page type?** → Create new template in `templates/` directory

### Step 4: Customize Blocks (if needed)
If a page needs unique styling:
1. Copy existing block to new variant
2. Modify CSS for specific use case
3. Register variant in `block-registry.json`

---

## Reusability Strategy

### For Content Authors
- **Block tables** in markdown make content portable
- **Templates** ensure consistency across pages
- **Registry** documents all available blocks and their uses

### For Developers
- **Block variants** handle common styling needs
- **Shared CSS** maintains brand consistency
- **Documented structure** makes onboarding easy

### Brand Consistency
All blocks use centralized brand colors from `block-registry.json`:
- Primary: `#351c15` (dark brown)
- Secondary: `#ffb500` (gold)
- Accent: `#e6a300` (darker gold)

---

## Next Steps for Full Migration

1. **Expand Block Library**
   - Add navigation block
   - Add footer block
   - Add accordion/FAQ block
   - Add tabbed content block

2. **Create More Templates**
   - Product pages
   - News/blog pages
   - Investor relations pages
   - Career pages

3. **Build Asset Pipeline**
   - Image optimization workflow
   - Icon library
   - Video embedding patterns

4. **Testing Framework**
   - Responsive design tests
   - Accessibility checks
   - Performance benchmarks

---

## Example: Migrating "About Us" Page

1. Identify blocks needed:
   - Hero banner (company mission)
   - Stats grid (company facts)
   - Multiple content sections (history, values, leadership)

2. Create `content/about.md`:
```markdown
# About UPS

## Hero Banner
| Tagline | Content |
|---------|---------|
| Our Story | |

## Stats Grid
[Company statistics]

## Content Section
[History section]

## Content Section
[Values section]
```

3. Result: Fully migrated page using existing blocks!

---

## Questions?
- Check `block-registry.json` for block options
- Review `corporate-homepage.json` for template structure
- Examine `content/home.md` for content format examples
