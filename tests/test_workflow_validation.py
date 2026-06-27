import json
import os

WORKFLOW = r"D:\LLM\StabilityMatrix-win-x64\Data\Packages\ComfyUI\user\default\workflows\realistic_photo_qwen_zimage.json"
MODELS_DIR = r"D:\LLM\Models\DiffusionModels"

def test_workflow_json_parse():
    with open(WORKFLOW, "r", encoding="utf-8") as f:
        data = json.load(f)
    assert isinstance(data, dict)
    assert "nodes" in data
    assert "links" in data

def test_required_node_types_present():
    with open(WORKFLOW, "r", encoding="utf-8") as f:
        data = json.load(f)
    types = {n["type"] for n in data["nodes"]}
    required = {"UNETLoader", "DualCLIPLoader", "CLIPTextEncode", "KSampler", "EmptySD3LatentImage", "VAEDecode", "SaveImage"}
    missing = required - types
    assert not missing, missing

def test_required_model_files_exist():
    with open(WORKFLOW, "r", encoding="utf-8") as f:
        data = json.load(f)
    refs = {w for n in data["nodes"] for w in n.get("widgets_values", []) if isinstance(w, str)}
    model_refs = {name for name in refs if name.endswith((".safetensors", ".gguf", ".bin"))}
    assert model_refs, "No model filenames referenced in workflow"
    for name in model_refs:
        assert os.path.exists(os.path.join(MODELS_DIR, name)), f"Missing model file: {name}"
