## [unreleased]

### 🚀 Features

- *(docs)* Update README.md
- *(test)* Add tests for hooked route
- *(internal)* Hooked example
- Added backward compatible support to provide several queries in one call
- Added reset support for content query options
- *(test)* Implement github actions tests (#13)
- *(test)* Implemented feed content test suites
- *(test)* Add xml fast parser for vitest
- *(test)* Docker test support
- *(test)* Enhance sripts in package json for test purposes
- *(test)* Set pages type to json for test purposes
- *(test)* Implemented test suites
- *(internal)* Provide content pages links for index page
- *(internal)* Added git cliff
- *(internal)* Allow publish via scripts
- Reimplement content
- Reimplement default handle

### 🐛 Bug Fixes

- *(test)* Change tpl branch ref
- *(test)* Switch action template to current branch
- *(internal)* Escape new json route from manual handling to allow content feed it
- *(internal)* Allow prerender to fail for playground since @nuxt/ui internal error

### ⚙️ Miscellaneous Tasks

- Release 2.0.0
- Update changelog
- *(internal)* Reorder playground modules
- Update changelog

## **Release** 1.0.1 - 2025-01-07

### 🚀 Features

- V1.0.1 release (after fix)
- V1.0.1 release
- Bundler resolution

### 🐛 Bug Fixes

- Incorrect type import for new bundler

### ⚙️ Miscellaneous Tasks

- *(docs)* Nuxi module add as way to install package
- Indicate compatibility with new v4 major
- Update to latest `@nuxt/module-builder`

## **Release** 1.0.0 - 2023-09-29

### 🐛 Bug Fixes

- Changelog version headings
- Incorrect link

### ⚙️ Miscellaneous Tasks

- *(release)* V1.0.0
- Updated dependencies

## **Release** 0.1.5 - 2023-08-26

### 🚀 Features

- Merge pull request #5 from helltraitor/fix/no-virtual-feedme

### 🐛 Bug Fixes

- Incorrect item usage
- Minor grammar for readme

### ⚙️ Miscellaneous Tasks

- *(release)* V0.1.5

## **Release** 0.1.5-dev - 2023-08-25

### 🚀 Features

- Removed feedme module declaration

### 🐛 Bug Fixes

- Removed types reference
- Feedme file no longer creates
- Virtual feedme module no longer used
- Virtual module feedme no longer used

## **Release** 0.1.4 - 2023-08-25

### ⚙️ Miscellaneous Tasks

- *(release)* V0.1.4

## **Release** 0.1.4-dev - 2023-08-25
### ❌ Breaking changes

#### ❌ 🐛 Bug Fixes

- Removed file-url package

    Previously playground and related projects (such as my blog) was unable to build without `file://` scheme, but since some changes occurred and package is unable to build now.
    
    In contrast to older state, where WSL, Windows, GitHub Pages (Linux) and Ubuntu successfully built, now Windows and WSL (only these were checked) are unable to build. So this patch fixes this behavior.


### 🐛 Bug Fixes

- Incorrect type name

## **Release** 0.1.3 - 2023-08-13

### 🚀 Features

- Extra example
- Package keywords

### 🐛 Bug Fixes

- Updated README.md links

### ⚙️ Miscellaneous Tasks

- *(release)* V0.1.3

## **Release** 0.1.2 - 2023-07-24

### 🚀 Features

- Package version now comes from json

### 🐛 Bug Fixes

- Invalid url on linux machine
- Changelogen temporary removed
- Removed unused imports

### ⚙️ Miscellaneous Tasks

- *(release)* V0.1.2

## **Release** 0.1.0 - 2023-07-22
### ❌ Breaking changes

#### ❌ 🚀 Features

- Removed match function as redundant

    Now all feeds must explicitly have content option
- Record replaced by arrray

    Record syntax replaced by array
- Updated hooks api

    Feed object is accusable only in after hooks - and that makes more sense
- Updated content options api

    Removed baseUrl since it can be set via tags or directly
- Updated content api

    Content api will be completely overridden

#### ❌ 🐛 Bug Fixes

- Removed root key

    Now full path must be provided in mapping
- Multiple call hook resolved

    Previously is required to return feed, but since now create method replaces feed in internal persistent and the returned value is ignored
- Rollup internal error

    Erased types with its templates that could degrade DX
- Disabled module default export

    Disabled module default export


### 🚀 Features

- Removed outdated test
- Mapping function note
- Added metadata for content records
- Replace old readme
- Mit license
- Hook using example for content
- Little documentation
- Template root
- Improved typing
- Improved tag replacement
- Added serialize-javascript module
- Updated handler according to new api
- Update create item functions
- Update imports
- Updated feed content handler
- Update createFeedFrom function
- ReplaceValueTags function
- Merge content options helper
- Simplified behavior condition
- Added basic content implementation
- Renamed persistent interface
- Moved feedme handler into separated function
- Handler functional moved into separated file
- Added content type declarations
- Make route string to be public
- Applied updates from main branch
- Added basic nitro plugin
- Added feedme content types declarations
- Added @nuxt/content to playground config
- Added @nuxt/content dependency
- Specialized hooks
- Added title for handle hook
- Added types references via prepare hooks
- Moved out nitropack module declaration
- Moved out feedme module declaration
- H3 as explicitly dependency
- Feed as explicitly dependency
- Handler moved into runtime directory
- Added basic feed generation
- Added feed generation
- Added nitropack hook
- Added feed
- Added nitropack
- Added extra meta for module
- Added basic module implementation
- Added feedme handler
- Added `#feedme` module declaration
- Added types shim
- Added eslint rules

### 🐛 Bug Fixes

- Eslint disabled for md fiels
- Removed unused import
- Passed undefined value leads to invalid date
- Unmapped date
- Replaced symbol
- Unresolved module in rollup
- Avoided warning on inlining external deps
- Case when string interpreted as object
- Removed empty line in doc
- Removed redundant comments
- Incorrect previous commit
- Redundant comments
- Redundant import
- More cases covered
- Wrong type was returned
- Incorrect selected field
- Incorrect iteration over index
- Item can have non string type
- Imports
- Removed interface
- Merged fields set once
- Moved baseUrl
- Introduced FeedmeContentTag
- Updated content usage on playground
- Plain type when implicit
- Removed dev log
- Removed redundant server plugin
- Removed redundant null passes
- Feedme options now required for processing
- Feedme can be undefined
- Updated names
- Feedme interfaces names
- Added empty export
- Nitropack shim become feedme
- Removed redundant type import
- Added 6 hours fallback when no time provided
- Added several valid variations
- Removed redundant plugin
- *(playground)* Replaced metadata
- Eslint fix applied
- Replaced old metadata

### ⚙️ Miscellaneous Tasks

- *(release)* V0.1.0
- Initial commit

