---
layout:     post
title:      Apereo CAS - Payara Micro Deployments
summary:    Learn how to deploy Apereo CAS via Payara Micro.
tags:       [CAS]
background: '/images/home/slide-1.jpg'
---

# Overview

[Payara Micro](https://www.payara.fish/software/payara-server/payara-micro/) is the open source, lightweight middleware platform of choice for containerized Java EE (Jakarta EE) microservices deployments.  Less than 70MB in size, Payara Micro requires no installation or configuration and no need for code rewrites  – so you can build and deploy a fully working app within minutes.

This is a short and sweet tutorial on how to get Apereo CAS deployed via Payara Micro.

Our starting position is based on:

- CAS `6.2.x`
- Java `11`
- Payara Micro `5.194`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

# Configuration

Clone the CAS WAR overlay and then download the Payara Micro application server. Next, in `gradle.properties` file, blank out the application server property:

```properties
appServer=
```

Next, make sure `src/main/webapp/WEB-INF/web.xml` exists in the overlay with the following content:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app version="3.1" 
     metadata-complete="true"
     xmlns="http://xmlns.jcp.org/xml/ns/javaee" 
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
     xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_3_1.xsd">
</web-app>
```

The key in the above snippet is `metadata-complete="true"`; it indicates that the JAR files in `/WEB-INF/lib` don't need to be scanned for Servlet 3.0 specific annotations, but the webapp's own classes will still be scanned. This is to specifically prevent [this bug](https://java.net/jira/browse/GLASSFISH-21265).

Finally, build the overlay using `./gradlew clean build` and then deploy to Payara Micro using:

```bash
java -jar /path/to/payara-micro.jar --deploy /path/to/cas-overlay/build/libs/cas.war
```

Once the deployment is complete, CAS will be available at `http://localhost:8080/cas`.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please know that all other use cases, scenarios, features, and theories certainly [are possible](https://apereo.github.io/2017/02/18/onthe-theoryof-possibility/) as well. Feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)
