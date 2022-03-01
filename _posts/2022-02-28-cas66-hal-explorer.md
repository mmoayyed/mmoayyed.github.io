---
layout:     post
title:      Apereo CAS - Actuator Endpoints with HAL Explorer
summary:    Gain insight into your running Apereo CAS actuator endpoints using the HAL Explorer and interact with APIs directly in the browser to learn what is available and possible.
tags:       ["CAS 6.6.x", "Monitoring"]
---

[HAL Explorer](https://github.com/toedter/hal-explorer) is a very helpful project, allowing one to browse and explore [HAL](http://stateless.co/hal_specification.html) and HAL-FORMS based RESTful Hypermedia APIs. In the context of Apereo CAS, we can take advantage of the explorer to discover various actuator endpoints and interact with them live in the browser.

{% include googlead1.html  %}

Our starting position is based on the following:

- CAS `6.6.0`
- Java 11
- [CAS Overlay](https://github.com/apereo/cas-overlay-template)

 
# Configuration

While not strictly required, we can include the CAS reporting facilitiy in our build to expose a number of actuator endpoints that are owned and built by CAS:

```gradle
implementation "org.apereo.cas:cas-server-support-reports"
```
{% include googlead1.html  %}
If you build and bring up CAS, the HAL Explorer option should be available from the main *drawer* panel:

{% include image.html img="https://user-images.githubusercontent.com/1205228/156120502-2dd9b385-0787-4fae-acf1-11011411f3cd.png"
width="70%" title="HAL Explorer" %}

At this point, you should be able to browse the available actuator endpoints that are enabled and exposed via your CAS configuraton:
{% include googlead1.html  %}
{% include image.html img="https://user-images.githubusercontent.com/1205228/155877447-c993b3d6-1e14-4dc8-8154-662d53ee2206.png"
width="80%" title="HAL Explorer" %}

# So...

It's important that you start off simple and make changes one step at a time. Once you have a functional environment, you can gradually and slowly add customizations to move files around.

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)
