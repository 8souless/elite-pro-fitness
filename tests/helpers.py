def run_module(page, path: str, expr: str):
    code = f"""async () => {{
        const m = await import({repr(path)});
        return ({expr});
    }}"""
    return page.evaluate(code)
