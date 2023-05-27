---
layout:     post
title:      Apereo CAS - Overriding Dependency Versions
summary:    Learn how to modify CAS overlays built with Gradle to override and adjust dependency versions and upgrade libraries. 
tags:       ["CAS 6.6.x", "Gradle", "Spring Boot", "Apache Tomcat"]
---

This post provides insights into dependency management options with Gradle and the CAS overlay that can be used to manipulate the CAS build to control and change dependency and library versions. Manual dependency upgrades typically are the solution to removing a particular defective library from the build and switching to something more recent and functional for a use case, or upgrading a library to remove a CVE that is often reported by a security scanner.

{% include googlead1.html  %}

In this post, we will demonstrate how the CAS Gradle build can be modified to change the Apache Tomcat version that does ship with CAS. Our starting position is as follows:

- CAS `6.6.x`
- Java `11`

## Disclaimer

While this can be a fairly handy trick, you **MUST** **NEVER** do this unless you absolutely and unconditionally have no other reasonable choices! Overriding a project dependency version from the upstream project can present very dangerous risks. 

{% include googlead1.html %}
- As soon as you control a given dependency and its lifecycle, you will then be tasked from that point on to continuously look after that dependency, watch out for newer releases for potential upgrades and worry about how that change might affect everything else in your build. Upstream dependency upgrades would be invisible and ineffective to you...which of course is the point of this entire exercise.
- As a consequence, your upgrade process will be difficult since you will have to always cross-check your changes with the newer versions of CAS. This will quickly get out of hand if you end up modifying multiple dependency libraries and their dependency hierarchy.
{% include googlead1.html  %}
- For your deployment to build and compile, you might need to introduce and add additional dependencies and libraries to the build. You will also need to take care of all transitive dependencies that might be brought into the build and all potential conflicts they might introduce, which are often invisible at build time.
- Potential dependency conflicts where you possibly end up with multiple versions of the same library can be fatal to one's deployment at runtime and may cause the deployment to be entirely unpredictable. Such deployments often tend to work in one environment and not another, depending on how server containers and classloaders favor one version of a jar library over another.

As ever, note that just because you *can* do something, it does not mean that you *should*. This strategy should always be a last resort.

# Scenario

Let's begin with the premise that our CAS deployment is set to ship with an embedded Apache Tomcat container which by default is fixed at version `10.1.8`. Our objective, for whatever reason (bug, security, etc), is to downgrade this version of Apache Tomcat to `10.1.7`. 

<div class="alert alert-info">
  <strong>Note</strong><br/>This is not meant to be an exact, step-by-step guide. Rather, it's a modest overview of the overall process. Basic familiarity with Gradle, as well as the structure of the CAS Overlay project, is required.
</div>
{% include googlead1.html  %}
To handle this change, we'll need to effectively do three things with the initial assumption that our desired version is already defined in the `gradle.properties` file:

```properties
tomcatVersion=10.1.7
```

First, we'll need to take advantage of Gradle's [dependency substitution feature](https://docs.gradle.org/current/userguide/resolution_rules.html). Gradle offers a powerful API for manipulating a requested dependency before that dependency is resolved. The feature currently offers the ability to change the group, name, and/or version of a requested dependency, allowing a dependency to be substituted with a completely different module during resolution.
{% include googlead1.html  %}
```groovy
eachDependency { DependencyResolveDetails dependency ->
    def requested = dependency.requested
    if (requested.group.startsWith("org.apache.tomcat") && requested.name != "jakartaee-migration")  {
        dependency.useVersion("${tomcatVersion}")
    }
}
```

Then, we will force the Gradle build to bring forth the required Apache Tomcat dependencies into the build so they can pass through our resolution rules:
{% include googlead1.html  %}
```groovy
if (project.appServer == "-tomcat") {
    implementation "org.apereo.cas:cas-server-webapp-init${project.appServer}:${project.'cas.version'}"
}
```

Lastly, we will need to adjust the `overlay` construct in the Gradle build to exclude all Apache Tomcat dependencies that are brought over by default by the initial build:

```groovy
cas {
    excludes = ["WEB-INF/lib/servlet-api-2*.jar", "WEB-INF/lib/tomcat-*.jar"]
}
```
# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html