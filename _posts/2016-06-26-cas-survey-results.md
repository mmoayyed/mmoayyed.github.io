---
layout:     post
title:      CAS Survey Results
summary:    ...in which I present a summarized view of the latest CAS community survey and discuss results.

---

A [while ago](https://groups.google.com/a/apereo.org/forum/#!searchin/cas-user/survey/cas-user/vQr3eBdHNg8/eKm9gkpxIwAJ) the CAS project management committee prepared a [survey](http://goo.gl/forms/rF9EeCN6GH) to help plan the future roadmapof the project. The primary objectives of the survey were to gain a better understanding of the current configuration pain points from a deployer point of view and learn what additional features and enhancements should have to be prioritized for development.

In this point, I intend to provide a summarized view of the survey results and discuss what has or will be done to address the feedback.

CAS Version
-----------

The table below shows what percentage of the community is using a given CAS server version.

| CAS Version  | Adoption |
| ------------- | ------------- |
| 3.x  | 53% |
| 4.0.x  | 22%  |
| 4.1.x  | 14%  |
| 4.2.x  | 4%  |
| Other  | 7%  |

It's important to note that CAS `3.x` has been EOLed for almost 2 years. What this means is that CAS `3.x` will no longer be maintained, fixed or (in case of security vulnerabilities) patched by the development team. Therefor, it is strongly recommended that those deployments switch and upgrade to a more recent and stable version of the platform, which at the time of this writing is CAS `4.2.x`. 