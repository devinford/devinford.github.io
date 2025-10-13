
# Dev Info R&D Site

## Instructions for Myself

### Install Ruby

#### Windows

Install Ruby with [Ruby Installer](https://rubyinstaller.org/).

#### Other Platforms

todo

### Serve Locally

1. `bundle install` to install dependencies.
2. `bundle exec jekyll serve --config _config.yml,_config.dev.yml` to serve the site locally.
    - Use `bundle exec jekyll serve --config _config.yml,_config.dev.yml --future` to serve the site locally including future-dated posts.

*Note, the `--config _config.yml,_config.dev.yml` option uses the development `_config.dev.yml`, which overrides corresponding fields of the default `_config.yml`.*

### Build Site without Serving

1. `bundle install` to install dependencies.
2. `bundle exec jekyll build --config _config.yml,_config.dev.yml` to generate the site files in `_site`.
    - Use `bundle exec jekyll build --config _config.yml,_config.dev.yml --future` to generate the site files including future-dated posts.

*Note, the `--config _config.yml,_config.dev.yml` option uses the development `_config.dev.yml`, which overrides corresponding fields of the default `_config.yml`. Remove this if building to upload the built static site to a hosting platform.*

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

### Check Remaining Runway for Puzzles

The following rake task will check the remaining number of puzzles that have
yet to launch.

```bash
bundle exec rake puzzle:dates
```
