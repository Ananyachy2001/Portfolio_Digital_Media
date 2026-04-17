

function isValidHttpUrl(link) {
    let url;
    
    try {
        url = new URL(link);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}


function isFilePath(str) {
    // Check for Unix-like paths
    const unixPattern = /^(\/|~\/|\.\/)/
    
    // Check for Windows paths
    const windowsPattern = /^[a-zA-Z]:\\/
  
    // Check for typical file extensions
    const fileExtensionPattern = /\.[a-zA-Z0-9]+$/
  
    return unixPattern.test(str) || windowsPattern.test(str) || fileExtensionPattern.test(str)
}

function isFileOrLink(path){

    return isFilePath(path) || isValidHttpUrl(path)
}


function isEmoji(str) {
    const emojiPattern = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2702}-\u{27B0}\u{24C2}-\u{1F251}]/u;
    return emojiPattern.test(str);
}

// Returns a URL safe to use as an image/link src, or an empty string if the
// input uses a disallowed scheme (e.g. javascript:, data:, vbscript:).
// Accepts relative paths and http(s) URLs only.
function sanitizeUrl(url) {
    if (typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (trimmed === '') return '';
    // Allow relative paths (./, ../, /, or path/without-scheme)
    if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
        return trimmed;
    }
    // For absolute URLs, require http(s).
    try {
        const parsed = new URL(trimmed);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
            return trimmed;
        }
    } catch (_) {
        return '';
    }
    return '';
}
