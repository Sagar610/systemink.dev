export function article(lead: string, sections: Array<{ id: string; title: string; paragraphs: string[]; list?: string[] }>): string {
  const parts = [`<p>${lead}</p>`];
  for (const section of sections) {
    parts.push(`<h2 id="${section.id}">${section.title}</h2>`);
    for (const paragraph of section.paragraphs) {
      parts.push(`<p>${paragraph}</p>`);
    }
    if (section.list?.length) {
      parts.push(`<ul>${section.list.map((item) => `<li>${item}</li>`).join('')}</ul>`);
    }
  }
  return `\n${parts.join('\n')}\n`;
}
