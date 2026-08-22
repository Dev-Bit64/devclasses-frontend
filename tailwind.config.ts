import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	prefix: "",
	// Preflight is disabled so Tailwind's global reset cannot fight antd/dist/reset.css on the
	// existing dashboard. A scoped reset is applied to the public shell in src/styles/tailwind.css.
	corePlugins: {
		preflight: false,
		// `.container` already exists in index.scss and is used by dashboard pages.
		container: false,
	},
	theme: {
		extend: {
			colors: {
				border: 'hsl(var(--dc-border))',
				input: 'hsl(var(--dc-input))',
				ring: 'hsl(var(--dc-ring))',
				background: 'hsl(var(--dc-background))',
				foreground: 'hsl(var(--dc-foreground))',
				primary: {
					DEFAULT: 'hsl(var(--dc-primary))',
					foreground: 'hsl(var(--dc-primary-foreground))',
					hover: 'hsl(var(--dc-primary-hover))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--dc-secondary))',
					foreground: 'hsl(var(--dc-secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--dc-destructive))',
					foreground: 'hsl(var(--dc-destructive-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--dc-success))',
					foreground: 'hsl(var(--dc-success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--dc-warning))',
					foreground: 'hsl(var(--dc-warning-foreground))'
				},
				info: {
					DEFAULT: 'hsl(var(--dc-info))',
					foreground: 'hsl(var(--dc-info-foreground))'
				},
				// Page ground behind cards on the authenticated app.
				surface: 'hsl(var(--dc-surface-subtle))',
				// The sidebar is a dark surface with its own scale.
				sidebar: {
					DEFAULT: 'hsl(var(--dc-sidebar))',
					foreground: 'hsl(var(--dc-sidebar-foreground))',
					accent: 'hsl(var(--dc-sidebar-accent))',
					border: 'hsl(var(--dc-sidebar-border))',
					ring: 'hsl(var(--dc-sidebar-ring))'
				},
				muted: {
					DEFAULT: 'hsl(var(--dc-muted))',
					foreground: 'hsl(var(--dc-muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--dc-accent))',
					foreground: 'hsl(var(--dc-accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--dc-popover))',
					foreground: 'hsl(var(--dc-popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--dc-card))',
					foreground: 'hsl(var(--dc-card-foreground))'
				}
			},
			fontFamily: {
				sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
			},
			fontSize: {
				// Tightened display scale for headline typography.
				'display-sm': ['2rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
				'display-md': ['2.75rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
				'display-lg': ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
			},
			borderRadius: {
				lg: 'var(--dc-radius)',
				md: 'calc(var(--dc-radius) - 4px)',
				sm: 'calc(var(--dc-radius) - 6px)',
				xl: 'calc(var(--dc-radius) + 4px)',
				'2xl': 'calc(var(--dc-radius) + 10px)'
			},
			boxShadow: {
				'dc-xs': '0 1px 2px 0 rgb(16 24 40 / 0.05)',
				'dc-sm': '0 1px 3px 0 rgb(16 24 40 / 0.08), 0 1px 2px -1px rgb(16 24 40 / 0.06)',
				'dc-md': '0 4px 12px -2px rgb(16 24 40 / 0.08), 0 2px 6px -2px rgb(16 24 40 / 0.05)',
				'dc-lg': '0 12px 32px -8px rgb(16 24 40 / 0.12), 0 4px 12px -4px rgb(16 24 40 / 0.06)',
				'dc-xl': '0 24px 56px -12px rgb(16 24 40 / 0.16)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'dc-float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-8px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'dc-float': 'dc-float 6s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
