# SmartCart

SmartCart helps households keep track of their pantry, plan meals, and optimise grocery runs.
The project is split into a React/Vite frontend and a Spring Boot backend deployed on Vercel and Render respectively.

## Live deployments

| Surface   | URL |
|-----------|-----|
| Frontend  | https://smartcart-phi.vercel.app/ |
| Backend API | https://smartcart-backend-zy2c.onrender.com/ |

Both links are public and ready to be shared with testers or stakeholders.

## Release history

The repository now carries Git tags so that we can trace what is in production.

| Version | Date | Notes |
|---------|------|-------|
| v1.0.0  | 2025-11-14 | First production-ready cut with SendGrid as the primary mail sender, Gmail fallback disabled, spam reminder on the OTP screen, and performance improvements. |

To create additional releases, tag the desired commit and push with `git push --tags`.

## Deployment notes

- Frontend redeploys from `main` via Vercel. If you need to redeploy manually run `npm run build` inside `frontend/` and push – Vercel will pick it up.
- Backend redeploys from `main` via Render using the Dockerfile in `/backend`. Logs: https://dashboard.render.com/
- Email is currently sent through SendGrid single sender (`smartcart2025.app@gmail.com`). The OTP screen tells users to check their spam/junk folder.
- If you acquire a custom domain, update SendGrid’s sender authentication and change `SENDGRID_FROM_EMAIL` in Render’s environment variables.

## Next steps / suggested issues

1. **Authenticate a custom domain on SendGrid** so OTP emails land in inboxes. (Requires a domain; see `GMAIL_SETUP_COMPLETE.md` for context.)
2. **Tune API rate limits** – heavy testers can still hit “Too many requests”.
3. **Add automated health checks** via GitHub Actions to avoid regressions.

Open GitHub issues for the items above when you are ready – keeping them tracked will make future sprints easier.

## Additional documentation

There is a large collection of operational docs in the repo (see `START_HERE.md`, `NEXT_STEPS.md`, `HOW_TO_SHARE.md`, etc.). Use the `docs/` folder as the knowledge base for one-off tasks.

