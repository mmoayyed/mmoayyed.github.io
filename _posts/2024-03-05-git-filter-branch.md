---
layout:     post
title:      Git - Rewrite History & Branches
summary:    A quick tip on how to rewrite git history to update commits, authors and committer information.
tags: ["Miscellaneous", "Git"]
---

I recently ran into a task where I needed to rename author and committer information of a commit range in a git repository, but only if the author or comitter fields matched a certain value. This tutorial is a quick overview of how I managed to solve this.

{% include googlead1.html  %}

`git filter-branch` is a powerful and versatile tool in Git used to rewrite the history of a repository. It's primarily used for applying complex changes to the repository's history, such as renaming files or directories, removing sensitive data, or, as in my case, modifying authorship information.
{% include googlead1.html  %}
In summary, `git filter-branch` essentially goes through each commit in the specified range (e.g., all commits, commits on a specific branch, etc.) and applies a specified set of filters to rewrite that commit. This includes rewriting the commit message, modifying the author or committer information, filtering files, and more.

I knew the commit range that I wanted to examine and rewrite and then was able to put this command together:
{% include googlead1.html  %}
```bash
git filter-branch --env-filter '
if [ "$GIT_COMMITTER_NAME" = "spongebob" ]; then
    export GIT_COMMITTER_NAME="SpongeBob"
    export GIT_COMMITTER_EMAIL="spongebob@gmail.com"
fi
if [ "$GIT_AUTHOR_NAME" = "spongebob" ]; then
    export GIT_AUTHOR_NAME="SpongeBob"
    export GIT_AUTHOR_EMAIL="spongebob@gmail.com"
fi
' -f -- master 2a12a6cc..7ade6a
```
{% include googlead1.html  %}
This git filter-branch command is rewriting the history of the specified range of commits on the master branch. In particular, `-- master -- master 2a12a6cc..7ade6a`, it starts from commit `2a12a6cc` and ends at commit `7ade6a` on the master branch. 

{% include googlead1.html  %}
The `--env-filter` is used to modify the environment in which the commit will be performed since we want to rewrite the author/committer name/email/time environment variables. Note that `--` is used to separate the revision range and the options.

Remember that after running the above command, you need to force push the changes to update the remote repository and once you're sure the changes are as you expect, you can remove the backup created:

{% include googlead1.html  %}
```bash
git update-ref -d refs/original/refs/heads/master
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services. 

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)