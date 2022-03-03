---
layout:     post
title:      Apereo CAS - OpenID Connect Load Testing w/ Apache JMeter & Eclipse Jifa
summary:    Learn how to take advantage of Apache JMeter and test scripts provided by Apereo CAS to run stress tests against your deployment, get a heap dump and analyze results in Eclipse Jifa.
tags:       ["CAS 6.6.x", "High Availability", "OpenID Connect"]
---

Load testing is an important part of ensuring that the CAS server deployment is ready for prime-time production use, especially when deployed in a cluster and configured to be highly available. In this tutorial, I plan to go over the basic aspects of running a stress test using Apache JMeter against a CAS server that is acting as an OpenID Connect Provider.

{% include googlead1.html  %}

Our starting position is based on the following:

- CAS `6.6.0`
- Java 11
- Docker
- [Apache JMeter](https://jmeter.apache.org/) (Version `5.4.3` as of this writing)
- [CAS Overlay](https://github.com/apereo/cas-overlay-template)

# Initial Setup

First, let's begin by preparing our CAS deployment to act as an OpenID Connect provider by including the correct extension module:

```groovy
implementation "org.apereo.cas:cas-server-support-oidc"
```
{% include googlead1.html  %}

Then, we teach CAS about specific aspects of the authorization server functionality:

```properties
cas.authn.oidc.core.issuer=https://sso.example.org/cas/oidc
cas.authn.oidc.jwks.file-system.jwks-file=file:///etc/cas/config/keystore.jwks
```

<div class="alert alert-info">
  <strong>Clustered Deployments</strong><br/>When deploying CAS in a cluster, you must make sure all CAS server nodes have access to and share an identical and exact copy of the keystore file. Keystore differences will lead to various validation failures and application integration issues.
</div>

That should be all. Now, you can proceed to register your client web application with CAS that will take part in the load tests:

{% include googlead1.html  %}
```json
{
  "@class": "org.apereo.cas.services.OidcRegisteredService",
  "clientId": "client",
  "clientSecret": "secret",
  "serviceId": "^https://.*",
  "name": "OIDC",
  "bypassApprovalPrompt": true,
  "generateRefreshToken": "true",
  "supportedResponseTypes": [ "java.util.HashSet", [ "code" ] ],
  "supportedGrantTypes": [ "java.util.HashSet", [ "authorization_code" ] ],
  "id": 1,
  "scopes" : [ "java.util.HashSet", [ "profile", "openid", "email" ] ]
}
```

It's important to set `bypassApprovalPrompt` to `true` to allow Apache JMeter to bypass the consent screen.

<div class="alert alert-info">
  <strong>Redirect URI</strong><br/>I am intentionally using a very wide pattern in the application definition above using the <code>serviceId</code> attribute to make this process easier for this tutorial. In reality, the application policy you use <strong>MUST</strong> be a lot more strict in terms of what it can authorize.</div>

So far, so good. Let's start testing.

# Apache JMeter

Apache JMeter is a Java-based performance testing tool that is open source and designed to load test functional behavior and measure performance. CAS presents [ready-made test scripts](https://github.com/apereo/cas/raw/master/etc/loadtests/) for Apache JMeter, and as it stands, the `CAS_OIDC.jmx` can be used to test the server acting as an OpenID Connect provider. If you open this script in your Apache JMeter, it will look something like this:
{% include googlead1.html  %}
{% include image.html img="https://user-images.githubusercontent.com/1205228/156491861-31829577-0f12-400c-b3d9-ff46f8c07133.png" width="75%" title="OpenID Connect - Apache JMeter" %}

Take note of the user-defined variables and modify accordingly.

Then, review the test execution plan, which executes the following sequence:

- Send an authentication request asking for a `code`
- Log in using a sample username and password, `casuser` and `Mellon`.
- Follow redirects to the client application to obtain the `code`
- Then exchange the `code` for an access token, an id token, and a refresh token.

Now, if you run the test you can examine the results in an aggregated form:
{% include googlead1.html  %}
{% include image.html img="https://user-images.githubusercontent.com/1205228/156492924-4897186f-03f1-4016-9e86-d01a5eb27310.png" 
width="75%" title="OpenID Connect - Apache JMeter" %}

So in the span of `30` seconds and using `2` threads, this CAS server was able to handle approx. `16` requests per second. That's not too impressive for a beginner's tutorial, I admit, and I am sure your results would be much more satisfying.

Note that it is highly recommended that the GUI be used for troubleshooting the scripts to work within your environment. Then, when you start load testing, you do that via the command line:

```bash
apache-jmeter/bin/jmeter -n -t "CAS_OIDC.jmx"
```
{% include googlead1.html  %}
# Heap Dumps w/ Eclipse JIFA

A heap dump is a snapshot of JVM memory. Typically it would be a large binary file that is roughly the same size as the heap of the application at the moment it is taken. One way to obtain a heap dump is by using the `heapdump` Spring Boot actuator endpoint. So you could do a curl or simply open in a browser the URL `https://sso.example.org/cas/actuator/heapdump`, which will download the heap dump file.

To get to this endpoint, you must first expose and enable the actuator endpoint:

```properties
cas.monitor.endpoints.endpoint.defaults.access=ANONYMOUS
management.endpoints.web.exposure.include=heapdump
management.endpoints.enabled-by-default=true
```
{% include googlead1.html  %}
<div class="alert alert-info">
  <strong>Actuator Access</strong><br/>Note that I am using very relaxed access rules to expose and enable CAS actuator endpoints. In reality, you <strong>MUST</strong> opt for hardened rules when it comes to access and exposure of web-based endpoints that can provide insight into the running CAS software.</div>

Once you have the heap dump, you can use [Eclipe Jifa](https://projects.eclipse.org/projects/technology.jifa) to analyze the heap dump. Eclipse Jifa (Java Issue Finder Assistant) is an open-source project for troubleshooting Java applications and it provides a scalable, web-based solution to prevent local memory and resource challenges. Heap Dump Analysis and GC Log Analysis are supported with features such as target heap overview, leak suspects, thread information, and GC root analysis.

You can use the following Docker image may be used to quickly run Eclipse Jifa:

```bash
docker run -p 8102:8102 jifadocker/jifa-worker:demo
```

Using the top menu, you can upload the heap dump file obtained earlier to Eclipse Jifa, and allow it to analyze the data. It might look something like this:
{% include googlead1.html  %}
{% include image.html img="https://user-images.githubusercontent.com/1205228/156493813-2d4da1ff-251b-4b53-b333-0d95b709bb95.png" 
width="75%" title="Eclipse Jifa" %}

Happy Troubleshooting!

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

It's important that you start off simple and make changes one step at a time. Once you have a functional environment, you can gradually and slowly add customizations to move files around.

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)
