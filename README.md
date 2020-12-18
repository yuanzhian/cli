npm - a package manager
==============================

![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/npm/cli/Node%20CI/latest) [![Coverage Status](https://coveralls.io/repos/github/npm/cli/badge.svg?branch=latest)](https://coveralls.io/github/npm/cli?branch=latest)

#### Requirements

- You need `node` v10 or higher to run this program

#### Acknowledgements
- `npm` is configured to use the **npm public registry** at
<https://registry.npmjs.org> by default. Use of the **npm public registry** is
subject to terms of use available at <https://www.npmjs.com/policies/terms>
- You can configure npm to use any compatible registry you
like, and even run your own registry. Check out the [doc on
registries](https://docs.npmjs.com/misc/registry).

## Installation

#### Node.js Project

`npm` is bundled with [`node`](https://nodejs.org/en/download/) by default. Most distributions of `node` should come with it out-of-the-box.

- [Mac](0)
- [Windows]()
- [Linux]()
- [Others]()

#### Direct Download

If you'd like to install `npm` directly from `npmjs.com`, you can download & run
our `install.sh`:

```
curl -L https://www.npmjs.com/install.sh | sh
```

#### Node Version Managers

If you're looking to manage multiple versions of `node` &/or `npm`, consider using projects such as:

- [`nvm`]()
- [`nvs`]()
- [`nave`]()
- [`n`]()
- [`volta`]()

### Development

- Fork & clone this repo locally (ex. `git clone https://github.com/npm/cli.git`)
- Run `make install`

### Slightly Fancier

You can set any npm configuration params with that script:

```sh
npm_config_prefix=/some/path sh install.sh
```

Or, you can run it in uber-debuggery mode:

```sh
npm_debug=1 sh install.sh
```

### Even Fancier

Get the code with git.  Use `make` to build the docs and do other stuff.
If you plan on hacking on npm, `make link` is your friend.

If you've got the npm source code, you can also semi-permanently set
arbitrary config keys using the `./configure --key=val ...`, and then
run npm commands by doing `node bin/npm-cli.js <command> <args>`.  (This is helpful
for testing, or running stuff without actually installing npm itself.)

## Windows Install or Upgrade

Many improvements for Windows users have been made in npm 3 - you will have a better
experience if you run a recent version of npm. To upgrade, either use [Microsoft's
upgrade tool](https://github.com/felixrieseberg/npm-windows-upgrade),
[download a new version of Node](https://nodejs.org/en/download/),
or follow the Windows upgrade instructions in the
[Installing/upgrading npm](https://npm.community/t/installing-upgrading-npm/251/2) post.


## Uninstalling

So sad to see you go.

```sh
sudo npm uninstall npm -g
```
Or, if that fails,

```sh
sudo make uninstall
```

Usually, the above instructions are sufficient.  That will remove
npm, but leave behind anything you've installed.

If you would like to remove all the packages that you have installed,
then you can use the `npm ls` command to find them, and then `npm rm` to
remove them.

To remove cruft left behind by npm 0.x, you can use the included
`clean-old.sh` script file.  You can run it conveniently like this:

```sh
npm explore npm -g -- sh scripts/clean-old.sh
```

npm uses two configuration files, one for per-user configs, and another
for global (every-user) configs.  You can view them by doing:

```sh
npm config get userconfig   # defaults to ~/.npmrc
npm config get globalconfig # defaults to /usr/local/etc/npmrc
```

Uninstalling npm does not remove configuration files by default.  You
must remove them yourself manually if you want them gone.  Note that
this means that future npm installs will not remember the settings that
you have chosen.

### Resources

- [Bug Tracker](https://github.com/npm/cli/issues) - Search or submit bugs against the npm CLI or any of our other maintained OSS projects
- [Documentation](https://docs.npmjs.com/) or `npm help` - The official API docs & how-tos for all things npm
- [Roadmap](https://github.com/npm/roadmap) - Track & follow along with our public roadmap
- [Feedback](https://github.com/npm/feedback) - Contribute ideas & discussion around the npm registry, website & CLI
- [RFCs](https://github.com/npm/rfcs) - Contribute ideas & specifications for the API/design of the npm CLI
- [Service Status](https://status.npmjs.org/) - Monitor the current status & see incident reports for the website & registry
- [Project Status](https://npm.github.io/statusboard/) - See the health of all our maintained OSS projects in one view
- [Public Events Calendar](https://calendar.google.com/calendar/u/0/embed?src=npmjs.com_oonluqt8oftrt0vmgrfbg6q6go@group.calendar.google.com) Keep track of our Open RFC calls, releases, meetups, conferences & more!
- [Support](https://www.npmjs.com/support) Experiencing problems with the website or registry? File a ticket here

### How-tos
- [Developing & Publishing Packages](https://docs.npmjs.com/misc/developers)
