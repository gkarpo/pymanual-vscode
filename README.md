# Pymanual (VS Code)

Highlight a Python module name in the editor, right-click → **Show Documentation**, and the extension opens the module's documentation page in your browser.

Accepts import names (`json`, `os.path`, `numpy`) and distribution names (`pytest-cov`, `PyYAML`).

## Requirements

This extension shells out to the [`pymanual`](https://pypi.org/project/pymanual/) CLI, which must be installed separately:

```bash
pipx install pymanual
# or
uv tool install pymanual
```

## Usage

1. Open a `.py` file.
2. Select a module name (on an `import` line, or anywhere in the file).
3. Right-click → **Show Documentation**. The resolved URL opens in your default browser.

If the selection can't be resolved to a module (e.g. a local variable), an information message is shown and no page is opened.

## Settings

| Setting | Default | Description |
|---|---|---|
| `pymanual.cliPath` | `pymanual` | Path to the CLI. Set this if it isn't on `PATH`. |
| `pymanual.useNetwork` | `true` | Allow the resolver to query PyPI when installed metadata is incomplete. When `false`, passes `--no-network`. |
| `pymanual.useCache` | `true` | Use the resolver's local cache. When `false`, passes `--no-cache`. |
| `pymanual.browser` | `external` | Where to open the URL: `external` (system default browser) or `internal` (VS Code's Simple Browser tab). |

## Development

```bash
npm install
npm run compile         # or: npm run watch
```

Press F5 in VS Code to launch an Extension Development Host.
