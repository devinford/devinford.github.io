---
layout: post
---

{% capture nav %}
  {% include series-nav.html tag=page.series name=page.series_name %}
{% endcapture %}

{% if page.series %}
  {{ nav }}
{% endif %}

{{ content | replace: "<!--nav-->", nav }}

{% if page.series %}
  {{ nav }}
{% endif %}
