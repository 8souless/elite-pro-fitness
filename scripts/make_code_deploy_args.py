import json

manifest = json.load(open("deployment-manifest.json"))
inlined = []

for item in manifest:
    rel = item["file"]
    if rel.endswith((".html", ".css", ".js", ".json")):
        data = open(rel, "rb").read()
        inlined.append({
            "file": rel,
            "data": data.decode("utf-8"),
            "encoding": "utf-8"
        })

payload = {
    "requestBody": {
        "name": "elite-pro-fitness",
        "project": "prj_cO0teKEznC6jGkaVhORwE4d5audu",
        "target": "production",
        "files": inlined
    }
}

with open("code-deploy-args.json", "w", encoding="utf-8") as f:
    json.dump(payload, f)

print(f"Generated code-deploy-args.json with {len(inlined)} files, size: {len(open('code-deploy-args.json', 'rb').read())} bytes")
