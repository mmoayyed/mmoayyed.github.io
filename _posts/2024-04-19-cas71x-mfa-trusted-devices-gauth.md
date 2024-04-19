---
layout:     post
title:      Apereo CAS - Trusted Multifactor Authentication Devices
summary:    Learn how to turn on multifactor authentication with CAS using Google Authenticator and explore options that allow CAS to trust and track authentication devices, browsers and more.
tags:       ["CAS 7.1.x", "Google Authenticator", "MFA"]
---

To stay ahead of the curve to safeguard sensitive data and prevent unauthorized access, identity providers such as Apereo CAS offer a vital measure such as multi-factor authentication (MFA), which adds an extra layer of security by requiring users to provide multiple forms of verification before granting access. Within the context of Apereo CAS deployments, enabling support for trusted devices amplifies this security posture significantly.
{% include googlead1.html  %}

Trusted devices are those that have been verified and approved by the user and can bypass multifactor authentication flows. In other words and in addition to triggers that are provided by the MFA functionality of CAS, there may be cases where you wish to let the user decide if the current browser/device should be trusted so as to skip subsequent MFA requests. The objective is for CAS to remember that decision for a configurable period of time and not bother the user with MFA until the decision is either forcefully revoked or considered expired.
{% include googlead1.html  %}
This blog post delves into the significance of trusted devices in MFA within the CAS framework, and how one might configure trusted devices for an MFA integration with Google Authenticator.

{% include googlead1.html  %}
Our starting position is based on:

- CAS `7.1.x`
- Java `21`

## Configuration

Once your CAS deployment is enabled for [MFA with Google Authenticator](https://apereo.github.io/cas/development/mfa/GoogleAuthenticator-Authentication.html), we need to figure out how to store user-trusted devices that are tracked and remembered by CAS. For this exercise, let's use a [PostgreSQL database](https://apereo.github.io/cas/development/mfa/Multifactor-TrustedDevice-Authentication-Storage-JDBC.html) with the following configuration:
{% include googlead1.html  %}
```properties
cas.authn.mfa.trusted.jpa.user=...
cas.authn.mfa.trusted.jpa.password=...
cas.authn.mfa.trusted.jpa.driver-class=org.postgresql.Driver
cas.authn.mfa.trusted.jpa.url=jdbc:postgresql://localhost:5432/mfa
cas.authn.mfa.trusted.jpa.dialect=org.hibernate.dialect.PostgreSQLDialect
```

<div class="alert alert-info">
<strong>Database Drivers</strong><br/>You do not need to include or configure special database drivers for the database configuration. They are provided for you automatically.</div>

The last thing we need to do is to teach CAS that multifactor authentication flows that are managed by Google Authenticator should also tap into and integrate with trusted devices:
{% include googlead1.html  %}
```properties
cas.authn.mfa.gauth.core.trusted-device-enabled=true
```

## Device Registration

By default, CAS is configured to ask for device registration consent. If device registration is turned off, CAS will execute the registration flow automatically:
{% include googlead1.html  %}
```properties
cas.authn.mfa.trusted.core.device-registration-enabled=true
```

...and when device registration is enabled, the following setting indicates whether a device name should be automatically selected and assigned by CAS or if the user should be given the option to select their own device name:
{% include googlead1.html  %}
```properties
cas.authn.mfa.trusted.core.auto-assign-device-name=true
```

The process for automatic assignment of device names will use a combination of the client IP address and the current date/time. This behavior can be controlled and redefined via the following bean:
{% include googlead1.html  %}
```java
@Bean
public MultifactorAuthenticationTrustedDeviceNamingStrategy mfaTrustDeviceNamingStrategy() {
    return ...
}
```

## Device Fingerprints

In order to distinguish trusted devices from each other we need to calculate a device fingerprint that uniquely identifies individual devices. Calculation of this device fingerprint can utilize a combination of multiple components from the request that might take into account client IP address, browser user agent, etc. Such fingerprinting strategies can be turned on and combined to work together at the same time.
{% include googlead1.html  %}
Trusting a device during an MFA workflow would mean that the ultimate decision controlled by the device fingerprint is remembered for that *user* of that *location* of that *device*. These keys are combined together securely and assigned to the final decision.

### Client IP

The device fingerprint component is extracted and based on the client's IP address:
{% include googlead1.html  %}
```properties
cas.authn.mfa.trusted.device-fingerprint.client-ip.enabled=true
```

### User Agent

The device fingerprint component is extracted and based on the request's `User-Agent` header:
{% include googlead1.html  %}
```properties
cas.authn.mfa.trusted.device-fingerprint.user-agent.enabled=true
```

### GeoLocation

This option works best if you have configured a GeoLocation service like [MaxMind](https://apereo.github.io/cas/development/authentication/GeoTracking-Authentication-Maxmind.html). When enabled, the user's location is determined using the GeoLocation service and used as a component in the final device fingerprint. 
{% include googlead1.html  %}
```properties
cas.authn.mfa.trusted.device-fingerprint.geolocation.enabled=true
```

### Browser Fingerprint

This option allows CAS to use the browser fingerprint as part of its device fingerprinting strategy. The browser fingerprint is calculated and passed back to CAS using the following snippet:
{% include googlead1.html  %}
```javascript
let client = new ClientJS();
let fingerprint = client.getFingerprint();
```

ClientJS is a JavaScript library that makes digital fingerprinting easy, while also exposing all the browser data-points used in generating fingerprints. The calculated browser fingerprint can then be used for formulating trusted device identifiers:
{% include googlead1.html  %}
```properties
cas.authn.mfa.trusted.device-fingerprint.browser.enabled=true
```

### Cookies

This strategy relies on the presence of a CAS-generated cookie to determine if the device is tagged as a trusted device.
{% include googlead1.html  %}
```properties
cas.authn.mfa.trusted.device-fingerprint.cookie.enabled=true
```

### Custom

As always, you can make up and control your own fingerprint extraction strategy by customizing CAS using the following bean:
{% include googlead1.html  %}
```java
@Bean
public DeviceFingerprintExtractor myFingerprintExtractor() {
    return ...
}
```

# Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)