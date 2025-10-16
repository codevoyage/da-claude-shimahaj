export default function decorate(block) {
  const stats = [...block.children];

  const grid = document.createElement('div');
  grid.className = 'stats-grid-wrapper';

  stats.forEach((stat) => {
    const [valueCell, labelCell] = [...stat.children];

    const statItem = document.createElement('div');
    statItem.className = 'stat-item';

    const value = document.createElement('div');
    value.className = 'stat-value';
    value.textContent = valueCell.textContent;

    const label = document.createElement('div');
    label.className = 'stat-label';
    label.textContent = labelCell.textContent;

    statItem.appendChild(value);
    statItem.appendChild(label);
    grid.appendChild(statItem);
  });

  block.textContent = '';
  block.appendChild(grid);
}
