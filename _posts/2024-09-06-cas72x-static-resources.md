---
layout:     post
title:      Apereo CAS - Serving Static Resources
summary:    A brief overview of how one may be able to pull in and display static resources in Apereo CAS deployments.
tags:       ["CAS 7.2.x", "Spring Boot"]
---

Spring Boot provides a convenient way to serve static resources from a list of Resource-based locations. Apereo CAS deployments can take advantage of this feature to display static content and have it dynamically be updated with reasonable caching intervals. 

{% include googlead1.html  %}

In this post, we will take a brief look at how static resources might be configured in the context of Apereo CAS deployments. Our starting position is as follows:

- CAS `7.2.x`
- Java `21`


# Configuration

Spring Boot and Apereo CAS together define the following locations where static resources may be found:
{% include googlead1.html  %}
- `file:/etc/cas/static/`
- `file:/etc/cas/public/`
{% include googlead1.html  %}
- `classpath:/META-INF/resources/`
- `classpath:/resources/`
- `classpath:/static/`
- `classpath:/public/`

This essentially means that the above paths are mounted onto the root of the `cas` web application after the context path, `/cas`. In other words, let's imagine that you have a `/etc/cas/static/hello/world.txt` static file. Once in place, you should be able to view its contents by going to `https://sso.example.org/cas/hello/world.txt`.
{% include googlead1.html  %}

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services. 

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)