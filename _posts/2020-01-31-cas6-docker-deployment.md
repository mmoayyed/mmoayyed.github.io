---
layout:     post
title:      Apereo CAS - Dockerized Deployments
summary:    Review a number of strategies that allow to create Docker images for your CAS deployment and run Docker containers with ease.
tags:       [CAS]
---

CAS [embraced Docker](https://github.com/apereo/cas-webapp-docker) a while ago by providing a sample `Dockerfile` template to kickstart the builds. Since then, both configuration and technology have evolved greatly to simplify Docker-based deployments of CAS in much easier and hassle-free ways. This tutorial begins to review strategies that exist today to allow a CAS adopter to create Docker images for a CAS deployment and run containers with ease.

 Our starting position is based on the following:

- CAS `6.2.x`
- Java 11
- [CAS Overlay](https://github.com/apereo/cas-overlay-template) (The `master` branch specifically)
- [Docker](https://www.docker.com/get-started)

## Jib

[Jib](https://github.com/GoogleContainerTools/jib) is an open-source Java containerizer from Google. It is a container image builder that handles all the steps of packaging the CAS web application into a container image. It does not require you to write a Dockerfile or have Docker installed, and it is directly integrated into CAS WAR overlay.

Once you have cloned the CAS WAR overlay, you can examine the relevant task via:

```bash
./gradlew tasks

Jib tasks
---------
jib - Builds a container image to a registry.
jibBuildTar - Builds a container image to a tarball.
jibDockerBuild - Builds a container image to a Docker daemon.
```

You can build Docker image direcly with jib using:

```bash
./gradlew jibDockerBuild

Setting image creation time to current time; your image may not be reproducible.

Containerizing application to Docker daemon as org.apereo.cas/cas:v6.2.0-SNAPSHOT...
Base image 'adoptopenjdk/openjdk11:alpine-jre' does not use a 
specific image digest - build may not be reproducible
The base image requires auth. Trying again for adoptopenjdk/openjdk11:alpine-jre...
The credential helper (docker-credential-desktop) has 
nothing for server URL: registry-1.docker.io

Got output:

credentials not found in native keychain

The credential helper (docker-credential-desktop) 
has nothing for server URL: registry.hub.docker.com

Got output:

credentials not found in native keychain

Using base image with digest: sha256:5c87145a62b49a7620

Container entrypoint set to [docker/entrypoint.sh]

Built image to Docker daemon as org.apereo.cas/cas:v6.2.0-SNAPSHOT
Executing tasks:
[==============================] 100.0% complete
```

Next, you can exmaine your available Docker images:

```bash
$ docker images
REPOSITORY                       TAG                                IMAGE ID            CREATED              SIZE
org.apereo.cas/cas               v6.2.0-SNAPSHOT                    7e9c1d4b3ce0        About a minute ago   358MB
```

Certain configuration elements about the Docker images, such as the base image can be controlled via the `gradle.propeties` file. For more 
details, please review `gradle/dockerjib.gradle` file.

## Docker

If you prefer a more traditional approach via a native `Dockerfile`, there is one provided for you in the Overlay that can be built via:

```bash
./docker-build.sh

...
Successfully built 83c945802e31
Successfully tagged apereo/cas:v6.2.0-SNAPSHOT
Built CAS image successfully tagged as apereo/cas:v6.2.0-SNAPSHOT
REPOSITORY                  TAG                 IMAGE ID            CREATED                  SIZE
org.apereo.cas/cas          v6.2.0-SNAPSHOT     83c945802e31        Less than a second ago   249MB
```

## Docker Compose

For convenience, an additional `docker-compose.yml` is also provided to orchestrate the build, as modest as it may be:

```bash
docker-compose build

Successfully built a8b5b2d1b90e
Successfully tagged org.apereo.cas/cas:v6.2.0-SNAPSHOT
Built CAS image successfully tagged as org.apereo.cas/cas:v6.2.0-SNAPSHOT
REPOSITORY           TAG                 IMAGE ID            CREATED                  SIZE
org.apereo.cas/cas   v6.2.0-SNAPSHOT     a8b5b2d1b90e        Less than a second ago   249MB
```

## Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)
