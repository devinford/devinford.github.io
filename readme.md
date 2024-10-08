
# Dev Info R&D Site

## Instructions for Myself

### Install Ruby

#### Windows

Install Ruby with [Ruby Installer](https://rubyinstaller.org/).

#### Other Platforms

todo

### Serve Locally

1. `bundle install` to install dependencies.
2. `bundle exec jekyll serve` to serve the site locally.
    - Use `bundle exec jekyll serve --future` to serve the site locally including future-dated posts.

### Build Site without Serving

1. `bundle install` to install dependencies.
2. `bundle exec jekyll build` to generate the site files in `_site`.
    - Use `bundle exec jekyll build --future` to generate the site files including future-dated posts.

### Regenerate Indexes

When a new article is added, the category indexes may need to be recreated. The
category indexes can be regenerated automatically by running the following
script:

```bash
bundle exec rake generate:tags
```

In order to generate tag indexes including "future" articles-- articles to be
released after the date that the script is run, instead run:

```bash
bundle exec rake generate:tags[true]
```
