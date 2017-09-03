:no_entry: [NOT MAINTAINED] This utility was created to help migrate us over from SVN to GIT. I no longer have use for this app and so my time and efforts have been refocused elsewhere. I'd be happy to transition this repo to someone else if desired, or accept pull requests as needed. Otherwise, this repo will be left active for historical purposes.

# SVN to Git

SVN to Git is a utility built on Electron and utilizing svn2git to migrate SVN repositories to Git. This utility was built for a specific environment and may not work in all environments, so some tweaks might need to be made for your specific use case. Note also that this tool was built specifically to run under Windows and has only been tested there. I would expect that the changes would be minimal to get it to run under a different OS though.

## Prerequisites

As this utility is just a wrapper on a bunch of other commands, there are some prerequisites which need to be installed. They either need to already be installed and available in your `PATH`, or downloaded manually as per the below. As well, the email address suffix `@example.com` specified in `js\app.js` should be updated to match your environment. 

1. Git for Windows: this should be downloaded and installed into `tools\Git`.
2. Ruby for Windows: this should be downloaded and installed into `tools\Ruby`.
3. An SVN client (ex. SlikSvn): this should be download installed to `tools\SlikSvn`.

<img alt="Screenshot" src="https://github.com/gotdibbs/SvnToGit/blob/master/Screenshot.PNG" style="border: 1px solid #444;" />
