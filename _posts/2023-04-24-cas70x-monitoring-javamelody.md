---
layout:     post
title:      Apereo CAS - Monitoring with JavaMelody
summary:    Learn to monitor your Apereo CAS deployment with JavaMelody to diagnose issues and identify hotspots, long-running requests, and more.
tags:       ["CAS 7.0.x", "Monitoring", "Spring Boot"]
---

[JavaMelody](https://github.com/javamelody/javamelody) advertises itself as an opensource, lightweight, and production-ready monitoring tool that is easy to integrate with Spring Boot applications to provide statistics on HTTP requests, memory, CPU, Spring beans, scheduled background jobs, JDBC connections and more. It can be used in a CAS context to calculate response times and the number of component/request executions using charts and graphs to identify problem areas and assist with troubleshooting.

{% include googlead1.html %}

In this post, we will take a brief look at how JavaMelody may be configured to monitor CAS deployments. This tutorial specifically requires and focuses on:

- CAS `7.0.x`
- Java `21`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

# Configuration

Once you include the appropriate [extension module](https://apereo.github.io/cas/development/monitoring/Configuring-Monitoring-JavaMelody.html) in your CAS build, JavaMelody will be available at `https://sso.example.org/cas/monitoring` to browse the monitoring reports. The report requires and forces authenticated access, so you will need to configure the credentials:
{% include googlead1.html %}
```properties
spring.security.user.name=javamelody
spring.security.user.password=M3ll0n
```

...and then you would be ready to browse:
{% include googlead1.html %}
{% include image.html img="https://user-images.githubusercontent.com/1205228/233893702-50e114e0-8ad1-479b-9830-705098060d79.png"
width="70%" title="Apereo CAS - Monitoring with JavaMelody" %}

# CAS Components

In addition to the out-of-the-box metrics and statistics provided by JavaMelody, CAS itself instruments and tags several core components for monitoring and observations, such as the ticket registry, service registry, etc. You can see the stats for those in the JavaMelody report for Spring:
{% include googlead1.html %}
{% include image.html img="https://user-images.githubusercontent.com/1205228/233894030-d0490ab2-f33b-486e-a17a-551d49443533.png"
width="70%" title="Apereo CAS - Monitoring with JavaMelody" %}

You can drill down into a tagged operation to, for instance, see how long CAS might take to locate and fetch a ticket. In this case, it would be extremely fast since the tickets by default are managed in runtime memory:
{% include googlead1.html %}
{% include image.html img="https://user-images.githubusercontent.com/1205228/233894219-1f14ca2f-91e6-41bc-9ca8-ffe9b8bc2196.png"
width="70%" title="Apereo CAS - Monitoring with JavaMelody" %}

# Custom Components

CAS components are not tied to JavaMelody at compile-time for monitoring and observations. Certain Spring beans annotated with `@Controller`, `@RestController`, `@Service`, `@Scheduled`, and many more are monitored automatically. If you want to monitor method calls and component invocations on other types of Spring beans, you can add `@MonitoredWithSpring` on those classes or methods, which is an annotation that is provided by JavaMelody, or if you prefer, you can use the CAS equivalent annotation `@Monitorable`. If you need to, you can also configure your annotation, i.e. `@MyAnnotation`, for other monitoring purposes and allow JavaMelody to locate and monitor your components separately:
{% include googlead1.html %}
```java
@Bean
public MonitoringSpringAdvisor myAdvisor() {
    return new MonitoringSpringAdvisor(
        new AnnotationMatchingPointcut(MyAnnotation.class, null));
}
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html