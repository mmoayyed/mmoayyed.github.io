---
layout:     post
title:      Apereo CAS - Software Bill of Materials (SBOM) with Spring Boot
summary:    Learn how to track and describe components used to build your Apereo CAS deployment and analyze CycloneDX BOMs to keep tabs on vulnerable dependencies and libraries used in your deployment.
tags:       ["CAS 7.1.x", "Getting Started", "Spring Boot"]
---

Ensuring the security and integrity of the components in your Apereo CAS deployment today is more crucial than ever. A [Software Bill of Materials (SBOM)](https://en.wikipedia.org/wiki/Software_supply_chain) serves as a comprehensive inventory of all the components in a software application, akin to a list of ingredients in a recipe. SBOMs provide visibility into the dependencies and libraries, facilitating better vulnerability management and compliance.

The most recent releases of Apereo CAS take advantage of and offer SBOM support offered by Spring Boot using a format known as [CycloneDX](https://cyclonedx.org/). This is a popular format for SBOMs and an open standard designed for ease of use and interoperability. CycloneDX SBOMs offer a detailed representation of software components, making it easier for organizations to manage their security posture.
{% include googlead1.html %}
Apereo CAS can generate SBOMs via Spring Boot, and the resulting document can then be utilized by tools like [Dependency-Track from OWASP](https://docs.dependencytrack.org/). While this is not the only dependency tracking and visualization tool, it is nonetheless a powerful OWASP tool for managing vulnerabilities in dependencies. It allows your team to monitor and ensure the CAS deployment is both robust and secure.
{% include googlead1.html %}
In this blog post, we'll look at SBOM support in Apereo CAS and present a quick overview of how one can use CycloneDX SBOMs to integrate with Dependency-Track for a fortified security strategy.

This tutorial specifically focuses on:

- CAS `7.1.x`
- Java `21`

# Generating SBOMs

Recent versions of the CAS deployment Overlay project are able to offer SBOM support via the [CAS Initializr](https://getcas.apereo.org/ui):
{% include googlead1.html %}
{% include image.html img="/images/blog/assets/2024-05-31-12-00-01.png" width="50%" title="Apereo CAS - SBOM Support" %}

Once you have generated the overlay, an SBOM will be automatically generated for your deployment and packaged with the CAS web application when you build:
{% include googlead1.html %}
```bash
./gradlew clean build
```

The resulting SBOM document is available and tagged under the id `application`.

# SBOM Actuator

Apereo CAS via Spring Boot offers an `sbom` actuator endpoint that needs to be explicitly enabled and exposed in CAS configuration:
{% include googlead1.html %}
```properties
management.endpoint.sbom.enabled=true
management.endpoints.web.exposure.include=sbom

spring.security.user.name=casuser
spring.security.user.password=Mellon

cas.monitor.endpoints.endpoint.defaults.access=AUTHENTICATED
```

Next, when you deploy CAS you can download the SBOM document:
{% include googlead1.html %}
```bash
# Note the SBOM id used to download the document...
curl -LO -u casuser:Mellon https://sso.example.org/cas/actuator/sbom/application
```

This will provide you with an `application` file that contains the SBOM report. For this exercise, we are going to manually import the SBOM into a dependency-tracking tool like Dependency-Track from OWASP.

# OWASP Dependency-Track

[Dependency-Track](https://docs.dependencytrack.org/) is an intelligent Component Analysis platform that allows organizations to identify and reduce risk in the software supply chain. Dependency-Track takes a unique and highly beneficial approach by leveraging the capabilities of Software Bill of Materials (SBOM). This approach provides capabilities that traditional Software Composition Analysis (SCA) solutions cannot achieve.
{% include googlead1.html %}
Dependency-Track monitors component usage across all versions of every application in its portfolio in order to proactively identify risk across an organization. The platform has an API-first design and is ideal for use in CI/CD environments.

Deploying with Docker is the easiest and fastest method of getting started. No prerequisites are required other than a modern version of Docker:
{% include googlead1.html %}
```bash
# Downloads the latest Docker Compose file
curl -LO https://dependencytrack.org/docker-compose.yml

# Starts the stack using Docker Compose
docker-compose up
```

You can now navigate to `http://localhost:8080`, sign in with `admin/admin` and complete the account creation process. Then, navigate to the *Projects* screen, create one called `CAS` and upload your `application` SBOM document:

{% include googlead1.html %}
{% include image.html img="/images/blog/assets/dependency-track.png" width="50%" title="Apereo CAS - SBOM Support" %}

Now, you can browse the list of components, examine the dependency graph, and analyze the audited vulnerabilities present in your CAS deployment.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services. 

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html