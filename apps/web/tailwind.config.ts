import type { Config } from 'tailwindcss';
import shared from '@flippin/config/tailwind.preset';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}'
  ],
  presets: [shared],
};

export default config;
