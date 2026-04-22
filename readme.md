
# Dev Info R&D Site

## Instructions for Myself

### Install Ruby

#### Windows

Install Ruby with [Ruby Installer](https://rubyinstaller.org/).

#### Other Platforms

todo

## Install

> Install necessary dependencies for running commands.

```bash
bundle install
```

```powershell
bundle install
```

## Serve

> Serves the site locally, not including future-dated posts.

*Note, the `--config _config.yml,_config.dev.yml` option uses the development `_config.dev.yml`, which overrides corresponding fields of the default `_config.yml`.*

```bash
bundle exec jekyll serve --config _config.yml,_config.dev.yml
```

```powershell
bundle exec jekyll serve --config _config.yml,_config.dev.yml
```

## Serve Future

> Serves the site locally, including future-dated posts.

*Note, the `--config _config.yml,_config.dev.yml` option uses the development `_config.dev.yml`, which overrides corresponding fields of the default `_config.yml`.*

```bash
bundle exec jekyll serve --config _config.yml,_config.dev.yml --future
```

```powershell
bundle exec jekyll serve --config _config.yml,_config.dev.yml --future
```

## Build

> Builds the site into the '\_site' directory without serving it, not including future-dated posts.

*Note, the `--config _config.yml,_config.dev.yml` option uses the development `_config.dev.yml`, which overrides corresponding fields of the default `_config.yml`. Remove this if building to upload the built static site to a hosting platform.*

```bash
bundle exec jekyll build --config _config.yml,_config.dev.yml
```

```powershell
bundle exec jekyll build --config _config.yml,_config.dev.yml
```

## Build Future

> Builds the site into the '\_site' directory without serving it, including future-dated posts.

*Note, the `--config _config.yml,_config.dev.yml` option uses the development `_config.dev.yml`, which overrides corresponding fields of the default `_config.yml`. Remove this if building to upload the built static site to a hosting platform.*

```bash
bundle exec jekyll build --config _config.yml,_config.dev.yml --future
```

```powershell
bundle exec jekyll build --config _config.yml,_config.dev.yml --future
```

## Regenerate Tags

> Regenerates the posts-by-category pages to account for the current number of posts, not including future-dated posts.

```bash
bundle exec rake generate:tags
```

```powershell
bundle exec rake generate:tags
```

## Regenerate Tags Future

> Regenerates the posts-by-category pages to account for the current number of posts, including future-dated posts.

```bash
bundle exec rake generate:tags[true]
```

```powershell
bundle exec rake generate:tags[true]
```

## Runway

> Checks the number of days of puzzles remaining for each

```bash
bundle exec rake puzzle:dates
```

```powershell
bundle exec rake puzzle:dates
```
