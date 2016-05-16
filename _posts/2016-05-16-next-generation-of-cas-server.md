---
layout:     post
title:      CAS version 5.0
summary:    The next generation of CAS server...

---

Over the past several months the Apereo CAS development team has been hard at work developing the next generation of the CAS server. Originally it was targeted as `4.3`, but was unanimously decided to designate this release as a major `5.0` release.

This release is very exciting as it modernizes internal CAS architecture quite a bit, building on top of excellent Spring Boot framework, re-engineering core CAS configuration arrangement away from aging Spring XML with modern Java Config `@Configuration` model. This arrangement should facilitate auto configuration of internal parts of CAS server that should not be unnecessarily exposed to the end users, further simplifying lives of deployers of CAS. All the necessary bits and pieces of CAS server functionality would be made available as separate Java library dependencies. All the deployers would need to do to enable such modules is to include the dependency in their local CAS build and configure necessary parts via simple Java properties or YAML files.

Also, this release would bring such goodness natively to CAS server as SAML2 IdP WebSSO profile implementation, Oauth2 implementation, Open Id Connect implementation, as well as
native multi-factor authentication support facility with several mfa providers support like Duo security, among other things.

And of course to take the opportunity of the major release cycle, the development team was finally able to move the top level package from `org.jasig` to `org.apereo` as well as
moving the project home on GitHub under the [Apereo Organization](https://github.com/apereo) umbrella.

As far as the timeline - as is always the case in open source, there is no definitive hard date set, but the development team is working hard to bring you this exciting release some time
before the end of the year. We should also start seeing the milestone releases appearing throughout this Summer (2016). If someone likes to follow the development of this version, it's happening in the open, on the `master` [branch](https://github.com/apereo/cas/tree/master)

Exciting times for the open source WebSSO world!

Until next time, good day...
