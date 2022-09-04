---
layout:     post
title:      Apereo CAS - Working with OpenID Connect & DPoP Access Tokens
summary:    A short overview of how to work with OAuth access tokens via a proof-of-posession (DPoP) mechanism. This mechanism allows for the detection of replay attacks with access tokens.
tags:       ["CAS 6.6.x", "OAuth", "OpenID Connect"]
---

DPoP is an OAuth security extension for binding tokens to a private key that belongs to the client. The binding makes the DPoP access token sender-constrained and its replay, if leaked or stolen token, can be effectively detected and prevented, as opposed to the common Bearer token. DPoP is intended for securing the tokens of public clients, such as single-page applications (SPA) and mobile applications.

You can read more about DPoP [here](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-dpop).

{% include googlead1.html %}

This blog post briefly looks at DPoP access tokens may be used with Apereo CAS. Our starting position is as follows:

- Apereo CAS `6.6.x`
- [CAS Initializr](https://apereo.github.io/cas/6.6.x/installation/WAR-Overlay-Initializr.html)

# Overview

Single-page applications (SPA) can now request the issue of DPoP access tokens from CAS when it is acting as an OpenID Connect provider. This is a new kind of token, with stronger security properties than the default Bearer access tokens. The DPoP token comes with a protection against unauthorised use in case it suffers an accidental or malicious leak. This is achieved by binding the token to a private key held by the client. To prevent a leak of the key itself the client should store it behind an API that renders its private parameters inaccessible to application code.
{% include googlead1.html %}

# Configuration

Note that there is no special configuration required in CAS to enable support for DPoP tokens; however you should note that at this time, support for DPoP only covers access tokens. Support for refresh tokens may be worked out in future versions.
{% include googlead1.html %}

First, the client application begins by creating a *DPoP Proof*:

```javascript
let dt = new Date();
dt.setSeconds(dt.getSeconds() - 5);
const payload = {
  "htm": "POST",
  "htu": "https://localhost:8443/cas/oidc/token",
  "iat": dt.getTime() / 1000,
  "jti": "vqv2EAaJECl67LmE"
};
const {publicKey, privateKey} = await jose.generateKeyPair('ES256');
const publicJwk = await jose.exportJWK(publicKey);
const dpopProof = await cas.createJwt(payload, privateKey, "ES256",
  {
    header: {
      jwk: publicJwk,
      typ: "dpop+jwt"
    }
  });
```
{% include googlead1.html %}
The DPoP JWT header would look something like this:

```json
{
  "alg": "ES256",
  "typ": "dpop+jwt",
  "jwk": {
    "kty": "EC",
    "x": "92k-NjaoaCVDFPcEJvbHPbwf-8UZc4gOYxJKBbM1bjU",
    "y": "xWWvDNEL870TXHFdURc1MSbXuXUaNePHwQwdciC8LeE",
    "crv": "P-256"
  }
}
```
{% include googlead1.html %}
...and the payload body would be similar to:

```json
{
  "htm": "POST",
  "htu": "https://localhost:8443/cas/oidc/token",
  "iat": 1659156608.74,
  "jti": "vqv2EAaJECl67LmE"
}
```
{% include googlead1.html %}
Now, you would use the proof to obtain a specific *DPoP Access Token*:

```javascript
await cas.doPost("https://localhost:8443/cas/oidc/token", 
  "grant_type=...&code=...&redirect_uri=...", 
  { "DPoP": dpopProof }, 
  result => {
    accessToken = res.data.access_token;
    assert(accessToken !== null);
    assert(res.data.token_type === "DPoP");
    cas.decodeJwt(accessToken, true)
      .then(decoded => {
        assert(decoded.payload["DPoP"] !== undefined);
        assert(decoded.payload["DPoPConfirmation"] !== undefined);
        assert(decoded.payload["cnf"]["jkt"] !== undefined)
      });
}, error => {
    throw `Operation failed: ${error}`;
});
```
{% include googlead1.html %}
This *DPoP aware* access token can now be used to obtain user profile information:

```javascript
let profileUrl = `https://localhost:8443/cas/oidc/profile?token=${accessToken}`;
await cas.doPost(profileUrl, "", {
    'Content-Type': "application/json",
    "DPoP": newDPoP
}, res => {
    assert(res.data.sub != null)
}, error => {
    throw `Operation failed: ${error}`;
});
```
{% include googlead1.html %}
You should note that every request must be accompanied with a newly generated DPoP token, i.e. `newDPoP`, that is created using the same private key as before. Per the recommendation from the specification, to prevent a leak of the key itself the client should store it behind an API that renders its private parameters inaccessible to application code.

Finally, you could always introspec the access token received to discover whether it was issued as part of a DPoP exchange. The introspection response would look similar to the following:
{% include googlead1.html %}
```json
{
  "token": "...",
  "active": true,
  "sub": "casuser",
  "tokenType": "DPoP",
  "iss": "https://localhost:8443/cas/oidc",
  "cnf": { "jkt": "RyByuozB_iGtud8vdRNQkq7s9YPGgRpAYjLLpAiSig8" }
}
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html