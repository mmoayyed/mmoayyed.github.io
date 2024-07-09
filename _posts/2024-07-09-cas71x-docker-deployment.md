---
layout:     post
title:      Apereo CAS - Dockerized Deployments
summary:    Review a number of strategies that allow to create Docker images for your CAS deployment and run Docker containers with ease.
tags:       ["CAS 7.1.x", "Docker"]
---

CAS embraced Docker a while ago by providing a sample `Dockerfile` template to kickstart the builds. Since then, both configuration and technology have evolved greatly to simplify Docker-based deployments of CAS in much easier and hassle-free ways. This tutorial begins to review strategies that exist today to allow a CAS adopter to create Docker images for a CAS deployment and run containers with ease.

{% include googlead1.html  %}

 Our starting position is based on the following:

- CAS `7.1.x`
- Java `21`
- [CAS Overlay](https://github.com/apereo/cas-overlay-template) (The `7.1` branch specifically)
- [Docker](https://www.docker.com/get-started)

## Jib

[Jib](https://github.com/GoogleContainerTools/jib) is an open-source Java containerizer from Google. It is a container image builder that handles all the steps of packaging the CAS web application into a container image. It does not require you to write a Dockerfile or have Docker installed, and it is directly integrated into CAS WAR overlay.

Once you have cloned the CAS WAR overlay, you can examine the relevant task via:
{% include googlead1.html  %}
```bash
./gradlew tasks

Jib tasks
---------
jib - Builds a container image to a registry.
jibBuildTar - Builds a container image to a tarball.
jibDockerBuild - Builds a container image to a Docker daemon.
```

{% include googlead1.html  %}

You can build Docker image direcly with jib using:

```bash
./gradlew --no-configuration-cache jibDockerBuild
```

Next, you can exmaine your available Docker images:
{% include googlead1.html  %}
```bash
$ docker images

REPOSITORY                       TAG                                IMAGE ID            CREATED              SIZE
org.apereo.cas/cas               v7.1.0                            8e9c1d4b3ce0        About a minute ago   358MB
```

You can also invoke the `jib` task, specify the platforms for the architectures you need, and also push the final image to relevant Docker repositories:
{% include googlead1.html  %}
```bash
./gradlew jib --no-configuration-cache \
    -PdockerImagePlatform="amd64:linux,arm64:linux" \
    -DdockerUsername="$DOCKER_USER" \
    -DdockerPassword="$DOCKER_PWD"
```

Docker images can support multiple platforms, which means that a single image may contain variants for different architectures, and sometimes for different operating systems, such as Windows. When you run an image with multi-platform support, Docker automatically selects the image that matches your OS and architecture. 

Certain configuration elements about the Docker images, such as the base image can be controlled via the `gradle.propeties` file. 
{% include googlead1.html %}
```properties
containerImageOrg=apereo
containerImageName=cas

baseDockerImage=azul/zulu-openjdk:21
allowInsecureRegistries=false
dockerImagePlatform=amd64:linux
```

## Docker

If you prefer a more traditional approach via a native `Dockerfile`, there is one provided for you in the Overlay that can be built via:

{% include googlead1.html  %}

```docker
./gradlew casBuildDockerImage
```

## Docker Compose

For convenience, an additional `docker-compose.yml` is also provided to orchestrate the build, as modest as it may be:

{% include googlead1.html  %}

```bash
docker-compose build
```

## Spring Boot

The most recent versions of the overlay provide a variant of the Spring Boot Gradle plugin that can create an OCI image using Cloud Native Buildpacks. Images can be built using the bootBuildImage task:
{% include googlead1.html  %}
```bash
./gradlew --no-daemon bootBuildImage
```

It’s important to note that the bootBuildImage task requires access to a Docker daemon. By default, it will communicate with a Docker daemon over a local connection. This works with Docker Engine on all supported platforms without configuration.

Just like before, certain configuration elements about the Docker images, such as the base image can be controlled via the `gradle.propeties` file. 

{% include googlead1.html  %}
```properties
containerImageOrg=apereo
containerImageName=cas

baseDockerImage=azul/zulu-openjdk:21
allowInsecureRegistries=false
dockerImagePlatform=amd64:linux
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

## Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)
