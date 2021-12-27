---
layout:     post
title:      Apereo CAS - Testing High Availability
summary:    Learn how to use a sample CASified application to test CAS high availability when deployed in a cluster.
tags:       ["CAS 6.4.x", "High Availability"]
---

A highly available CAS deployment offers resilience in response to various failure modes such that CAS continues to offer SSO services despite failures. A high availability (HA) configuration of CAS is achieved by ensuring there is adequate redundancy so that the service is robust in the face of component failures and that routine maintenance can be done without service downtime. 

{% include googlead1.html  %}

In this post, we will take a brief look at the high availability deployment requirements with CAS in a multi-node CAS, and effective ways to ensure workloads are distributed across the entire CAS cluster.

Our starting position is as follows:

- Any CAS Server
- Java `11`
- [Sample Client Application](https://github.com/apereo/cas-sample-java-webapp)

# Overview

A highly available CAS deployment is composed of two or more nodes behind a load balancer typically in an active/active mode. Active-active configuration is possible with a clustered, distributed ticket registry state such that any available CAS node can service any request for the CAS server. Several options are available for implementing an active-active configuration with a shared ticket state. 

{% include googlead1.html  %}

For a highly-available CAS deployment, running CAS backed by a distributed ticket registry such as the [Hazelcast Ticket Registry](https://apereo.github.io/cas/6.3.x/ticketing/Hazelcast-Ticket-Registry.html) can be a great option, though the choice of the ticket registry generally has little to no impact on the testing techniques described here. HA can be achieved by implementing a multi-node CAS deployment running on multiple VMs or physical hosts. This approach is attractive since it allows true zero downtime maintenance of the service at the cost of a marginal increase in deployment complexity.

{% include googlead1.html  %}

In summary, multi-node CAS generally involves the following:

- Installing multiple instances of the CAS server so that one or more of the servers can be destroyed without the CAS service becoming unavailable.
- Configuring the multiple instances of the CAS server to share ticket state so that regardless of which CAS server a user or service interacts with, the response from each CAS server is the same.

# Testing

To test CAS in high availability mode, you will need to start with a [CASified application](https://github.com/apereo/cas-sample-java-webapp) that would act as the client to exercise the CAS server. 

<div class="alert alert-info"><strong>Note</strong><br/>We assume the client application is already registered 
with CAS server as an authorization client application. Furthermore, note that the CAS server version 
is not relevant to this testing technique, and the strategy applies all the same so long as CAS is configured and deployed in a cluster.</div>

{% include googlead1.html  %}

This application communicates with a CAS server using the Java CAS Client, which is quite traditionally configured in the application's `src/main/webapp/WEB-INF/web.xml` file:

```xml
<filter>
  <filter-name>CAS Authentication Filter</filter-name>
  <filter-class>oj.c.c.a.AuthenticationFilter</filter-class>
  <init-param>
    <param-name>casServerLoginUrl</param-name>
    <param-value>https://sso.example.org/cas/login</param-value>
  </init-param>
  ...
</filter>

<filter>
  <filter-name>CAS Validation Filter</filter-name>
  <filter-class>o.j.c.c.v.Cas30ProxyReceivingTicketValidationFilter</filter-class>
  <init-param>
    <param-name>casServerUrlPrefix</param-name>
    <param-value>https://sso.example.org/cas</param-value>
  </init-param>
  ...
</filter>
```

The most important settings in the above configuration that are relevant for high availability are the public addresses of the CAS server, defined by `casServerLoginUrl` and `casServerUrlPrefix` parameters. All values point to the canonical address of the CAS server which typically is the load balancer's address, and in return, the proxy knows of the CAS server node that would ultimately handle the traffic.

{% include googlead1.html  %}

For our purposes, we want to bypass the load balancer's entry barrier and force our way into a particular CAS node. Assuming we have deployed 2 CAS server nodes in a cluster, our strategy is to send authentication requests to one CAS server node and allow it to generate a ticket for us, while asking the other CAS node to validate that ticket when received by the application. This will ensure that tickets created by one CAS node can be found and processed by others for validation operations. The only *gotcha* is that the addresses of the individual CAS server nodes need to be accessible to the client application and known beforehand to be defined in the client applications' configuration:

```xml
<filter>
  <filter-name>CAS Authentication Filter</filter-name>
  <init-param>
    <param-name>casServerLoginUrl</param-name>
    <param-value>https://sso1.example.org/cas/login</param-value>
  </init-param>
  ...
</filter>

<filter>
  <filter-name>CAS Validation Filter</filter-name>
  <init-param>
    <param-name>casServerUrlPrefix</param-name>
    <param-value>https://sso2.example.org/cas</param-value>
  </init-param>
  ...
</filter>
```

In this setup, we have CAS server node `sso1` responsible for creating tickets and responding to authentication requests, while validation operations are handled and sent to CAS server node `sso2`. Once our testing is successful, the values should be swapped and rotated so the opposite scenario (i.e. authentication requests via `sso2`, validation events via `sso1`, etc.) may also be tested:

{% include googlead1.html  %}

```xml
<filter>
  <filter-name>CAS Authentication Filter</filter-name>
  <init-param>
    <param-name>casServerLoginUrl</param-name>
    <param-value>https://sso2.example.org/cas/login</param-value>
  </init-param>
  ...
</filter>

<filter>
  <filter-name>CAS Validation Filter</filter-name>
  <init-param>
    <param-name>casServerUrlPrefix</param-name>
    <param-value>https://sso1.example.org/cas</param-value></span>
  </init-param>
  ...
</filter>
```

# Advantages

There a few advantages to testing CAS high availability using this technique:

- Other than registering the client application with CAS, the server configuration does not need any modifications.
- While the client application interacts with CAS using the CAS protocol, the results should be equally applicable to other relevant protocols such as OAuth and OpenID Connect.
{% include googlead1.html  %}
- The client application is a simple Java-based web application and does not require any additional dependencies, extensions, or frameworks.
- The client application can be used to test other aspects and features of CAS, and its use is not limited to high availability testing.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html