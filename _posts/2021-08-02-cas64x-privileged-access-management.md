---
layout:     post
title:      Apereo CAS - Privileged Access Management (PAM)
summary:    An overview of various PAM features and options that can be relevant in Apereo CAS deployments.
tags:       [CAS]
---

<div class="alert alert-success"><i class="far fa-lightbulb"></i> This blog post was originally posted on the <a href="https://www.tirasa.net/en/blog/privileged-access-management-pam-with-apereo-cas">Tirasa Blog</a>.</div>

Privileged Access Management (PAM) typically describes systems that can manage elevated permissions on a special set of accounts. Such *supercharged* accounts can access critical or sensitive parts of applications, device interfaces or invoke special operations that require heightened privileges. A good example of a designated account might be the *root* user in Linux systems or the corporate account owner that is tasked to manage operations via a cloud-based platform such as Heroku. As such, PAM can be seen as one of the most important security aspects of a secure, scalable and auditable Identity and Access Management (IAM) deployment.

{% include googlead1.html  %}
## Policies and Privileges

A reasonable initial question might be *"Where do privileged accounts and policies come from?"*. Well, this requires a lot of hard meticulous work, and certainly not by storks, but by PAM administrators and IAM architects.
 
Summarily put, privilege may be defined as a special permission or advantage assigned to an account allowing it proper authorization to overrule, skip or activate security operations or access forbidden areas. Often, the assignment of the special permission is based on person attributes that represent a role, or it is inherited as part of membership in a group or passed down via delegations. Alternatively, a special permission can be defined more dynamically by relying on time of day, ever-changing work schedules or absence/presence of suspicious online activity. 

{% include googlead1.html  %}

An IAM architect or system administrator is tasked to define and store policies and authorization rules to distinguish such privileged accounts and conditions. This process would require various forms of review and certification. For example, a standard user might *apply* for special permission to access the payroll section of the company's HR system and after proper review, the user gains the status of *payroll reviewer* as part of the membership in the relevant group in the company's user vault or directory.

## PAMing with Apereo CAS

While not strictly a PAM solution, Apereo CAS as an identity provider and single sign-on manager offers several capabilities and features out of the box that primarily assist with the execution, enforcement and validation of a privileged account's authentication requests. 

{% include googlead1.html  %}

In this section, we will dive into a few relevant strategies and techniques with CAS that explore authorization and access strategy, multifactor authentication, and audits.

### Authorization and Access Strategy

A CAS operator can define special policies for authorization and access strategy for CAS-enabled applications. In its most basic form, we could imagine a scenario where entry access to the application at `https://app.example.org/payroll` can only be allowed if the requesting account, at the time of authentication, is a member of `admins` or `payroll` groups. This policy can be translated into CAS speech using the following JSON snippet: 

{% include googlead1.html  %}

```json
{
  "@class" : "o.a.c.s.RegexRegisteredService",
  "serviceId" : "https://app.example.org/payroll",
  "name" : "Payroll",
  "id" : 1,
  "accessStrategy" : {
    "@class" : "o.a.c.s.DefaultRegisteredServiceAccessStrategy",
    "requiredAttributes" : {
      "@class" : "java.util.HashMap",
      "membership" : [ "java.util.HashSet", [ "org:groups:admins", "org:groups:payroll" ] ]
    }
  }
}
```

So an elevated account is recognized and authorized access to the application if the account contains the attribute `membership` that contains one of indicated groups. 

{% include googlead1.html  %}

Another example focuses on more dynamic aspects of an authorization policy, where a standard account can obtain the correct permission for application access for a limited time window:

```json
{
  "@class" : "o.a.c.s.RegexRegisteredService",
  "serviceId" : "https://app.example.org/payroll",
  "name" : "Payroll",
  "id" : 1,
  "accessStrategy" : {
    "@class" : "o.a.c.s.TimeBasedRegisteredServiceAccessStrategy",
    "startingDateTime" : "2020-11-01",
    "endingDateTime" : "2020-11-30"
  }
}
```

### Authentication Policies 

Similar to access strategies, a CAS operator can define special policies for authentication such that accounts would only be permitted to access resources if their credentials can be found in pre-designated user directories. 

{% include googlead1.html  %}

A typical scenario would be that entry access to an application must require the user's credentials to validate against a special guest directory:

```json
{
  "@class" : "o.a.c.s.RegexRegisteredService",
  "serviceId" : "https://app.example.org/guest",
  "name" : "Guest",
  "id" : 1,
  "authenticationPolicy": {
    "@class": "o.a.c.s.DefaultRegisteredServiceAuthenticationPolicy",
    "requiredAuthenticationHandlers" : ["java.util.TreeSet", [ "GuestActiveDirectory" ]],
    "criteria": {
      "@class": "o.a.c.s.AllowedAuthenticationHandlersRegisteredServiceAuthenticationPolicyCriteria"
    }
  }
}
```

A similar authentication policy may refuse to allow authentication requests to participate and take advantage of single sign-on sessions, forcing the user to always present credentials at the time of authentication:

```json
{
  "@class" : "o.a.c.s.RegexRegisteredService",
  "serviceId" : "https://app.example.org/payroll",
  "name" : "Payroll",
  "id" : 1,
  "accessStrategy" : {
    "@class" : "o.a.c.s.DefaultRegisteredServiceAccessStrategy",
    "ssoEnabled": false
  }
}
```

### Multifactor Authentication

An important component of PAM frameworks and solutions is to design policies that would force user accounts into a multifactor authentication workflow. This not only provides elevated access to the account, but also assists with security compliance requirements for applications that require strong authentication and higher levels of assurance based on regulatory standards such as HIPAA or FISMA. 

{% include googlead1.html  %}

CAS supports many forms of triggering and enforcing multifactor authentication flows. One simple scenario would be to require the user audience of our payroll application to pass through [Google Authenticator](https://www.wikiwand.com/en/Google_Authenticator), but only if the user account qualifies for MFA using a special membership as is demonstrated using the following policy:

```json
{
  "@class" : "o.a.c.s.RegexRegisteredService",
  "serviceId" : "https://app.example.org/payroll",
  "name" : "Payroll",
  "id" : 1,
  "multifactorPolicy" : {
    "@class" : "o.a.c.s.DefaultRegisteredServiceMultifactorPolicy",
    "multifactorAuthenticationProviders" : [ "java.util.LinkedHashSet", [ "mfa-gauth" ] ],
    "principalAttributeNameTrigger" : "memberOf",
    "principalAttributeValueToMatch" : "org:groups:payroll-mfa"
  }
}
```

Of course the activation rule of the multifactor authentication workflow is rather static, as is defined in the JSON policy file. Triggering MFA may also be based on more dynamic factors such as *risk*. Such factors allow CAS to detect suspicious and seemingly-fraudulent authentication requests based on past user behavior and history to determine a risk factor and a threshold as the basis for triggering MFA. 

{% include googlead1.html  %}

For example, if the authentication history for a given user shows that an authentication attempt has never been made from Australia or during the weekend, CAS could decide to consider the attempt risky and would force the user to be prompted for elevated access via pre-designated MFA workflows.

### Audits

A major component of most if not all PAM solutions is the ability to audit access strategies and policies and get a clear sense of the activity trail. Activities should be recorded with sufficient detail and the PAM solution should provide facilities to query and manage the audit trail. A workable audit trail not only helps with monitoring system status, health and security but also helps to achieve compliance more comfortably.

{% include googlead1.html  %}

The CAS software surely can track and audit a wide range of activities, which are then collected and sent to the audit log for optional re-routing and storage. Activities might include application access, enforcement of multifactor authentication, session termination, password updates, and more. The audit log can be managed and stored using a variety of services such as relational or NoSQL databases, distributed caches, etc for later querying and analysis. Each audited event contains characteristics that indicate the *who, what, where, how, when* as shown below:

```bash
WHO: johnsmith
WHAT: TGT-9-qj2jZKQUmu1gQv...
ACTION: AUTHENTICATION_SUCCESS
APPLICATION: CAS
WHEN: Mon Aug 26 12:35:59 IST 2021
CLIENT IP ADDRESS: 172.16.5.181
SERVER IP ADDRESS: 192.168.200.22
```

# So...

PAM solutions are critical components of a healthy and functional IAM infrastructure, as they focuses on privileged accounts and those with elevated privileges in the organization. PAM and IAM need to work together to define and execute appropriate policies to protect against cyber attacks. 

[Misagh Moayyed](https://fawnoos.com)