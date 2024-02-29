---
layout:     post
title:      Apereo CAS - Identity Impersonation
summary:    You do not always have to be you. Configure the Apereo CAS server to allow you to pretend to be another person for fun and profit.
tags:       ["CAS 7.0.x", "Impersonation", "LDAP"]
---

# Overview

The Apereo CAS server has had support for impersonation for a quite a while now, starting with CAS `5.1.x`. This feature usually referred to as [*Surrogate Authentication*](https://apereo.github.io/cas/7.0.x/authentication/Surrogate-Authentication.html) or *sudo for the web* long existed before the CAS 5 series in form of an extension and gradually and eventually found its way into the mainline distribution through community contributions, having been tested and tried in production battlegrounds.

{% include googlead1.html  %}

The idea behind this feature is fairly simple; sometimes you want to be someone else perhaps for the purposes of duplicating a troublesome scenario or troubleshooting a bad user experience, etc. In such scenarios, your own identity and credentials are first verified and assuming you have the authorization to impersonate someone else, you proceed to adopt that person's identity in order to duplicate their user experience and workflow. 

This is a short tutorial on how to achieve said functionality.

Our starting position is based on the following:

- CAS `7.0.x`
- Java 21

Our primary source for authentication is abstracted away with [JAAS](https://apereo.github.io/cas/7.0.x/authentication/JAAS-Authentication.html), and the principal store for fetching user attributes is [LDAP](https://apereo.github.io/cas/7.0.x/integration/Attribute-Resolution-LDAP.html).

# Overlay Setup

Once you have a [functional overlay](https://github.com/apereo/cas-overlay-template) build, the first step would be to prep the right number of configuration settings in order to handle authentication and attribute resolution. The following settings, summarily, should do the job:
{% include googlead1.html  %}
```
cas.authn.jaas[0].realm=CAS

cas.authn.attribute-repository.ldap[0].attributes.uid=uid
cas.authn.attribute-repository.ldap[0].attributes.displayName=displayName
cas.authn.attribute-repository.ldap[0].attributes.cn=commonName
cas.authn.attribute-repository.ldap[0].attributes.memberOf=memberOf

cas.authn.attribute-repository.ldap[0].ldap-url=ldap://...
cas.authn.attribute-repository.ldap[0].base-dn=dc=example,dc=edu
cas.authn.attribute-repository.ldap[0].search-filter=uid={0}
cas.authn.attribute-repository.ldap[0].bind-dn=...
cas.authn.attribute-repository.ldap[0].bind-credential=...

cas.personDirectory.principal-attribute=uid
```
{% include googlead1.html  %}
At this point, we should be able to authenticate via JAAS and subsequently fetch attributes from LDAP. We are also instructing CAS to build the final authenticated `Principal` identified by the `uid` attribute (instead of whatever the user types into the login form as the credential id).

So far, so good.

# Impersonation Scenario

Our handling of [impersonated authentication attempts](https://apereo.github.io/cas/7.0.x/authentication/Surrogate-Authentication.html) scenarios is rather unique. Sometimes, we know beforehand the identity of the user whom we plan to impersonate. Other times, it would be nice to be presented with a menu to choose our target impersonatee. Of course, a mere successful authentication attempt is not enough; not only do we need to be authorized to start impersonation attempts, but also we need special permissions for each impersonated user account. For the purposes of this tutorial, we shall attempt to kill both such birds with one stone; LDAP.

{% include googlead1.html  %}

Furthermore, we will need to establish a special sort of syntax instructing CAS to display a list of potential impersonatee accounts authorized for our use as well as one that simply bypasses that menu list and executes the requested impersonation attempt. Per CAS, we may be able to use the *plus syntax* which sort of goes like this:
{% include googlead1.html  %}
- `jsmith+casuser` would mean: *Authenticate myself, the primary user as `casuser`, using my own credentials. Then switch my identity and adopt that of `jsmith`*.
- `+casuser` would mean: *Authenticate myself, the primary user as `casuser`, using my own credentials. Then present a list of accounts authorized for impersonation attempts by me*.

# The Setup

First, let's ensure that CAS is prepped with the baseline impersonation functionality by including the [right extension module](https://apereo.github.io/cas/7.0.x/authentication/Surrogate-Authentication.html). Then, since impersonated accounts and authorization rules are going to be fetched from LDAP, let's get CAS [prepped for that too](https://apereo.github.io/cas/7.0.x/authentication/Surrogate-Authentication-Storage-LDAP.html).

Surely, we need to instruct CAS on how to connect to LDAP for impersonation attempts:
{% include googlead1.html  %}
```properties
cas.authn.surrogate.ldap.ldap-url=ldap://...
cas.authn.surrogate.ldap.base-dn=dc=example,dc=edu
cas.authn.surrogate.ldap.search-filter=uid={0}
cas.authn.surrogate.ldap.bind-dn=...
cas.authn.surrogate.ldap.bind-credential=...
```

# Impersonation Configuration

We have to teach CAS to hit LDAP and fetch a list of accounts authorized for impersonation, if and when instructed by the above special syntax. This can be done using the following settings:
{% include googlead1.html  %}
```properties
cas.authn.surrogate.ldap.surrogate-search-filter=(&(uid={user})(memberOf=cn=edu:example:app:{surrogate}))

cas.authn.surrogate.ldap.member-attribute-name=memberOf
cas.authn.surrogate.ldap.member-attribute-value-regex=cn=edu:example:app:([^,]+)
```
{% include googlead1.html  %}
These basically tell CAS to execute an LDAP search query where `uid` attribute equals the identity of the primary user (i.e. `casuser`) and the `memberOf` attribute matches a value of `cn=edu:example:app:{surrogate}` where `{surrogate}` is the identity of the impersonatee provided using the special plus syntax. 
{% include googlead1.html  %}
If a match is found, authorization is granted and CAS picks up the identity of `surrogate` under legitimate pretenses. In other words, if `casuser` is found in LDAP with a `uid` of `casuser` and a `memberOf` of `cn=edu:example:app:jsmith`, then `jsmith+casuser` should allow CAS to switch the primary user from `casuser` to `jsmith`.

## Impersonation User Menu

{% include googlead1.html  %}
What about the `+casuser` syntax? That's where the two other settings come in. Once CAS finds the primary user (i.e. `casuser`) in LDAP via the specified search query `uid={0}`, it then begins to look at all values of the `memberOf` attribute and will pick out those that match the attribute value specified. Note that the value is a regular expression pattern and once matched, CAS will attempt to extract the first group in the pattern for display purposes in the final menu where `casuser` will get to choose an impersonate account and proceed.

## Validate Impersonation

{% include googlead1.html  %}

Here is the thing: once authorization has been granted via the `surrogate-search-filter` and depending on how that filter is constructed, you may want to make sure the resulting entry actually does exist in LDAP. You can configure an optional LDAP validation filter that attempts to look for surrogate/impersonatee account. For example, let's imagine that your starting configuration begins with:
{% include googlead1.html  %}
```properties
cas.authn.surrogate.ldap.search-filter=(uid={user})
cas.authn.surrogate.ldap.surrogate-search-filter=(&(uid={user})(memberOf=actAs:{surrogate}))
cas.authn.surrogate.ldap.member-attribute-name=memberOf
cas.authn.surrogate.ldap.member-attribute-value-regex=actAs:([^,]+)
```

If the `surrogate-search-filter` does return a result, you may want to doubly verify that the surrogate does in fact exist in LDAP and not blindly trust the fact that the data and entry is valid. To do so, CAS provides a second and optional validation filter that you can use for extra safety to ensure the impersonated account reaaaaally does exist:
{% include googlead1.html  %}
```properties
cas.authn.surrogate.ldap.surrogate-validation-filter=uid={surrogate}
```

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)
