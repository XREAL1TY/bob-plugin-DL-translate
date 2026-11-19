#!/bin/sh
set -eu

root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
version=$(plutil -extract version raw -expect string -o - "$root/src/info.json")
case "$version" in
    ''|*[!a-z0-9.]*)
        printf '%s\n' 'Invalid plugin version in src/info.json.' >&2
        exit 1
        ;;
esac
output="$root/dist/dl-free-translate-$version.bobplugin"

mkdir -p "$root/dist"
staging=$(mktemp -d "$root/dist/.build.XXXXXX")
archive="$staging/plugin.zip"
cleanup() {
    if [ -f "$archive" ]; then
        rm "$archive"
    fi
    rmdir "$staging"
}
trap cleanup EXIT

zip -q -X -j "$archive" \
    "$root/src/info.json" "$root/src/main.js" "$root/src/icon.png" "$root/LICENSE"
unzip -tqq "$archive"
mv -f "$archive" "$output"
printf '%s\n' "$output"
