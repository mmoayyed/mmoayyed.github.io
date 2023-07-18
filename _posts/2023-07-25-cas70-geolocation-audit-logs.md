---
layout:     post
title:      Apereo CAS - Formatting Audit Log Outputs
summary:    Learn how to format and decorate CAS audit logs with new styles and formats, and include additional fields dynamically via Groovy.
tags:       ["CAS 7.0.x", "GeoLocation", "Audits", "Groovy"]
---

Apereo CAS uses the [Inspektr framework](https://github.com/apereo/inspektr) for all audit-related functionality. Inspektr is a very small library designed to capture and record the pieces of runtime information that attempt to answer questions like "*who did what to which resource, when and how?*" and in this post, we will review a few strategies that allow one to control and format the output of the audit log in Apereo CAS.

{% include googlead1.html  %}

 Our starting position is as follows:

- CAS `7.0.x`
- Java `17`

# Audit Records

Audited records are typically sent to the CAS logging framework, which in turn and by default may decide to log output to the console. A basic example of an audited record in the logs, condensed to one line, would be:

```
2023-07-15T10:48:10.802814875|casuser|\
    {service=https://localhost:9859/anything/1, return=ST-1-********Olip7NI-fv-az407-374}| \
    SERVICE_TICKET_CREATED|0:0:0:0:0:0:0:1|0:0:0:0:0:0:0:1
```
{% include googlead1.html  %}
While this might seem reasonable enough, there are of course options that allow one to take full control of the audit output and its formatting. One such option is to render and build the output via Groovy. 

# Groovy Audits

Groovy-based audits can receive and process the auditable context parameters and build the final auditable record in any text format or representation. The final auditable record is then passed to the logging framework, typically tagged under `INFO`.

Let's start by disabling the default log-based audit trail manager and enabling Groovy-based audits:

```properties
cas.audit.slf4j.enabled=false
cas.audit.groovy.template.location=file:/path/to/GroovyAuditor.groovy
```

A basic template for the Groovy script tasked to build the audit output might be:
{% include googlead1.html  %}
```groovy
who: ${who}, what: ${what}, when: ${when}, ip: ${clientIpAddress}
```

The fields that are available in the script should hopefully be self-explanatory. Note that the script above has very basic scripting abilities and it is processed by Groovy's `SimpleTemplateEngine`. This component processes template source files substituting variables and expressions into placeholders in a template source text to produce the desired output. The template engine uses JSP style `<% %>` script and `<%= %>` expression syntax or GString style expressions. 

# Client IP Geolocation 

A fancier (though certainly uglier) version of the script could attempt to geolocate IP addresses and have the result recorded in the final audit log. This option would require a valid subscription to a geolocation service such as [MaxMind](https://www.maxmind.com/). 

According to the MaxMind website:
{% include googlead1.html  %}
> MaxMind GeoIP2 offerings identify the location and other characteristics of Internet users for a wide range of applications including content personalization, fraud detection, ad targeting, traffic analysis, compliance, geo-targeting, geo-fencing, and digital rights management.

To activate this variant of session pinning, one would need to tweak a CAS build with the [right extension module](https://apereo.github.io/cas/development/authentication/GeoTracking-Authentication-Maxmind.html) and configure CAS to integrate with MaxMind. Then, we move on with the script:
{% include googlead1.html  %}
```groovy
who: ${who},
what: ${what},
when: ${when},
ip: ${
    org.apereo.cas.util.spring.ApplicationContextProvider
        .getApplicationContext()
        .getBean(org.apereo.cas.authentication.adaptive.geo.GeoLocationService.BEAN_NAME,
                org.apereo.cas.authentication.adaptive.geo.GeoLocationService.class)
            .locate(clientIpAddress)?.build()
}
```

It of course does the job to some extent, but looks fairly ugly to me! Dynamically accessing CAS internal components inside a Groovy script typically leads to long-term maintenance issues, especially when/if such components move around and get refactored in the CAS codebase. Execution failures remain somewhat unknown and silent until runtime when the feature is exercised and this might remain unnoticed for a while. 

A safer though slightly heavy-handed option for this task would be to house the logic inside a `ClientInfoResolver` component:
{% include googlead1.html  %}
```java
@Bean
public ClientInfoResolver casAuditClientInfoResolver(GeoLocationService service) {
    return new MyClientInfoResolver(service);
}
```

<div class="alert alert-info">
  <strong>Note</strong><br/>The method (bean) name chosen above must be exactly as shown. At runtime, the active application context would begin to select your version of this particular bean instead of what ships by default with CAS, and this decision is based on the presence of the same bean name defined above.
</div>

Once the bean is correctly registered with the Spring application context, your implementation should be able to safely geolocate client IP addresses:
{% include googlead1.html  %}
```java
@RequiredArgsConstructor
public class MyClientInfoResolver extends DefaultClientInfoResolver {
    private final GeoLocationService geoLocationService;

    @Override
    public ClientInfo resolveClientInfo(ClientInfo clientInfo) {
        var geolocation = geoLocationService.locate(clientInfo.getClientIpAddress()).build();
        return clientInfo.include("geo", geolocation);
    }
}
```

You get the idea. 

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html