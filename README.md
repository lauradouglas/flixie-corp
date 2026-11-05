# flixie-corp
## Release notifications

Website deployment notifications are currently disabled. The webhook secret is
retained. To restore automatic success/failure messages on later deployments,
set the GitHub Actions repository variable `SLACK_RELEASE_NOTIFICATIONS_ENABLED`
to `true`; set it to `false` to disable them again. Manual runs also provide a
`notify_slack` input for a single explicitly authorized notification. Deployment
checks and GitHub logs run normally with notifications disabled.
