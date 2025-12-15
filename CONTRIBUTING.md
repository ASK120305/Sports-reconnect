# Contributing to Sports Reconnect

Thanks for being part of the team! Here's how to contribute effectively.

## Branching Strategy

Use feature branches for all work:
```bash
git checkout -b feature/feature-name
# or
git checkout -b fix/bug-name
git checkout -b docs/update-readme
```

## Commit Messages

Follow conventional commits:
- `feat: add new feature`
- `fix: resolve bug`
- `docs: update documentation`
- `refactor: restructure code`
- `test: add tests`

Example:
```bash
git commit -m "feat: add certificate export to PDF"
```

## Frontend Development

1. **Branch**: `git checkout -b feature/new-component`
2. **Code**: Add components, pages, or styles
3. **Test**: Run `npm run dev` in `frontend/` and test locally
4. **Commit**: `git commit -m "feat: add new component"`
5. **Push**: `git push origin feature/new-component`
6. **PR**: Open PR to `main` for review

### Code Standards
- Use TypeScript strictly (no `any` types)
- Component files: PascalCase (`MyComponent.tsx`)
- Utility files: camelCase (`utility.ts`)
- Use Tailwind classes; avoid inline styles
- Keep components small and focused

## Backend Development

1. **Branch**: `git checkout -b feature/api-endpoint`
2. **Code**: Add routes, controllers, models
3. **Test**: Run tests, test with Postman/curl
4. **Commit**: `git commit -m "feat: add certificate API"`
5. **Push**: `git push origin feature/api-endpoint`
6. **PR**: Open PR for review

### Code Standards
- Follow your framework's best practices
- Write clear API documentation
- Include error handling & validation
- Add unit/integration tests

## Pull Request Process

1. Push your branch to GitHub
2. Open a PR with a clear title and description
3. Link related issues (e.g., "Closes #42")
4. Request review from teammates
5. Address feedback and push updates
6. Once approved, maintainer will merge

## Deployment

- **Frontend**: Automatically deployed to Vercel/Netlify on merge to `main`
- **Backend**: Deploy to production environment after PR approval

## Questions?

Open an issue or ping the team in Slack. Happy coding! 🚀
