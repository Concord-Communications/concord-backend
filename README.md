> [!Note]
> There is no webui within this repo, see https://github.com/Concord-Communications/concord-web-client for a basic implementation (apologies to anyone who writes intelligeable frontend code.)


# installation
> This app assumes you have a basic knowledge of the terminal, but should be concise
1. download source code `git clone ` + this repo
2. configure the `compose.yaml` so that all the `# This needs to be changed` lines are changed
3. run the `update_compose.sh` (**IMPORTANT**: reset_compose.sh is for development only and will drop your database!)
> [!Note] Concord is meant to be put behind a reverse proxy for rate limiting and security. 

Like the repo? Consider starring it :star:

## Troubleshooting
> Not much here yet, were still in beta
- did you forget to git clone the code?
- have you done `chmod +x ./update_compose.sh` before running it
- Do you have docker installed and running
- Are you using the right CPU architecture? (if not, I don't know enough about docker to help)

# Contributing
Contributing is not publicly ready yet. If you have a feature idea or bug, please open an issue. Note: not everything will be implemented.

# THE LORE
Concord was originally thought of as a solution to the chaos of trying to get multiple people in the same chat. After months of work, it was finally ready to be open sourced.    