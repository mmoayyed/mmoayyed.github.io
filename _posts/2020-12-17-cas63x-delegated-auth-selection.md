---
layout:     post
title:      Apereo CAS - External Identity Provider Selection
summary:    An overview of modest changes to the Apereo CAS user interface to handle external identity provider selections in delegated authentication scenarios.
tags:       [CAS]
---

When Apereo CAS is configured to hand off the authentication flow to [external identity providers](https://apereo.github.io/cas/development/integration/Delegate-Authentication.html), one use case that often pops up is the ability to auto-select the appropriate identity provider based on user affiliations, scope, or tenancy. In simple scenarios, this selection logic is keyed off of the user identifier. For example, the SSO system should be able to auto-select `GitHub` as the external identity provider, if the user's given identifier is in the format of `user@example.com` and so on.

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-8081398210264173"
     data-ad-slot="3789603713"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

This post describes a modest enhancement to the CAS user interface to allow automatic selection of the correct identity provider based on user identifiers. 

Our starting position is as follows:

- CAS `6.3.x`
- Java `11`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

## Configuration

Let's suppose that a given CAS server is configured to hand off the authentication flow to the following external identity providers:

{% include image.html img="https://user-images.githubusercontent.com/1205228/102490099-9f27a100-4083-11eb-9810-dee409e47131.png" width="80%" title="CAS Delegated Proxy Login Flow" %}

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-8081398210264173"
     data-ad-slot="3789603713"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

To handle automatic selection of the correct identity provider, we can start by customizing the `loginProviders.html` file that contains the appropriate markup for external identity providers. With a tiny amount of Javascript, we can install an event listener that can auto-redirect the user to the appropriate identity provider based on the structure of the provided user id:

```html
<script type="text/javascript">var providers = [];</script>
<!-- 
  Further down in the loop where 
  identity providers are rendered... 
-->
<script th:inline="javascript">
    /*<![CDATA[*/
    providers.push({
        name: /*[[${entry.name}]]*/ ,
        type: /*[[${entry.type}]]*/ ,
        url: /*[[@{${entry.redirectUrl}}]]*/
    });

    function jqueryReady() {
        $("#fm1 #username").on("focusout", function () {
            let user = $("#fm1 #username").val();
            if (user.endsWith("@example.com")) {
                let provider = providers.find(
                  element => element.name === "GitHub");
                $("#passwordSection").hide();
                location.href = provider.url;
            }
        });
    }
    /*]]>*/
</script>
```

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-8081398210264173"
     data-ad-slot="3789603713"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

It is important to emphasize that this is a modest user interface enhancement, mostly designed as *a matter of convenience to the user* and the overall user experience. Other variations of this flow that force the server to execute authorization logic to determine the user's home identity provider without providing a selection menu *can not* be handled via client-side enhancements in a secure way and must be pushed back to the backend server.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html