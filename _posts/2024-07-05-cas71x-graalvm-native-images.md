---
layout:     post
title:      Apereo CAS - Native Images with Graal VM
summary:    Learn how to build and deploy Apereo CAS as a Graal VM Native Image to gain super-fast startup time with a small memory footprint.
tags:       ["CAS 7.1.x", "Graal VM", "Gradle"]
---

[Graal VM](https://www.graalvm.org/) is an advanced JDK with ahead-of-time compilation, offering a high-performance runtime that provides significant advantages over traditional JVMs. One of the standout features of Graal VM is its native image tool, which allows developers to compile Java applications such as Apereo CAS into standalone native executables. This capability is particularly interesting, as it brings a host of benefits, including reduced startup time, lower memory consumption, and improved performance.
{% include googlead1.html %}
Creating an Apereo CAS native image with Graal VM can drastically improve the startup time and reduce the size of the final artifact, However, while the advantages are compelling, you may still face challenges such as (much) longer build times, handling dynamic features of Java and ensuring compatibility with existing libraries.
{% include googlead1.html %}
In this blog post, we'll figure out the essentials of Graal VM's native image tools and will attempt to build a native image with the Apereo CAS WAR overlay. Our starting position is as follows:

- CAS `7.1.x`
- Java `21`

# What is a Graal VM Native Image?

The most famous aspect of the Graal VM ecosystem is probably the *SubstrateVM (SVM)* project, which allows one to compile a Java application into *native executables*. This is also called a ahead-of-time (AOT) compiler. This means that once you compile the CAS web application into a native executable, it can run without a JVM. 
{% include googlead1.html %}
So, what you get is a self-contained executable that contains everything it needs to run in a target environment. As a result, the application starts up super fast without the need for the JVM or the extra code generation step with JIT. Very cool, eh? 
{% include googlead1.html %}

<div class="alert alert-info">
  <strong>Note</strong><br/>A native image built using one OS architecture cannot be targetted or executed on a different OS architecture. If you're building a Java application as a native image on the Linux platform, that cannot then be run on a MacOS or Windows platform just like you cannot <i>simply</i> take a <code>.exe</code> Windows file and run it on Linux. All you have is a native binary that must be built and executed on the same type of system architecture.
</div>

# CAS Graal VM Native Images

As discussed, a CAS Graal VM Native Image is a complete, platform-specific executable. You do not need to ship a Java Virtual Machine in order to run a CAS native image. The native image build process requires and uses ahead-of-time (AOT) processing in order to create the CAS native executable. This ahead-of-time processing involves statically analyzing CAS application code from its main entry point. During this AOT processing phase, the CAS web application is started up to the point that Spring bean *definitions* are available. Bean *instances* are NOT created during the AOT processing phase.
{% include googlead1.html %}
So what do you need to build your CAS server as a Graal VM Native Image?

- Of course, you need [the Graal VM distribution](https://www.graalvm.org/downloads/) itself.
- The ability to work with Graal VM native image is and will only be available in CAS deployments that run with an embedded server container. When building a CAS Graal VM native image, an embedded server container backed by Apache Tomcat will be automatically provided.
- The build machine that ultimately produces the CAS Graal VM native image is preferred to be running Linux with at least 16GB of memory and 4 CPU cores.
{% include googlead1.html %}
<div class="alert alert-info">
  <strong>Note</strong><br/>Building CAS Graal VM native images can be quite resource-intensive and time-consuming. Depending on the number of modules included in the build, CAS configuration options and the horsepower of the build machine and available memory, the build time can vary greatly and typically is in the neighborhood of 10~20 minutes and perhaps longer.
</div>
- Finally, you need to [generate a CAS Overlay](https://getcas.apereo.org/ui) with support for Graal VM native image:
{% include googlead1.html %}
{% include image.html img="/images/blog/assets/nativeimage.png" width="50%" title="Apereo CAS - Native Images with Graal VM" %}

# The Build

As a baseline, let's build a vanilla CAS web application and boot it up to measure its current capabilities and startup time:
{% include googlead1.html %}
```bash
./gradlew clean build
...
java -jar build/libs/cas.war
```

On this current workstation, CAS shows up with the following statement:

```
Started CasWebApplication in 8.405 seconds (process running for 9.489)
```

If you examine the set of tasks that are available to the build with `./gradlew tasks`, you should find the following:

```bash
nativeCompile - Compiles a native image for the main binary
```

You will need to make sure `GRAALVM_HOME` is correctly set:
{% include googlead1.html %}
```bash
export GRAALVM_HOME="/path/to/where/graalvm/is/installed"
```

Let's build:

```bash
./gradlew nativeCompile -PnativeImage=true
```
{% include googlead1.html %}
...and [we wait](https://github.com/oracle/graal/issues/5327).

<div class="alert alert-info">
  <strong>Note</strong><br/>Again, building CAS Graal VM native images can be quite resource-intensive and time-consuming. Once you run the build, be patient here.
</div>

Once the build process is finished, you'll see similar statements like below in the logs:

```
...
Produced artifacts:
 /cas/build/native/nativeCompile/cas (executable, debug_info)
 /cas/build/native/nativeCompile/sources (debug_info)
=====================================================
Finished generating 'cas' in 2m 57s.
[native-image-plugin] Native Image written to: /cas/build/native/nativeCompile
```

This means we are now ready to launch the CAS native image:
{% include googlead1.html %}
```bash
./build/native/nativeCompile/cas
```

...and when CAS is ready, you should see a significant difference in startup time:

```
Started CasNativeWebApplication in 1.547 seconds (process running for 1.581)
```

# Analysis

While the CAS startup time is orders of magnitude faster than on the traditional JVM, you should nonetheless note that CAS Graal VM native images are an *evolving technology*. Not all libraries used by CAS and not all modules offered by CAS provide support for native images. In particular, Apache Log4j does not (yet, as of this writing) support native images. Furthermore, all capabilities and features that load, parse and execute Groovy scripts, or load dynamic code constructs might present a major blocker. Finally, the number of libraries and extension modules included in your build could significantly impact build time.
{% include googlead1.html %}

CAS itself will provide a large body of native image *hints* for many of the modules found in the codebase. This process and native image support coverage are not exhaustive, and you may be asked to register your own hints for components, APIs, and processes that are absent in CAS-provided hints. If you do run into such scenarios, consider contributing those hints back to the CAS project directly if the hint belongs or affects a CAS-owned component, or discuss the issue with the [reachability metadata project](https://github.com/oracle/graalvm-reachability-metadata).

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html