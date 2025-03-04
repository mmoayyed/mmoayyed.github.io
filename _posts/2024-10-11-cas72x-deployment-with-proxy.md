---
layout:     post
title:      Deploying Apereo CAS Behind a Proxy with SSL Termination
summary:    A short tutorial on how to get Apereo CAS deployed behind proxies and load balancers that aim to terminate SSL.
tags:       ["CAS 7.2.x", "Apache Tomcat"]
---
 
The majority of CAS deployments today sit behind some sort of proxy or load balancer, especially with high-availability requirements in mind. F5, HAProxy, etc. In most setups, the proxy upfront terminates SSL and then hands off the request over to CAS on a secured connection typically on port `8080`. 
{% include googlead1.html  %}
While doing this sort of thing with an external servlet container such as Apache Tomcat is perfectly doable and folks have been doing that for ages, this guide aims to demonstrate how one might go about achieving the same result using the embedded Apache Tomcat container that ships with CAS.
 
# Environment

- CAS `7.2.x`
- Java `21`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

# Configuration

We are using the embedded Apache Tomcat container provided by CAS automatically. This is the *recommended approach* in almost all cases (The embedded bit; not the Apache Tomcat bit) as the container configuration is entirely automated by CAS and its version is guaranteed to be compatible with the running CAS deployment. Furthermore, updates and maintenance of the servlet container are handled at the CAS project level where you as the adopter are only tasked with making sure your deployment is running the latest available release to take advantage of such updates. 
{% include googlead1.html  %}
<div class="alert alert-info">
  <strong>Remember</strong><br/>Note that CAS does also provide embedded servlet container options based on Jetty and Undertow. Depending on the functionality at hand, certain features may require additional support and development for automation. YMMV.
</div>


So, in order to open up a communication channel between the proxy and the CAS embedded Apache Tomcat server, we want to do the following:

{% include googlead1.html  %}

1. Ensure Apache Tomcat runs on port `8080`, assuming that's what the proxy uses to talk to CAS.
2. Ensure Apache Tomcat has SSL turned off.
3. Ensure the Apache Tomcat *connector* listening on the above port is marked as `secure`.

The above tasklist translates to the following properties expected to be found in your `cas.properties`:
{% include googlead1.html  %}
```properties
server.port=8080
server.ssl.enabled=false

cas.server.tomcat.http-proxy.enabled=true
cas.server.tomcat.http-proxy.protocol=HTTP/1.1
cas.server.tomcat.http-proxy.secure=true
cas.server.tomcat.http-proxy.scheme=https
```

That's all.

# Summary

I hope this review was of some help to you. As you have been reading, I can guess that you have come up with a number of missing bits and pieces that would satisfy your use cases more comprehensively with CAS. In a way, that is exactly what this tutorial intends to inspire. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)
