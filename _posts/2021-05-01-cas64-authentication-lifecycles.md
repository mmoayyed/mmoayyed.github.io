---
layout:     post
title:      Apereo CAS - Authentication Handler Lifecycles
summary:    Learn how to manage authentication states and activate authentication handlers on-demand and dynamically when necessary.
tags:       [CAS]
---

Apereo CAS offers a variety of authentication handlers and strategies that are responsible to validate credentials. Such authentication handlers are typically defined statically at configuration time and then activated dynamically at runtime to operate on user-provided credentials. The focus of this post is to examine the state of authentication handlers, statically and/or dynamically, and review authentication handler activation rules selectively.

{% include googlead1.html  %}

This post specifically requires and focuses on:

- CAS `6.4.x`
- Java `11`
- [Apereo CAS Initializr][initializr] 

# Overview

On startup, Apereo CAS examines its configuration to activate and load authentication handlers into the runtime authentication execution plan. For example, one could define two authentication handlers that can accept a static list of user accounts or load such accounts from an external JSON file:

```properties
cas.authn.json.location=file:/etc/cas/config/json-authn.json
cas.authn.json.name=JSON
cas.authn.json.order=1

cas.authn.accept.name=STATIC
cas.authn.accept.users=casuser::Mellon
cas.authn.accept.order=0
```

{% include googlead1.html  %}

By default, an authentication handler that is processed and put into the execution plan is considered active and ready to validate the credential as long as it can declare support for the credential type. Authentication handlers that pass this test are filtered into a final list and execute one after another in a rather deterministic way, ordered by a specific execution sequence. For example, if we are working with username/password type of credentials, both of our defined handlers above would qualify for the validation task and are executed in the order of `STATIC` and `JSON`.

# Application Authentication Policy

Imagine a scenario where you may want to activate the `JSON` handler if the authentication request is submitted from a specific application. In other words, the `JSON` handler should only be allowed to validate credentials if the end-user is about to log into a designated application that is of course registered with CAS. To achieve this use case, we could design a specific [authentication policy](https://apereo.github.io/cas/6.4.x/services/Configuring-Service-AuthN-Policy.html) for the application and instruct CAS to use our `JSON` authentication handler when processing requests from this application:

{% include googlead1.html  %}

```json
{
  "@class" : "org.apereo.cas.services.RegexRegisteredService",
  "serviceId" : "https://app.example.org/.+",
  "name" : "ExampleApplication",
  "id" : 1,
  "authenticationPolicy" : {
    "@class" : "org.apereo.cas.services.DefaultRegisteredServiceAuthenticationPolicy",
    "requiredAuthenticationHandlers" : ["java.util.TreeSet", [ "JSON" ]],
    "criteria": {
      "@class": "org.apereo.cas.services.AllowedAuthenticationHandlersRegisteredServiceAuthenticationPolicyCriteria"
    }
  }
}
```

# Authentication Handler State

Now suppose that our `JSON` handler should only and exclusively activate when CAS is processing requests from `ExampleApplication`. For all other attempts and globally, our `STATIC` should be responsible for validating credentials. One less-than-ideal option to keep defining authentication policies for every application which of course is not quite practical if the number of applications is super large. The other option is to define the condition of the authentication handler directly in the configuration:

{% include googlead1.html  %}

```properties
cas.authn.json.state=STANDBY
```

This allows our `JSON` handler to remain in a semi-active state which would globally exclude its execution from all authentication attempts. Of course, the authentication handler is available for invocations but only when called upon directly by the application policy.

{% include googlead2.html  %}

<div class="alert alert-info">
  <strong>Note</strong><br/>The ability to define the state of an authentication handler is supported for many authentication handlers. Consult the documentation to learn more.
</div>

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html
[initializr]: https://casinit.herokuapp.com