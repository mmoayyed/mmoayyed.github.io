---
layout:     post
title:      Apereo CAS - Passwordless Authentication
summary:    Playing around with different variations of Passwordless Authentication in CAS, integrating it with other advanced authentication flows such as delegated authentication, multifactor and more.
tags:       ["CAS 7.1.x", "MFA"]
---

Since the introduction of [Passwordless Authentication](/2019/07/18/cas61x-passwordless-authn/) in CAS `6.1.x`, a lot of additional and useful improvements are added to make this integration seamlessly integrate with other forms of authentication such as delegation or multifactor. This blog post intends to demonstrate a few advanced variations of passwordless authentication in combination with other authentication flows and forms.

{% include googlead1.html  %}

Our starting position is based on the following:

- CAS `7.1.x`
- Java 21

## Overview

Passwordless Authentication in CAS by default is a form of authentication where passwords are replaced by tokens that expire after a configurable time period. Users are asked for an identifier (i.e. username) which is then used to locate the user record that contains forms of contact such as email and phone number to receive the token. While this works nicely for certain use cases, there are now other variations available where the *passwordless* user account fetched relevant user repositories can skip the default flow in favor of multifactor or delegated authentication. Furthermore, it is now also possible to, *conditionally*, skip the default passwordless authentication flow and simply challenge the user for their password as one might traditionally expect. 
{% include googlead1.html  %}
Passwordless Authn might also be interpreted as [WebAuthn support](https://webauthn.io/); a specification and API written by the W3C and FIDO that allows identity providers such as CAS to register and authenticate users using public-key cryptography instead of a password. While this behavior can be achieved using certain multifactor provider integrations with CAS that provide WebAuthn support, built-in native support for WebAuthn is *not available* as of this writing and may become available in future releases.

## Configuration

Once you have decorated the CAS WAR Overlay with the proper [extension module](https://apereo.github.io/cas/development/authentication/Passwordless-Authentication.html), you will need to adjust your CAS configuration (i.e. `cas.properties` file) to tune the feature for the following:

## User Accounts

How should user records and contact information be found, given an identifier?

To keep things simple for this tutorial, we are going to use a Groovy script to locate our passwordless accounts:
{% include googlead1.html  %}
```properties
cas.authn.passwordless.accounts.groovy.location=file:/etc/cas/config/PasswordlessAccounts.groovy
```

...and the Groovy script may be designed as:
{% include googlead1.html  %}
```groovy
def run(Object[] args) {
    def request = args[0]
    def logger = args[1]
    
    logger.info("Locating user record for user $request.username")

    /*
     * Query relevant data sources to fetch
     * the passwordless account record...
     */

    def account = new PasswordlessUserAccount()
    account.setUsername("casuser")
  
    /*
     * Modify the account as appropriate...
     */

    return account
}
```

## Skip Passwordless Authentication

A passwordless account can be optionally tagged to use the traditional authentication flow that typically challenges the user for their password. To do this, the account needs to be modified as such:
{% include googlead1.html  %}
```groovy
  ...
  account.setRequestPassword(true)
  ...
```

In doing so, CAS will skip the default passwordless authentication flow in favor of its default primary authentication strategy where you might see this:
{% include googlead1.html  %}
![image](https://user-images.githubusercontent.com/1205228/74814088-ffd53880-530f-11ea-860a-392f33ce3b03.png)

## Delegated Authentication

In another variation, the passwordless account can skip its default flow in favor of delegated authentication. To do so and with the assumption that [delegated authentication](https://apereo.github.io/cas/development/integration/Delegate-Authentication.html) is turned on in CAS, we can tag the account as one who's eligible for delegated authentication via:
{% include googlead1.html  %}
```groovy
  ...
  account.setDelegatedAuthenticationEligible(true)  
  ...
```

{% include googlead1.html  %}

This requires a separate decision to select the identity provider from the list of those that are available and configured in CAS. To do this, we can design a small Groovy script tasked to decide and select the appropriate identity provider for our passwordless user:
{% include googlead1.html  %}
```properties
cas.authn.passwordless.delegatedAuthenticationSelectorScript.location= \
    file:/etc/cas/config/PasswordlessDelegated.groovy
```

...and the selection script would be:
{% include googlead1.html  %}
```groovy
def run(Object[] args) {
  def user = args[0]
  def clients = (Set) args[1]
  def httpServletRequest = args[2]
  def logger = args[3]

  logger.info("Choose identity provider for $user")

  /*
   * Pick an identity provider from 
   * the list of clients available
   */
  return clients[0]
}
```

## Multifactor Authentication

In another variation, the passwordless account can skip its default flow in favor of [multifactor authentication](https://apereo.github.io/cas/development/mfa/Configuring-Multifactor-Authentication.html) using a multifactor provider that is found configured and available in CAS. In doing so and much like other variations, the account must be tagged as one eligible for multifactor authentication:
{% include googlead1.html  %}
```groovy
  ...
  account.setMultifactorAuthenticationEligible(true)
  ...
```

Once the account is deemed eligible for a multifactor authentication flow, it is processed by the collection of multifactor authentication triggers to select the appropriate provider. To keep things simple, let's say we would want to require MFA for users with an attribute `category` whose value(s) matches a pattern of `student` or `admin`.
{% include googlead1.html  %}
```properties
cas.authn.mfa.globalPrincipalAttributeNameTriggers=category
cas.authn.mfa.globalPrincipalAttributeValueRegex=student|admin
```

Let's also make sure our demo passwordless account carries that relevant attribute:
{% include googlead1.html  %}
```groovy
  ...
  def attributes = Map.of("category", List.of("student", "admin")) 
  account.setAttributes(attributes) 
  ...
```

With the above configuration, the account is processed by CAS [multifactor authentication triggers](https://apereo.github.io/cas/development/mfa/Configuring-Multifactor-Authentication-Triggers.html) to route to the appropriate multifactor authentication flow.

## Duo Security User Accounts

Duo Security can also act as a passwordless account store. Once enabled, user accounts that are found and registered with Duo Security with a valid email address and phone number will receive a push notification from Duo Security and are able to login to CAS without the need for a password:
{% include googlead1.html  %}
```
cas.authn.mfa.duo[0].duo-secret-key=...
cas.authn.mfa.duo[0].duo-integration-key=...
cas.authn.mfa.duo[0].duo-api-host=...
cas.authn.mfa.duo[0].passwordless-authentication-enabled=true
```

## Disabling Passwordless Authentication

Passwordless authentication can be selectively controlled for specific applications. By default,
all services and applications are eligible for passwordless authentication. If you wish to disable the flow for a particular application, 
modify the application policy and indicate your own `passwordlessPolicy` construct:
{% include googlead1.html  %}
```json
{
  "@class": "org.apereo.cas.services.CasRegisteredService",
  "serviceId": "^https://app.example.org",
  "name": "App",
  "id": 1,
  "passwordlessPolicy" : {
    "@class" : "org.apereo.cas.services.DefaultRegisteredServicePasswordlessPolicy",
    "enabled": false
  }
}
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

## Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)