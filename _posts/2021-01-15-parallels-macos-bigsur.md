---
layout:     post
title:      Parallels Desktop - Network Initialization Failure
summary:    A quick tip on how to fix the infamous 'Network initialization failed' error message when running Parallels Desktop on macOS Big Sur.
published: true
---

If you are running Parallels Desktop for Mac and you have upgraded to macOS Big Sur, you might see this error message after the upgrade when launching an existing virtual machine in Parallels Desktop:

> Network initialization failed. Your virtual machine will continue working normally but will no have no network connection

{% include image.html img="https://user-images.githubusercontent.com/1205228/105573123-99069d80-5d70-11eb-9b21-2b7d7d75ec44.png" 
width="80%" 
title="Network initialization failed. Your virtual machine will continue working normally but will no have no network connection" %}

I found several posts on various forums that prescribed different recipes. This is one recipe that works best for me, and perhaps it might do the trick for you as well:

- Find and edit the `network.desktop.xml` file:

```bash
sudo vim /Library/Preferences/Parallels/network.desktop.xml
```

- Locate the tag `<UseKextless>` in the file and set its value to `0`, so that it would look like `<UseKextless>0</UseKextless>`. If the tag does not exist, you may want to create it under the parent root tag `ParallelsNetworkConfig`. 

Save and exit the editor and try to launch Parallels again. Hopefully, the error should be gone!


[Misagh Moayyed](https://fawnoos.com)