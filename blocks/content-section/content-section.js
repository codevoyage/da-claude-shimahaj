export default function decorate(block) {
  const [headingRow, textRow, ctaRow] = [...block.children];

  const wrapper = document.createElement('div');
  wrapper.className = 'content-section-wrapper';

  // Heading
  if (headingRow) {
    const heading = document.createElement('h2');
    heading.className = 'content-heading';
    heading.textContent = headingRow.textContent;
    wrapper.appendChild(heading);
  }

  // Text content
  if (textRow) {
    const text = document.createElement('div');
    text.className = 'content-text';
    text.innerHTML = textRow.innerHTML;
    wrapper.appendChild(text);
  }

  // CTA button
  if (ctaRow) {
    const ctaContainer = document.createElement('div');
    ctaContainer.className = 'content-cta';

    const links = ctaRow.querySelectorAll('a');
    links.forEach((link) => {
      link.className = 'cta-button';
    });

    ctaContainer.innerHTML = ctaRow.innerHTML;
    wrapper.appendChild(ctaContainer);
  }

  block.textContent = '';
  block.appendChild(wrapper);
}
