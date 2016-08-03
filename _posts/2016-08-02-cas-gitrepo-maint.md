---
layout:     post
title:      CAS Git Repository Maintenance
summary:    The CAS development team is starting with a bit of git repository housekeeping. Here is how and why.

---

If you have managed to clone the [CAS Github repository](https://github.com/apereo/cas) recently, you would notice that the repository is obscenely large; 1.2GB large that is. Depending on your connection bandwidth, the clone operation could take a very long time, specially time that could otherwise be spent wisely to catch Pokémon. Over the years, the CAS development has collected a lot of history in the git commit log. Given the [upcoming CAS 5 release](https://github.com/apereo/cas/milestones), we feel this is an oppurtune time to do a little bit of housekeeping to compress the repository and leave it in a functional efficient state. 

Here are the details. 

## What does this mean to adopters?

If you are a CAS deployer and have started your CAS deployment using a WAR overlay method, this will have **absolutely NO IMPACT** on your deployment and future upgrades. None whatsoever. Keep building, patching and upgrading. 

If you are a CAS deployer and have started your CAS deployment via building directly from source, you **MIGHT* be in trouble. Read on. 

## What does this mean to developers?
