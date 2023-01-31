---
layout:     post
title:      Apereo CAS - WAR Overlay Overrides
summary:    Learn how to override and overwrite configuration files and even source code artifacts provided by the CAS distribution in your deployment for maximum flexibility and customizability. 
tags:       ["CAS 7.0.x", "CAS 6.6.x", "CAS 6.5.x", "Getting Started", "Gradle"]
---

CAS deployments oftentimes need to customize and/or overwrite behavior that is offered by the upstream project. This may be done to introduce new behavior, fix a bug, or completely change the meaning of the custom component to account for very specific scenarios. In some cases, specifically in the case of source code components and `.java` files, it may not always be possible to handle this override via special Spring-based component implementations that replace an existing `@Bean`, and the upstream component itself may lend itself to easy extensions and overrides. In these scenarios, deployers can download the source code or configuration artifact and pull that into their deployments to allow their build to use their version of the file(s) instead of the default.

{% include googlead1.html %}

In this post, we will briefly take a look at strategies that allow one to overwrite configuration files and source code from the upstream CAS project without having to manually rebuild the entire codebase from the source. This tutorial specifically requires and focuses on:

- CAS `7.0.x`
- Java `17`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

# Source Files

Let's suppose that a CAS deployment is taking advantage of certain fancy features provided by the following extension:

```groovy
implementation "org.apereo.cas:cas-server-support-fancy"
```
{% include googlead1.html %}
If we examine the module at its source, we'll find that it has the following structure:

```
└── src
    ├── main
    │   ├── java
    │   │   └── org
    │   │       └── apereo
    │   │           └── cas
    │   │               └── monitor
    │   │                   ├── Fancy.java
```

...with the `Fancy.java` file above that might contain:

```java
public interface Fancy {
    String NAME = "Hello";
}
```
{% include googlead1.html %}
Let's say a use case at hand requires the value of that field to change from `Hello` to `Hi`. To do so, you need to create the following file in your WAR overlay project directory:

```
src/main/java/org/apereo/cas/monitor/Fancy.java
```

...and then re-create the same `Fancy.java` using its exact name, and of course, change the field:

```java
public interface Fancy {
    String NAME = "Hi";
}
```

Next, when you build and deploy CAS, the runtime will select the compiled binary version of this file instead of what ships with CAS.

## Follow-up

While this can be a fairly handy trick, you **MUST** try to **NEVER** do this! Overriding a project source file from the upstream project in its entirety and owning a full copy of the file in your deployment presents very dangerous risks. 
{% include googlead1.html %}
- Your upgrade process will be difficult since you will have to always cross-check your changes with the newer versions of the file. This will quickly get out of hand if you end up modifying multiple files!
- You will not receive fixes from security patch releases provided by the upstream project if they affect the same file. After all, you're overwriting the file and the build will always take your copy regardless of what happens upstream!
- For your deployment to build and compile, you might need to introduce and add additional dependencies and libraries to the build.
- The change, in most cases and my experience, will be entirely undocumented. Did you remember to document the ins and outs of change so you or your colleagues might remember the why, 3 years from now? Likely not.

As ever, note that just because you *can* do something, it does not mean that you *should*. This strategy should always be a last resort.

# Resources

The same strategy, though with a less severe effect, works for resources such as message bundles, CSS, Javascript, and HTML pages. For example, the WAR overlay is capable of fetching message bundles for you to overwrite:

```bash
./gradlew getResource -PresourceName=messages.properties
```
{% include googlead1.html %}
<div class="alert alert-info">
  <strong>Remember</strong><br/>Only overlay and modify files you need and try to use externalized resources and configuration as much as possible. Just because you CAN override something in the default package, it doesn't mean that you should.
</div>

As another example, to modify the CAS HTML views you can use:

```bash
./gradlew getResource -PresourceName=footer.html
````
... to bring the view into your overlay. 

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html