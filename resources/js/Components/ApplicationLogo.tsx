import type { ImgHTMLAttributes } from 'react';

export default function ApplicationLogo({ className = 'h-8 w-auto', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            className={className}
            src="/tdc_logo_2.png"
            alt="TDC Logo"
            loading="eager"
            decoding="async"
            draggable={false}
        />
    );
}
