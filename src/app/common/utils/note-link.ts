const noteLinkPattern = /^knowte:\/\/note\/([A-Za-z0-9_-]+)$/i;
const previewLinkPattern = /^#knowte-note\/([A-Za-z0-9_-]+)$/;

export function getLinkedNoteId(href: string): string | undefined {
    const match = noteLinkPattern.exec(href) || previewLinkPattern.exec(href);
    return match ? match[1] : undefined;
}

export function isNoteLink(href: string): boolean {
    return /^knowte:/i.test(href) || href.startsWith('#knowte-note/');
}

export function getNoteLinkPreviewHref(href: string): string {
    return isNoteLink(href) ? `#knowte-note/${getLinkedNoteId(href) || ''}` : href;
}

export function createNoteLink(id: string, title: string): string {
    const label = title.replace(/\r?\n/g, ' ').replace(/&/g, '&amp;').replace(/[\\`*_[\]<>!~|=]/g, '\\$&');
    return `[${label}](knowte://note/${id})`;
}
