import { execFile } from "node:child_process";
import { promisify } from "node:util";
import * as vscode from "vscode";

const execFileAsync = promisify(execFile);

const STATUS_TOKENS = new Set([
    "module_not_found",
    "unresolvable_module_path",
    "local_module_no_external_docs",
]);

export function activate(context: vscode.ExtensionContext): void {
    const disposable = vscode.commands.registerCommand(
        "pymanual.showDocs",
        showDocsCommand,
    );
    context.subscriptions.push(disposable);
}

export function deactivate(): void {}

async function showDocsCommand(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    const name = getSelectedIdentifier(editor);
    if (!name) {
        vscode.window.showInformationMessage(
            "Select a Python module name first.",
        );
        return;
    }

    const config = vscode.workspace.getConfiguration("pymanual");
    const cliPath = config.get<string>("cliPath", "pymanual");
    const useNetwork = config.get<boolean>("useNetwork", true);
    const useCache = config.get<boolean>("useCache", true);
    const browser = config.get<"external" | "internal">("browser", "external");

    const args = [name];
    if (!useNetwork) {
        args.push("--no-network");
    }
    if (!useCache) {
        args.push("--no-cache");
    }

    let output: string;
    try {
        const result = await execFileAsync(cliPath, args, { timeout: 15_000 });
        output = result.stdout.trim();
    } catch (err) {
        const execErr = err as NodeJS.ErrnoException & {
            stdout?: string;
            stderr?: string;
            code?: string | number;
        };

        if (execErr.code === "ENOENT") {
            void promptInstallCli(cliPath);
            return;
        }

        // The CLI exits 1 for status tokens but still prints a valid result to stdout.
        output = (execErr.stdout ?? "").trim();
        if (!output) {
            const detail = (execErr.stderr ?? execErr.message ?? "").trim();
            vscode.window.showErrorMessage(
                `pymanual failed${detail ? `: ${detail}` : "."}`,
            );
            return;
        }
    }

    if (!output) {
        vscode.window.showWarningMessage(
            `No output from pymanual for "${name}".`,
        );
        return;
    }

    if (STATUS_TOKENS.has(output)) {
        vscode.window.showInformationMessage(
            `No documentation URL available for "${name}" (${output}).`,
        );
        return;
    }

    await openUrl(output, browser);
}

async function openUrl(
    url: string,
    browser: "external" | "internal",
): Promise<void> {
    if (browser === "internal") {
        await vscode.commands.executeCommand("simpleBrowser.show", url);
        return;
    }
    await vscode.env.openExternal(vscode.Uri.parse(url));
}

function getSelectedIdentifier(editor: vscode.TextEditor): string | null {
    const selection = editor.selection;
    if (!selection.isEmpty) {
        return editor.document.getText(selection).trim() || null;
    }
    // Fallback: use the identifier-like token under the cursor.
    const range = editor.document.getWordRangeAtPosition(
        selection.active,
        /[A-Za-z_][A-Za-z0-9_.\-]*/,
    );
    if (!range) {
        return null;
    }
    return editor.document.getText(range).trim() || null;
}

async function promptInstallCli(cliPath: string): Promise<void> {
    const installLabel = "Install with pipx";
    const settingsLabel = "Open settings";
    const choice = await vscode.window.showErrorMessage(
        `Could not find pymanual CLI at "${cliPath}". Install it or point pymanual.cliPath to its location.`,
        installLabel,
        settingsLabel,
    );

    if (choice === installLabel) {
        const terminal = vscode.window.createTerminal("pymanual install");
        terminal.show();
        terminal.sendText("pipx install pymanual");
    } else if (choice === settingsLabel) {
        void vscode.commands.executeCommand(
            "workbench.action.openSettings",
            "pymanual.cliPath",
        );
    }
}
