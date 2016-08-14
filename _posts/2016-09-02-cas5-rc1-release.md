---
layout:     post
title:      CAS 5 RC1 Release
summary:    ...in which I present an overview of CAS 5 RC1 release.

---

Based on the [CAS project release schedule](https://github.com/apereo/cas/milestones), today we are excited to announce the first release candidate in the CAS 5 series. There are a [few enhancements](https://github.com/apereo/cas/releases/tag/v5.0.0.M3) packed into this release that are worthy to publicize. So here it goes.

Before we get started, it should be pointed out that [releases of CAS 5 are available to adopters to try](https://github.com/apereo/cas-overlay-template/tree/5.0). Deployers are more than welcome to try these out and share feedback.

The current documentation of CAS 5 is also [available here](https://apereo.github.io/cas/development/index.html).

# Bug Fixes

Several bug fixes submitted by the community that address:

- SPNEGO authentication & documentation
- LDAP authentication & attribute resolution
- OIDC discovery

# Google reCAPTCHA

Over the years, there have been several requests on the mailing list asking for guidance to enable a CAS integration with Google's reCAPTCHA. While [a recipe](https://wiki.jasig.org/display/CASUM/Integrating+reCaptcha+with+CAS) existed for enabling this feature for older CAS versions, over time it'd gotten rusty. In this release candidate, CAS starts to support Google's reCAPTCHA natively. Just like with all other features, there will be no need to modify
the CAS login webflow or any other configuration file. Including the relevant module, and provide your settings for reCAPTCHA.

[This article](http://news.softpedia.com/news/google-recaptcha-cracked-in-new-automated-attack-502677.shtml) may be of further interest to you.

# Default Redirect URL

What happens when users accidentally and incorrectly bookmark the `https://sso.example.org/cas/login` url? They get to the CAS login page, authenticate and then are greeted with a warm welcoming message that redirects them next to nowhere important. Phone calls and support tickets flood IT services reporting that CAS or that/that application are broken.

That's no fun.

So to accommodate this briefly, CAS starts to support a default redirect URL to which you can redirect your audience if no target application is specified upon authentication. The URL can be just about anywhere, as long as you have authorized and registered it correctly. In most cases, it's a redirect to some sort of portal page that lists all services allows for user access.

# Case Insensitive Attribute Release

So you have set up CAS to retrieve attributes from your LDAP server and decided to retrieve the attribute `givenName`. You then register a few services and design them such that they would be allowed to receive `givenName`, yet nothing is released. Your logs show `givenName` is found and your LDAP queries and browsers all show that attribute has a valid attribute and all the right permissions are set. What's happening? Is CAS secretly biased against that attribute?

Lets not point fingers, but some LDAP servers seem to change the case of the attribute name when they pass it back to the requesting application. CAS may submit `givenName`, yet it receives `givenname`. When the application asks for attributes CAS looks at the associated attribute policy and finds that it's authorized to release `givenName`, yet the actual principal has no such attribute! It only has `givenname`. As a result, the application gets nothing.

To accommodate this scenario, CAS starts to treat attributes that are specified in attribute release policies in a case insensitive manner. With this change, CAS may ask for `givenName` and the LDAP server is free to return `givenname`, `GIVENNAME` a hyper-emo version of it, `gIvEnNaMe`. At release time, since case no longer matters the application will correctly receive `givenName`.

If it matters that much, note that you can always control the exact case of the attribute released as well.

# Geoprofiling Authentication Requests

How do you block what you may consider a suspicious authentication attempt? For instance, you may wish to disallow requests from certain locations or IP addresses. Even better, you may want those requests to pass through multifactor authentication for extra security. Is there anything in CAS that can help with yes?

Yes. As a variant of adaptive authentication and starting with this release candidate CAS allows you to geoprofile authentication requests and then based on your devised rules, reject those or force them through a particular multifactor provider. Geoprofiling can be achieved via Maxmind or GoogleMaps, both of which are services that require a paid subscription.

# What's Next?

The development team is working hard to make sure the CAS 5 release is on [schedule](https://github.com/apereo/cas/milestones).

At this point, all new development has been frozen and project is solely focusing on testing the release candidate and applying bug fixes based on the community reports. There will likely be other release candidates, but short of any major incidents or changes, the CAS 5 GA release should be available right on schedule.

# How can you help?

- Start your early [CAS 5 deployment](https://github.com/apereo/cas-overlay-template/tree/5.0) today. Try out features and [share feedback](https://apereo.github.io/cas/Mailing-Lists.html).
- Better yet, [contribute patches](https://apereo.github.io/cas/developer/Contributor-Guidelines.html).
- Review and suggest documentation improvements.
- Review the release schedule and make sure you report your desired feature requests on the project's issue tracker.

# Das Ende

A big hearty thanks to all who participated in the development of this release to submit patches, report issues and suggest improvements. Keep'em coming!

[Misagh Moayyed](https://twitter.com/misagh84)
