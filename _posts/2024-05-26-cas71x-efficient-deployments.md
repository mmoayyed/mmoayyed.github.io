---
layout:     post
title:      Apereo CAS - Efficient Deployments with Class Data Sharing
summary:    Learn how to build, unpack and run an unpackaged Apereo CAS server via Spring Boot and Application Class-Data Sharing for optimal performance.
tags:       ["CAS 7.1.x", "Getting Started", "Spring Boot"]
---

Efficiency is a key factor that can significantly impact user experience when it comes to Spring Boot applications and that of Apereo CAS. Today, we'll look at an Apereo CAS deployment that would be packaged and run as a Spring Boot application and explore techniques to enhance deployment efficiency and startup times. Our focus will be on packaging CAS as an executable WAR, utilizing Class Data Sharing (CDS), and leveraging Application Class-Data Sharing (AppCDS) for optimal performance, particularly for unpacked deployments.

{% include googlead1.html %}

This tutorial specifically focuses on:

- CAS `7.1.x`
- Java `21`

# The Build

[Apereo CAS Initializr](https://getcas.apereo.org/ui) is a component in the Apereo CAS ecosystem that allows you as the deployer to generate CAS WAR Overlay projects on the fly with just what you need to start quickly. Conceptually identical to [start.spring.io](https://start.spring.io), you can browse the user interface and add/remove modules that you wish to include in your deployment from the menu. At its most basic form, you can in the end either download the project as a `.zip` file manually or do so via the command line:
{% include googlead1.html %}
```bash
mkdir cas-server && cd cas-server
curl "https://getcas.apereo.org/starter.tgz" | tar -xzvf -
```

Then, it's time to build the project:

```bash
./gradlew build
```
{% include googlead1.html %}

...and now it's time to run the application. Let's review options.

# Executable WAR

The easiest way to run is to run CAS as an executable web application with embedded Apache Tomcat container:
{% include googlead1.html %}
```bash
java -jar build/libs/cas.war --server.ssl.enabled=false --server.port=8080
...
...
...
<Started CasWebApplication in 10.283 seconds (process running for 11.564)>
```

Not bad, but we can do better. It is often an advantage to explode the web application and run it in a different way. Certain PaaS implementations choose to unpack archives before they run. One way to run an unpacked archive is by starting the appropriate launcher, as follows:
{% include googlead1.html %}
```bash
jar -xf build/libs/cas.war
cd build/libs
java org.springframework.boot.loader.launch.JarLauncher
...
...
...
<Started CasWebApplication in 7.693 seconds (process running for 9.285)>
```

This is slightly faster on startup (depending on the size of the CAS WAR file) than running from an unexploded archive. After startup, you should not expect any differences. Alternatively, once you have unpacked the `.war` file you can also get an extra boost to startup time by running the app with its "natural" main method instead of the `JarLauncher`. For example:
{% include googlead1.html %}
```bash
jar -xf build/libs/cas.war
cd build/libs
java -cp "WEB-INF/classes:WEB-INF/lib/*" org.apereo.cas.web.CasWebApplication
...
...
...
<Started CasWebApplication in 6.873 seconds (process running for 7.469)>
```

Cool, eh?

<div class="alert alert-info">
  <strong>Remember</strong><br/>Using the <code>JarLauncher</code> over the <code>CasWebApplication</code> has the added benefit of a predictable classpath order. The WAR file contains a <code>classpath.idx</code> file which is used by the <code>JarLauncher</code> when constructing the classpath.
</div>

# Class Data Sharing (CDS)

Class Data Sharing (CDS) helps reduce the startup time and memory footprint of JVMs by caching class metadata in an archive file so that it can be quickly pre-loaded into a newly launched JVM. This accelerates class loading, a significant contributor to startup time. A default CDS archive is pre-packaged with most recent JDK distributions to contain metadata for common JDK classes. We can also create customized CDS archives to speed up the loading of classes in CAS.

A CDS archive for an **unpacked-already** CAS can be created when the application exits. The Spring Framework provides a mode of operation where the process can exit automatically once the application context has been refreshed. In this mode, all non-lazy initialized singletons have been instantiated, and callbacks have been invoked but the lifecycle has not started. 
{% include googlead1.html %}
To build and run CAS with CDS, you must first make sure the CAS web application is built without *executable* mode:

```bash
./gradlew clean build -Pexecutable=false
```

Then, extract the uber WAR:
{% include googlead1.html %}
```bash
java -Djarmode=tools -jar build/libs/cas.war extract
```

If the WAR file is invalid, you will receive the following error:

```
Error: File 'cas.war' is not compatible; ensure jar file is valid and launch script is not enabled
```

This creates a `cas/cas.war` file and the needed libraries in a `cas/lib` folder at the root of the project directory. CAS can then be executed with:

{% include googlead1.html %}
```bash
java -jar cas/cas.war
...
...
...
<Started CasWebApplication in 6.216 seconds (process running for 7.582)>
```

A tiny bit better. Note that CDS technology keeps getting better and better in each new JVM release. Unpackaged Spring Boot executable JARs or WARs do not yet fulfill all the conditions that are needed for optimal CDS performance and future upgrades are expected to bring more improvements to this area. Ultimately, the combination of CDS and Spring AOT optimizations should reduce the CAS startup time quite a bit.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services. 

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html