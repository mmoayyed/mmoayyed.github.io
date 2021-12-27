---
layout:     post
title:      Design CAS-Enabled Custom Protocols 
summary:    Learn how to design and mass-promote your very own custom authentication protocol, get rich quickly, stay healthy indefinitely and reach a new state of enlightenment in a few very easy steps. 
tags:       ["CAS 5.1.x"]
---

![](https://cloud.githubusercontent.com/assets/1205228/23062372/c06e1e1a-f51a-11e6-8e5a-60692af7728c.jpg)

That's right. If you enjoy designing your own authentication protocols, integration strategies and workflows and then face the requirement of letting your Apereo CAS deployment support them, you have come to the right place. This is a guide for you.

Today, [Apereo CAS](https://apereo.github.io/cas) presents itself as a multilingual platform supporting protocols such as CAS, SAML2, OAuth2 and OpenID Connect. There are even plans and projections to provide support for the necessary parts of the `WS-*` protocol stack. Support and functionality for each of these protocols continually improves per every iteration and release of the software thanks to excellent community feedback and adoption. While almost all such protocols are similar in nature and intention, they all have their own specific bindings, parameters, payload and security requirements. So, in order for you to understand how to add support for yet another protocol into CAS, it's very important that you first begin to study and understand how existing protocols are supported in CAS. The strategy you follow and implement will most likely be very similar.

{% include googlead1.html  %}
So the bridge for the most part is the "control tower" of the operation. It speaks both languages and protocols, and just like any decent translator, it knows about the quirks and specifics of each language and as such is able to dynamically translate the technical lingo.

So far, so good.

{% include googlead1.html  %}ike above, to the OAuth2-enabled client all such details are totally transparent and as long as “the right stuff” is produced back to the client, it shall not care.

## Advantages

There are some internal technical and architectural advantages to this approach. Namely:

1. The core of the CAS authentication engine, flow and components need not be modified at all. After all, we are just integrating yet another client even if it’s embedded directly in CAS itself. (If you recall and are familiar, the original Clearpass integration via authentication proxying worked in very similar terms).
2. ...and because of that, support for that protocol can be very easily removed, if needed. After all, protocols come and go every day. That’s why you’re reading this blog post, right?!
3. ...and because of that and just like any other CAS client, all features of the CAS server are readily available and translated to the relevant client removing the need to duplicate and re-create protocol-specific configuration as much as  possible. Things like access strategies, attribute release, username providers, etc.

## Challenges

This process is rather difficult to get right, because just like any other decent translator, you do have to learn and speak both languages just-in-time. The plugin module needs to be designed generically and with a reasonable degree of abstraction such that it can dynamically insert itself into the right core areas of CAS without getting too entangled in the internal architecture.

# Your Road to Fame

So if you mean to build support for your very own authentication protocol, you’d do well to follow in the same footsteps. Take inspiration from the approach that current plugins and modules implement and design your own plugin that itself is the client of the CAS server hosting and housing it.

Happy Designing.

[Misagh Moayyed](https://fawnoos.com)
