export default function decorate(block) {
  const [taglineRow, contentRow] = [...block.children];

  // Create hero structure
  const hero = document.createElement('div');
  hero.className = 'hero-banner-wrapper';

  // Tagline section
  if (taglineRow) {
    const tagline = document.createElement('div');
    tagline.className = 'hero-tagline';
    tagline.innerHTML = taglineRow.textContent;
    hero.appendChild(tagline);
  }

  // Featured content card
  if (contentRow) {
    const card = document.createElement('div');
    card.className = 'hero-content-card';
    const cells = [...contentRow.children];

    cells.forEach((cell, idx) => {
      const content = document.createElement('div');
      content.className = idx === 0 ? 'card-theme' : 'card-headline';
      content.innerHTML = cell.innerHTML;
      card.appendChild(content);
    });

    hero.appendChild(card);
  }

  block.textContent = '';
  block.appendChild(hero);
}
