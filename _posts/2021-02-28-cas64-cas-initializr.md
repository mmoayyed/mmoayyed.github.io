---
layout:     post
title:      Apereo CAS - WAR Overlay Initializr
summary:    Apereo CAS Initializr generates CAS WAR Overlay projects with just what you need to start quickly and accelerate CAS development and deployments.
tags:       ["CAS 6.4.x", "Getting Started", "Gradle"]
---

[Apereo CAS Initializr][initializr] is a relatively new addition to the Apereo CAS ecosystem that allows you as the deployer to generate WAR Overlay projects on the fly with just what you need to start quickly. This post builds on top of the original [blog entry](/2020/11/14/cas63-cas-initializr/) and reviews recent enhancements to the [Apereo CAS Initializr][initializr] concerning support for additional project types and publishing Docker images.

{% include googlead1.html  %}

This post specifically requires and focuses on:

- CAS `6.4.x`
- Java `11`
- [Apereo CAS Initializr][initializr] 

# Project Types

Resuming from the [initial effort](/2020/11/14/cas63-cas-initializr/), the [Apereo CAS Initializr][initializr] is now able to support the generation of additional project types. The project selection is indicated using a `type` parameter. Let's review a few examples together.

## CAS Overlay

Just as before, you may generate a CAS WAR overlay project using the following command:

```bash
curl -k http://getcas.apereo.org/starter.tgz \
  -d dependencies="core,duo" -d type=cas-overlay \
  -d baseDir=overlay | tar -xzvf -
```

{% include googlead1.html  %}

...which will generate a `cas-overlay` project based on the requested modules (i.e. dependencies) inside the `overlay` directory. Of course, note that the `type` parameter is optional here and is the default type for [Apereo CAS Initializr][initializr].

## CAS Spring Boot Admin Overlay

You may generate a [CAS Spring Boot Admin](https://apereo.github.io/cas/6.4.x/monitoring/Configuring-Monitoring-Administration.html) WAR overlay project using the following command:

```bash
curl -k http://getcas.apereo.org/starter.tgz \
  -d type=cas-bootadmin-server-overlay \
  -d baseDir=overlay | tar -xzvf -
```

## CAS Spring Cloud Configuration Server Overlay

You may generate a [CAS Spring Cloud Configuration Server](https://apereo.github.io/cas/6.4.x/configuration/Configuration-Server-Management.html) WAR overlay project using the following command:

{% include googlead1.html  %}

```bash
curl -k http://getcas.apereo.org/starter.tgz \
  -d type=cas-config-server-overlay \
  -d baseDir=overlay | tar -xzvf -
```

## CAS Spring Cloud Discovery Server Overlay

You may generate a [CAS Spring Cloud Discovery Server](https://apereo.github.io/cas/6.4.x/installation/Service-Discovery-Guide-Eureka.html) WAR overlay project using the following command:

{% include googlead1.html  %}

```bash
curl -k http://getcas.apereo.org/starter.tgz \
  -d type=cas-discovery-server-overlay   \
  -d baseDir=overlay | tar -xzvf -
```

## CAS Management Server Overlay

You may generate a [CAS Management Server](https://apereo.github.io/cas/6.4.x/services/Installing-ServicesMgmt-Webapp.html) WAR overlay project using the following command:

```bash
curl -k http://getcas.apereo.org/starter.tgz \
  -d type=cas-mgmt-overlay   \
  -d baseDir=overlay | tar -xzvf -
```

# Advantages

In summary, here are a few reasons to take advantage of the CAS Initializr capabilities.

## Low Maintenance Effort

The maintenance effort to manage and update multiple overlay projects as starting templates for deployments is now reduced to one unified codebase. Updating various version numbers to produce new versions of each overlay can be done centrally in one codebase without having to manually manage, update and keep track of different projects.

{% include googlead1.html  %}

<div class="alert alert-info">
  <strong>Note</strong><br/>It is expected that at some point, previous/existing overlay projects would be deprecated and ultimately removed, allowing the CAS Initializr to be the one true way to generate a starting template project for CAS deployments.
</div>

## Uniform Builds

The structure and build process for each overlay project is now uniformly consistent and similar, which helps with reducing the learning curve and entry barriers for new adopters and users. Build tasks, customizations, and other relevant settings in this area are all managed centrally, and should mainly differ in the final produced artifact and not much in the way artifacts are built.

## Automated Project Validation

[Apereo CAS Initializr][initializr] can validate each overlay project via consistent continuous integration builds, which of course allows for a more comfortable upgrade process as artifacts and version numbers change.

{% include googlead1.html  %}

{% include image.html img="https://user-images.githubusercontent.com/1205228/109414208-f83a7c00-79c6-11eb-82f4-c03de70297ae.png"
width="40%" 
title="Apereo CAS Initializr continuous integration build for automated validation" %}

## Docker Images

Once validation efforts succeed and are approved continuous integration system, [Apereo CAS Initializr][initializr] can automatically publish Docker images for each overlay project:

{% include image.html img="https://user-images.githubusercontent.com/1205228/109414377-c8d83f00-79c7-11eb-953c-a8a7e588b913.png" 
title="Apereo CAS Initializr publishing Docker images into Docker Hub for overlay projects" %}

## Dynamic Project Generation

The CAS Initializr can dynamically generate a starting project based on the requested modules and dependencies needed for a deployment. This behavior can be tailored to the user's experience based on that input and the conditions that follow to generate additional references, files, starting templates, and more in the same project to make the deployment process more comfortable.

## User Interface

CAS Initializr at this point is mainly a backend service and a few APIs. However, one could imagine that a graphical and modern user interface could be built on top of available APIs to help with the project generation task, especially for project newcomers.

{% include googlead1.html  %}

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

Start simple and make changes one step at a time. Once you have a functional environment, you can gradually and slowly add customizations to move files around.

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

[Misagh Moayyed](https://fawnoos.com)

[initializr]: https://getcas.apereo.org
[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html