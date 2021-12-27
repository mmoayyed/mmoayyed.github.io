---
layout:     post
title:      Apereo CAS - Import & Export w/ Service Registries
summary:    Learn how to manage the state of the CAS service registry, when managed via external storage services such as relational databases and more.
tags:       ["CAS 6.3.x", "Service Integrations"]
---

Apereo CAS offers a large menu of options for [managing client application registration records](https://apereo.github.io/cas/6.3.x/services/Service-Management.html). One popular option especially applicable to distributed deployments of the CAS server is to store application policies inside a [relational database](https://apereo.github.io/cas/6.3.x/services/JPA-Service-Management.html) such as MySQL, Oracle, etc. In this use case, while CAS can be configured to automatically generate the necessary schemas and table structures required to manage application data, it might be challenging to properly import existing applications into the database or export the current dataset into a friendly format for reviews and audits. Rather than playing around with database native tooling or manually fiddling with fancy SQL statements, (a very-discouraged endeavor), the CAS server itself offers a few additional tools that allow one to import or export the contents of the service registry regardless of the type of storage service.

{% include googlead1.html  %}

Our starting position is as follows:

- CAS `6.3.x`
- Java `11`
- [CLI JSON Processor `jq`](https://stedolan.github.io/jq/)
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

# Setup

The service management facilities in Apereo CAS can be controlled and massaged using several [actuator endpoints](https://apereo.github.io/cas/6.3.x/services/Service-Management.html#administrative-endpoints). These endpoints, *once exposed, secured and enabled*, allow the adopter to peek into the current contents of the service registry, export entries as a zip file or import a pre-existing application policy file into the registry without having to deal with the specifics of the storage technology used by CAS.

For example, let's imagine that a CAS server deployment is backed by a MySQL database to manage application policies. To start, we can verify the initial empty state of the service registry by invoking an actuator endpoint that reports back the registry contents:

```bash
curl -u casuser:Mellon https://sso.example.org/cas/actuator/registeredServices | jq 
```

<div class="alert alert-info">
  <strong>Note</strong><br/>This post assumes that all CAS actuator endpoints are protected with basic auth using the predefined
  credentials <code>casuser</code> and <code>Mellon</code> for the username and password, respectively.
</div>


{% include googlead1.html  %}


Next, let's prepare a sample JSON file to represent an application registration record:

```json
{
  "@class" : "org.apereo.cas.services.RegexRegisteredService",
  "serviceId" : "https://service.example.com/.*",
  "name" : "Service",
  "id" : 1,
  "evaluationOrder" : 10
}
```

To import the file into the CAS service registry, we can invoke yet another actuator endpoint that expects the body of the request to be our service definition:

```bash
curl -u casuser:Mellon -X POST -H "Content-Type: application/json" \
     --data-binary "@/path/to/Service-1.json" \
     https://sso.example.org/cas/actuator/importRegisteredServices
```

Of course, you could do the same if the application policy is a YAML file:

```bash
curl -u casuser:Mellon -X POST -H "Accept: application/vnd.cas.services+yaml" \
     --data-binary "@/path/to/Service-1.yaml" \
     https://sso.example.org/cas/actuator/importRegisteredServices
```

<div class="alert alert-info">
  <strong>Note</strong><br/>The <code>--data-binary</code> flag is important for <code>curl</code>, since it preserves the formatting of line breaks allowing CAS to properly recognize the syntax and consume the content.
</div>


Once entries are imported, you can invoke the previous `registeredServices` actuator endpoint to peek at the content, or you could also ask for an export of the entire service registry as a zip file:

{% include googlead1.html  %}


```bash
curl -u casuser:Mellon https://sso.example.org/cas/actuator/exportRegisteredServices -o results.zip
```


# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

Remember that the strategies outlined in this guide apply to all types of technologies and services that can [manage application definitions](https://apereo.github.io/cas/6.3.x/services/Service-Management.html#storage) in Apereo CAS. They are not limited to relational databases, and should work all the same if your deployment uses MongoDb, Cassandra or any other technology as the backing solution for the CAS service registry. 

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please know that all other use cases, scenarios, features, and theories certainly [are possible](https://apereo.github.io/2017/02/18/onthe-theoryof-possibility/) as well. Feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)