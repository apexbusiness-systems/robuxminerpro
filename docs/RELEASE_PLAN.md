# Release Plan

## Versioning Strategy

**Current Phase**: Pre-GA (v0.x series)
- Start at **v0.1.0** now
- During pre-GA: increment MINOR per sprint (new features) and PATCH for fixes
- GA milestone: tag **v1.0.0** at production cutover

Follows [Semantic Versioning](https://semver.org/) specification and [SemVer FAQ](https://semver.org/faq/).

## Tagging Workflow

Use **annotated tags only**:
```bash
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push --follow-tags
```

Reference: [git-tag documentation](https://git-scm.com/docs/git-tag)

## Packaging

1. Draft a GitHub Release from the tag
2. Include highlights and links to issues/PRs
3. Follow [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github) best practices

## Commit Standards

Follow [Conventional Commits](https://www.conventionalcommits.org/) to ease release note generation:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `refactor:` for code refactoring

## Rollback Strategy

- Revert problematic PR or restore previous Lovable version
- Retag if needed for version consistency

## Examples

- **v0.1.0**: Initial release with core features
- **v0.2.0**: Added new dashboard functionality
- **v0.2.1**: Fixed critical navigation bug

## Tag & Release — Quick Commands

```bash
# annotate & push
git tag -a v0.1.0 -m "Release v0.1.0"
git push --follow-tags
# GitHub → Releases → 'Draft a new release' from tag → publish
```

## References

- [Semantic Versioning](https://semver.org/)
- [SemVer FAQ](https://semver.org/faq/)
- [git-tag](https://git-scm.com/docs/git-tag)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [Conventional Commits](https://www.conventionalcommits.org/)