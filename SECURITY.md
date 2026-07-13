# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 2.0.x   | ✅ Active  |
| 1.0.x   | ❌ End-of-life |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

This is a browser-native, local-only application with no server-side components. All data remains on your local machine. However, if you discover:

- Cross-site scripting (XSS) vulnerabilities in the document preview rendering
- Prototype pollution in the JSON import parser
- Unsafe use of `innerHTML` with untrusted user input
- Any other security concern

Please report it privately by opening a [GitHub Security Advisory](https://github.com/ebeauzec/VASTbuilder/security/advisories/new).

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if known)

**Response time:** We aim to acknowledge reports within 5 business days and provide a resolution timeline within 14 days.

## Security Considerations for Users

- This tool stores configuration data in your browser's **IndexedDB** — it does not transmit data to any remote server.
- The tool loads fonts from **Google Fonts CDN** — the only external network request made.
- **Never** store real credentials, API keys, or passwords in configuration fields.
- The Generated Outputs (HLD, LLD, BOM, etc.) may contain sensitive network details — handle them according to your organisation's data classification policy.

*Copyright (c) 2024–2026 Eugene Beauzec. All Rights Reserved.*
