function handler(event) {
  // Normalize URL
  var uri = event.request.uri;
  var uriSplits = uri.split('?', 1);
  var pathname = uriSplits[0]
  var pathnameSegments = pathname.split('/').map(p => p.trim()).filter(Boolean)
  var finalPath = pathnameSegments[pathnameSegments.length -1] || "";
  var finalPathSplits = finalPath.split('.').filter(Boolean);
  if (finalPathSplits.length <= 1)
    pathnameSegments.push("index.html");
  event.request.uri = "/" + pathnameSegments.join("/")
  return event.request;
}