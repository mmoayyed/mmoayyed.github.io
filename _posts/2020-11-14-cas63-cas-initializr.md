---
layout:     post
title:      Apereo CAS - WAR Overlay Initializr
summary:    Apereo CAS Initializr generates CAS WAR Overlay projects with just what you need to start quickly and accelerate CAS development and deployments.
tags:       [CAS]
---

[Apereo CAS Initializr][initializr] is a relatively new addition to the Apereo CAS ecosystem that allows you as the deployer to generate [CAS WAR Overlay][overlay] projects on the fly with just what you need to start quickly. In this tutorial, we will take a look at how the Initializr can be used to probe, create, and automate the process of a CAS deployment.

This tutorial specifically requires and focuses on:

- CAS `6.3.x`
- Java `11`
- [Apereo CAS Initializr][initializr] 

# Overview

To get started with a CAS deployment, adopters typically start with a plain [Gradle-based overlay project][overlayrepo] on GitHub and use that as a baseline for future modifications. While this has been the traditional and recommended approach for many years, it can also be rather challenging for a relatively-novice user new to the ecosystem to download, modify and prepare an overlay project to include all required customizations. Given the overlay project's static nature, it can also be challenging for project owners and maintainers to keep it up-to-date or offer additional enhancements and automation without affecting the baseline template.

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-8081398210264173"
     data-ad-slot="3789603713"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

To address such scenarios, [Apereo CAS Initializr][initializr] offers a fast way to pull in all the dependencies and modules needed for a CAS deployment and provides friendly and programmatic API to generate an overlay structure and required build files. The underlying framework that handles the project generation task [can be found here](https://github.com/spring-io/initializr).

Let's review the setup.

# Project Generation

The [CAS Initializr][initializr] can be invoked using `curl` to generate an overlay project. To access the CAS Initializr, the following strategies can be used.

<div class="alert alert-info">
  <strong>Note</strong><br/>Remember that the CAS Initializr at this point in time is not able to produce an overlay project for the CAS Management web application. This functionality will be worked out in future releases.
</div>

## Heroku

The CAS projects provides a running an instance of the CAS Initializr on Heroku. To get started with this instance, a simple way might be to include the following function in your `bash` profile:

```bash
function getcas() {
  curl -k https://casinit.herokuapp.com/starter.tgz -d dependencies=$1 | tar -xzvf -
  ls
}
```

This allows you to generate a CAS overlay project using:

```bash
getcas duo,oidc
```

...which generates a CAS overlay project prepared with multifactor authentication by [Duo Security][duo] and support for [OpenID Connect][oidc].

<div class="alert alert-info">
  <strong>Note</strong><br/>To help keep the deployment costs down, the Heroku instance has turned on support for rate-limiting requests. Be aware that frequent requests may be throttled for access.
</div>

## Docker

In case the Initializr is not available on Heroku, you can also run your own Initializr instance via Docker:

```bash
docker run --rm -p 8080:8080 apereo/cas-initializr:${tag}
```

The CAS Initializr should become available at `http://localhost:8080` and will respond to API requests using `curl`. Published images and tags of the CAS Initializr [can be found here](https://hub.docker.com/r/apereo/cas-initializr/tags). Each tagged image corresponds to the CAS server version for which the image is able to produce overlay projects.

## IntelliJ IDEA

IntelliJ IDEA provides an Initializr project wizard that integrates with the CAS Initializr API to generate and import your project directly from the IDE.

![image](https://user-images.githubusercontent.com/1205228/98470078-9e842b00-21f8-11eb-9e40-6641f08da89c.png)

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-8081398210264173"
     data-ad-slot="3789603713"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

Once you have provided the basic project information, you can select the modules advertised by the CAS Initializr:

![image](https://user-images.githubusercontent.com/1205228/98470083-a2b04880-21f8-11eb-8abf-8b392039a24f.png)

## Reference Documentation

Feature modules referenced throughout [CAS documentation](https://apereo.github.io/cas) are now given the option to be included in a WAR overlay, that can be directly and conveniently generated on the spot using the CAS Initializr:

![image](https://user-images.githubusercontent.com/1205228/98765085-8546ce80-23f2-11eb-8711-fa67704783a9.png)

# Project Dependencies

CAS project modules and dependencies that can be requested must be specified by their identifier. To see a full list of all dependencies supported and available by this service, you can invoke the following command:

```bash
curl https://casinit.herokuapp.com/dependencies
```

Typically, dependency identifiers match CAS server dependency/module artifact names without the `cas-server-` prefix. Furthermore, certain dependencies can are assigned `aliases` as *shortcuts* to simplify requests. To see the full list of dependencies and their aliases, you may use:

```bash
curl https://casinit.herokuapp.com/actuator/info
```

# CAS Initializr Metadata

The metadata lists the capabilities of the service, that is the available options for all request parameters (dependencies, type, etc.) A client to the service uses that information to initialize the select options and the tree of available dependencies.

You can grab the metadata on the root endpoint with the appropriate `Accept` header:

```bash
curl -H 'Accept: application/json' https://casinit.herokuapp.com
```     

Or using `HTTPie`:

```bash
http https://casinit.herokuapp.com Accept:application/json
```

# CAS Initializr Anatomy

To better review the advantages of generating a project using the CAS Initializr, let's examine the anatomy of the generated overlay by generating a fairly plain project:

```bash
getcas duo
```

Just as before, this generates a CAS overlay project prepared with multifactor authentication by [Duo Security][duo]. At first glance, the generated overlay seems quite similar to the existing [Gradle Overlay project][overlayrepo], but on a closer look, you will find the following notable differences.

## Spring Configuration

The generated overlay comes equipped with a `CasOverlayOverrideConfiguration` that can be used to define custom Spring `@Bean` definitions. 

```
src
└── main
    ├── java
    │   └── org
    │       └── apereo
    │           └── cas
    │               └── config
    │                   └── CasOverlayOverrideConfiguration.java
    ├── resources
    │   ├── META-INF
    │   │   └── spring.factories
```

This setup should help to correctly put together an accurate structure for customizations, 
and should streamline [the extension work][extensions] that previously might have been expected of the deployer.

## Bill of Materials

The generated project takes advantage of the Spring's dependency management plugin, allowing CAS modules to be declared and used using the CAS BOM:

```groovy
dependencyManagement {
    imports {
        mavenBom "org.apereo.cas:cas-server-support-bom:${casServerVersion}"
    }
}

dependencies {
    /**
     * CAS dependencies and modules may be listed here.
     * 
     * There is no need to specify the version number for each dependency
     * since versions are all resolved and controlled by the dependency management
     * plugin via the CAS bom.
     **/
    implementation "org.apereo.cas:cas-server-support-duo"
}
```

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-8081398210264173"
     data-ad-slot="3789603713"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

As the comment indicates, there is no need to repeat the CAS version number when declaring dependencies, as those should be automatically found and imported using the referenced BOM.

## Conditional Module Selections

Let's try to generate a CAS overlay with an embedded Jetty container:

```bash
getcas jetty
```

Once you examine the result, you should notice that the appropriate module for Jetty is not included in the build, but it's taught to the build using the appropriate server container property in `gradle.properties`:

```properties
# Use -tomcat, -jetty, -undertow to other containers
# Or blank if you want to deploy to an external container
appServer=-jetty
```

This scenario should demonstrate the power of generating an overlay based on dynamic conditions at runtime and on-demand. Since the nature of the overlay project is no longer static, the result can lend itself appropriately based on given requirements and user selections and do all the grunt work automatically to prepare an ideal starting template.

## Properties & References

One great thing about the CAS Initializr is that it can automatically present a starting template for all relevant and required properties that affect module selections. At generation time, the system can determine the set of properties that control behavior for selected modules and it can automatically present a configuration template in `cas.properties` to include all affected settings along with their description, type, default value, deprecation status, and more.

```
etc
└── cas
    ├── config
    │   ├── all-cas-properties.ref
    │   ├── all-properties.ref
    │   ├── cas.properties
```

Of course, such settings are all disabled by default and one would still need to go through them to figure out the specifics of each. Having them at hand in one spot should make it relatively comfortable for one to configure, compared to copy/paste from the official CAS documentation and references. 

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-8081398210264173"
     data-ad-slot="3789603713"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

You should also notice that the above structure presents two additional *reference* files; one that contains a template of all configuration properties available to the CAS server that are not controlled or owned by the CAS server, and one that lists every setting in control of the CAS project itself. These are reference material and can be treated as dictionaries for when you needed to look up a particular setting, its description, or default value which are produced based on available [configuration metadata](/2019/12/15/cas62x-config-metadata/).

# CAS Initializr Advantages

In summary, here are a few reasons to take advantage of the CAS Initializr capabilities.

## Dynamic Project Generation

The CAS Initializr can dynamically generate a starting project based on requested modules and dependencies needed for a deployment. This behavior can be tailored to the user's experience based on that input and the conditions that follow to generate additional references, files, starting templates, and more in the same project to make the deployment process more comfortable.

## User Interface

CAS Initializr at this point is mainly a backend service and a few APIs. However, one could imagine that a graphical and modern user interface could be built on top of available APIs to help with the project generation task, especially for project newcomers.

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-8081398210264173"
     data-ad-slot="3789603713"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

## Low Maintenance Cost

Managing and maintaining a separate [overlay project][overlayrepo] and keeping it in sync with various CAS versions can be a costly maintenance task. CAS Initializr allows the project developers to automate the maintenance task, keep everything in the same repository for faster and more accurate upgrades. 

## Test & DevOps Automation

CAS Initializr is used internally by the CAS project itself in a very *'Eat Your Own Dog Food'* type of way to dynamically generate overlay projects. These generated projects are used as CAS base docker images published to Docker Hub, and as a baseline for browser/UI tests run by the [CAS CI](https://github.com/apereo/cas/actions) for each relevant feature. CAS Initializr uses itself to test itself!

# So...

Start simple and make changes one step at a time. Once you have a functional environment, you can gradually and slowly add customizations to move files around.

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribute] as best as you can.

[Misagh Moayyed](https://fawnoos.com)

[oidc]: https://apereo.github.io/cas/development/installation/OIDC-Authentication.html
[duo]: https://apereo.github.io/cas/development/mfa/DuoSecurity-Authentication.html
[overlayrepo]: https://github.com/apereo/cas-overlay-template
[overlay]: https://apereo.github.io/cas/development/installation/WAR-Overlay-Installation.html
[initializr]: https://casinit.herokuapp.com
[extensions]: https://apereo.github.io/cas/development/configuration/Configuration-Management-Extensions.html
[contribute]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html

