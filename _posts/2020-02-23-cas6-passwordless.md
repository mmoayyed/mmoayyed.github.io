---
layout:     post
title:      Apereo CAS - Advanced Passwordless Authentication
summary:    Playing around with different variations of Passwordless Authentication in CAS, integrating it with other advanced authentication flows such as delegated authentication, multifactor and more.
published: true
tags:       [CAS]
---

Since the introduction of [Passwordless Authentication](/2019/07/18/cas61x-passwordless-authn/) in CAS `6.1.x`, a lot of additional and useful improvements are added to make this integration seamlessly integrate with other forms of authentication such as delegation or multifactor. This blog post intends to demonstrate a few advanced variations of passwordless authentication in combination with other authentication flows and forms.

{% include googlead1.html  %}

Our starting position is based on the following:

- CAS `6.2.x`
- Java 11

## Overview

Passwordless Authentication in CAS by default is a form of authentication where passwords are replaced by tokens that expire after a configurable time period. Users are asked for an identifier (i.e. username) which is then used to locate the user record that contains forms of contact such as email and phone number to receive the token. While this works nicely for certain use cases, there are now other variations available where the *passwordless* user account fetched relevant user repositories can skip the default flow in favor of multifactor or delegated authentication. Furthermore, it is now also possible to, *conditionally*, skip the default passwordless authentication flow and simply challenge the user for their password as one might traditionally expect. 

Passwordless Authn might also be interpreted as [WebAuthn support](https://webauthn.io/); a specification and API written by the W3C and FIDO that allows identity providers such as CAS to register and authenticate users using public-key cryptography instead of a password. While this behavior can be achieved using certain multifactor provider integrations with CAS that provide WebAuthn support, built-in native support for WebAuthn is *not available* as of this writing and may become available in future releases.

## Configuration

Once you have decorated the CAS WAR Overlay with the proper [extension module](https://apereo.github.io/cas/6.2.x/installation/Passwordless-Authentication.html), you will need to adjust your CAS configuration (i.e. `cas.properties` file) to tune the feature for the following:

## User Accounts

How should user records and contact information be found, given an identifier?

To keep things simple for this tutorial, we are going to use a Groovy script to locate our passwordless accounts:

```properties
cas.authn.passwordless.accounts.groovy.location=file:/etc/cas/config/PasswordlessAccounts.groovy
```

...and the Groovy script may be designed as:

```groovy
def run(Object[] args) {
    def username = args[0]
    def logger = args[1]
    
    logger.info("Locating user record for user $username")

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

```groovy
  ...
  account.setRequestPassword(true)
  ...
```

In doing so, CAS will skip the default passwordless authentication flow in favor of its default primary authentication strategy where you might see this:

![image](https://user-images.githubusercontent.com/1205228/74814088-ffd53880-530f-11ea-860a-392f33ce3b03.png)

## Delegated Authentication

In another variation, the passwordless account can skip its default flow in favor of delegated authentication. To do so and with the assumption that [delegated authentication](https://apereo.github.io/cas/6.2.x/integration/Delegate-Authentication.html) is turned on in CAS, we can tag the account as one who's eligible for delegated authentication via:

```groovy
  ...
  account.setDelegatedAuthenticationEligible(true)  
  ...
```

{% include googlead1.html  %}

This requires a separate decision to select the identity provider from the list of those that are available and configured in CAS. To do this, we can design a small Groovy script tasked to decide and select the appropriate identity provider for our passwordless user:

```properties
cas.authn.passwordless.delegatedAuthenticationSelectorScript.location= \
    file:/etc/cas/config/PasswordlessDelegated.groovy
```

...and the selection script would be:

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

In another variation, the passwordless account can skip its default flow in favor of [multifactor authentication](https://apereo.github.io/cas/6.2.x/mfa/Configuring-Multifactor-Authentication.html) using a multifactor provider that is found configured and available in CAS. In doing so and much like other variations, the account must be tagged as one eligible for multifactor authentication:

```groovy
  ...
  account.setMultifactorAuthenticationEligible(true)
  ...
```

Once the account is deemed eligible for a multifactor authentication flow, it is processed by the collection of multifactor authentication triggers to select the appropriate provider. To keep things simple, let's say we would want to require MFA for users with an attribute `category` whose value(s) matches a pattern of `student` or `admin`.

```properties
cas.authn.mfa.globalPrincipalAttributeNameTriggers=category
cas.authn.mfa.globalPrincipalAttributeValueRegex=student|admin
```

Let's also make sure our demo passwordless account carries that relevant attribute:

```groovy
  ...
  def attributes = Map.of("category", List.of("student", "admin")) 
  account.setAttributes(attributes) 
  ...
```

With the above configuration, the account is processed by CAS [multifactor authentication triggers](https://apereo.github.io/cas/6.2.x/mfa/Configuring-Multifactor-Authentication-Triggers.html) to route to the appropriate multifactor authentication flow.

## Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)