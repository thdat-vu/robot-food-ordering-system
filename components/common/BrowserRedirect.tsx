// components/common/BrowserRedirect.tsx
'use client';

import {useEffect} from 'react';
import {X} from 'lucide-react';

export const BrowserRedirect = () => {
    useEffect(() => {
        const userAgent = navigator.userAgent || navigator.vendor;

        // Detect if in WebView/In-App Browser
        const isInAppBrowser =
            /FBAN|FBAV|Instagram|Line|Messenger|Twitter|Telegram|Zalo/i.test(userAgent) ||
            (/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(userAgent)) ||
            (/wv|WebView/i.test(userAgent));

        if (isInAppBrowser) {
            const currentUrl = window.location.href;

            // Android: Redirect to Chrome
            if (/Android/i.test(userAgent)) {
                // Try Chrome URL scheme first
                const chromeUrl = `googlechrome://navigate?url=${encodeURIComponent(currentUrl)}`;
                window.location.href = chromeUrl;

                // Fallback to intent URL after 500ms
                setTimeout(() => {
                    const host = window.location.host;
                    const path = window.location.pathname;
                    const search = window.location.search;
                    const intentUrl = `intent://${host}${path}${search}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(currentUrl)};end`;
                    window.location.href = intentUrl;
                }, 500);
            }
            // iOS: Show instruction banner
            else if (/iPhone|iPad|iPod/i.test(userAgent)) {
                showIOSInstructionBanner();
            }
        }
    }, []);

    return null;
};

const showIOSInstructionBanner = () => {
    // Check if banner already exists
    if (document.getElementById('ios-browser-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'ios-browser-banner';
    banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px;
        z-index: 99999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideDown 0.3s ease-out;
    `;

    banner.innerHTML = `
        <div style="max-width: 500px; margin: 0 auto; position: relative;">
            <button 
                id="close-banner-btn"
                style="position: absolute; top: -8px; right: -8px; background: rgba(255,255,255,0.2); border: none; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; font-size: 18px; font-weight: bold;"
                aria-label="Đóng"
            >
                ×
            </button>
            <div style="font-size: 15px; font-weight: 600; margin-bottom: 6px; padding-right: 30px;">
                📱 Mở trong Safari để đặt món
            </div>
            <div style="font-size: 13px; opacity: 0.95; line-height: 1.4;">
                Nhấn vào nút <strong>"..."</strong> hoặc <strong>"Chia sẻ"</strong> → Chọn <strong>"Mở trong Safari"</strong>
            </div>
        </div>
    `;

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from {
                transform: translateY(-100%);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    document.body.prepend(banner);

    // Close button handler
    const closeBtn = banner.querySelector('#close-banner-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            banner.style.animation = 'slideUp 0.3s ease-out';
            setTimeout(() => banner.remove(), 300);
        });
    }

    // Add slide up animation
    style.textContent += `
        @keyframes slideUp {
            from {
                transform: translateY(0);
                opacity: 1;
            }
            to {
                transform: translateY(-100%);
                opacity: 0;
            }
        }
    `;
};