# Changelog

All notable changes to this extension are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.1] - 2026-04-22

### Changed
- Marketplace metadata: switched categories from `Other` to `Programming Languages` and `Education`, and added `keywords` for better discoverability.

## [1.0.0] - 2026-04-22

Initial release.

- Right-click a selected Python module name in a `.py` file to open its documentation in your browser.
- Accepts import names (`json`, `os.path`, `numpy`) and distribution names (`pytest-cov`, `PyYAML`).
- Shells out to the [`pymanual`](https://pypi.org/project/pymanual/) CLI for resolution.
- Settings: `pymanual.cliPath`, `pymanual.useNetwork`, `pymanual.useCache`, `pymanual.browser`.
