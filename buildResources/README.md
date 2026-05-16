# Packaging icons

- `icon.png` is the official BickSpec Studio Spec Grid icon copied from `designs/brand/icon.png`.
- `icon.ico` is the Windows packaging icon derived from that official icon.
- macOS packaging currently uses the same official `icon.png`; Electron Builder converts it during macOS packaging.

TODO: commit an official `icon.icns` generated from `designs/brand/icon.png` from a macOS icon toolchain, then switch `mac.icon` to `buildResources/icon.icns`.
