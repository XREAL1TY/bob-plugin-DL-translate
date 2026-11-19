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
output="$root/dist/deepl-free-translate-$version.bobplugin"

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

cd "$root/src"
zip -q -X "$archive" info.json main.js
unzip -tqq "$archive"
mv -f "$archive" "$output"
printf '%s\n' "$output"
