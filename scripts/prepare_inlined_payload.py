import os
import base64
import json

manifest = json.load(open("deployment-manifest.json"))
inlined = []
total_bytes = 0

for item in manifest:
    rel = item["file"]
    data = open(rel, "rb").read()
    if rel.endswith((".html", ".css", ".js", ".json")):
        inlined.append({
            "file": rel,
            "data": data.decode("utf-8"),
            "encoding": "utf-8"
        })
        total_bytes += len(data)
    else:
        b64 = base64.b64encode(data).decode("ascii")
        inlined.append({
            "file": rel,
            "data": b64,
            "encoding": "base64"
        })
        total_bytes += len(b64)

print(f"Total inlined items: {len(inlined)}")
print(f"Total payload size: {total_bytes} bytes ({total_bytes / 1024 / 1024:.2f} MB)")
