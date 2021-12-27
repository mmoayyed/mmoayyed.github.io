---
layout:     post
title:      Apereo CAS - Acceptable Usage Policy
summary:    Activate different forms of acceptable usage policy and terms of service conditionally based on user affiliation, etc.
tags:       ["CAS 6.2.x", "Acceptable Usage Policy"]
---

Dealing with license agreements and terms of use policies is never an exciting thing. That said, pretty much every piece of software and web service in existence requires you to accept the terms and conditions before use, and certainly, the same functionality can be offered by your CAS deployment to activate and manage the right policy for the user base.

When it comes to terms of use with CAS, there are a few aspects you should consider:

1. What is the appropriate policy for the current user? 
2. How could we construct and present that policy?
3. How do we manage and store user decisions?

{% include googlead1.html  %}

In this tutorial, we will briefly take a look at [Acceptable Usage Policy](https://apereo.github.io/cas/6.2.x/webflow/Webflow-Customization-AUP.html) support in CAS, with our starting position as follows:

- CAS `6.2.x`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)
- Java 11
- [JSON Service Registry](https://apereo.github.io/cas/6.2.x/services/JSON-Service-Management.html)

## Configuration

There is support for a wide variety of technologies and platforms in CAS, such as LDAP, JDBC, etc to manage AUP decisions. Support for each technology generally means that it's capable of fetching policies for the user and storing the choice back. To start simple, let's begin with the [default option](https://apereo.github.io/cas/6.2.x/webflow/Webflow-Customization-AUP.html) which tracks user decisions in the runtime memory. 

The default policy looks for the user's previous choice and also examines user attributes to look for an attribute indicating the policy acceptance status. If the user has already consented to the policy or the policy status indicates acceptance, then the authentication flow will resume to the next step. Otherwise, a decision must be made by the user and the flow will be interrupted where the following screen would be presented:

![image](https://user-images.githubusercontent.com/1205228/76687812-c48f0680-663c-11ea-885d-01ee53a17459.png)

## Policy Terms

Let's suppose that we would want to present a different policy based on user type. For example, if the authenticating user is a developer as indicated by an `affiliation` attribute with a value of `dev`, our policy should change terms and text that would be appropriate for a developer audience. If not, we would fall back onto the default text applicable to the rest of the user base.

<div class="alert alert-info">
<strong>Clarification</strong><br>This attribute of course is not brought to CAS by storks. The assumption is that the underlying attribute store that provides user data contains an <code>affiliation</code> attribute and CAS is configured correctly to fetch and resolve this attribute for users.
</div>

{% include googlead1.html  %}

To achieve this, first, we need to teach CAS about the `affiliation` attribute that distinguishes users for policy terms:

```properties
cas.acceptableUsagePolicy.aup-policy-terms-attribute-name=affiliation
```

...and then, we should, of course, define our new policy for the developer audience in the appropriate CAS language bundle (typically `custom_messages.properties` file):

```properties
screen.aup.policyterms.dev=<p>Your usage of the CAS software \
 shall not result in a widespread viral infection transmitted \
 via bites or contact with bodily fluids that causes \
 human corpses to reanimate and seek to consume \
 living human flesh, blood, brain or nerve \
 tissue and is likely to result in the \
 fall of organized civilization.</p>
```

..which of course would present the following screen:

![image](https://user-images.githubusercontent.com/1205228/76688090-edb09680-663e-11ea-9e19-d71252ab9c72.png)

## Policy For Applications

Policies can, of course, vary based on application definitions as well. For example, you might want to present a different policy if the user wishes to enter the application at `https://app.example.org`:

```json
{
  "@class": "org.apereo.cas.services.RegexRegisteredService",
  "serviceId": "https://app.example.org",
  "name": "ExampleApplication",
  "id": 1,
  "acceptableUsagePolicy": {
    "@class": "org.apereo.cas.services.DefaultRegisteredServiceAcceptableUsagePolicy",
    "messageCode": "screen.aup.policyterms.app1"
  }
}
```

Just as before the language code that is referenced above must also be defined:

```properties
screen.aup.policyterms.app1=<p>You also agree that \
  you will not use the CAS software \
  for any purposes that may result in joy, laughter, fun or \
  happiness. This, security software, is very \
  serious stuff after all. Hey, no laughing!</p>
```

...which of course would present the following screen:

![image](https://user-images.githubusercontent.com/1205228/76688189-df16af00-663f-11ea-8707-aa0ef1dc5096.png)


# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

## Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)