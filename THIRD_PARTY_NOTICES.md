# Third-party notices

Sleepy itself is under the PolyForm Noncommercial License 1.0.0 (see LICENSE). Voice input bundles these components, all under licences compatible with redistribution:

| Component | Licence | Use |
|---|---|---|
| OpenAI Whisper `whisper-base` weights (ONNX conversion `onnx-community/whisper-base`, quantized, revision pinned in `scripts/prepare-voice.mjs`) | MIT per the OpenAI Whisper repository (Copyright (c) 2022 OpenAI); the Hugging Face model card for `openai/whisper-base` lists Apache-2.0. Either is permissive | on-device speech-to-text model |
| Transformers.js (`@huggingface/transformers`) | Apache-2.0 | runs the model in a Web Worker |
| ONNX Runtime Web (`onnxruntime-web`, WebAssembly build) | MIT, Copyright (c) Microsoft Corporation | inference runtime |

Apache-2.0 and MIT both permit redistribution inside this app provided the copyright and
licence notices are kept; this file and the packages' own licence files in `node_modules` serve that purpose.
Full texts: <https://github.com/openai/whisper/blob/main/LICENSE>,
<https://github.com/huggingface/transformers.js/blob/main/LICENSE>,
<https://github.com/microsoft/onnxruntime/blob/main/LICENSE>.
