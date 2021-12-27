---
layout:     post
title:      Apereo CAS - Global Access Strategy & Enforcement
summary:    An overview of access strategy and authorization enforcement techniques used at a global level to control entry to applications integrated with Apereo CAS for single sign-on.
tags:       ["CAS 6.5.x"]
---

Apereo CAS is now able to offer features to control authorization and entry access to the application at a global level, in addition to providing options for overrides at the application level. This post can be viewed as an extension of [Privileged Access Management](2021/08/02/cas64x-privileged-access-management/) features in Apereo CAS that specifically focus on options to determine user access at a global level.

{% include googlead1.html  %}

This tutorial specifically requires and focuses on:

- CAS `6.5.x`
- Java 11

## Overview

Typically, options and features that exist in CAS to control entry access and authorization are defined at the application policy level, *RBAC* style. For example, to access an application that is registered with CAS, the following policy may be defined to ensure the principal (i.e. authenticated user) must have a `cn` attribute with the value of `admin` AND a `givenName` attribute with the value of `Administrator`: 

{% include googlead1.html  %}

```json
{
  "@class" : "org.apereo.cas.services.RegexRegisteredService",
  "serviceId" : "testId",
  "name" : "testId",
  "id" : 1,
  "accessStrategy" : {
    "@class" : "org.apereo.cas.services.DefaultRegisteredServiceAccessStrategy",
    "requiredAttributes" : {
      "@class" : "java.util.HashMap",
      "cn" : [ "java.util.HashSet", [ "admin" ] ],
      "givenName" : [ "java.util.HashSet", [ "Administrator" ] ]
    }
  }
}
```

While this approach may be sufficient in certain cases, it can prove difficult to maintain and manage rules for each application definition at this layer, especially if the rules are too many, the variety is diverse, and the applications grow in number. 

{% include googlead1.html  %}

Furthermore, one could consider that the authorization rules and logic could be outsourced to a different, external system, all combined and managed in one place, with a friendly interface and API which can answer and respond to authorization queries for user access and policy. Such systems often tend to interact with other sources of truth, group management software, and family that drive authorization decisions by group membership and entitlements, etc. 

{% include googlead1.html  %}

What's important here is that CAS ought to have the ability to interact with such external systems, seen as a black box, via a proven API to determine user access requirements in one place for a given application and user attributes, etc. The definition and request for access are made in one place, globally, and the calculation rules and the responses are also handled and outsourced in one [external] place. 

How might we go about accomplishing that? 

## Global Access Strategy

Rather than placing the authorization policy definition in each application record, Apereo CAS starts simple and allows one to script the authorization logic globally inside a Groovy script:

{% include googlead1.html  %}

```groovy
import org.apereo.cas.audit.*
import org.apereo.cas.services.*

def run(Object[] args) {
    def context = args[0] as AuditableContext
    def logger = args[1]
    logger.debug("Checking access for ${context.registeredService}")
    def result = AuditableExecutionResult.builder().build()
    result.setException(new UnauthorizedServiceException("Service unauthorized"))
    return result
}
```

The script execution is set to return a type of response that would signal to CAS whether access should be granted, given arbitrary logic and context. One could consider that such logic might at some point be about reaching out to an external authorization system, passing along needed details in the request, and processing the response to determine access rules. 

{% include googlead1.html  %}

This is a rather flexible *one-ring-to-rule-them-all* type of solution to the *global access strategy* use case; of course, as APIs and authorization systems mature, well-defined dedicated integrations and extensions can be built to handle matters directly and in an opinionated fashion without asking one to script their way into the system.

## What About...?

As is almost always the case with Apereo CAS, one can surely take direct control of the access strategy component with custom logic and code:

```java
@Bean
public AuditableExecution registeredServiceAccessStrategyEnforcer() {
    return new MyAccessStrategy(...);
}
```

...and of course, `MyAccessStrategy` looks as humble as ever:

```java
@Override
public AuditableExecutionResult execute(AuditableContext context) {
  ...
}
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

{% include googlead1.html  %}

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html