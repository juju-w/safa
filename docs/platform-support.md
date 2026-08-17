# Platform Support

This matrix describes implemented and planned capability, not marketing intent.

| Capability | macOS 14.4+ | Linux | Windows |
| --- | --- | --- | --- |
| Native runtime | Swift preview | Not implemented; language not selected | Not implemented; language not selected |
| Secure credential store | Keychain | Secret Service/keyring adapter planned | DPAPI/Credential Manager planned |
| Native user authorization | Implemented for protected resource lifecycle | Planned | Planned |
| Trusted broker IPC | XPC design/implementation | Unix socket + peer identity planned | Named Pipe + ACL planned |
| SSH resource profiles | Preview | Planned | Planned |
| Database/S3/cache/service profiles | Contract extension point only | Contract extension point only | Contract extension point only |
| Verified public installer | Not published | Not published | Not published |
| Public Skill package | Not published | Not published | Not published |

“Planned” is not a support promise. A platform becomes supported only after its native runtime passes
the shared conformance suite, security review, provenance checks, and an exact release manifest is
reviewed in this repository.
