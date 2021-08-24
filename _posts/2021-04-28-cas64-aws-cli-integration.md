---
layout:     post
title:      Apereo CAS - AWS CLI Integration
summary:    Learn how to access and manage AWS services using the AWS CLI, integrated with Apereo CAS for authentication and RBAC authorization.
tags:       [CAS]
---

The [AWS Command Line Interface (CLI)](https://aws.amazon.com/cli/) is a unified tool that allows one to access manage AWS services. Before access to such services can be granted, the CLI tool needs to authenticate itself and all subsequent API requests using dedicated credentials obtained from a trusted identity provider that is integrated with AWS' security token service. These temporary credentials consist of an access key ID, a secret access key, and a security token. Typically, clients in this space either attempt to configure AWS CLI to use [AWS Single Sign-On](https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html), or try to take advantage of the [SAML2 protocol](https://aws.amazon.com/premiumsupport/knowledge-center/aws-cli-call-store-saml-credentials/) via the likes of ECP, headless browsers, etc to replay a SAML2 response back to AWS to make `AssumeRole` API calls and store temporary user credentials.

{% include googlead1.html  %}

In this post, we will examine [integration strategies](https://apereo.github.io/cas/6.4.x/integration/AWS-Integration.html) between Apereo CAS and AWS CLI requests that aim to offer a simpler technique for obtaining AWS temporary credentials. This post specifically requires and focuses on:

- CAS `6.4.x`
- Java `11`
- [AWS Integration](https://apereo.github.io/cas/6.4.x/integration/AWS-Integration.html)

# Overview

Apereo CAS offers a [dedicated endpoint](https://apereo.github.io/cas/6.4.x/integration/AWS-Integration.html) that can support two different integration options for obtaining security credentials from AWS security token service. These options primarily take advantage of the AWS offered APIs that are, namely, `AssumeRole` and `GetSessionToken`. We should also note that the authenticated user that is trying to submit the API requests can qualify and initiate multifactor authentication using the available CAS [multifactor authentication triggers](https://apereo.github.io/cas/6.4.x/mfa/Configuring-Multifactor-Authentication-Triggers.html). This is also a new addition to the list of enhancements in this Apereo CAS release that allows [REST API requests](https://apereo.github.io/cas/6.4.x/protocol/REST-Protocol.html) to take advantage of multifactor authentication for qualifying users.

{% include googlead1.html  %}

## Session Tokens

Obtaining temporary security credentials from AWS STS is done using the `GetSessionToken` API operation. The primary occasion for calling this operation is when a user must be authenticated with multi-factor authentication (MFA).

Let's suppose that we would want to allow AWS security credentials for authenticated users that are part of a specific group, noted via the `groupMembership` attribute. We can set up the authorization logic using the following configuration:

```properties
cas.amazon-sts.principal-attribute-name=groupMembership
cas.amazon-sts.principal-attribute-value=^aws:.*
```

With the above setup, authenticated users that carry the `groupMembership` attribute with a value that matches the `^aws:.*` pattern should be allowed access to submit requests to AWS and obtain security credentials:

{% include googlead1.html  %}

```bash
curl -X POST -d username=casuser -d password=Mellon \
  https://cas.example.org/cas/actuator/awsSts
```

Additionally, let's suppose that our CAS server is configured to [multifactor authentication](https://apereo.github.io/cas/6.4.x/mfa/Configuring-Multifactor-Authentication.html) using [Duo Security](https://apereo.github.io/cas/6.4.x/mfa/DuoSecurity-Authentication.html). The API request can certainly carry a `passcode` credential obtained from the Duo Security's mobile app to pre-authenticate the user for multifactor authentication:

```bash
curl -X POST -d username=casuser -d password=Mellon -d passcode=325301 \
  https://cas.example.org/cas/actuator/awsSts
```

In this case, if the `passcode` is not specified then a push notification is automatically requested and activated by CAS.

## Roles

Another strategy to obtain temporary security credentials from AWS STS is done using the `AssumeRole` API operation. Typically, you use this API within your account or for cross-account access. Per AWS documentation,

{% include googlead1.html  %}

> To assume a role from a different account, your AWS account must be trusted by the role. The trust relationship is defined in the role's trust policy when the role is created. That trust policy states which accounts are allowed to delegate that access to users in the account. 

To activate this integration  mode, the following configuration setting must be enabled:

```properties
cas.amazon-sts.rbac-enabled=true
cas.amazon-sts.principal-attribute-name=awsroles
cas.amazon-sts.principal-attribute-value=arn.+
```

Everything else remains the same! The above configuration instructs CAS to look at the resolved attributes for the authenticated user and locate roles based on the `awsroles` attribute and look for a role value matching the `arn.+` pattern. The obtained role would then be passed onto the AWS SDK to complete the operation. Note that if multiple roles are found for the user, the request would be rejected and the response body would contain the resolved roles, expecting the client to re-submit the request with a selected role using the `roleArn` parameter.

{% include googlead1.html  %}

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html