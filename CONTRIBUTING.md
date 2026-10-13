# Contributing

Issues and pull requests are welcome.

The two templates are meant to be copied out on their own, so `templates/react-app/backend`
and `templates/next-app/backend` are duplicates. A backend change has to land in both trees.
The frontends are different and should stay that way.

Before opening a pull request:

1. Keep secrets out of the diff. `.env.example` is the only env file that belongs in git.
2. If you add a dependency, pin the current release in `requirements.txt` or `package.json`
   and refresh the lockfile.
3. `python -m compileall` should pass for both backends, and `npm run build` should pass
   for the frontend you touched.

GitHub Actions runs that check on push and pull request.
