---
layout: default
---

<script>
  const illegal_punctuation_regex = /["'\.,?!]/g;
  const stop_words = ['a', 'an', 'and', 'the', 'in', 'is', 'it', 'you', 'that', 'or', ''];
  const minimum_word_length = 2;

  function find_matching_articles(search_text, articles) {
    var search_words = search_text.toLowerCase().replace(illegal_punctuation_regex, ' ').split(' ').filter(word => !stop_words.includes(word) && word.length >= minimum_word_length);

    // If there are no search words left, return no results.
    if (search_words.length === 0) {
      return;
    }

    // Find articles that match every keyword.
    let matching_articles = [];
    for (var i = 0; i < articles.length; ++i) {
      var article_keywords = articles[i].keywords;
      if (search_words.every(word => article_keywords.some(keyword => keyword.includes(word)))) {
        matching_articles.push(articles[i]);
      }
    }

    return matching_articles;
  }

  window.onload = function() {
    fetch('/articles.json?v={{ site.time | date: '%s' }}')
      .then(response => response.json())
      .then(articles => {
        var urlParams = new URLSearchParams(window.location.search);
        var q = urlParams.get('q');
        if (q) {
          let matching_articles = find_matching_articles(q, articles);

          // Set search header
          var search_header = document.getElementById('search-header');
          search_header.innerHTML = `Search Results for '${q}'`;

          // Set search results
          var search_results = document.getElementById('search-results');
          if(matching_articles.length == 0) {
            search_results.innerHTML = 'No results found';
          } else {
            for (var i = 0; i < matching_articles.length; ++i) {
              search_results.innerHTML += `<div class="option-item"><a href="${matching_articles[i].page}"><img class="option-item-icon" src="${matching_articles[i].icon}" alt="${matching_articles[i].title}" /><div class="option-item-name">${matching_articles[i].title}</div></a></div>`;
            }
          }
        }
      });
  };
</script>

<h1 id="search-header">Search Results</h1>
<div id="search-results" class="option-picker"></div>
