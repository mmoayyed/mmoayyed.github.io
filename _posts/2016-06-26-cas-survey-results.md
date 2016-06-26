---
layout:     post
title:      CAS Survey Results
summary:    ...in which I present a summarized view of the latest CAS community survey and discuss results.

---

A [while ago](https://groups.google.com/a/apereo.org/forum/#!searchin/cas-user/survey/cas-user/vQr3eBdHNg8/eKm9gkpxIwAJ) the CAS project management committee prepared a [survey](http://goo.gl/forms/rF9EeCN6GH) to help plan the future roadmap of the project. The primary objectives of the survey were to gain a better understanding of the current configuration pain points from a deployer point of view and learn what additional features and enhancements should have to be prioritized for development.

In this post, I intend to provide a summarized view of the survey results and discuss what has or will be done to address the feedback.

## Results

There were about 200 responses to the survey from both individuals and institutions. Some responses were submitted by consulting firms who provide CAS commercial services for their clients which indicates the actual number of deployers may be larger than the reported 200. 

Participants of the survey indicated that on average, they have been running CAS for more than 10 years in a variety of industry sectors such as Government, Higher-Ed, Insurance, Finance, Travel and Health. More than 50% of the results indicated a CAS server deployment size of more than 10K users which is considered a rather large deployment of the platform.

The table below demonstrates what percentage of the community has chosen a given form of primary authentication:


| Method  | Adoption |
| ------------- | ------------- |
| LDAP/AD | 82% |
| RDBMS  | 8%  |
| Other  | 10%  |

The "Other" category being: NoSQL, X509, Rest, Social AuthN and many other forms of authentication supported by CAS.

### CAS Version

The table below shows what percentage of the community is using a given CAS server version.

| Version  | Adoption |
| ------------- | ------------- |
| 3.x  | 53% |
| 4.0.x  | 22%  |
| 4.1.x  | 14%  |
| 4.2.x  | 4%  |
| Other  | 7%  |

It's important to note that CAS 3.x has been EOLed for almost 2 years. What this means is that CAS 3.x will no longer be maintained, fixed or (in case of security vulnerabilities) patched by the development team. Therefor, it is strongly recommended that those deployments switch and upgrade to a more recent and stable version of the platform, which at the time of this writing is CAS 4.2.x. 

### Features

Survey participants were also asked to vote on a number of proposed features on a 1-5 scale with 5 being most desirable. The following table shows an aggregated view of the results for each given feature where the adoption percentage is a summary of 4 and 5 response types, indicating  development should strongly focus on the completion or improvement of the proposed item.

| Feature  | Vote |
| ------------- | ------------- |
| Admin UIs  | 60%  |
| SAML2  | 60%  |
| MFA  | 52% |
| Surrogate AuthN  | 43%  |
| Adaptive AuthN  | 42%  |
| Rest APIs  | 40%  |
| GUI Wizard  | 33%  |
| Front-Channel SLO  | 33%  |
| WS-Fed  | 31%  |
| OIDC  | 29%  |
| OAuth2  | 28%  |
| FIDO  | 16%  |
| Dynamic Registration  | 11%  |


### Additional Feedback

The following items were also reported by the community as areas that require improvement and clarification:

#### Better Documentation

The current CAS documentation assumes a high degree of familiarity with deployment tools such as Maven, Tomcat/Jetty, etc. The adopter also at times has to deal with multiple XML configuration files for enabling features such as LDAP authentication. This presents varying degrees of difficulty for a novice deployer to quickly get started with a CAS deployment. Step-by-step installation instructions, more samples and clarity in the documentation when it comes to dealing with specific CAS modules and features would be strongly desirable. A non-Maven deployment strategy could also be devised to relieve some of that pain when it comes to managing dependencies and CAS artifacts.

#### Easier Upgrades

The current CAS deployment strategy consists of constructing a Maven overlay in order to combine and merge local customizations with the original CAS distribution. This at times can morph into a complicated CAS upgrade process, specially if local customizations end up at odd conflicts with the new CAS distribution. Adopters are invariably forced to compare locally overlaid artifacts with their original version and fill in the gaps where necessary. Needless to say, this process for a novice deploy is than less obvious to understand and utilize.

#### Other Features

A number of other features were requested by participants that were not part of proposed scope. These included:

1. JWT authentication
2. Integrated Password Management
3. Tracking and Geo-profiling authentication requests.
4. Other registry types of managing CAS tickets and service definitions, such as YAML, Redis, etc.





















