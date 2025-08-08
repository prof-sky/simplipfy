import os
import re
from googletrans import Translator
import asyncio


#####################################################################
################# Configuration #####################################
#####################################################################

language = "fr"

lang_var_map = {
    "en": "english",
    "fr": "french",
    "de": "german",
}

#####################################################################


source_lang = "en"
source_dir = source_lang
target_dir = language

os.makedirs(target_dir, exist_ok=True)

def parse_simple(js_content):
    var_match = re.search(r"window\.(\w+)\s*=\s*{", js_content)
    if not var_match:
        return None, None
    var_name = var_match.group(1)

    content_match = re.search(r"{([\s\S]*?)}", js_content)
    if not content_match:
        return None, None
    body = content_match.group(1)

    lines = body.splitlines()
    key_value_pairs = {}
    key = None
    value_lines = []

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        if ":" in stripped and key is None:
            parts = stripped.split(":", 1)
            key = parts[0].strip()
            value_part = parts[1].strip().rstrip(",")
            value_lines = [value_part]
            if stripped.endswith(","):
                key_value_pairs[key] = join_value_lines(value_lines)
                key = None
                value_lines = []
        elif key is not None:
            value_lines.append(stripped.rstrip(","))
            if stripped.endswith(","):
                key_value_pairs[key] = join_value_lines(value_lines)
                key = None
                value_lines = []

    return var_name, key_value_pairs

def join_value_lines(lines):
    joined = " ".join(lines)
    joined = joined.replace("+", "").strip()
    if joined.startswith('"') and joined.endswith('"'):
        joined = joined[1:-1]
    return joined.replace("<br>", "\n")

def generate_js(var_name, translations, keys):
    result = f"window.{var_name} = {{\n"
    for key in keys:
        val = translations[key].replace('\n', '<br>').replace('"', '\\"').replace('\\"\\"', "")
        result += f'    {key}: "{val}",\n'
    result += "}\n"
    return result

async def translate_text(text: str, src: str, dest: str) -> str:
    async with Translator() as translator:
        result = await translator.translate(text, src=src, dest=dest)
        return result.text

def translate_lang_file(content: str, source_lang: str, target_lang: str) -> str:
    # 1. window.english → window.french (language kleingeschrieben)

    source_var = lang_var_map.get(source_lang.lower(), source_lang.lower())
    target_var = lang_var_map.get(target_lang.lower(), target_lang.lower())

    content = re.sub(r"window\." + re.escape(source_var), f"window.{target_var}", content)

    # 2. Alle Spread-Operatoren ...window.XEnTexts → ...window.XFrTexts (case sensitive)
    # Ersetze 'En' vor 'Texts' durch z.B. 'Fr'
    def replace_lang(match):
        full = match.group(0)
        replaced = full.replace(f"{source_lang.capitalize()}", f"{target_lang.capitalize()}")
        return replaced

    content = re.sub(r"\.\.\.window\.\w+" + source_lang.capitalize() + r"Texts", replace_lang, content)

    return content

def main():
    for filename in os.listdir(source_dir):
        if not filename.endswith(f".{source_lang}.js"):
            continue

        src_path = os.path.join(source_dir, filename)
        tgt_filename = filename.replace(f".{source_lang}.js", f".{language}.js")
        tgt_path = os.path.join(target_dir, tgt_filename)

        with open(src_path, "r", encoding="utf-8") as f:
            js_content = f.read()

        if filename.startswith("lang."):
            # lang-Datei anders behandeln
            translated_content = translate_lang_file(js_content, source_lang, language)

            with open(tgt_path, "w", encoding="utf-8") as f:
                f.write(translated_content)

            print(f"Created lang file: {tgt_path}")
            continue

        var_name, kv_pairs = parse_simple(js_content)
        if not kv_pairs:
            print(f"No object found in {filename}")
            continue

        var_translated = var_name.replace(source_lang.capitalize(), language.capitalize())

        translations = {}
        for key, val in kv_pairs.items():
            try:
                translated = asyncio.run(translate_text(val, source_lang, language))
                translations[key] = translated
            except Exception as e:
                print(f"Error in translation: {key}: {e}")
                translations[key] = val

        js_output = generate_js(var_translated, translations, kv_pairs.keys())

        with open(tgt_path, "w", encoding="utf-8") as f:
            f.write(js_output)

        print(f"Created file: {tgt_path}")


if __name__ == "__main__":
    main()
