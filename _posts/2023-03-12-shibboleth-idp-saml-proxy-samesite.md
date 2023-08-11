---
layout:     post
title:      Shibboleth Identity Provider - SAML Proxy Authentication w/ SameSite Cookies
summary:    Discussion of SameSite cookie sporadic failures with the Shibboleth Identity Provider and its support for SAML login flow allowing one to use a separate SAML 2.0 Identity Provider to authenticate a subject.
tags:       ["Shibboleth Identity Provider", "SAML"]
---

The authn/SAML login flow in the Shibboleth Identity Provider supports the use of a separate SAML 2.0 Identity Provider to authenticate the subject, with the IdP acting as a SAML proxy. This flow provides native SAML support with additional features and flexibility without the need to deploy a separate SAML Service Provider implementation.

This is a review of how to employ a workaround in the Shibboleth Identity Provider to conditionally manage and control the SameSite cookie attribute, to prevent sporadic failures with this feature during the SAML POST back to the proxying Shibboleth IdP.

{% include googlead1.html %}

This tutorial specifically focuses on:

- Shibboleth Identity Provider `4.3.x`
- Java `11`

# Problem

When the SAML proxying feature is deployed and turned on in the Shibboleth IdP, the POST back to the IdP from the proxied IdP may omit the necessary cookies to resume the flow, resulting in the "stale request" message. There are no alternatives but to get SameSite addressed if you use that feature with Chrome, Firefox, and other browsers that enforce this type of behavior. 

Aside from the proxying case, the following deployment scenario results in the loss of SSO functionality (the user has to enter their credentials again).
{% include googlead1.html %}
- A SAML 2.0 SP uses the HTTP-POST binding to issue its request AND
- The IdP is configured to use server-side sessions OR is not using HTML Local Storage with client-side sessions.

# SameSite Filtering

The Shibboleth IdP includes a Java servlet filter class that can be deployed to work around Java's lack of SameSite support and auto-add the attribute to cookies in various ways. It does have a generic extension point for attaching a condition that can be used for User-Agent testing. 

To activate the filter, one needs the following properties in `idp.properties` file:
{% include googlead1.html %}
```properties
idp.cookie.sameSite = None 
idp.cookie.sameSiteCondition = My.SameSiteCondition
```

The `My.SameSiteCondition` refers to a bean ID of a `Predicate<ServletRequest>` component that would need to be defined in `global.xml` file:

```xml
<bean id="My.SameSiteCondition" parent="shibboleth.Conditions.Scripted" factory-method="resourceScript" 
    p:returnOnError="true" p:hideExceptions="true" c:_0="javascript" c:_1="%{idp.home}/conf/my-samesite.js" />
```

The `%{idp.home}/conf/my-samesite.js` executes a JSR-223 scriptlet against a `ProfileRequestContext` to produce a true/false result. The script itself may be designed as such:
{% include googlead1.html %}
```javascript
function minVersion(ua, browserName, version) {
    var setSameSite = true;
    var regexString = browserName + "/(\\d+)\\.";
    var regex = new RegExp(regexString);
    var match = ua.match(regex);
    if (match) {
        var major = parseInt(match[1]);
        if (major < version) { 
            setSameSite = false;
        }
    }
    return setSameSite;
}

var activate = true;
var logger = Java.type("org.slf4j.LoggerFactory").getLogger("My.SameSiteCondition");
try {
    if (input != null) {
        var UA = input.getHeader("User-Agent");
        if (UA != null) {
            logger.info('SameSite User-Agent: ' + UA);
            if ((UA.contains("iPhone") || UA.contains("iPad") || UA.contains(" OS X ")) 
                && (UA.contains("Version/") && UA.contains("Safari/"))) {
                activate = minVersion(UA, "Version", 15);
            } else if (UA.contains("Firefox/")) {
                activate = minVersion(UA, "Firefox", 60); 
            } else if (UA.contains("Opera/")) {
                activate = minVersion(UA, "Opera", 39);
            } else if (UA.contains("Chrome/")) {
                activate = minVersion(UA, "Chrome", 51); 
            } else if (UA.contains("Chromium/")) {
                activate = minVersion(UA, "Chromium", 51);
            }
            logger.debug('SameSite User-Agent: ' + activate);
        }
    }
}
catch (e) {
    logger.error('SameSite User-Agent Error: ' + e);
}
return activate;
```
{% include googlead1.html %}
The returned outcome of the script is a boolean `true/false` that is only set based on the type of browser and a minimum version that could support SameSite cookies. When the script returns `true`, the IdP will set the SameSite attribute to `None`, as specified via the `idp.cookie.sameSite` property.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html