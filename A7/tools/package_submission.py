"""Generate FINAL_TREE.txt and package exactly one A7/ folder.

Run the separate archive check after this command:
  python tools/check_submission.py --zip /path/to/A7_Final_Submission.zip
"""
from pathlib import Path
import hashlib
import zipfile
import argparse
from check_submission import ROOT, submission_files, check_baseline, check_secrets


def write_zip(destination, files):
    # PDFs/PNGs are already compressed; level 1 keeps packaging fast without
    # materially increasing the archive size.
    with zipfile.ZipFile(destination, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=1) as archive:
        for path in files:
            archive.write(path, "A7/" + path.relative_to(ROOT).as_posix())


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, default=ROOT.parent / 'A7_submission.zip')
    args = parser.parse_args()
    from check_part2 import verify
    verify()
    evidence = ROOT / "data/test_result"
    evidence.mkdir(exist_ok=True)
    receipts = [evidence / name for name in ["baseline_source_validation.txt", "secret_scan.txt", "package_verification.txt"]]
    for path in receipts:
        if not path.exists():
            path.write_text("Verification pending. Run the validators listed in MASTER_HANDOFF.md.\n", encoding="utf-8")
    tree = ROOT / "FINAL_TREE.txt"
    tree.touch(exist_ok=True)
    files = list(submission_files())
    tree.write_text("A7/\n" + "\n".join("  " + p.relative_to(ROOT).as_posix() for p in files) + f"\n\n{len(files)} packaged files. Generated from final source and evidence; runtime caches and installed dependencies excluded.\n", encoding="utf-8")
    baseline = check_baseline()
    secrets = check_secrets(files)
    receipts[0].write_text(baseline + "\n", encoding="utf-8")
    receipts[1].write_text(secrets + "\n", encoding="utf-8")
    receipts[2].write_text("Archive validation is performed after ZIP creation with tools/check_submission.py --zip; see the external A7_Final_Submission.validation.txt receipt.\n", encoding="utf-8")
    # Refresh file objects after receipt writes so the ZIP captures final bytes.
    files = list(submission_files())
    destination = args.output.resolve()
    write_zip(destination, files)
    digest = hashlib.sha256(destination.read_bytes()).hexdigest()
    print(baseline)
    print(secrets)
    print(f"Created: {destination}")
    print(f"Packaged files: {len(files)}")
    print(f"ZIP SHA-256 (pre-archive-validation): {digest}")
