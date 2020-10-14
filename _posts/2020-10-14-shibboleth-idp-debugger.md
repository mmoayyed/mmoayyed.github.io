---
layout:     post
title:      Shibboleth IdP - Docker Debugging Tricks & Techniques
summary:    A quick survey of tricks and techniques used to attach a debugger to the Shibboleth Identity provider that may be running inside a Docker container.
published: true
tags:       [Shib]
---

One of the more popular ways of packaging and running the Shibboleth Identity is with Docker. A Docker-based build environment can be particularly useful during development and testing, especially when building add-ons and extending the capabilities of the identity provider with custom code. A build powered by Docker can simulate the deployment environment by packaging the Shibboleth Identity Provider in an Apache Tomcat server with the proper TLS setup, an LDAP server for authentication and attribute release, and maybe a sample service provider and more in a recyclable automated way. 

When building this sort of development environment, it's often very helpful to attach a debugger to the running Shibboleth IdP container to step into the code and diagnose issues. This implies that the container and the server environment hosting the IdP web application must be prepped and capable of responding to debugger requests from the host machine. 

## Apache Tomcat Remote Debugging

Apache Tomcat that hosts the Shibboleth Identity Provider's web application can be configured to allow a development environment like eclipse or IntelliJ IDEA to connect and attach remotely using [`JPDA`](https://cwiki.apache.org/confluence/x/8CklBg) (Java Platform Debugger Architecture) and step into the code. In doing so, that are two adjustments that must be applied to the Apache Tomcat configuration.

First, `JPDA_ADDRESS` and `JPDA_TRANSPORT` (optional) must be defined as environment variables. The address should be a port number (default is `8000`) which is the entry point for Tomcat debugging interfaces.

```bash
export JPDA_ADDRESS=5005
export JPDA_TRANSPORT=dt_socket
```

<div class="alert alert-info">
  <strong>JDK 11</strong><br/>Note that from Java 9, the JDWP socket connector accepts <a href="https://bugs.openjdk.java.net/browse/JDK-8175050">only local connections</a> by default. To bypass this restriction for development purposes, specially if the Shibboleth container is running against JDK 11, the JPDA address must be specified as <code>export JPDA_ADDRESS="*:5005"</code> instead.
</div>

Next, the command used to run Apache Tomcat must be altered to invoke JPDA:

```bash
bin/catalina.sh jpda run
```

## Docker Configuration

You may also consider exposing port `5005` in the Dockerfile that builds the Shibboleth Identity Provider's image:

```docker
EXPOSE 5005
```

## Port Mappings

Finally, you must make sure that port `5005` is properly mapped when you run the Shibboleth Identity Provider container. The development environment I have today is backed by the Gradle build tool and a [special plugin](https://plugins.gradle.org/plugin/de.gesellix.docker) that empowers it with Docker. To handle the port mappings, my `build.gradle` file contains this block:

```groovy
task runShibContainer(type: DockerRunTask) {
    dependsOn buildShibImage

    imageName = "test/shib"
    containerName = "shib"
    containerConfiguration = [
     "ExposedPorts": ["8443/tcp": [:]],
     "HostConfig"  : [
          "PortBindings": [
               "8443/tcp": [["HostPort": "9443"]],
               "5005/tcp": [["HostPort": "5005"]]
          ],
          "Links"       : ["ldap:ldap"]
     ]
    ]
}
```

The important bit in the above block is the mapping of port `5005` to the container's, which will act as the port for debugger requests. 
 
## Development Environment

Once the container is up and running, you should be able to configure a *Remote Run/Debug Configuration* in your IDEA development environment to attach a debugger to port `5005`:

![image](https://user-images.githubusercontent.com/1205228/95970890-58b48c80-0e1d-11eb-85e9-a1c6a7c51668.png)

Other IDEs such as eclipse or NetBeans can be configured all the same.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please know that all other use cases, scenarios, features, and theories certainly [are possible](https://apereo.github.io/2017/02/18/onthe-theoryof-possibility/) as well. Feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

Happy Coding,

[Misagh Moayyed](https://twitter.com/misagh84)