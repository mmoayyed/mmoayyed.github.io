---
layout:     post
title:      Apereo CAS - Attribute Release via Apache Groovy
summary:    Learn how to release and share attributes with client applications and relying parties by scripting the release logic using Apache Groovy.
tags:       ["CAS 7.0.x", "CAS 6.6.x", "Groovy"]
---

Client applications that are registered with an identity provider such as Apereo CAS often need access to person data and attributes. The identity provider is tasked to retrieve, calculate, and then finally authorize these attributes for release to the application. In certain cases, you may need to build a special attribute dynamically on the fly or manipulate its name or list of values to match the requirements and expectations of the client application.

{% include googlead1.html  %}

In this post, we will take a look at how attribute release rules and logic can be embedded inside an application's policy record that is modeled as a JSON file. We will review and break down the rationale behind the release rules and tap into how Apache Groovy can be used to build and release attributes dynamically.

{% include googlead1.html  %}

This tutorial specifically requires and focuses on:

- CAS `7.0.x`
- Java `21`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

# Use Case

Let's say we have a `memberOf` attribute that contains the following list of values:

- `CN=Admins,OU=Services`
- `CN=Users,OU=Services`
- `CN=Guests,OU=Services`
- `CN=System,OU=Services`

Additionally, we have the following attributes:
{% include googlead1.html  %}
- `extensionAttribute1` with value(s) `A`
- `extensionAttribute2` with value(s) `B`
- `extensionAttribute3` with value(s) `C`

We have registered a SAML2 service provider with Apereo CAS, and this application is interested to receive a `memberOf` attribute with the following values: 

- `Admins`
- `Users`
- `Guests`
- `System`
- `A`
- `B`
- `C`

How do we do this?

# Solution

Apereo CAS allows one to release attributes to an application using specific *attribute release policies*. These policies can be built via embedded Apache Groovy scripts and fragments and can take advantage of Groovy's scripting capabilities. Our SAML2 service provider is registered with CAS using a JSON policy file with an attribute release policy that ultimately would look similar to the following file:
{% include googlead1.html  %}
```json
{
  "@class" : "org.apereo.cas.support.saml.services.SamlRegisteredService",
  "serviceId" : "<saml2-service-provider-entity-id>",
  "name" : "Sample",
  "id" : 1,
  "metadataLocation" : "/path/to/service-provider/metadata.xml",
  "attributeReleasePolicy" : {
    "@class" : "org.apereo.cas.services.ReturnMappedAttributeReleasePolicy",
    "allowedAttributes" : {
      "@class" : "java.util.TreeMap",
      "memberOf" : "groovy { ...Groovy script would go here... }"
    }
  }
}
```

The main element to note here is the use of `ReturnMappedAttributeReleasePolicy` which allows one to virtually re-map attributes. Our policy above is tasked to produce a `memberOf` attribute whose values are determined based on the result and outcome of an embedded Groovy script, yet to be defined.
{% include googlead1.html  %}
<div class="alert alert-info">
  <strong>Note</strong><br/>The Groovy script is tasked to operate on certain attributes as a baseline. This means, original attributes such as <code>memberOf</code>, <code>extensionAttribute1</code>, etc must already be available and fetched from the attribute source before the script's execution.
</div>


Let's define the script:

```groovy
def results = attributes['memberOf'].collect({ value ->
    println "memberOf attribute: $value"
    def matcher = (value =~ ~/(CN=)(.*?)(?<!\\),.*/)
    if (matcher.find()) {
      def match = matcher.group(2)
      println "Found a match: $match"
      return match
    }
    println "No match found for memberOf. Returning $value"
    return value
})

def ext1 = attributes['extensionAttribute1']
println "Values for extensionAttribute1: $ext1"
if (ext1 != null) results.addAll(ext1)

def ext2 = attributes['extensionAttribute2']
println "Values for extensionAttribute2: $ext2"
if (ext2 != null) results.addAll(ext2)

def ext3 = attributes['extensionAttribute3']
println "Values for extensionAttribute3: $ext3"
if (ext3 != null) results.addAll(ext3)

println "memberOf values: $results"
return results
```
{% include googlead1.html  %}
A few key points to review:

- The script receives a special `attributes` variable; this is a key-value `Map` that contains all available attributes that are already and before this step, resolved and fetched by CAS. In the script, `attributes['memberOf']` return a list of all existing values for the `memberOf` attribute.
- We loop through the list of available values, and compare each value with the pattern `(CN=)(.*?)(?<!\\),.*`. If we find a match, we extract the second group of the match (which would be the actual `CN` value) and return that as a candidate value. All such candidates are ultimately recorded in the `results`.
- Finally, we check for the existence of attributes `extensionAttribute1`, `extensionAttribute2`, and `extensionAttribute3`. If they are available, we add their values to the `results`.
- For troubleshooting and visibility purposes, we log the final results and finally return them to CAS. At this point, CAS would be taking our result list and will record its values under the mapped `memberOf` attribute. 

Putting it all together, it can be somewhat tricky to correctly format and place the script inside the JSON file. Fortunately, the JSON syntax supported by CAS has supported multiline strings for many years. This means we can do something like this:
{% include googlead1.html  %}
```java
{
  "@class" : "org.apereo.cas.support.saml.services.SamlRegisteredService",
  "serviceId" : "<saml2-service-provider-entity-id>",
  "name" : "Sample",
  "id" : 1,
  "metadataLocation" : "/path/to/service-provider/metadata.xml",
  "attributeReleasePolicy" : {
    "@class" : "org.apereo.cas.services.ReturnMappedAttributeReleasePolicy",
    "allowedAttributes" : {
      "@class" : "java.util.TreeMap",
      "memberOf" : 
        '''
        groovy {
          // Groovy script goes here...
        }  
        '''
    }
  }
}
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html