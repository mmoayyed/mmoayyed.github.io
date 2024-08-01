---
layout:     post
title:      Apereo CAS - Mastering Upgrades & Versions
summary:    An overview of the Apereo CAS versioning strategy and release policy and a few helpful tips and tricks to manage one's CAS Gradle overlay from one CAS version to the next.
tags:       ["CAS 7.1.x", "Spring Boot", "Gradle"]
---

The Apereo CAS project presents a rather active and healthy development cycle, with monthly maintenance releases and patch versions. There are also feature (or minor) releases typically twice a year, and the project, of course, reserves the right to publish a major release once every few years to keep up with the latest trends and technologies in the IAM and OSS ecosystem. Given a CAS deployment is made up of many moving parts, frameworks, and components, it is important to keep up with the latest CAS releases to take advantage of new features, enhancements, and security fixes.

{% include googlead1.html  %}

In this post, we will present a brief overview of the various CAS release types, their impact and maintenance needs. We will also review the necessary steps and strategies required for a CAS upgrade to outline how one may manage and adjust different CAS versions from one to the next. 

# CAS Releases

Apereo CAS generally and loosely follows the concepts of Semantic Versioning, with some small modifications and adjustments to match the realities of CAS deployments in the wild. These modifications are necessary to maintain a healthy development lifecycle and set clear expectations regarding the maintenance and support needs of the larger community. 

Let's start with the initial modest assumption that our starting CAS version is set to `A.B.C` in our CAS overlay's `gradle.properties` file:
{% include googlead1.html  %}
```properties
cas.version=A.B.C
```

<div class="alert alert-info">
  <strong>Note</strong><br/>CAS deployments are typically managed and handled using a <a href="https://github.com/apereo/cas-overlay-template">CAS overlay</a>, published via the <a href="https://getcas.apereo.org/ui">CAS Initializr</a>. This project is the reference starting point for a CAS installation and contains dedicated branches for each CAS release line. You can always cross-check your deployment with the canonical overlay to compare versions and requirements. Remember that the overlay project might change its structure or component versions, especially if the targetted release is under development or in release-candidate mode. Check early. Check often.
</div>

## Security

A CAS security release is one that is typically presented in the form of `A.B.C.1`, `A.B.C.2`, etc. Such releases directly address a targetted security issue and are generally extremely lightweight and lean in nature, and only focus on a specific area in the codebase. As a result, going from a security release to the next should be a drop-in replacement. Essentially, all you should have to do is to modify your CAS version in the `gradle.properties` file and aim for the target desired version:
{% include googlead1.html  %}
```properties
cas.version=A.B.C.1
```

That's it. Unless the instructions clearly indicate otherwise, or you have made significant code modifications to your CAS overlay, that is all you should have to do. No more, no less. You can pretty much close your eyes and proceed with the CAS upgrade with the assurance that nothing else in your build will require any attention except the area that is affected by the security release, which is typically buried in the bowls of the software itself and should be largely invisible to you.
{% include googlead1.html  %}
Note that security releases are not, strictly speaking, `100%` backward compatible when it comes to CAS APIs. If you have made code modifications to your CAS build, especially in the areas that might be affected by the security release, you might be expected to make adjustments. Of course, every effort is made to ensure breaking APIs are avoided or kept to a minimum but sometimes and depending on the nature of the fix, this might not be completely avoidable. Likewise, you might see differences in CAS behavior at runtime if you are affected by the security issue, which makes it super important to have a solid test suite to verify that changes are up to your expectations as you progress.
{% include googlead1.html  %}
<div class="alert alert-info">
  <strong>Note</strong><br/>By now, it should hopefully be somewhat obvious that the less you modify, the easier your upgrade path will be. The moment you start modifying code or otherwise touch the internals of the CAS software, you have essentially submitted an application to adopt a child and you will have to care for that child for as long as you live and stay within this ecosystem. Favor less work, and resist change unless you have excellent reasons to do so, and maybe not even then.
</div>

For the majority of deployments, changing the CAS version in that one line is enough. You do not need to reboot or refresh your entire CAS overlay project from scratch or make any other significant modifications to your build unless there are very, very good reasons to do so. The CAS project largely supports the mantra of favoring less work, and this is very much in line with that spirit.

## Patch (Maintenance)

A CAS patch or maintenance release is one that is typically presented in the form of `A.B.1`, `A.B.2`, etc. When the right-most number changes, it signals to the adopter that this release contains small enhancements and bug fixes largely deemed to be backward compatible, save the usual exceptions when it comes to code or runtime behavior. A maintenance release is usually very small and focused in nature and targets one or more areas in the CAS ecosystem that likely suffer from bugs and defects, be it Java components, user interface, language bundles, documentation, etc.
{% include googlead1.html  %}
Patch releases typically come out once every 30 days. You can watch the [release schedule here](https://github.com/apereo/cas/milestones).

Similar to security releases, a maintenance release does not require the adopter to reboot or refresh the CAS overlay project, and will never, intentionally of course, force breaking API changes or require major upgrades to the deployment environment or the underlying Java platform or relevant build tools. In a maintenance release, (and while there are some super minor exceptions to this rule from time to time such as servlet container versions like Apache Tomcat, etc), nothing else other than CAS itself changes.

<div class="alert alert-info">
  <strong>Note</strong><br/>By now, you likely may have noticed that the general recommendation is to keep up with CAS security and/or maintenance releases as they are published. This will put you in a reasonable security posture and makes it easier to stay relevant, when and if the time comes.
</div>

For such versions, all you should have to do is to modify your CAS version in the `gradle.properties` file and aim for the target desired version:
{% include googlead1.html  %}
```properties
cas.version=A.B.1
```

That's it, you're done. Remember that there is no way to mess this up; if you are unhappy with the newer version, you can just adjust that one line and go back and forth as you wish.

## Feature (Minor)

A CAS feature or minor release is one that is presented in the form of `A.1.C`, `A.2.C`, etc. When the middle number changes, it signals to the adopter that this release contains somewhat significant features and enhancements such as new integrations, new extensions and more. Feature releases might not be completely backwards-compatible when it comes to CAS APIs, configuration and/or runtime behavior.
{% include googlead1.html  %}
Feature releases usually come out once every 6 months, and present a series of *beta* or release candidates along with relevant release notes for each to highlight breaking changes and summarize new features. The goal here is for the adopter to be able to follow along the process, keep tabs on potential breaking changes relevant for their deployment and hopefully contribute feedback and fixes. A release candidate, by definition, is exactly that: a candidate that may be somewhat *unstable* for a very specific definition of stability. In a CAS release candidate, the system and the build might depend on `SNAPSHOT` or `RC` libraries, and certain types of functionality or extensions might be tagged as *WIP*. APIs might change from candidate to candidate. Remember that the goal here is to demonstrate progress and collect feedback.

Specifically a CAS feature release might require the interested adopter to:
{% include googlead1.html  %}
1. Upgrade the version of the Gradle build tool
2. Adjust many other build-level components and versions in the CAS overlay.
3. Upgrade the desired server container, such as Apache Tomcat or Jetty.
4. Rework CAS configuration, application registration records, etc in small and modest ways.

<div class="alert alert-info">
  <strong>Note</strong><br/>A CAS feature release will never ever change the Java platform requirement and will reject any and all other component upgrades that might ask for a newer Java version. Special consideration is also made to ensure data that is produced by CAS that is meant to hang around and stay for the long-term remains compatible and unmolested with newer versions, except for very small cosmetic changes from time to time.
</div>
{% include googlead1.html  %}
As a result, it might be easier to reboot and refresh the CAS overlay and start anew, unless you really know what you're doing and have kept up with the release progress and process over the months. It may not be immediately enough to just upgrade the CAS version in your build; other plugins and components used in the build might also need your attention.

## Major

A CAS major release is one that is presented in the form of `1.B.C`, `2.B.C`, etc. When the left-most number changes, it signals to the adopter that this release *could* contain significant features and enhancements such as new integrations and most importantly, platform-level requirements might have changed. You may be asked to go to a newer Java version, or an entirely different operating system, etc. A major release is, by definition, free to change anything and everything, though, of course, every effort is made to ensure application data and configuration remain compatible. Should the need show up, however, with very, very good reasons, a major release allows for that sort of change to pass.
{% include googlead1.html  %}
CAS major releases do not follow a predefined schedule; they are decided upon by the project maintainers and developers when time and technology feel right and are in demand. Anecdotally, they are released once every few years mainly to keep up with the Java release cadence. Just as before, it might be easier to reboot and refresh the CAS overlay and start anew, unless you really know what you're doing.

# Recommendations

- Try to keep up with the CAS release train as much as possible, especially for security and maintenance releases.
- Do *NOT* make major (code) modifications to your CAS build. You will soon come to regret it.
- Make sure you have a decent and solid test suite to verify upgrades as quickly as possible.
{% include googlead1.html %}
- Have a decent CI/CD pipeline and enough automation in place to let you roll forward and back as necessary.
- Try to play around and experiment with the CAS release candidates; this will save you time, prevent surprises and ultimately the broader community will benefit from your engagement and enthusiasm. 
- Keep up with and browse the CAS release notes where possible. CAS publishes release notes mainly for feature and major releases, largely hoping to win a Nobel prize in literature. A secondary goal is to allow you to understand what's going on and what you might have to watch out for when the time comes. Pay attention; 3 hours of debugging can save you 5 minutes of reading the documentation.
{% include googlead1.html %}
- Consider evaluating [upgrade recipes](/2024/03/07/cas70x-upgrades-openrewrite/) that aim to automate certain aspects of the upgrade process. 

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services. 

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)