
import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
      fontFamily: {
        sans: ["Rajdhani", ...fontFamily.sans],
        display: ["Orbitron", ...fontFamily.serif],
        mono: ["Roboto Mono", ...fontFamily.mono],
      },
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Cyber theme colors
				neon: {
					cyan: 'hsl(var(--neon-cyan))',
					green: 'hsl(var(--neon-green))',
					blue: 'hsl(var(--neon-blue))',
				},
				cta: 'hsl(var(--cta-highlight))',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				none: '0',
			},
			boxShadow: {
				'cyber': '0 0 10px hsl(var(--neon-cyan) / 0.3), 0 0 20px hsl(var(--neon-cyan) / 0.2)',
				'cyber-lg': '0 0 20px hsl(var(--neon-cyan) / 0.4), 0 0 40px hsl(var(--neon-cyan) / 0.2)',
				'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
			},
			animation: {
				'cyber-pulse': 'cyber-pulse 2s ease-in-out infinite',
				'neon-flicker': 'neon-flicker 3s ease-in-out infinite',
				'slide-in': 'slide-in 0.3s ease-out',
			},
			keyframes: {
				'cyber-pulse': {
					'0%, 100%': {
						boxShadow: '0 0 5px hsl(var(--neon-cyan) / 0.2)'
					},
					'50%': {
						boxShadow: '0 0 20px hsl(var(--neon-cyan) / 0.4), 0 0 30px hsl(var(--neon-cyan) / 0.2)'
					}
				},
				'neon-flicker': {
					'0%, 100%': {
						opacity: '1',
						textShadow: '0 0 10px hsl(var(--neon-cyan) / 0.5)'
					},
					'50%': {
						opacity: '0.8',
						textShadow: '0 0 5px hsl(var(--neon-cyan) / 0.3)'
					}
				},
				'slide-in': {
					'0%': {
						opacity: '0',
						transform: 'translateX(-20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateX(0)'
					}
				}
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
