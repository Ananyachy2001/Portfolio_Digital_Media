/** Plugins for markdown-it */

function centerImagesPlugin(md) {
    // Override the default image renderer
    const defaultRender = md.renderer.rules.image || function(tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options)
    }
  
    md.renderer.rules.image = function(tokens, idx, options, env, self) {
      const token = tokens[idx]
  
      // Get the original image HTML
      const imgHtml = defaultRender(tokens, idx, options, env, self)
  
      // Wrap the image in a div with a centering class or inline style
      return `<p align="center">${imgHtml}</p>`
    }
}


function externalLinksPlugin(md) {
    const defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options)
    }
  
    md.renderer.rules.link_open = function(tokens, idx, options, env, self) {
      const token = tokens[idx]

      // Add target="_blank" so external links open in a new tab.
      const targetIndex = token.attrIndex('target')
      if (targetIndex < 0) {
        token.attrPush(['target', '_blank'])
      } else {
        token.attrs[targetIndex][1] = '_blank'
      }

      // Add rel="noopener noreferrer" to prevent reverse tabnabbing and referrer leakage.
      const relIndex = token.attrIndex('rel')
      if (relIndex < 0) {
        token.attrPush(['rel', 'noopener noreferrer'])
      } else {
        token.attrs[relIndex][1] = 'noopener noreferrer'
      }

      return defaultRender(tokens, idx, options, env, self)
    }
}
