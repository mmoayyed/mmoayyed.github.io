---
layout:     post
title:      Apereo CAS - SAML2 with Node.js <br>and Passport-SAML
summary:    Take advantage of Passport-SAML to integrate your Node.js application with a SAML2 identity provider for authentication.
tags:       ["CAS 6.4.x", "SAML", "Node.js"]
---

[Passport](http://www.passportjs.org/) is authentication middleware for Node.js. Extremely flexible and modular, Passport can be unobtrusively dropped into any Express-based web application. Password also have a collection of authentication strategies, [one of which](http://www.passportjs.org/packages/passport-saml/) provides a SAML2 authentication provider which is the main focus of this blog post based on the following components:

{% include googlead1.html  %}

- CAS `6.4.x`
- Java `11`
- [Passport-SAML](http://www.passportjs.org/packages/passport-saml/)
- [JSON Service Registry](https://apereo.github.io/cas/6.4.x/services/JSON-Service-Management.html)

# CAS Configuration

Apereo CAS can be configured to act as a standalone [SAML2 identity provider](https://apereo.github.io/cas/6.4.x/authentication/Configuring-SAML2-Authentication.html) to integrate with and support SAML2 service providers such as our to-be-developed Node.js application via appropriate SAML2 metadata exchanges to establish mutual trust. This metadata exchange and the registration step is done with CAS using the following JSON snippet:

{% include googlead1.html  %}

```json
{
  "@class": "org.apereo.cas.support.saml.services.SamlRegisteredService",
  "serviceId": "passport-saml",
  "name": "SAML",
  "id": 1,
  "evaluationOrder": 1,
  "metadataLocation": "http://localhost:3000/metadata",
  "attributeReleasePolicy" : {
    "@class" : "org.apereo.cas.services.ReturnAllAttributeReleasePolicy"
  }
}
```

Do note that,

- The Node.js SAML2 service provider metadata will be automatically fetched by CAS using the URL found at `metadataLocation`.
- The Node.js SAML2 provider metadata is expected to have the entity id `passport-saml`.

# Node.js SAML2 Service Provider

If you are well-versed in the ways of Node.js, you should be able to put together an [Express-js web application](https://expressjs.com/) fairly quickly and put [Passport-SAML](http://www.passportjs.org/packages/passport-saml/) inside it. In this section, I will only highlight the specifics of the integration and things that should be of note. 

## SAML2 Configuration

To set up the SAML2 service provider configuration, you will need to generate a pair of keys:

```bash
cd ./credentials
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout sp.key -out sp.crt
```

{% include googlead1.html  %}

You will be using the generated private key, along with the identity provider's entry point and SAML2 signing certificate to set up the service provider configuration:

```js
passport: {
    strategy: 'saml',
    saml: {
        callbackUrl: 'http://localhost:3000/login/callback',
        path: '/login/callback',
        entryPoint: 'https://sso.example.org/cas/idp/profile/SAML2/Redirect/SSO',
        issuer: 'passport-saml',
        cert: fs.readFileSync('/path/to/idp-signing.crt', 'utf-8'),
        decryptionPvk: fs.readFileSync('./credentials/sp.key', 'utf-8'),
    }
}
```

Note the `issuer` here represents the SAML2 entity id of the Node.js application.

## Passport SAML Strategy
 
The `SamlStrategy` strategy should now be created via Passport-SAML as the effective and active authentication provider: 

{% include googlead1.html  %}

```js
const strategy = (passport, config) => {  
    let strategy = new SamlStrategy(
      config.passport.saml,
      function (profile, done) {
        return done(null,
          {
            id: profile.uid,
            email: profile.email,
            profile: profile.profile,
            name: profile.name,
            username: profile.username
          });
      });
  
    passport.use(strategy);
    return strategy;
};
```

Note the mappings and extraction of identity provider attributes from the profile that are released to the service provider. Such attributes can then be used in the authenticated session to display user data.

## Service Provider Metadata

We'll need to put together a URL that exposes our SAML2 service provider configuration. Passport-SAML does not automatically generate or store SAML2 service provider metadata, but exposes options for one to create it on the fly:

{% include googlead1.html  %}

```js
app.get('/metadata',
  function(req, res) {
    const cert = fs.readFileSync('./credentials/sp.crt', 'utf-8');
    res.type('application/xml');
    // strategy is `SamlStrategy`
    res.send(strategy.generateServiceProviderMetadata(cert));
  }
);
```

## Start

To start, this would be our humble home page for the Node.js application:

{% include googlead1.html  %}
{% include image.html img="https://user-images.githubusercontent.com/1205228/128531842-b7a681b3-2325-4686-ba53-bcbb92d03e35.png" 
width="80%" title="Node.js Passport-SAML application" %}

We can visit the `/metadata` URL to take a look at our SAML2 service provider metadata:

{% include googlead1.html  %}
{% include image.html img="https://user-images.githubusercontent.com/1205228/128531926-adf8af8b-916f-476f-8ea7-6481e49e512d.png" 
width="80%" title="Node.js Passport-SAML application" %}

Once after a successful authentication attempt with CAS as a SAML2 identity provider, we can retrieve and display user profile data:

{% include googlead1.html  %}
{% include image.html img="https://user-images.githubusercontent.com/1205228/128532053-386f0581-212a-4ff4-b118-e05c6048b7e3.png" 
width="80%" title="Node.js Passport-SAML application" %}

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html