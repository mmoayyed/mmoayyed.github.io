---
layout:     post
title:      Apereo CAS - Authentication Flow Interrupts
summary:    Interrupt the authentication flow in Apereo CAS with notifications and advertisements, dictating CAS should treat the authenticated session with configuration and compassion.
tags:       ["CAS 7.0.x", "Spring Webflow"]
---

> The fastest route to a 10X engineer is to give them 0.1X the distractions. - Eric Meyer

While that is generally sensible advice, when it comes to CAS there are times where you wish to interrupt the CAS authentication flow and the present the end-user with notifications and announcements. A common use case deals with presenting a message board during the authentication flow to select users and then optionally require the audience to complete a certain task before CAS is able to honor the authentication request and establish a session. Examples of such messages tasks may include: _"The kitchen’s menu today features <a href="https://www.wikiwand.com/en/Khash_(dish)">Khash</a>. Click here to get directions."_ or _"The office of compliance and regulations has announced a new policy on using forks. Click to accept, or forever be doomed with spoons"_.

{% include googlead1.html %}

CAS has the ability to pause and interrupt the authentication flow to reach out to external services and resources, querying for status and settings that would then dictate how CAS should manage and control the SSO session. Interrupt services are able to present notification messages to the user, provide options for redirects to external services, etc.
{% include googlead1.html %}
In this post, we are going to take a brief look at what it takes to interrupt the authentication flow. This tutorial specifically focuses on:

- CAS `7.0.x`
- Java `21`

# Interrupt Source

First and foremost, there needs to be an engine of some sort that is able to produce notifications and interruptions. CAS supports a range of such engines that are backed by JSON & Groovy resources, REST endpoints or one you decide to create and inject into the runtime. 

{% include googlead1.html  %}

For the purposes of this tutorial, I will be using a Groovy script. This strategy reaches out to a Groovy resource whose job is to dynamically calculate whether the authentication flow should be interrupted given the provided username and certain number of other parameters.

```properties
cas.interrupt.groovy.location=file:/path/to/your/interrupt.groovy
```

You can choose any path and filename you prefer.

# Interrupt Rules

Once you have defined the above setting and assuming your overlay is prepped with relevant configuration module, CAS will attempt to understand the interruption rules that are defined in the Groovy file. My rules are defined as such:

```groovy
import org.apereo.cas.interrupt.*

def run(final Object... args) {
    def (principal,attributes,service,registeredService,requestContext,logger) = args

    if (dontYouLoveItWhenYouAreInterrupted(principal, attributes)) {
      def block = false
      def ssoEnabled = true
      return new InterruptResponse("Message", [link1:"google.com", link2:"yahoo.com"], block, ssoEnabled)
    }
    return new InterruptResponse(false)
}
```
{% include googlead1.html  %}
The above ruleset says: *Evaluate the current principal and its attributes using `dontYouLoveItWhenYouAreInterrupted(...)` (something you, yes you, have to complete) and then present the `Message` to the user with a number of links. Do not block the user and allow the SSO session to be established.*
{% include googlead1.html  %}
Note that this is the default strategy that allows the interrupt query and script to execute after the primary authentication event and before the single sign-on event. This means an authenticated user has been identified by CAS and by extension is made available to the interrupt, and interrupt has the ability to decide whether a single sign-on session can be established for the user.

# The Looks

Once that is all in place, `casuser` will see something similar to the following screen, after having authenticated successfully:
{% include googlead1.html  %}
{% include image.html img="https://user-images.githubusercontent.com/1205228/29816821-eb5a597a-8cca-11e7-8ee8-f5433b01f90d.png"
width="60%" title="Authentication Flow Interrupts" %}

# Custom Interrupt Sources

In scenarios where the power of Groovy is not good enough for you, you can always create your own interrupt source in Java. If you wish to design your own interrupt strategy to make inquiries, register the following bean:
{% include googlead1.html  %}
```java
@Bean
public InterruptInquiryExecutionPlanConfigurer myInterruptConfigurer() {
    return plan -> {
        plan.registerInterruptInquirer(new MyInterruptInquirer());
    };
}
```

...and your implementation may potentially look like this:
{% include googlead1.html  %}
```java
class MyInterruptInquirer extends BaseInterruptInquirer {
    @Override
    protected InterruptResponse inquireInternal(final Authentication authentication,
                                                final RegisteredService registeredService,
                                                final Service service, 
                                                final Credential credential,
                                                final RequestContext requestContext) {
      // Stuff happens...
    }
}
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services. 

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html
