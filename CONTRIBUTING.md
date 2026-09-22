# Contributing to BioAI Toolkit

Thanks for your interest in contributing. This project is maintained by a single developer and primarily serves as a portfolio project, but thoughtful contributions are welcome.

## How to contribute

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run `npm run build` and confirm zero errors
5. Commit with a clear message
6. Open a Pull Request describing what you changed and why

## Code style

- TypeScript strict mode is on
- Use the existing utility classes in `app/globals.css`
- Never commit secrets — use `.env.local` locally
- Keep AI prompts in `lib/prompts.ts` well-commented

## Reporting issues

Open a GitHub issue with:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Screenshots if relevant
