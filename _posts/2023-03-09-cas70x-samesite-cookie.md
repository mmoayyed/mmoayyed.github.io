---
layout:     post
title:      Apereo CAS - Controlling SameSite Cookies
summary:    Learn how to generate the Same-Site attribute for the CAS single sign-on cookie dynamically via Groovy or Java to accommodate older browsers and other conditions, etc. 
tags:       ["CAS 7.0.x"]
---

The `SameSite` attribute of the `Set-Cookie` HTTP response header allows CAS to declare if the SSO cookie should be restricted to a *first-party* or same-site context. A cookie is associated with a particular domain and scheme (such as `http` or `https`), and may also be associated with subdomains if the `Set-Cookie Domain` attribute is set. If the cookie domain and scheme match the current page, the cookie is considered to be from the same site as the page and is referred to as a first-party cookie.

This is especially important for Apereo CAS, as SSO management is mainly backed by a cookie. A ticket-granting cookie (also known as a `TGC`) is an HTTP cookie set by CAS upon the establishment of a single sign-on session. This cookie maintains the login state for the client, and while it is valid, the client can present it to CAS instead of primary credentials.

{% include googlead1.html %}

In this post, we will briefly take a look at a few configuration options that allow CAS to control and define the `SameSite` attribute. This tutorial specifically requires and focuses on:

- CAS `7.0.x`
- Java `17`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

# Configuration

All CAS settings that deal with cookie-related features typically should benefit from a consistent configuration schema to automatically inherit the `same-site-policy` setting:

```properties
cas.tgc.same-site-policy=
```
{% include googlead1.html %}
The value assigned above controls the `SameSite` attribute of the ticket-granting cookie statically and at configuration time. Leaving the setting value blank would force CAS to never generate this attribute when it sets cookies. 

You may of course choose any of the listed options below.

## SameSite Options

- `Lax`: Cookies are not sent on normal cross-site subrequests (for example to load images or frames into a third-party site), but are sent when a user is navigating to the origin site (i.e., when following a link).
- `Strict`: Cookies will only be sent in a first-party context and not be sent along with requests initiated by third-party websites. 
- `None`: Cookies will be sent in all contexts, i.e. in responses to both first-party and cross-site requests. If `SameSite=None` is set, the cookie Secure attribute must also be set (or the cookie will be blocked).
{% include googlead1.html %}

CAS itself offers a few additional options as well:

- `Off`: Disable the generation of the `SameSite` cookie attribute altogether.

## Generating SameSite

You might have to deal with scenarios where the `SameSite` cookie attribute needs to be set dynamically or conditionally depending on a variety of conditions such as the browser user agent, IP address, etc. To handle this use case, CAS offers the following options.

### Generating SameSite with Groovy

The cookie setting in CAS configuration may point to a Groovy script that is tasked to generate the SameAttribute cookie attribute. 
{% include googlead1.html %}
```properties
cas.tgc.same-site-policy=file:/path/to/MyGroovyScript.groovy
```

The outline of the script may be as follows:

```groovy
import org.apereo.cas.web.cookie.*
import jakarta.servlet.http.*

def run(final Object... args) {
    def request = args[0] as HttpServletRequest
    def response = args[1] as HttpServletResponse
    def context = args[2] as CookieGenerationContext
    def logger = args[3]
    
    logger.info("Generating SameSite for ${context.name}")
    return "SameSite=Lax;"
}
```
{% include googlead1.html %}
The `request` object above allows access to all request headers. For example, you may fetch the `User-Agent` via `request.getHeader("User-Agent")` and base your conditions off of that header value, or you may check for specific IP addresses via `request.getRemoteAddr()`. 

If you wish to skip generating the `SameSite` attribute altogether, you could always return `null`.

### Generating SameSite with Java

The cookie setting in CAS configuration may point to a Java class using its FQDN that is tasked to generate the `SameAttribute` cookie attribute. This may be the preferred approach if the complexity of your implementation and conditions require more power, and access to external libraries or you may want to take advantage of the static compilation of the changes to prevent accidental mistakes and syntax errors.

```properties
cas.tgc.same-site-policy=org.example.cas.MyCookieSameSitePolicy
```

Then your Java implementation would be similar to the following:
{% include googlead1.html %}
```java
public class MyCookieSameSitePolicy implements CookieSameSitePolicy {
    @Override
    public Optional<String> build(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  CookieGenerationContext context) {
        return Optional.of("SameSite=Lax;");
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