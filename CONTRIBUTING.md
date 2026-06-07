# Contributing to RideShare MERN App

Thank you for your interest in contributing! We welcome improvements, bug fixes, and documentation updates.

## How to Contribute

- Open an issue to discuss large changes before implementing.
- Fork the repository and create a feature branch from `main` named `feat/brief-description` or `fix/brief-description`.
- Write clear, focused commits and a descriptive PR title.
- Submit a pull request targeting `main` and include a brief description of your changes.

## Code Style

- The project uses ESLint for JavaScript/React linting. Please run the linter and fix warnings before opening a PR.
- Follow existing code patterns for components, hooks, and CSS modules.

## Running the Project Locally

1. Install dependencies for both `client` and `server`:

```bash
cd client
npm install

cd ../server
npm install
```

2. Start the development servers:

```bash
# In separate terminals
cd client
npm run dev

cd server
npm start
```

3. Environment variables:

- Client: add any Vite env vars to `client/.env.local` (see `client/README.md`).
- Server: add `DBURL` and `PORT` to `server/.env`.

## PR Checklist

- [ ] Lint passes (`npm run lint` where available)
- [ ] No console errors in the browser
- [ ] Updated any relevant documentation
- [ ] Describe breaking changes (if any)

## Tests

If you add tests, ensure they run and pass locally. Add instructions in this file if new tooling is required.

## Code of Conduct

Be respectful and collaborative. Treat maintainer feedback as guidance and respond constructively.

## Questions

If you're unsure about the contribution process, open an issue or contact the maintainer.

---

Thanks for helping improve RideShare!
