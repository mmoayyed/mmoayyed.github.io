---
layout:     post
title:      Apereo CAS - Docker Images via Spring Boot
summary:    Learn how to use an existing CAS overlay to build Docker images via Spring Boot.
tags:       [CAS]
---

A very common way to package and deploy Apereo CAS is via Docker. There are numerous strategies, such as those outlined by [this post](/2018/11/09/cas6-docker-jib/) or [this post](/2020/01/31/cas6-docker-deployment/) that can be used to transform an existing CAS overlay into a packaged Docker image. This tutorial focuses on producing Apereo CAS Docker images via the [Spring Boot Gradle plugin][plugin].

Apereo CAS, as a Spring Boot application, supports building a container from Gradle using the Spring Boot Gradle build plugin. Similar to previous approaches, the most interesting thing about this approach is that you don’t need a Dockerfile. You build the image using the same standard container format as you get from `docker build` - and it can work in environments where docker is not installed.

{% include googlead1.html  %}

This tutorial specifically requires and focuses on:

- CAS `6.3.x`
- Java `11`
- Docker
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

## Configuration

To get started quickly, the CAS overlay must be modified in small ways to allow the generation of a Docker image. The most important change is to allow the Spring Boot plugin to locate the main application class by including the following dependency in the build:

```gradle
implementation "org.apereo.cas:cas-server-webapp-init:${casServerVersion}"
```

Furthermore, it might also be preferable to customize the generated image name and tag:

```gradle
bootBuildImage {
    imageName = "apereo/cas:${casServerVersion}"
}
```

{% include googlead1.html  %}

The most recent versions of the overlay provide a variant of the Spring Boot Gradle plugin that can create an OCI image using Cloud Native Buildpacks. Images can be built using the `bootBuildImage` task:

```bash
./gradlew clean build bootBuildImage 
```

It's important to note that the `bootBuildImage` task requires access to a Docker daemon. By default, it will communicate with a Docker daemon over a local connection. This works with Docker Engine on all supported platforms without configuration. For additional details, please see the [reference documentation][plugin].

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[plugin]: https://docs.spring.io/spring-boot/docs/current/gradle-plugin/reference/html/
[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html

