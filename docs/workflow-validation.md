# SmoothSTT Workflow Validation Notes

## Status: verified for JSON structure + model references

This repo now contains a lightweight pytest file that verifies any local ComfyUI workflow JSON for:

- valid JSON structure
- presence of required node types
- existence of referenced model files in `D:\LLM\Models\DiffusionModels\`

Test file:
- `tests/test_workflow_validation.py`

Current workflow under validation:
- `D:\LLM\StabilityMatrix-win-x64\Data\Packages\ComfyUI\user\default\workflows\realistic_photo_qwen_zimage.json`

## Verification command

```cmd
"C:\Program Files\Python\Python312\python.exe" -m pytest tests/test_workflow_validation.py -q
```

Latest result:
- `3 passed in 0.09s`
