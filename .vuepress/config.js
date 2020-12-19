const AddonsAutomation = require('./addons-automation.js')
const AddonsBindings = require('./addons-bindings.js')
const AddonsIntegrations = require('./addons-integrations.js')
const AddonsPersistence = require('./addons-persistence.js')
const AddonsTransformations = require('./addons-transformations.js')
const AddonsVoice = require('./addons-voice.js')

const fs = require ('fs-extra')
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const HighlightDsl = require('./highlight-dsl')
const HighlightRules = require('./highlight-rules')

const DocsSidebarNavigation = require('./openhab-docs/.vuepress/docs-sidebar.js')

const base = process.env.OH_DOCS_VERSION ? `/v${process.env.OH_DOCS_VERSION}/` : '/'

const noAddons = process.env.OH_NOADDONS

module.exports = {
  title: 'openHAB',
  description: 'openHAB - a vendor and technology agnostic open source automation software for your home',
  dest: 'vuepress',
  host: 'localhost',
  base,
  ga: 'UA-47717934-1',
  plugins: ['tabs', 'container'],
  patterns: (noAddons) ? ['**/*.md', '**/*.vue', '!addons/**'] : ['**/*.md', '**/*.vue'],
  head: [
    // ['link', { rel: 'stylesheet', href: `/fonts/fonts.css` }],
    ['link', { rel: 'icon', href: `/favicon.ico` }],
    ['link', { rel: 'shortcut icon', href: `/favicon.ico` }],
    ['link', { rel: 'apple-touch-icon', href: `/apple-icon.png` }],
    // ['link', { rel: 'stylesheet', href: `https://fonts.googleapis.com/css?family=Open+Sans:300,400` }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:image', content: 'https://www.openhab.org/og-image.png' }],
    // ['meta', { property: 'og:title', content: 'openHAB' }],
    // ['meta', { property: 'og:description', content: 'a vendor and technology agnostic open source automation software for your home' }],
    // ['script', { src: `https://identity.netlify.com/v1/netlify-identity-widget.js` }]
  ],
  shouldPreload: (file, type) => {
    // type is inferred based on the file extension.
    // https://fetch.spec.whatwg.org/#concept-request-destination
    if (type === 'script' || type === 'style') {
      return true
    }
    if (type === 'font') {
      // only preload woff2 fonts
      return /\.woff2$/.test(file)
    }
    if (type === 'image') {
      // only preload important images
      return file === 'hero.jpg'
    }
  },
  extendMarkdown(md) {
    md.options.linkify = true
    const highlight = md.options.highlight
    md.options.highlight = (str, lang) => {
      if (!Prism.languages.dsl || !Prism.languages.rules) {
        Prism.languages.dsl = HighlightDsl
        Prism.languages.rules = HighlightRules
      }

      if (['nginx', 'bash', 'python', 'js', 'javascript', 'groovy'].indexOf(lang) >= 0) return highlight(str, lang)

      /* Simple heuristics to detect rules & other openHAB DSL code snippets and override the language */
      if (str.match(/\b(?:Color|Contact|Dimmer|Group|Number|Player|Rollershutter|Switch|Location|Frame|Default|Text|Group|Selection|Setpoint|Slider|Colorpicker|Chart|Webview|Mapview|Image|Video|Item|Thing|Bridge|Time|Type|Sitemap|sitemap)\b/)) {
        if (!str.match(/\b(?:private|public|protected|class|implements|extends|thing-type|thing-description|channel-type)\b/)) {
          lang = 'dsl'
        }
      }
      if (str.match(/\b(?:String|DateTime)\b/) && lang !== 'java' && lang !== 'xml') {
        lang = 'dsl'
      }
      if ((str.match(/\brule\b/) && str.match(/\bwhen\b/) && str.match(/\bthen\b/) && str.match(/\bend\b/)) ||
        str.match(/received update/) || str.match(/changed.*(?:from|to)/) || str.match(/Channel.*triggered/) ||
        str.match(/\bval\b/) || str.match(/\bvar\b/) /* <-- dangerous! */) {

        lang = 'rules'
      }
      if (lang === 'shell' || lang === 'sh' || lang === 'shell_session') lang = 'bash'
      if (lang === 'conf') lang = 'dsl'
      if (lang === 'JSON') lang = 'json'
      if (lang === 'xtend' || lang === 'text' || !lang) {
        lang = ''
        // console.log('Cannot determine language of code: ' + lang)
        // console.log(str)
      }

      return highlight(str, lang)
    }
  },
  configureWebpack: (config, isServer) => {
    config.plugins.push(new CopyWebpackPlugin([
      { from: '.vuepress/_redirects', to: '.'},
      { from: '.vuepress/_headers', to: '.'},
    ]))
  },
  serviceWorker: false,
  themeConfig: {
    logo: `/openhab-logo.png`,
    // repo: 'openhab',
    editLinks: false,
    activeHeaderLinks: false,
    sidebarDepth: 0,
    docsDir: 'docs',
    algolia: {
      apiKey: 'af17a113c6a11af8057592a3120ffd3b',
      indexName: 'openhab',
      algoliaOptions: {
        facetFilters: null
      }
    },
    nav: [
      {
        text: 'Download',
        link: '/download/',
      },
      {
        text: 'Documentation',
        link: '/docs/',
      },
      {
        text: 'Add-ons',
        link: '/addons/'
      },
      {
        text: 'Community',
        link: '/community/',
      },
      {
        text: 'Blog',
        link: '/blog/'
      },
      {
        text: 'About',
        items: [
          {
            text: 'Get Involved',
            items: [
              {
                text: 'Who We Are',
                link: '/about/who-we-are',
              },
              {
                text: 'Contribute',
                link: '/about/contributing'
              },
              {
                text: 'Events',
                link: '/about/events'
              },
            ]
          },
          {
            text: 'Support openHAB',
            items: [
              {
                text: 'Foundation',
                link: 'https://openhabfoundation.org/'
              },
              {
                text: 'Donate',
                link: '/about/donate'
              }
            ]
          },
          {
            text: 'Resources',
            items: [
              {
                text: 'Showcase/How-tos',
                link: '/about/showcase'
              },
              {
                text: 'Privacy Policy',
                link: '/privacy'
              },
              {
                text: 'myopenHAB',
                link: 'https://www.myopenhab.org/'
              },
              // {
              //   text: 'Press',
              //   link: '/about/press'
              // },
              // {
              //   text: 'Academia',
              //   link: '/about/education'
              // },
              // {
              //   text: 'Logos',
              //   link: '/about/logos'
              // }
            ]
          }
        ]
      },
      {
        text: 'GitHub',
        link: 'https://github.com/openhab',
      }
    ],
    sidebar: {
      '/docs/': DocsSidebarNavigation,
      '/addons/': (noAddons) ? [] : [
        {
          title: 'Bindings',
          collapsible: false,
          children: AddonsBindings.sort((a,b) => a[1].localeCompare(b[1]))
        },
        {
          title: 'System Integrations',
          collapsible: false,
          children: AddonsIntegrations.sort((a,b) => a[1].localeCompare(b[1]))
        },
        {
          title: 'Automation',
          collapsible: false,
          children: AddonsAutomation.sort((a,b) => a[1].localeCompare(b[1]))
        },
        {
          title: 'Data Persistence',
          collapsible: false,
          children: AddonsPersistence.sort((a,b) => a[1].localeCompare(b[1]))
        },
        {
          title: 'Data Transformation',
          collapsible: false,
          children: AddonsTransformations.sort((a,b) => a[1].localeCompare(b[1]))
        },
        {
          title: 'Voice',
          collapsible: false,
          children: AddonsVoice.sort((a,b) => a[1].localeCompare(b[1]))
        }
      ]
    }
  }
}
