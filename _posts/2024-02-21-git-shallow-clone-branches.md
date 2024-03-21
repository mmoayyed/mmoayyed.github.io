---
layout:     post
title:      Git - Shallow Clones & Branches
summary:    A quick tip on how to fetch remote branches of a git repository after it has been shallow-cloned.
tags: ["Miscellaneous", "Git"]
---

A shallow clone in Git is a way to clone a repository with only a limited history. When you perform a standard clone of a Git repository, you typically get the entire history of that repository, including all commits, branches, and tags. With a shallow clone, you specify a `depth` parameter that limits the number of commits fetched from the remote repository. This can significantly reduce the amount of time and disk space required for cloning large repositories.

An example would be:
{% include googlead1.html  %}
```bash
git clone --depth 1 git@github.com:apereo/cas.git
```

After a shallow clone, a common use case might be to try to switch to other possible branches of the repository. However, git does not show any of the remote branches afterwards:
{% include googlead1.html  %}
```bash
cd cas
git branch -a
* master
  remotes/origin/HEAD -> origin/master
  remotes/origin/master
```

Not cool, right? 

To get around this and after doing a shallow clone, you will need to do:
{% include googlead1.html  %}
```bash
git remote set-branches origin '*'
```

...and then:
{% include googlead1.html  %}
```bash
git fetch --depth=1
```

`set-branches` is used to specify which branches of a remote repository you want to track locally. Once you've set the branches to track with `git remote set-branches`, you can fetch updates for those branches from the remote repository using `git fetch <remote>`. Git will then download any new commits from the specified branches and update your local references accordingly.


# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services. 

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. 

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)