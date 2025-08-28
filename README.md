> [!IMPORTANT] Note:
> There is no webui within this repo, one will be provided in later versions.


# installation
> This app assumes you have a basic knowledge of the terminal, but should be concise
1. download source code `git clone ` + this repo
2. configure the `compose.yaml` so that all the `# This needs to be changed` lines are changed
3. run the `update_compose.sh` (**IMPORTANT**: reset_compose.sh is for development only and will drop your database!)

## Troubleshooting
> Not much here yet, were still in beta
- did you forget to git clone the code?
- have you done `chmod +x ./update_compose.sh` before running it
- Do you have docker installed and running
- Are you using the right CPU architecture? (if not, I don't know enough about docker to help)