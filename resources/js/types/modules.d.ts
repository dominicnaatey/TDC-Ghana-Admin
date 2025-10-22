// Global declarations to satisfy TypeScript module resolution
// for TinyMCE submodules and CSS imports used by Vite

declare module '*.css';

declare module 'tinymce/*';
declare module 'tinymce/plugins/*';
declare module 'tinymce/icons/*';
declare module 'tinymce/themes/*';
declare module 'tinymce/models/*';
declare module 'tinymce/skins/*';

declare module 'tinymce/plugins/emoticons/js/emojis.js';