# Changelog

## 1.4

#### User Experience
* Full support for spanish. A complete french version will be launched in late august.
* Performance (Reduced amount of calls on connection testing and less nickname-traffic for students)
* Question-View: The view starts in format mode, the preview-button is moved to the markdown-bar.
* The number of current votes is displayed during voting, not the number of all session-members.
* Added Cookie-consent (a law requirement, Piwik is using a cookie, our App is not).
* All Splashscreens got a close-button in the upper right.´
* Removed function which are not usable on an iPad (Import and Fullscreen).
* Improve theme selection presentation / reduce amount of themes.

#### Bugfixes
* Messed up sessions after export (import fails)
* Joining bug: "All nicknames already taken"
* Fixed leaderboard bugs (with survey and ranged questions)
* Missing hooks from some views (leaderboard) were added.

This version is brought to you by:
Project management: Klaus Quibeldey-Cirkel
Lead programming: Tjark Wilhelm Hoeck, Christopher Fullarton, Daniel Gerhardt


## 1.3.1

#### Bugfixes
* Imports of old sessions might failed due to database changes. With v1.3.1, they can be imported again.
* The internet connection-test will only fire one XHR-Request to stress the internet link as less as possible.
* Improvements of the user appcache to reduce internet traffic.
* Fixes an error where survey-questions are always validated as wrong.

This version is brought to you by:
Project management: Klaus Quibeldey-Cirkel
Lead programming: Tjark Wilhelm Hoeck, Christopher Fullarton, Daniel Gerhardt, Tom Käsler


## 1.3

#### Features
* New Question formats:
   - Yes-No Single-Choice question
   - True-False Single-Choice question
   - Free text question (response is correct in accordance with the provided sample)
* Connection quality indicator
* Predefined nickname-lists (categories)

#### UX
* Media elements are shown within the app (they were openend in a new tab before)
* French and spanish translations were reviewed by (human) translators and are leaving the beta-stage
* There are a lot of new themes you can play around with.
* On creating or editing a new session, you are now guided by a breadcrump.

#### Bugfixes
* The reading-confirmation-splashscreen was improved, the delay (up to 8 seconds) shouldn't be seen again.
* More bugfixes. See the git log for further informations.

This version is brought to you by:
Project management: Klaus Quibeldey-Cirkel
Lead programming: Tjark Wilhelm Hoeck, Christopher Fullarton, Daniel Gerhardt, Tom Käsler


## 1.2.1

#### Features
* New question type: Ranged questions.
* Change hashtag-name on importing sessions with already taken hashtags

#### UX
* Style-tweaks for very small devices

#### Bugfixes
* Fix an session-error where the instructor wasn't able to start the quiz.

This version is brought to you by:
Project management: Klaus Quibeldey-Cirkel
Lead programming: Tjark Wilhelm Hoeck, Christopher Fullarton


## 1.2

#### Features
* Choosable designs
* Validation summary
* Finish polling if all students have send a response

#### UX
* new Footer
* new Header

#### Bugfixes
* A lot of bug fixes. See the git log for further informations.

This version is brought to you by:
Project management: Klaus Quibeldey-Cirkel
Lead programming: Tjark Wilhelm Hoeck, Christopher Fullarton


## 1.1.0

#### Features
* i18n
* Ban filter for nicknames

#### UX
* Get an instant preview for questions containing latex or markdown in the "edit question"-view.
* format times in german standards (01,23 s)
* Set the focus directly on input files while not using a mobile device
* Improve the responsive design of the" reading confirmation" progress-bar
* Fullscreen button and support for Edge / Firefox-browsers (we're working getting it on webkit, too)

#### Bugfixes
* Hide informations about right or wrong answers for students until the current turn is finished
* Fix behaviour of show more- / show less-button in the leaderboard
* Improve the JS-hint
* Resolve issues with the deletion of sessions and the redirect of the attendees
* Prevent empty answer options if there is text input for at least one

Furthermore, we improved the jshint-rules for a better code quality and refactored the project scaffolding for a better maintainability.

This version is brought to you by:
Project management: Klaus Quibeldey-Cirkel
Lead programming: Tjark Wilhelm Hoeck, Christopher Fullarton, Tom "tekay" Käsler, Daniel Gerhardt
Contributions: Nina Isensee, Curtis Adam, Tobias Brähler, Adrian Tim Guthmann, Yannick Lehnhausen


## 1.0.0
First version including the main features:

* Competition-based
* Realtime
* Gamification
* One landing page for both roles: quizmaster and candidate
* Privacy to the extreme: no data is stored on the server
* Simple and easy to use: no sign-in, no installation and no paying
* Markdown and LaTex support
* Responsive
* Support for multiple questions
* Session management in local storage

This version is brought to you by:
Project management: Klaus Quibeldey-Cirkel
Lead programming: Tjark Wilhelm Hoeck, Tom "tekay" Käsler, Daniel Gerhardt
Contributions: Christopher Fullarton, Daniel Henkel, Maurice Wallbott, Anton Schwarz, Kevin Weigand, Kevin Linne, Tim Strietzel, Michael Sann, Tobias Viehmann