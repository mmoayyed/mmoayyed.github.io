---
layout:     post
title:      CAS configuration web app
summary:    The future of the CAS' configuration/management web app...

---

Currently, there is a discussion going on mailing lists about the future of [Apereo CAS'](https://www.apereo.org/projects/cas){:target="_blank"} registered services configuration management web application. Historically this web component was "baked" into the core of CAS and was/is used for managing CAS' registered services via service registry implementation that is "durable". Well, the only choice was the RDBMS implementation. In the past several years, with the raise of [3rd party addons](https://github.com/Unicon/cas-addons){:target="_blank"} and [the original JSON service registry implementation](https://github.com/Unicon/cas-addons/wiki/Configuring%20JSON%20Service%20Registry){:target="_blank"}, the need for the management web app has dramatically decreased, especially with the JSON service registry implementation which pioneered the instant live reloading of the services by detecting the config file change.

Now, in mid-2015 we are in the `CAS 4.1` release cycle and with JSON service registry with live reloading implementation making its way into the core (different implementation strategy from cas-addons), the question becomes - should the configuration management web app code base stay within the CAS' core or be moved out of the core as a separate project with its own release cycle? Especially with the current advance in CAS' configuration model and current "rich client" implementation of the web app (AngularJS - not yet released), it became apparent (to some) that the complectedness (not sure if there is such word, but the one that is `complected` with) of it with the CAS core does not make sense anymore. It will be useful, of course, to have a "rich configuration toolbox" for CAS server, with a rich and pretty, and functional UI, but with a different, modern and maintainable implementation strategy.

I'm personally of the opinion, that the CAS server should have a small core, which implements its core concepts (CAS protocol, WebSSO) well, and has a set of cohesive REST services exposing its rich configuration model, which would enable rich tools to be built outside of the core CAS server project repository. This has an advantage of having smaller CAS server codebase, with a small focus, and with an additional advantage of shortening its release cycle.

Until next time, good day...
