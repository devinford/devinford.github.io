require 'fileutils'
require 'jekyll'
require 'yaml'

TagFilePath = '_data/tags.yaml'

namespace :generate do
  desc "Generate tag index pages"
  task :tags, [:future] do |t, args|
    args = args.with_defaults(future: 'false')

    tag_configurations = YAML.load_file(TagFilePath)

    config = {
      'future' => args[:future]
    }
    site_config = Jekyll.configuration(config)
    site = Jekyll::Site.new(site_config)
    site.reset
    site.read

    # @@@ Get Markdown-To-HTML Converter
    converter = site.find_converter_instance(Jekyll::Converters::Markdown)

    # @@@ Get Configured Articles Per Page
    articles_per_page = site.config['paginate']

    # @@ Aggregate front matter data
    tags = {}
    site.posts.docs.each do |post|
      # @@ Add to Tag Groups
      post.data['tags'].each do |tag|
        tags[tag] ||= []
        tags[tag] << post
      end
    end

    # @@ Delete Old Category Indexes
    categories_directory = 'category'
    if Dir.exist?(categories_directory)
      puts Dir.glob("#{categories_directory}/*")
      FileUtils.rm_rf(Dir.glob("#{categories_directory}/*"))
    else
      # Create the "categories" directory if it doesn't exist
      Dir.mkdir(categories_directory)
    end

    # @@ Write List of Categories
    File.open("category/index.markdown", 'w') do |file|
      file.puts <<-CONTENT
---
layout: base
title: "Posts by Category"
---

<h1>{{ page.title }}</h1>

CONTENT
      tag_configurations.each do |tag_configuration|
        file.puts "- [#{tag_configuration['name']}](#{tag_configuration['tag']})"
      end
    end

    # @@ Write new Category Indexes
    tag_configurations.each do |tag_configuration|
      all_posts = tags[tag_configuration['tag']] || []
      pages = (all_posts.count + articles_per_page - 1) / articles_per_page

      tag_subdirectory = tag_configuration['path_stub']
      pages.times do |i|
        file_path = nil

        if i == 0 then
          FileUtils.mkdir_p(tag_subdirectory)

          file_path = File.join(tag_subdirectory, 'index.markdown')
        else
          subdirectory = File.join(tag_subdirectory, (i + 1).to_s)
          FileUtils.mkdir_p(subdirectory)
          file_path = File.join(subdirectory, 'index.markdown')
        end

        File.open(file_path, 'w') do |file|
          file.puts <<-CONTENT
---
layout: paged_posts_by_tag
title: '"#{tag_configuration['name']}" Posts'
listed_tag: #{tag_configuration['tag']}
post_offset: #{i * articles_per_page}
post_count: #{articles_per_page}
paginator:
  page: #{i + 1}
  previous_page: #{(i > 0 ? i : nil)}
  previous_page_path: #{i == 1 ? "/#{tag_configuration['path_stub']}" : "/#{tag_configuration['path_stub']}/#{i}"}
  next_page: #{(i < pages - 1 ? i + 2 : nil)}
  next_page_path: #{"/#{tag_configuration['path_stub']}/#{i + 2}"}
---
CONTENT
        end
      end
    end
  end
end
