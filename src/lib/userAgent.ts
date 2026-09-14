/** Turns a raw User-Agent string into a short, human label like "Chrome on macOS" — nobody wants to read the full UA string in a sessions list. */
export function friendlyUserAgent(ua: string): string {
  if (!ua) return 'Unknown device'

  let browser = 'Unknown browser'
  if (/Edg\//.test(ua)) browser = 'Edge'
  else if (/OPR\//.test(ua)) browser = 'Opera'
  else if (/Chrome\//.test(ua)) browser = 'Chrome'
  else if (/Firefox\//.test(ua)) browser = 'Firefox'
  else if (/Safari\//.test(ua) && /Version\//.test(ua)) browser = 'Safari'

  let os = 'Unknown OS'
  if (/Windows/.test(ua)) os = 'Windows'
  else if (/Mac OS X/.test(ua) && /Mobile/.test(ua) === false && /iPhone|iPad/.test(ua) === false) os = 'macOS'
  else if (/iPhone/.test(ua)) os = 'iOS'
  else if (/iPad/.test(ua)) os = 'iPadOS'
  else if (/Android/.test(ua)) os = 'Android'
  else if (/Linux/.test(ua)) os = 'Linux'

  return `${browser} on ${os}`
}
