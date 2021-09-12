---
layout:     post
title:      Apereo CAS - Master of Puppeteer
summary:    Learn how to take advantage of Puppeteer to automate browser-based integration and/or functional tests.
tags:       [CAS]
---

Apereo CAS started to incorporate browser-based integration and functional tests, [starting with the `6.3.x` release](https://apereo.github.io/cas/6.3.x/release_notes/RC5.html#puppeteer-tests). In this effort, the project presents a set of functional/browser scenarios that are backed by the [Puppeteer framework](https://pptr.dev/). Such test scenarios are used to verify protocol compatibility, validate authentication flows, and ensure the correctness of other types of integration tests using a headless Chromium browser across various CAS releases. 

{% include googlead1.html  %}

In this blog post, we will take a quick look at how Puppeteer is used by CAS to design and automate browser-based integration and/or functional tests. Our starting position is as follows:

- CAS `6.4.x`
- Java `11`

# Overview

Automated browser testing is done via the [Puppeteer framework](https://pptr.dev/). Puppeteer is a Node library that provides a high-level API to control Chrome or Chromium over the DevTools Protocol and runs headless by default. The test scenarios that are designed are executed by the [CAS continuous integration system](https://github.com/apereo/cas/actions) and will be improved over time to account for advanced use cases such as ensuring protocol compatibility and other variations of the authentication webflow.

{% include googlead1.html  %}

Functional tests start by generating a plain CAS overlay as a baseline that can run under HTTPS using a pre-generated keystore. This CAS overlay is supplied with the test scenario configuration that explains the required modules, properties, bootstrapping techniques, etc to use when CAS is deployed inside an embedded Apache Tomcat container. Once running, the Puppeteer script is executed by Node for the given test scenario to verify specific functionality such as successful logins, generation of tickets, etc.

<div class="alert alert-info">
<strong>Note</strong><br/>The primary function of Puppeteer and browser-based tests is not to verify user interface functionality and appearance in different types of browsers. Rather, it is to ensure CAS features and integrations remain functional when interfacing with different protocols and applications from a client browser's point of view. The framework primarily supports a Headless Chromium browser but can be slightly tuned to also verify batches of tests against Firefox.</div>

{% include googlead1.html  %}

Once you clone the [CAS git repository](https://github.com/apereo/cas), the test scenarios may all be found at `ci/tests/puppeteer/scenarios`. Each folder represents a complete test scenario with the folder name acting the scenario name. As of this writing, there are `134` test scenarios available, and the collection of scenarios will continue to grow over time.

# Test Scenario

Each Puppeteer test scenario may contain the following configuration files:

### Test Script

`script.js` is the main test scenario that drives the execution of the Puppeteer test. This script is responsible to interact with the Puppeteer APIs to launch a Chromium-based browser and begin executing the test sequence, validating and verifying assertions and page elements along the way.

{% include googlead1.html  %}

As an example, here is a typical `script.js` file:

```javascript
const puppeteer = require('puppeteer');
const assert = require('assert');
const cas = require('../../cas.js');

(async () => {
    const browser = await puppeteer.launch(cas.browserOptions());
    const page = await cas.newPage(browser);
    await page.goto("https://localhost:8443/cas/login");

    await cas.loginWith(page, "casuser", "Mellon");

    await cas.assertTicketGrantingCookie(page);
    
    const header = await cas.innerText(page, '#content div h2');
    assert(header === "Log In Successful")

    await browser.close();
})();
```

The above scenario does handle the following sequence:

{% include googlead1.html  %}

- Launch a browser instance, and navigate to the CAS login screen.
- Login using `casuser` and `Mellon` as the username and password respectively.
- Assert the presence of CAS ticket-granting cookie to ensure the login attempt was a success.
- Check and compare the page header element's text against predefined values.
- Finally, close the browser instance.

### Test Configuration

Each test scenario may require a special configuration to bootstrap a tailored version of CAS with custom extensions, modules, and settings. The scenario configuration file is controlled via a ‍‍‍`script.json` file:

{% include googlead1.html  %}

```json
{
  "dependencies": "gauth",
  "properties": [
    "--cas.authn.mfa.gauth.json.location=file:${PWD}/ci/tests/puppeteer/scenarios/${SCENARIO}/accounts.json",
    "--cas.authn.mfa.gauth.core.multiple-device-registration-enabled=true"
  ]
}
```

The above configuration instructs the test execution runtime to include the `cas-server-support-gauth` module into the final CAS overlay and activates a few additional settings required for the test correctness. Note that variables such as `PWD` and `SCENARIO` as pointers to the working directory and scenario name are automatically handled and resolved by the execution script.

### Test Execution

Puppeteer test scenarios are executed using a dedicated `ci/tests/puppeteer/run.sh` script. To make test execution easier, the following bash function may prove useful to invoke the execution script with a small degree of automation:

{% include googlead1.html  %}

```bash
function pupcas() {
  scenario=$1
  rebuild=${2:-true}
  cd /path/to/cas-server
  # sudo codesign --force --deep --sign - \
  #  ./ci/tests/puppeteer/node_modules/puppeteer/.local-chromium/mac-*/chrome-mac/Chromium.app
  echo -e "Scenario: $scenario"
  echo -e "Rebuilding: ${rebuild}\n"
  export REBUILD="${rebuild}"
  ./ci/tests/puppeteer/run.sh ./ci/tests/puppeteer/scenarios/"${scenario}"
}
```

This allows you to invoke a test scenario as such:

```bash
pupcas generate-service-ticket
```

...or, if you'd rather not rebuild the CAS overlay used for test execution:

```bash
pupcas generate-service-ticket false
```

{% include googlead1.html  %}

Each test execution launches an embedded Apache Tomcat container that is listening for remote debugger requests on port `5000`.

# Why

Using Puppeteer as a browser automation tool and framework has several advantages:

- Puppeteer is a Node library that provides a high-level API to control Chrome or Chromium over the DevTools Protocol. Test scripts have access to the entire Node.js ecosystem to handle automation tasks, assertions, etc. 
- Puppeteer installation, maintenance, and APIs are fairly straightforward to use.
- Using Node.js and javascript as the test scripting language welcomes a wider range of user/contributor audiences to manage and maintain test scripts. There is **no server-side Java code** to learn and maintain, and all libraries and tooling should be easy or familiar to follow, especially to front-end developers and/or UI designers.
- The simplicity of setup and low maintenance effort allows CAS to run all test scenarios automatically using the [CAS continuous integration system](https://github.com/apereo/cas/actions) with very little effort.

{% include googlead1.html  %}

All relevant patches or pull requests that affect the CAS user interface or have an effect on an external client-facing representation of a component **should be tested and submitted** with a test scenario based on Puppeteer. This makes it much easier for the project maintainers to verify the correctness of the original claim, review and ascertain the state of the patch, and ensure regressions are prevented as future CAS releases are published.  

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html