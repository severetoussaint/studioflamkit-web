import localFont from 'next/font/local';

export const dmSerif = localFont({
  src: './fonts/dm-serif-display-latin.woff2',
  weight: '400',
  variable: '--font-dm-serif',
  display: 'swap',
});

export const inter = localFont({
  src: './fonts/inter-latin.woff2',
  weight: '400 700',
  variable: '--font-inter',
  display: 'swap',
});
