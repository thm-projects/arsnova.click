# Contributing

arsnova.click needs you! If you are interested in helping, here is a short guide.

## Step-by-step summary

1. First, fork and clone our repository.
2. Create a topic branch.
3. Make your changes. Be sure to provide clean commits and to write [expressive commit messages][commit-message].
4. Check your style: after pushing to your branch, read the jshint-comments in the [build section][build-section].
5. Stay up to date with our repository: Rebase to the latest revision of our master branch using `git rebase`.
6. Push the changes to your topic branch.
7. Finally, [submit a merge request][merge-request].

If you don't feel like writing code, you could also update the documentation. And if you find any bugs, feel free to [open a new issue][new-issue].

[build-section]: https://git.thm.de/arsnova/arsnova.click/builds
[commit-message]: http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html
[merge-request]: https://git.thm.de/arsnova/arsnova.click/merge_requests/new
[new-issue]: https://git.thm.de/arsnova/arsnova.click/issues/new?issue%5Bassignee_id%5D=&issue%5Bmilestone_id%5D=

## How we review merge requests

To get your merge request accepted faster, you should follow our review process before submitting your request. Here is our list of do's and dont's.

### No merge conflicts

This is a no-brainer. Keep your branches up to date so that merges will never end up conflicting. Always test-merge your branches before submitting your pull requests. Ideally, your branches are fast-forwardable, but this is not a requirement.

### Avoid trailing white-spaces

Committing trailing white-spaces makes your merge request look sloppy. Most editors have a setting that remove trailing white-spaces, which you should activate. You can use `git diff` to review changes since it highlights erroneous white-spaces.

![Erroneuous white-spaces are highlighted](src/main/webapp/resources/images/documentation/trailing_whitespaces.png "Output of `git diff`")

In addition, do not accidentally remove white-spaces of unrelated lines.

### Avoid changing unrelated lines

Use `git add -p` to selectively add changes. Skip those that have nothing to do with the commit you are preparing. Every commit should precisely contain only those changes that are important for the feature you are developing or the bug you are fixing.

![Unrelated lines are changed](src/main/webapp/resources/images/documentation/unwanted_changes.png "Output of `git diff`")

In the screenshot above, the license header was accidentally changed, presumably by some editor misconfiguration. Reviewing your changes before committing allows you to spot such mistakes.

### Review list of changed files

Is every file present that has seen some changes? Are there any files that appear in the list even if they were not changed? As mentioned previously, only necessary changes should appear in a commit. Review your changes using `git diff --stat`.

![List of files that have been changed](src/main/webapp/resources/images/documentation/affected_files.png "Output of `git diff --summary`")

Addtionally, watch out for mode changes using `git diff --summary`. A file's mode should not be changed without a reason. As a default, all files should have mode `644`:

![Mode of four files has been changed](src/main/webapp/resources/images/documentation/mode_changes.png "Output of `git diff --summary`")

### Use UTF-8

Sadly, some editors still do not have UTF-8 as their default setting. Using the wrong encoding will destroy non-ASCII characters like french quotation marks or umlauts.

### Summary

It all comes down to

* reviewing your own changes,
* keeping your commits clean and focused,
* and always staying up to date.

If you keep these things in mind, your pull requests will be accepted much faster. Happy coding!
