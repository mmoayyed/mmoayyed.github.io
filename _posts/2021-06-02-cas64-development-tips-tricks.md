---
layout:     post
title:      Apereo CAS - Development Tips & Techniques
summary:    Collections of bash aliases, tips, and tricks and all the secret ways to stay productive while developing and/or contributing to Apereo CAS.
tags:       [CAS]
---

When you are planning to contribute a bug fix or feature enhancements to Apereo CAS, it quite useful to have access to a set of scripts, commands, and shell aliases to make your development environment more productive and less repetitive. In this blog post, I am cataloging a collection of shell aliases and functions that I use on a daily basis while working on Apereo CAS. 

For additional details on tuning the build and development environment, I would encourage you to check out the documentation on CAS [Build][buildproc] and [Test][testproc] processes.

{% include googlead1.html  %}

This post specifically requires and focuses on:

- CAS `6.4.x`
- Java `11`
- [Apereo CAS Initializr][initializr] 

Most if not all of the listed commands here would go into your OS *profile*. If you are using [Oh My ZSH!](https://ohmyz.sh/) on macOS, a good place to start would be `~/.zprofile`.

## ANSI Colors

Use the following variables to output colorized text for better clarity.

```bash
BLACK=$(tput setaf 0)
RED=$(tput setaf 1)
GREEN=$(tput setaf 2)
YELLOW=$(tput setaf 3)
BLUE=$(tput setaf 4)
MAGENTA=$(tput setaf 5)
CYAN=$(tput setaf 6)
WHITE=$(tput setaf 7)
BOLD=$(tput bold)
NORMAL=$(tput sgr0)
```

## Build 

{% include googlead1.html  %}

The CAS build is based on the [Gradle build tool](https://gradle.org/). You may want to consider using [Gum](https://github.com/kordamp/gm) that primarily helps you choose the correct Gradle wrapper.

Shortcut alias for building the CAS codebase:

```bash
alias bgc="clear; gm build -x check -x test -x javadoc \
  --parallel --build-cache --configure-on-demand \
  -DskipNestedConfigMetadataGen=true -DskipBootifulArtifact=true "
```

Shortcut alias for building *and* install CAS artifacts into local repositories:

```bash
alias bgp="bgi -DskipClientBuild=true publishToMavenLocal \
  -x signMavenJavaPublication -x signMavenWebPublication"
```

Run CAS with an embedded tomcat with pre-selected modules on the fly:

{% include googlead1.html  %}

```bash
function bctomcat() {
  clear
  cd ~/cas-sever
  cd webapp/cas-server-webapp-tomcat
  casmodules="$1"
  if [ ! -z "$casmodules" ] ; then
    echo "Modules: ${GREEN}${casmodules}${NORMAL}"
  fi
  rm /tmp/graal.log
  gm build bootRun \
    --configure-on-demand --build-cache -b ./build.gradle \
    --parallel -x test -x javadoc -x check \
    -DenableRemoteDebugging=true \
    --stacktrace -DskipNestedConfigMetadataGen=true \
    -DremoteDebuggingSuspend=false \
    -PcasModules=${casmodules} \
    -Dgraal.LogFile=/tmp/graal.log
}
```

Run CAS with an embedded container:

```bash
function jrun() {
    java -jar $1 $2 $3 $4 $5 $6 $7 $8 $9
}
```

Run CAS with an embedded container with debugger listening on port `5006`:

{% include googlead1.html  %}

```bash
function jbug() {
    java -Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=5006 \
      -jar $1 $2 $3 $4 $5 $6 $7
}
```

Create overlay projects using [Apereo CAS Initializr][initializr]:

```bash
function getcas(){
    URL="https://casinit.herokuapp.com/starter.tgz"
    DEFAULT_PROJECT_TYPE="cas-overlay"
    projectType=${2:-$DEFAULT_PROJECT_TYPE}
    rm -Rf ./overlay
    clear
    echo -e "${GREEN}${projectType}${NORMAL} with dependencies ${GREEN}${1}${NORMAL}..."
    curl ${URL} -d type=${projectType} -d baseDir=overlay \
      -d dependencies="$1" | tar -xzvf -
    lx
}
```

## Test

Shortcut alias for running unit/integration tests:

{% include googlead1.html  %}

```bash
alias testcas="~/cas-server/testcas.sh --no-wrapper --no-retry --category"
```

Run a puppeteer test scenario:

```bash
function pupcas() {
  scenario=$1
  cd ~/cas-server
  echo -e "Scenario: ${GREEN}$scenario${NORMAL}\n"
  ./ci/tests/puppeteer/run.sh ./ci/tests/puppeteer/scenarios/"${scenario}"
}
```

## Gradle Build

Check for dependency insight information:

{% include googlead1.html  %}

```bash
function gdep() {
  echo -e "${GREEN}Checking dependency $1 under configuration $2...${NORMAL}"
  gm dependencyInsight --configuration "$2" --dependency "$1" -DskipVersionConflict=true
}
```

## Git Repository

Commit changes to the repository:

```bash
function cm() {
  echo -e "${BLUE}----------${WHITE}${NORMAL}"
  echo -e "${GREEN}Commit message:\n${WHITE}\t$1\n${NORMAL}"

  echo "${GREEN}Adding all changes...${NORMAL}"
  git add --all
  echo "${GREEN}Committing changes...${NORMAL}"
  git commit -S -am "$1"
  echo -e "${BLUE}----------${WHITE}${NORMAL}"
  echo -e "${GREEN}\nStatus:${NORMAL}"
  git status
}
```

{% include googlead1.html  %}

Pull changes from `origin/master`:

```bash
function gpl() {
  echo -e "${GREEN}Pulling changes from master...${NORMAL}"
  git pull origin master --no-edit \
    --allow-unrelated-histories --rebase \
    --recurse-submodules=on-demand
  echo -e "${GREEN}Status:${NORMAL}"
  git status
}
```

Push changes to `origin/master`:

```bash
function gps() {
  echo -e "${GREEN}Pushing changes...${NORMAL}"
  git push --recurse-submodules=on-demand origin master
}
```

Commit an *empty commit* to the build:

{% include googlead1.html  %}

```bash
function emptycommit() {
  git commit --allow-empty -m "Trigger build with an update"
}
```

Fetch a pull request as a local branch:

```bash
function fetchpr() {
  pullid=$1
  branch="pr-${pullid}"
  clear
  git fetch origin pull/$pullid/head:$branch
  echo -e "${GREEN}Done.${NORMAL}\n"
  echo -e "${GREEN}Switching to local branch ${CYAN}[$branch]${NORMAL}"
  git checkout $branch
}
```

## Miscellaneous 

Launch into a running Docker container using `bash`:

{% include googlead1.html  %}

```bash
function dockerbash() {
    export CID=$(docker ps -aqf "name=$1"); docker exec -it $CID /bin/bash
}
```

Launch into a running Docker container using `sh`:

```bash
function dockersh() {
    export CID=$(docker ps -aqf "name=$1"); docker exec -it $CID /bin/sh
}
```

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html
[initializr]: https://casinit.herokuapp.com
[testproc]: https://apereo.github.io/cas/development/developer/Test-Process.html
[buildproc]: https://apereo.github.io/cas/development/developer/Build-Process.html