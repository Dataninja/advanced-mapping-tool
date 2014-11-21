advanced-mapping-tool
=====================

Another advanced mapping tool by Dataninja, enhancement of the original Confiscati Bene choropleth: https://github.com/Dataninja/confiscatibene-choropleth.

# Installation
``` bash
git clone https://github.com/Dataninja/advanced-mapping-tool.git
cd advanced-mapping-tool/
cp dataninja-advanced-mapping-tool.conf.sample.js dataninja-advanced-mapping-tool.conf.js
cp dataninja-advanced-mapping-tool.custom.sample.css dataninja-advanced-mapping-tool.custom.css
cp index.sample.html index.html
```

# Setup
Edit the configuration file dataninja-advanced-mapping-tool.conf.js accordingly to your needs.

View the map browsing to index.html.

You can download the application to work offline zipping it: `zip -r map.zip . -x \*demo\* -x \*.git\*`.

# Development
``` bash
git clone https://github.com/Dataninja/advanced-mapping-tool.git
cd advanced-mapping-tool/
npm install
bower install
grunt
cp dataninja-advanced-mapping-tool.conf.sample.js dataninja-advanced-mapping-tool.conf.js
cp dataninja-advanced-mapping-tool.custom.sample.css dataninja-advanced-mapping-tool.custom.css
cp index.sample.html index.html
cp debug.sample.html debug.html
```

