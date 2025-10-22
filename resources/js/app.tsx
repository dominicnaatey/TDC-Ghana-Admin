import '../css/app.css';
import './bootstrap';

// TinyMCE local bundle (v8) imports
import 'tinymce/tinymce';
import 'tinymce/icons/default';
import 'tinymce/themes/silver';
import 'tinymce/models/dom';
import 'tinymce/skins/ui/oxide/skin.min.css';
import 'tinymce/skins/content/default/content.min.css';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/codesample';
import 'tinymce/plugins/emoticons';
import 'tinymce/plugins/emoticons/js/emojis.js';
import 'tinymce/plugins/image';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/media';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/table';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/wordcount';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.{jsx,tsx}');
        const tsx = pages[`./Pages/${name}.tsx`];
        const jsx = pages[`./Pages/${name}.jsx`];
        if (tsx) {
            return tsx().then((m: any) => m.default ?? m);
        }
        if (jsx) {
            return jsx().then((m: any) => m.default ?? m);
        }
        throw new Error(`Page not found: ${name}`);
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
